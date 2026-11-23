---
title: LIS3DSH và phát hiện chuyển động
description: Probe IMU, cấu hình state machine, xử lý interrupt và quiet time.
---

# LIS3DSH và phát hiện chuyển động

Board dùng LIS3DSH, thử địa chỉ I2C `0x1D` rồi `0x1E`. Driver cấu hình state machine bên trong chip để tạo interrupt motion trên GPIO41.

## Probe đúng thiết bị

Không chỉ ACK địa chỉ. Driver cần đọc WHO_AM_I hoặc register định danh phù hợp để tránh cấu hình nhầm thiết bị có cùng địa chỉ.

## Hai lớp lọc motion

### Trong IMU

Register threshold, duration và state machine của LIS3DSH quyết định khi nào chân interrupt được assert. Đây là lọc ở tốc độ cảm biến.

### Trong `axes.c`

Mỗi interrupt làm motion thành moving ngay. `motion_quiet_ms` mặc định 30.000 ms quyết định khi nào trở lại stationary. Đây là policy hệ thống.

Hai lớp không thay thế nhau. IMU giảm nhiễu vật lý. Axes tạo semantics ổn định cho FSM.

## Interrupt path

```text
LIS3DSH state machine
  → GPIO41 ISR
  → board task/event
  → IVTS_EV_MOTION
  → app queue
  → axes_on_motion
  → FSM PARKED ↔ ALARM
```

ISR không gọi I2C transaction dài, không log chuỗi lớn và không gọi FSM. Nó đánh thức task hoặc đặt tín hiệu tối thiểu.

## Motion wake

GPIO41 có thể đánh thức light sleep. Nó không phải RTC GPIO nên không thể là deep sleep wake source. Nếu yêu cầu motion wake, app phải chọn light sleep.

## Kiểm tra từng lớp

1. I2C probe đúng chip.
2. Đọc register sau khi ghi để xác nhận config.
3. Ở trạng thái awake, tạo rung và đếm interrupt.
4. Xác nhận event vào app.
5. Xác nhận axes giữ moving trong 30 giây quiet.
6. Xác nhận PARKED chuyển ALARM.
7. Lặp lại từ light sleep và kiểm wake reason.

## Lỗi thường gặp

**Nhiều interrupt khi đứng yên.** Kiểm cơ khí, threshold/duration và latch/clear register.

**Có interrupt nhưng FSM không ALARM.** Trace event queue và axes, không sửa IMU ngay.

**Deep sleep không thức vì motion.** Đây là giới hạn pin map hiện tại, không phải bug parser.

**Mốc hoàn thành.** Bạn chứng minh được từng đoạn của đường interrupt thay vì chỉ thấy state cuối cùng.
