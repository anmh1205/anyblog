---
title: Tải và kiểm tra OTA image
description: Kiểm precondition, HTTP metadata, partition size, streaming write và SHA-256.
---

# Tải và kiểm tra OTA image

Component `ota` ghi image vào OTA partition không đang chạy. Nó không tự quyết định lệnh có hợp lệ về nghiệp vụ hay khi nào bản mới được confirm.

## Command input

Một job OTA gồm:

```json
{
  "command_id": "ota-lab-01",
  "command": "ota_update",
  "params": {
    "job_id": "lab-01",
    "version": "1.0.1",
    "url": "http://lab.example/ivts-firmware.bin",
    "sha256": "<64-hex-characters>",
    "size": 692368,
    "confirm_timeout_sec": 180
  }
}
```

Giá trị size và hash phải lấy từ đúng file sẽ phục vụ.

## Preconditions

Trước khi tải, app/OTA kiểm:

- ignition và trạng thái vận hành phù hợp
- điện áp thiết bị trên ngưỡng an toàn
- URL và SHA hợp lệ
- không có OTA khác đang chạy
- next partition tồn tại và đủ lớn

## Streaming path

```text
SIM7600 HTTP
  → chunk tối đa theo adapter
  → esp_ota_write
  → PSA SHA-256 update
  → lặp tới expected size
  → compare digest
  → esp_ota_end
  → set boot partition
```

Implementation hiện dùng chunk 1024 byte và PSA Crypto SHA-256 phù hợp mbedTLS 4 trong ESP-IDF 6.1.1.

## Kiểm nhiều lớp

Không tin riêng HTTP status. Cần kiểm:

- status thành công
- content/received size đúng expected
- không vượt partition
- SHA-256 đúng
- `esp_ota_end()` xác nhận image hợp lệ
- set boot partition thành công

Chỉ sau đó mới lưu pending context và reboot.

## Partition layout

Firmware có factory, `ota_0` và `ota_1`, mỗi app slot 1536 KiB. Build hiện tại khoảng 692.368 byte, còn khoảng 56 phần trăm ở slot nhỏ nhất. Luôn lấy số mới từ build output, không dựa mãi vào con số này.

## Failure injection

Thử trên board lab:

- HTTP 404
- size khai báo nhỏ/lớn hơn file
- hash sai một ký tự
- ngắt mạng giữa chunk
- pin giảm dưới ngưỡng trước khi bắt đầu
- image lớn hơn partition

Không case nào được đổi boot partition sang image chưa xác nhận toàn vẹn.

**Mốc hoàn thành.** Chỉ image đúng size, hash và format mới được chọn làm boot target.
