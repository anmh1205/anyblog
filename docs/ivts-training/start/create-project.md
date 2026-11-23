---
title: Tạo project ESP-IDF tối thiểu
description: Tạo project trống và đi tới app_main mà chưa kéo cả firmware vào.
---

# Tạo project ESP-IDF tối thiểu

Mục tiêu của bài này là tạo image nhỏ nhất có cùng target với IVTS. Chưa copy component nào từ repo tham chiếu.

## 1. Tạo cấu trúc thư mục

```powershell
. 'C:\Espressif\tools\Microsoft.v6.1.1.PowerShell_profile.ps1'

$lab = Join-Path $env:USERPROFILE 'ivts-lab'
New-Item -ItemType Directory -Path $lab -ErrorAction Stop
New-Item -ItemType Directory -Path (Join-Path $lab 'main')
Set-Location -LiteralPath $lab
```

Nếu thư mục đã tồn tại, không chạy lệnh trên để ghi đè. Chọn `ivts-lab-2` hoặc kiểm tra nội dung cũ.

## 2. Tạo CMake gốc

Tạo `CMakeLists.txt`:

```cmake
cmake_minimum_required(VERSION 3.22)
include($ENV{IDF_PATH}/tools/cmake/project.cmake)
set(COMPONENTS main)
project(ivts-lab)
```

`set(COMPONENTS main)` làm build ban đầu thật nhỏ. Ở firmware đầy đủ, `main` phụ thuộc `app`, rồi dependency graph kéo các component còn lại vào.

## 3. Đăng ký component main

Tạo `main/CMakeLists.txt`:

```cmake
idf_component_register(SRCS "main.c")
```

Tạo `main/main.c`:

```c
#include <stdio.h>

void app_main(void)
{
    puts("IVTS LAB: app_main reached");
}
```

ESP-IDF chuẩn bị scheduler và runtime trước khi gọi `app_main()`. `app_main()` không phải `main()` của chương trình C hosted.

## 4. Chọn target và build

```powershell
idf.py set-target esp32s3
idf.py build
Get-Item .\build\ivts-lab.bin
```

## Bạn vừa tạo ra những gì

| Artifact | Vai trò |
| --- | --- |
| `bootloader.bin` | Khởi tạo chip và chọn app partition |
| `partition-table.bin` | Mô tả phân vùng flash |
| `ivts-lab.bin` | Application image |
| `flash_args` | Offset và file dùng khi flash |
| `.map` | Symbol và phân bố bộ nhớ |

## Vì sao chưa copy toàn bộ repo

Nếu build tối thiểu lỗi, nguyên nhân nằm ở môi trường hoặc project skeleton. Nếu copy cả firmware ngay, cùng một lỗi bị trộn với NimBLE, partition, mbedTLS, Kconfig và driver. Mỗi bài chỉ thêm một trục thay đổi.

## Kết quả mong đợi

Build kết thúc bằng `Project build complete` và `build\ivts-lab.bin` tồn tại. Chưa cần thấy telemetry hay task nào khác.

## Biến thể

Đổi tên project trong `project(ivts-lab)` thành `ivts-lab-step1`, chạy `idf.py fullclean` và build lại. Quan sát tên file application thay đổi. Điều này giúp bạn phân biệt tên project với version firmware và tên component.

**Mốc hoàn thành.** Bạn có thể xóa riêng thư mục build, cấu hình lại target và tái tạo image mà không copy file sinh tự động.
