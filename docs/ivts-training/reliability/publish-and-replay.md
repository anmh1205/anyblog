---
title: Publish, ACK và replay
description: Theo dõi record từ snapshot tới MQTT hoặc SD và chỉ xóa sau ACK đúng.
---

# Publish, ACK và replay

`app_publish.c` nối record, payload, modem và storage. Đây là nơi semantics at-least-once được thực thi.

## Đường gửi mới

```text
FSM action emit RAW
  → app_state tạo record
  → payload tạo JSON
  → modem_publish cấp tx_id
  → chờ ACK
```

Nếu link down hoặc publish không thể bắt đầu, record được append vào queue trên SD. Nếu một publish mới fail sau khi đã bắt đầu, app cũng phải quyết định queue record nếu chưa có bằng chứng ACK thành công.

## Đường replay

```text
link up + queue pending
  → storage_queue_peek(record, token)
  → dựng payload từ record cũ
  → publish và nhớ tx_id + token
  → ACK success đúng tx_id
  → storage_queue_pop(token)
```

Chỉ có một replay in-flight hoặc cơ chế mapping phải đủ rõ. ACK của RAW mới không được pop replay.

## Ba identity khác nhau

| Identity | Phạm vi |
| --- | --- |
| `message_id` | record, giữ qua reset/replay |
| `tx_id` | một lần publish qua modem |
| queue token | slot đang peek trên SD |

Nhầm ba giá trị này tạo lỗi mất dữ liệu hoặc pop sai.

## Race cần kiểm thử

- link down sau khi gửi nhưng trước ACK
- ACK tới sau timeout
- reset khi replay đang in-flight
- queue head đổi sau lỗi storage
- record mới xuất hiện trong lúc replay
- broker gửi duplicate ACK/URC

Policy an toàn là không pop nếu bất kỳ identity nào không khớp. Hậu quả có thể là duplicate, tốt hơn mất record.

## Lab mất mạng

1. Subscribe `v1/<device_id>/#`.
2. Giữ board ở DRIVING.
3. Ghi ba `message_id` online.
4. Tắt broker hoặc chặn kết nối.
5. Chờ pending count tăng.
6. Reset board nếu muốn kiểm bền vững.
7. Khôi phục broker.
8. Quan sát pending giảm sau từng ACK.
9. Đối chiếu ID replay.

## Kết quả đúng khi có duplicate

Nếu backend nhận record nhưng ACK mất, record sẽ được replay. Hai payload cùng `message_id` là đúng theo QoS 1. Backend cần idempotency.

**Mốc hoàn thành.** Bạn chứng minh được không record nào bị pop trước ACK và giải thích mọi duplicate quan sát được.
