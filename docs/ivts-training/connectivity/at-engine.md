---
title: AT parser và transaction engine
description: Parse stream theo chunk, xử lý URC, prompt, binary và timeout.
---

# AT parser và transaction engine

UART không bảo toàn ranh giới dòng. Một lần read có thể chứa nửa dòng, nhiều dòng hoặc line cộng một phần binary block. Parser phải làm việc theo stream.

## Trạng thái parser

Parser tích lũy bytes cho tới khi nhận biết:

- CR/LF kết thúc line
- prompt như `>`
- prefix báo một block có length
- số byte binary cần nhận đủ

Buffer luôn có giới hạn. Line quá dài phải tạo lỗi có kiểm soát và resync, không ghi tràn.

## Transaction engine

Một transaction mô tả:

- command bytes
- response mong đợi
- timeout
- callback hoặc nơi lưu kết quả
- trạng thái đang chờ prompt/data/terminal

Engine feed mọi token từ parser. URC được chuyển sang handler riêng mà không kết thúc nhầm transaction hiện tại.

## Timeout

Timeout dùng monotonic time. Khi hết hạn:

1. đánh dấu transaction fail
2. giải phóng owner
3. resync parser nếu cần
4. áp backoff ở lớp feature

Không gửi command mới lên trên bytes còn sót mà chưa có quy tắc resync.

## Test host

```bash
bash tools/host_test.sh at_parser
```

Test cần feed cùng dữ liệu với nhiều chunk boundary khác nhau. Ví dụ một response được feed từng byte phải cho kết quả giống feed cả buffer.

## Ca khó cần có

- `OK\r\n` chia giữa `\r` và `\n`
- URC chen giữa response
- prompt không kèm newline
- binary chứa byte 0 và chuỗi giống `OK`
- line dài hơn buffer
- timeout sau một phần response
- nhiều URC trong một read

## Vì sao không dùng `strstr` trên UART buffer

Buffer có thể chưa NUL-terminated, chứa binary và có token chia qua chunk. `strstr` vừa có nguy cơ đọc quá giới hạn vừa bỏ lỡ token cắt đôi.

## Bài tập

Lấy một transcript SIM7600 thật. Feed parser theo chunk 1, 2, 7 và toàn bộ length. So sánh danh sách token. Nếu khác, parser đang phụ thuộc ranh giới của UART read.

**Mốc hoàn thành.** Parser cho cùng kết quả bất kể chunk boundary và engine không nhầm URC thành terminal response.
