---
title: Hàng đợi offline trên SD
description: Hiểu segment, frame CRC, cursor, peek token và semantics at-least-once.
---

# Hàng đợi offline trên SD

`storage_queue.c` lưu record chưa được broker xác nhận vào các file segment dưới `/sd/q`. Thiết kế ưu tiên phục hồi sau mất điện và semantics at-least-once.

## Tên và quota segment

Segment có dạng:

```text
/sd/q/Q0000001.BIN
/sd/q/Q0000002.BIN
```

Kích thước mặc định mỗi segment là 32 KiB, tối đa 256 segment. Khi vượt quota, policy bỏ segment cũ nhất để hệ thống tiếp tục ghi dữ liệu mới.

## Frame format

Mỗi frame chứa:

```text
magic | length | serialized record | CRC
```

Khi scan, queue kiểm header, giới hạn length và CRC. Nếu mất điện để lại frame cuối chưa hoàn tất, file được truncate về offset của frame hợp lệ cuối cùng.

## Cursor

Read cursor được persist định kỳ, hiện tại mỗi 16 lần pop. Persist mỗi record tăng wear. Persist thưa hơn chấp nhận replay trùng một số record sau reset, phù hợp at-least-once.

## Peek rồi mới pop

API không pop ngay khi đọc:

1. `peek` trả record và token của slot.
2. App publish record.
3. Broker ACK được map về transaction.
4. Chỉ khi ACK thành công và token còn khớp, app gọi pop.

Token ngăn một ACK cũ xóa nhầm record mới ở đầu queue.

## Mất ACK

Nếu broker đã nhận record nhưng thiết bị reset trước ACK, record vẫn ở queue và được gửi lại. Đây là kết quả đúng. Backend deduplicate bằng `message_id`.

## Phục hồi sau mất điện

Test cần cắt dữ liệu ở nhiều offset:

- giữa header
- sau header nhưng giữa payload
- sau payload nhưng trước CRC
- sau frame hoàn chỉnh nhưng trước cursor persist

Sau khởi động lại, queue phải giữ mọi frame hoàn chỉnh và không đọc bytes rác như record.

## Quan sát thực tế

1. Ngắt broker.
2. Tạo nhiều RAW record.
3. Ghi pending count và file segment.
4. Reset giữa lúc ghi.
5. Kết nối broker.
6. Quan sát pending giảm chỉ sau ACK.
7. Kiểm duplicate có cùng `message_id`.

**Mốc hoàn thành.** Bạn có thể giải thích vì sao duplicate được chấp nhận nhưng mất một frame đã báo thành công thì không.
