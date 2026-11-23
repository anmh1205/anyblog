---
title: Kiến trúc tổng thể
description: Tách policy thuần C, adapter I/O và composition root trong firmware IVTS.
---

# Kiến trúc tổng thể

Firmware IVTS dùng kiến trúc hướng sự kiện. Driver không gọi trực tiếp state machine và state machine không gọi driver. Hai phía trao đổi bằng event, snapshot và action.

## Ba lớp trách nhiệm

### Lõi thuần C

`components/ivts-core` chứa:

- kiểu lỗi, CRC32, backoff, chuyển đổi lịch và xử lý chuỗi
- event và model telemetry
- config, record nhị phân, JSON reader/writer
- logic ignition/motion và state machine
- hợp đồng OTA cùng quyết định confirm/rollback

Lõi không include `freertos/*`, `esp_*` hay header của component I/O. Vì vậy nó được build bằng GCC trên máy tính.

### Adapter I/O

`board`, `storage`, `modem`, `obd` và `ota` chuyển API phần cứng thành interface của hệ thống. Ví dụ `board_os.c` định kỳ đọc ADC rồi phát `IVTS_EV_POWER_SAMPLE`. Nó không biết state `DRIVING` nghĩa là gì.

### Composition root

`components/app` tạo queue, khởi tạo component, giữ snapshot, gọi FSM và thực thi action. Đây là nơi duy nhất phụ thuộc đồng thời vào mọi adapter.

## Một vòng xử lý hoàn chỉnh

```text
1. board task đọc ADC
2. board phát ivts_event_t
3. app sink chép event vào FreeRTOS queue, không chờ
4. app task rút event và cập nhật snapshot
5. axes suy ra ignition
6. fsm_step trả action flags
7. app thực thi action qua board/modem/obd/storage
8. I/O mới lại phát event về queue
```

Chỉ app task sửa snapshot chính. Quy tắc single-writer này tránh việc record được dựng giữa lúc GNSS, OBD và power task cùng cập nhật dữ liệu.

## Dependency đi theo một chiều

Mở các file `CMakeLists.txt` trong từng component. Bạn sẽ thấy adapter phụ thuộc `ivts-core`, còn `app` dùng `PRIV_REQUIRES` để kéo adapter vào.

Quy tắc quan trọng:

- core không biết ESP-IDF
- adapter không gọi adapter khác
- public header của adapter không để lộ header nội bộ
- app điều phối, không chứa lại parser hoặc driver
- `main/main.c` chỉ gọi `app_start()`

## Fatal và degraded startup

Không phải mọi lỗi khởi tạo đều có mức độ giống nhau.

| Thành phần | Nếu lỗi | Lý do |
| --- | --- | --- |
| app queue | dừng khởi động | không còn đường nhận event |
| board/ADC | dừng khởi động | thiếu tín hiệu nguồn cốt lõi |
| NVS/storage init | dừng khởi động | mất config, boot ID, OTA context |
| modem init | dừng khởi động | không có task/link chính |
| microSD | chạy degraded | vẫn có thể gửi online |
| IMU | chạy degraded | mất motion nhưng còn ignition/timer |
| RTC | chạy degraded | timestamp bị đánh dấu không tin cậy |
| OBD | chạy degraded | telemetry vẫn còn nguồn/GNSS |

## Bài tập đọc code

1. Mở `main/main.c` và xác nhận nó không chứa business logic.
2. Mở `components/app/src/app_init.c` và liệt kê thứ tự init.
3. Mở `components/board/src/board_os.c` và tìm chỗ phát event.
4. Mở `components/app/src/app.c` và tìm chỗ dispatch event.

**Mốc hoàn thành.** Khi thấy một thay đổi mới, bạn quyết định được nó thuộc core, adapter hay app mà không dựa vào tên file hiện tại.
