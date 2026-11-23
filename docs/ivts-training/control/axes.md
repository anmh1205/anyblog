---
title: Suy ra ignition và motion
description: Dựng axes state với hysteresis, debounce và motion quiet time.
---

# Suy ra ignition và motion

ADC chỉ cho một con số điện áp. IMU chỉ phát interrupt. `axes.c` biến tín hiệu thô thành hai trục ổn định mà FSM sử dụng là ignition và motion.

## Cấu hình

```c
static const ivts_axes_cfg_t cfg = {
    .on_threshold_mv = 13000u,
    .hysteresis_mv = 500u,
    .on_hold_ms = 1500u,
    .off_hold_ms = 15000u,
    .motion_quiet_ms = 30000u,
};
```

Ngưỡng ON là 13.000 mV. Khi đang ON, chỉ điện áp dưới 12.500 mV mới là ứng viên OFF. Vùng giữa giữ nguyên ý kiến hiện tại.

## Mẫu đầu tiên

Mẫu power đầu tiên được chốt ngay, không đợi hold time. Khi vừa boot, hệ thống cần có quan điểm ban đầu để chọn luồng khởi động. Các lần chuyển sau mới debounce.

## Chuyển OFF sang ON

```text
t=1000 ms   13.9 V   bắt đầu ứng viên ON
t=2000 ms   13.9 V   chưa đủ 1500 ms
t=2500 ms   13.9 V   commit ON
```

Nếu một mẫu rơi lại phía OFF trước 2500 ms, ứng viên bị hủy.

## Chuyển ON sang OFF

```text
t=4000 ms   12.7 V   trong hysteresis, vẫn ON
t=6000 ms   11.0 V   bắt đầu ứng viên OFF
t=9000 ms   13.9 V   hủy ứng viên OFF
t=10000 ms  11.0 V   bắt đầu lại từ đầu
t=25000 ms  11.0 V   commit OFF
```

Một lần sụt áp ngắn không được cộng dồn với lần sụt sau. Hold time phải liên tục.

## Motion

Motion interrupt chuyển trạng thái sang moving ngay. Sau interrupt cuối, cần `motion_quiet_ms` không có chuyển động mới trở lại stationary. Cách này tránh FSM nhảy giữa ALARM và PARKED vì rung ngắn.

## Vehicle state

Vehicle state được suy từ ignition và motion. Không để mỗi component tự diễn giải hai tín hiệu theo cách khác nhau. Một hàm thuần tạo ra kết quả thống nhất cho payload và FSM.

## Chạy test

```bash
bash tools/host_test.sh fsm
```

`test_fsm.c` chứa cả test axes và FSM. Kết quả tham chiếu có 67 assertion pass và 0 failed.

## Tự viết test sụt áp

Thêm chuỗi mẫu:

1. Chốt ON.
2. Xuống 11 V trong 5 giây.
3. Quay lại 13.9 V.
4. Xuống 11 V thêm 11 giây.

Dự đoán trước. Kết quả vẫn ON vì hai khoảng OFF không liên tục và khoảng thứ hai chưa đủ 15 giây.

**Mốc hoàn thành.** Bạn có thể tính bằng tay thời điểm ignition đổi state từ một bảng `timestamp, millivolt`.
