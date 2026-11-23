---
title: Diagnostics và khả năng quan sát
description: Đo queue, stack, link, storage, reset reason và lỗi mà không làm thay đổi timing quá mức.
---

# Diagnostics và khả năng quan sát

Firmware bất đồng bộ cần trả lời được “hệ thống đang kẹt ở lớp nào”. `app_diag.c` gom tín hiệu vận hành thay vì rải log ngẫu nhiên.

## Chỉ số cần theo dõi

- app queue depth và dropped event count
- stack high-water mark khi tùy chọn diagnostics bật
- current FSM state và thời gian ở state
- LTE/MQTT link state, retry và backoff
- SD mounted, queue pending và queue drop-oldest count
- publish in-flight, ACK success/failure
- OBD transport/session state
- OTA state, bytes, hash result và confirm state
- reset reason và wake reason
- timestamp trusted hay không

## Log state transition, không log mọi tick

Tick app chạy khoảng 200 ms. Log mỗi tick vừa làm ngập UART vừa thay timing. Chỉ log khi state hoặc lỗi thay đổi, cộng summary định kỳ chậm.

## Correlation ID

Khi trace telemetry, in `message_id`, `tx_id` và queue token ở đúng bước. Khi trace command, dùng `command_id`. Khi trace OTA, dùng `job_id`. Không dùng một số chung cho mọi loại identity.

## Stack watermark

FreeRTOS high-water mark cho biết khoảng stack còn nhỏ nhất, không phải current usage. Bật đo ở build lab, chạy workload nặng nhất rồi lấy margin. Đừng tăng mọi stack theo cảm tính.

## Reset và wake reason

Đầu boot log phải ghi lý do reset và wake. Một deep-sleep wake dự kiến không giống watchdog reset. Nếu không phân biệt, heartbeat có thể bị hiểu nhầm thành crash loop.

## Log có thể che bug

UART log thay đổi scheduling và tốn buffer. Khi bug timing biến mất vì bật log:

1. chuyển sang counter hoặc ring buffer nhỏ
2. giảm log text
3. lấy timestamp monotonic
4. dump summary sau khi sự kiện xảy ra

## Bài tập dashboard thủ công

Trong một lần test mất mạng, ghi bảng theo phút gồm link state, queue pending, publish in-flight, dropped event và FSM state. Bảng này phải đủ để giải thích khi nào record bắt đầu replay và vì sao queue giảm.

**Mốc hoàn thành.** Với một lỗi thực tế, bạn xác định được lớp đầu tiên lệch kỳ vọng chỉ từ diagnostics đã thiết kế.
