---
title: CMake và ranh giới component
description: Dựng dependency graph ESP-IDF và ngăn phụ thuộc chéo giữa các adapter.
---

# CMake và ranh giới component

ESP-IDF component không chỉ là thư mục. `idf_component_register()` xác định source, public include path và dependency được phép.

## Root project

Firmware tham chiếu dùng:

```cmake
cmake_minimum_required(VERSION 3.22)
include($ENV{IDF_PATH}/tools/cmake/project.cmake)
set(COMPONENTS main)
project(ivts-firmware)
```

`main` là root được chọn. Dependency từ `main` tới `app`, rồi từ `app` tới phần còn lại, tạo ra tập component cần build.

## Public và private dependency

Một component có thể đăng ký như sau:

```cmake
idf_component_register(
    SRCS "src/example.c"
    INCLUDE_DIRS "include"
    PRIV_INCLUDE_DIRS "src"
    REQUIRES ivts-core
)
```

`INCLUDE_DIRS` là API cho consumer. `PRIV_INCLUDE_DIRS` chỉ dùng trong component. `REQUIRES` được truyền ra consumer, còn `PRIV_REQUIRES` chỉ phục vụ source của component hiện tại.

Trong firmware này, `app_priv.h`, `board_priv.h`, `modem_priv.h`, `obd_priv.h`, `ota_priv.h` và `storage_priv.h` phải luôn là implementation detail.

## Tự dựng graph trong lab

Copy `ivts-core` trước:

```powershell
$ref = 'C:\Users\Admin\Downloads\ivts-firmware'
$lab = Join-Path $env:USERPROFILE 'ivts-lab'
New-Item -ItemType Directory -Path "$lab\components" -Force
Copy-Item "$ref\components\ivts-core" "$lab\components" -Recurse
```

Sau đó cho `main` phụ thuộc core:

```cmake
idf_component_register(
    SRCS "main.c"
    PRIV_REQUIRES ivts-core
)
```

Build. Nếu header được đặt đúng public path, `main.c` có thể include `ivts_core/base/err.h` mà không thêm đường dẫn thủ công.

## Ranh giới được máy kiểm tra

Hai script `tools/check_layers.ps1` và `tools/check_layers.sh` kiểm tra chín quy tắc. Ý nghĩa của lớp kiểm tra này là bắt lỗi kiến trúc trước khi compiler hoặc reviewer phải suy luận toàn graph.

Ví dụ vi phạm:

```c
// Sai: storage gọi thẳng modem
#include "modem/modem.h"
```

Luồng đúng là storage phát trạng thái hoặc trả kết quả cho app. App quyết định có yêu cầu modem publish hay không.

## Vì sao không để component gọi nhau

Nếu modem tự ghi SD, nó phải biết record format, queue policy và trạng thái mount. Nếu storage tự publish, nó phải biết MQTT session. Khi đó:

- không test từng adapter độc lập được
- init order trở thành vòng lặp
- lỗi mạng lan vào filesystem
- thay modem khác buộc sửa storage

Composition root chịu thêm code điều phối để đổi lấy dependency một chiều.

## Bài tập cố ý làm sai

Trong bản lab, tạm include `modem/modem.h` từ một file storage rồi chạy layer checker. Ghi lại rule bị báo. Hoàn tác thay đổi ngay sau đó.

**Mốc hoàn thành.** Bạn giải thích được khác biệt giữa header public và private, cũng như vì sao `app` được phép phụ thuộc mọi adapter nhưng adapter không được phụ thuộc nhau.
