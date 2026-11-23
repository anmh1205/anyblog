---
title: Record nhị phân và JSON payload
description: Tạo định danh ổn định, serialize record và dựng payload MQTT có giới hạn.
---

# Record nhị phân và JSON payload

Firmware dùng hai biểu diễn cho cùng một lần đo. Record nhị phân phục vụ lưu bền vững. JSON phục vụ giao tiếp MQTT.

## Định danh bản ghi

Mỗi record có `boot_id` và `seq`. Payload tạo `message_id` theo dạng ghép hai giá trị này. Mục tiêu là một record giữ cùng định danh khi:

- publish lần đầu
- bị lưu vào SD
- thiết bị reset
- record được replay
- broker nhận trùng do ACK bị mất

Backend có thể deduplicate theo `message_id`.

## Record format

`record.c` encode/decode cấu trúc versioned. Khi thay model:

1. tăng version khi layout không còn tương thích
2. giữ decoder cũ nếu cần đọc queue cũ
3. kiểm size trước mọi access
4. tính CRC theo cùng một vùng byte
5. không ghi trực tiếp struct C ra file vì padding và endian

## JSON writer

`json_writer.c` ghi vào buffer có capacity. Mỗi thao tác phải giữ invariant:

- không ghi quá cuối buffer
- chuỗi được escape đúng
- writer biết đã lỗi và không tiếp tục tạo JSON giả hợp lệ
- caller nhận được length thực

`payload.c` dùng writer để tạo rawdata, status, event và firmware payload.

## JSON reader

Command parser dùng token array cố định, tối đa 64 token và độ sâu 4. Giới hạn này biến payload từ xa thành tài nguyên có thể dự đoán. JSON hợp lệ nhưng quá sâu hoặc quá nhiều token vẫn bị từ chối.

## Chạy test

```bash
cd /mnt/c/Users/Admin/Downloads/ivts-firmware
bash tools/host_test.sh record
bash tools/host_test.sh json_writer
bash tools/host_test.sh json_reader
bash tools/host_test.sh payload
```

Test cần bao phủ buffer vừa đủ, buffer thiếu một byte, escape ký tự, field thiếu, version sai và CRC sai.

## Theo dõi một record

1. Ghi lại `boot_id` và `seq` khi record được tạo.
2. So sánh `message_id` trong JSON online.
3. Ngắt broker để record vào SD.
4. Reset thiết bị.
5. Kết nối lại và kiểm `message_id` của bản replay.

Nó phải giống bước 2 nếu đó là cùng record.

## Gotcha

QoS 1 đảm bảo at-least-once, không đảm bảo exactly-once. Broker có thể đã nhận payload nhưng ACK không tới thiết bị. Vì vậy duplicate là hành vi dự kiến, không phải bằng chứng queue lỗi.

**Mốc hoàn thành.** Bạn encode/decode round-trip một record, làm hỏng một byte để CRC bắt lỗi và chứng minh replay giữ nguyên `message_id`.
