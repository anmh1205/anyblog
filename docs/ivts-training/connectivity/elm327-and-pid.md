---
title: ELM327 session và PID
description: Khởi tạo adapter, framing response và chuyển OBD-II PID thành telemetry.
---

# ELM327 session và PID

Sau khi BLE transport ready, `elm327.c` quản lý command/response còn `obd_pid.c` giải mã dữ liệu OBD-II.

## Session ELM327

Session thường cần các lệnh setup để tắt echo, chuẩn hóa linefeed/space và chọn protocol. Firmware phải chờ prompt hoàn tất trước command tiếp theo.

Parser cần xử lý:

- echo nếu chưa tắt
- `SEARCHING...`
- `NO DATA`
- lỗi adapter
- nhiều dòng ECU response
- prompt `>`
- response chia qua nhiều notify

## Request PID

Mode 01 current data dùng request như `01 0C` cho RPM. Response chứa mode trả lời, PID và data bytes. Decoder phải kiểm header trước công thức.

Ví dụ công thức phổ biến:

```text
RPM = ((A × 256) + B) / 4
speed_kph = A
coolant_c = A - 40
```

Chỉ áp công thức sau khi length đủ và PID đúng.

## Model validity

Nếu một PID timeout, giữ field invalid hoặc stale theo policy rõ ràng. Không đổi thành 0. App record cần biết dữ liệu nào thật sự có trong lần đo.

## Host test

```bash
bash tools/host_test.sh elm327
bash tools/host_test.sh obd_pid
```

Test gồm response có space, không space, CR/LF khác nhau, prompt chia chunk, no data, hex sai và payload thiếu byte.

## Poll scheduling

Chu kỳ OBD mặc định 1000 ms. Không gửi nhiều command chồng nhau. Một request phải hoàn tất, timeout hoặc bị hủy khi disconnect trước request tiếp theo.

## Trace từ bytes tới telemetry

1. log notify bytes ở chế độ debug
2. log frame ELM hoàn chỉnh
3. log PID và bytes A/B
4. log value đã scale
5. kiểm field trong RAW payload

Tắt raw log khi hoàn tất vì log UART lớn có thể làm thay đổi timing.

**Mốc hoàn thành.** Bạn đưa một transcript ELM327 thật vào host test và nhận đúng model mà board publish.
