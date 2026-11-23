---
title: Build firmware đầy đủ
description: Tạo sdkconfig riêng, build ESP32-S3, đọc size và kiểm partition.
---

# Build firmware đầy đủ

Sau khi host test và layer check xanh, build application với ESP-IDF 6.1.1. Full build xác nhận API ESP-IDF, NimBLE, mbedTLS, partition và Kconfig khớp nhau.

## Build sạch vào thư mục riêng

```powershell
. 'C:\Espressif\tools\Microsoft.v6.1.1.PowerShell_profile.ps1'
$ref = 'C:\Users\Admin\Downloads\ivts-firmware'
Set-Location -LiteralPath $ref

$buildArgs = @(
  '-B', 'build-release',
  "-DSDKCONFIG=$ref\sdkconfig.release"
)
idf.py @buildArgs set-target esp32s3
idf.py @buildArgs build
```

Dùng sdkconfig riêng tránh ghi đè config đang dùng cho bài lab khác.

## Partition table

`partitions.csv` có factory, `ota_0` và `ota_1`, mỗi app slot 1536 KiB. Rollback OTA cần ít nhất hai OTA slot và OTA data partition đúng.

## Đọc báo cáo size

```powershell
idf.py @buildArgs size
idf.py @buildArgs size-components
```

Build đã kiểm tra trước đây tạo image khoảng `0xA9090`, tương đương 692.368 byte và còn khoảng 56 phần trăm trong app partition nhỏ nhất. Hãy dùng output mới làm nguồn sự thật vì code thay đổi sẽ đổi size.

## Điều cần kiểm

- target là ESP32-S3
- flash size 16 MB
- partition table custom được dùng
- rollback được bật
- NimBLE central được bật
- app image nhỏ hơn mọi slot có thể boot
- không có warning bị bỏ qua đáng ngờ

## Artifact release

Giữ cùng nhau:

- `bootloader.bin`
- `partition-table.bin`
- application `.bin`
- `ota_data_initial.bin` nếu quy trình flash cần
- `flash_args`
- map file
- SHA-256 của application
- source revision và sdkconfig

OTA server chỉ cần application image, còn factory flashing cần bộ artifact và offset đầy đủ.

## Không coi build pass là hardware pass

Build chỉ chứng minh compile/link/size. Nó không chứng minh pin map, nguồn modem, anten, ADC calibration, BLE adapter hay rollback trên board.

**Mốc hoàn thành.** Bạn tạo được bộ artifact truy vết về source/config, image vừa slot và hash được ghi lại.
