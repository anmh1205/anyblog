---
title: Sleep và wake-up
description: Chọn fake, light hoặc deep sleep theo nguồn đánh thức và công việc đang chờ.
---

# Sleep và wake-up

Sleep là kết quả của policy FSM và khả năng phần cứng. App quyết định khi nào được ngủ. Board quyết định cách cấu hình ESP32-S3 để ngủ.

## Ba chế độ

| Mode | Dùng khi | Đặc điểm |
| --- | --- | --- |
| fake sleep | sleep bị tắt trong config | giữ task chạy để debug |
| light sleep | cần motion wake GPIO41 | RAM/task context được giữ |
| deep sleep | chỉ cần timer wake | reset qua boot path khi thức |

GPIO41 không phải RTC GPIO, nên deep sleep không thể dùng nó làm nguồn motion wake.

## Điều kiện trước khi ngủ

FSM không yêu cầu sleep chỉ vì ignition OFF. Nó còn xét:

- state đã settle trong PARKED
- không còn action bắt buộc
- publish/replay đã drain theo policy
- OTA không chạy
- không có lý do giữ awake
- chưa vượt awake max bắt buộc

## Chuẩn bị sleep

`app_sleep.c` phối hợp:

1. ghi context cần giữ
2. dừng hoặc đưa peripheral về trạng thái an toàn
3. chọn wake sources
4. log mode và deadline
5. gọi board power API

Không để driver tự gọi `esp_deep_sleep_start()` vì app cần hoàn tất storage và publish policy trước.

## Wake reason

Sau boot/wake, board phân loại nguyên nhân. FSM dùng nó trong `CHECK_IGN`:

- timer wake → HEARTBEAT
- motion wake → ALARM nếu ignition chưa ON
- cold boot/khác → PARKED hoặc DRIVING theo axes

## RTC memory và NVS

Light sleep giữ RAM. Deep sleep reset CPU, chỉ RTC memory được giữ nếu dùng đúng section. Dữ liệu phải tồn tại qua mất nguồn cần NVS hoặc SD, không phải RTC memory.

## Test policy không cần board

`test_sleep_modes()` trong `test_fsm.c` kiểm mode được đề xuất từ capability input. Hãy thêm các ca:

- sleep disabled
- motion wake required nhưng pin không deep-sleep capable
- timer-only wake
- OTA active
- queue chưa drain

## Kiểm tra trên board

1. Đưa ignition OFF đủ lâu để vào PARKED.
2. Quan sát log `sleep mode`.
3. Với light sleep, tạo motion và kiểm wake reason.
4. Với deep sleep, chờ timer.
5. Kiểm tra state đầu tiên sau wake.

**Mốc hoàn thành.** Bạn dự đoán đúng sleep mode và state sau wake từ capability, config và wake reason.
