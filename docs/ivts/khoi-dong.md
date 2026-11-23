---
slug: "/ivts/khoi-dong"
title: "Bài 1. Từ thư mục trống tới log khởi động"
sidebar_label: "Bài 1 · Từ project trống đến bản build đầu tiên"
description: "Tạo project ESP-IDF và xem log từ app_main."
---

## Chuẩn bị ESP-IDF

Mở terminal ESP-IDF **v6.1.1**. Đây là bản SDK mà `.vscode/settings.json` của project trỏ tới. Nếu dùng Espressif Installation Manager, mở terminal của bản v6.1.1. Trên Windows, bạn cũng có thể nạp profile bằng PowerShell. Sửa đường dẫn profile và đường dẫn mã nguồn theo nơi bạn đã lưu.

~~~powershell
$profileIdf = 'C:\Espressif\tools\Microsoft.v6.1.1.PowerShell_profile.ps1'
if (Test-Path -LiteralPath $profileIdf) { . $profileIdf }
idf.py --version

$ref = Join-Path $env:USERPROFILE 'Downloads\ivts-firmware'
$lab = Join-Path $env:USERPROFILE 'ivts-lab'
New-Item -ItemType Directory -Path $lab | Out-Null
Set-Location -LiteralPath $lab
New-Item -ItemType Directory -Path main,components | Out-Null
~~~

## Tạo project tối thiểu

Chọn một tên thư mục mới nếu `ivts-lab` đã tồn tại. Tạo `CMakeLists.txt` ở thư mục gốc của project thực hành.

~~~cmake
cmake_minimum_required(VERSION 3.22)
include($ENV{IDF_PATH}/tools/cmake/project.cmake)
set(COMPONENTS main)
project(ivts-lab)
~~~

Tạo `main/CMakeLists.txt` để đăng ký file C của component `main`.

~~~cmake
idf_component_register(SRCS "main.c")
~~~

Tạo `main/main.c`. ESP-IDF gọi `app_main()` sau khi đã khởi tạo hệ thống.

~~~c
#include <stdio.h>

void app_main(void)
{
    puts("IVTS LAB: app_main reached");
}
~~~

## Build và nạp thử

~~~powershell
idf.py set-target esp32s3
idf.py build
Get-Item .\build\ivts-lab.bin
~~~

Nếu có board dành riêng cho thực hành, thay `COM7` bằng cổng trong Device Manager rồi chạy `idf.py -p COM7 flash monitor`. Mốc đạt là log `IVTS LAB: app_main reached`. Thoát monitor bằng `Ctrl+]`. Nếu đã có file `.bin` nhưng monitor không thấy log, kiểm tra cổng và cách board đưa console ra USB trước khi sửa code. [Hướng dẫn build, flash và monitor của Espressif](https://docs.espressif.com/projects/esp-idf/en/v6.1.1/esp32s3/get-started/windows-start-project.html)
