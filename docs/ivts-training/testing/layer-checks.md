---
title: Kiểm tra ranh giới kiến trúc
description: Chạy chín rule để ngăn core phụ thuộc ESP-IDF và adapter phụ thuộc chéo.
---

# Kiểm tra ranh giới kiến trúc

Compiler xác nhận code build được. Layer checker xác nhận dependency vẫn theo kiến trúc đã chọn.

## Chạy trên PowerShell

```powershell
Set-Location 'C:\Users\Admin\Downloads\ivts-firmware'
.\tools\check_layers.ps1
```

## Chạy trên Bash

```bash
cd /mnt/c/Users/Admin/Downloads/ivts-firmware
bash tools/check_layers.sh
```

Kết quả phải báo cả chín rule pass.

## Các loại vi phạm cần bắt

- `ivts-core` include ESP-IDF hoặc FreeRTOS
- adapter include public API của adapter khác
- public header để lộ private header
- app logic bị đẩy vào `main`
- source dùng đường include xuyên qua `src` component khác
- dependency CMake không khớp lớp cho phép

## Vì sao dùng cả source scan và CMake

CMake graph có thể sạch nhưng source include bằng đường tương đối lách qua dependency. Ngược lại source chưa include nhưng `REQUIRES` thừa vẫn làm coupling tăng. Checker cần xem cả hai dạng.

## Thử nghiệm cố ý

Trong branch/lab tạm:

```c
// Thêm vào một file ivts-core, rồi chạy checker
#include "freertos/FreeRTOS.h"
```

Checker phải fail trước full firmware build. Xóa dòng ngay sau bài tập.

## Khi rule cần thay đổi

Không sửa script chỉ để pull request xanh. Nếu dependency mới thật sự cần thiết:

1. nêu use case
2. xem có thể biểu diễn bằng event/interface không
3. đánh giá host-testability
4. cập nhật sơ đồ kiến trúc
5. chỉ sau quyết định mới cập nhật rule

## Ghép vào CI

Thứ tự nhanh:

```text
layer check
  → host tests
  → Docusaurus/docs build nếu có
  → ESP-IDF full build
```

Layer check fail nhanh hơn IDF build và cho thông báo đúng nguyên nhân.

**Mốc hoàn thành.** Bạn tạo được một vi phạm có chủ ý, thấy đúng rule fail và phục hồi về chín rule pass.
