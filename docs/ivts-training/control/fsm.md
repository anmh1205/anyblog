---
title: State machine vận hành
description: Hiểu bảy state, transition và action của firmware IVTS.
---

# State machine vận hành

`fsm.c` nhận snapshot logic và trả action. Nó không gọi GPIO, modem hay filesystem. Nhờ đó mọi transition có thể được mô phỏng bằng bảng thời gian.

## Bảy trạng thái

| State | Ý nghĩa | Hành vi chính |
| --- | --- | --- |
| `INIT` | vừa khởi tạo | bật GNSS, chuyển kiểm tra ignition |
| `CHECK_IGN` | phân loại sau boot/wake | chọn DRIVING, ALARM, HEARTBEAT hoặc PARKED |
| `DRIVING` | ignition ON | OBD/GNSS hoạt động, phát RAW và status định kỳ |
| `PARKED` | ignition OFF, xe yên | status một lần, chờ settle rồi ngủ |
| `ALARM` | motion khi xe tắt | RAW/status nhanh hơn, chờ yên hoặc ignition ON |
| `HEARTBEAT` | thức bởi timer | gửi status rồi ngủ sau khi drain |
| `SLEEP` | chuẩn bị/ngủ | chọn fake, light hoặc deep sleep |

## Transition khi khởi động

`INIT` luôn chuyển `CHECK_IGN`. Từ đó:

- ignition ON → `DRIVING`
- wake do motion hoặc đang moving → `ALARM`
- wake do timer → `HEARTBEAT`
- còn lại → `PARKED`

Thứ tự điều kiện quan trọng. Ignition ON phải thắng motion để xe đang chạy không bị coi là alarm.

## Action thay vì side effect

FSM trả các cờ như:

- start/stop OBD
- enable/disable GNSS
- emit RAW/status/event
- request replay
- enter sleep

App thực thi action. Nếu action thất bại, app có thể log, retry hoặc chuyển thành event mới mà không làm policy phụ thuộc driver.

## DRIVING

Ở `DRIVING`, tick định kỳ có thể tạo RAW và status. Khi axes xác nhận ignition OFF sau đủ debounce, FSM yêu cầu dừng OBD rồi chuyển `PARKED`. Một mẫu điện áp thấp ngắn không đủ gây transition vì axes đã lọc nó.

## PARKED và ALARM

`PARKED` phát status một lần. Motion đưa state sang `ALARM`. `ALARM` phát RAW/status theo chu kỳ, quay `DRIVING` nếu ignition ON hoặc quay `PARKED` sau thời gian yên/alarm timeout.

PARKED chỉ ngủ khi điều kiện settle, queue/drain và OTA cho phép. OTA đang chạy ngăn sleep.

## HEARTBEAT

Timer wake không cần chạy đầy đủ như một chuyến đi. State này phát status, chờ publish/replay drain rồi ngủ lại.

## Replay là hành vi ngang state

Khi link up và queue còn record, FSM có thể yêu cầu replay ở mọi state thích hợp ngoài sleep. Replay không phải state riêng vì nó là công việc nền, không phải chế độ vận hành của xe.

## Bài tập transition table

Viết bảng cho chuỗi:

```text
boot → ignition OFF → motion → quiet → ignition ON → ignition OFF → timer wake
```

Với mỗi hàng, ghi `state trước`, `input`, `state sau`, `action`. Sau đó mã hóa thành test host.

**Mốc hoàn thành.** Bạn giải thích được transition mà không nhắc tới API ESP-IDF nào.
