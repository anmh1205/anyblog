---
title: NVS, boot ID và context bền vững
description: Lưu config có CRC, boot identity và trạng thái OTA trong NVS.
---

# NVS, boot ID và context bền vững

`storage_nvs.c` quản lý dữ liệu nhỏ cần sống qua reset và mất nguồn. Dữ liệu lớn, append liên tục thuộc SD, không thuộc NVS.

## Các nhóm dữ liệu

- config versioned và CRC
- boot ID dùng tạo `message_id`
- OTA pending context
- metadata nhỏ cần commit nguyên tử

## Boot ID

Mỗi boot lấy một ID bền vững mới. `seq` tăng trong boot hiện tại. Cặp này tạo identity cho record. Khi replay sau reboot, record giữ boot ID cũ nằm trong chính record, không lấy boot ID mới.

## Config blob

Quy trình đọc an toàn:

1. lấy size trước
2. từ chối size không đúng version hỗ trợ
3. đọc blob vào buffer giới hạn
4. kiểm magic/version
5. kiểm CRC
6. validation field
7. chỉ sau đó áp config

Nếu bất kỳ bước nào lỗi, dùng default/Kconfig và log nguyên nhân.

## Commit semantics

NVS set chưa đủ. Cần commit namespace. Khi cập nhật nhiều key tạo thành một transaction logic, phải thiết kế thứ tự để reset giữa chừng không tạo context nửa cũ nửa mới.

OTA pending context đặc biệt nhạy cảm. App cần lưu đủ thông tin trước reboot để bản mới biết deadline và trạng thái đang chờ xác nhận.

## Wear

Không ghi counter nhanh hoặc telemetry mỗi 500 ms vào NVS. NVS có wear leveling nhưng vẫn không phải log store. Queue trên SD nhận dữ liệu append nhiều hơn.

## Fault cases cần thử

- namespace chưa tồn tại ở lần boot đầu
- blob thiếu một phần
- CRC sai
- version mới hơn firmware
- commit thất bại
- reset sau lưu OTA context nhưng trước reboot chủ động

## Quan sát sau reset

Ghi boot ID và config version ra log. Reset mềm, deep sleep wake và power cycle. Kiểm boot ID thay đổi theo policy, còn config vẫn giữ.

**Mốc hoàn thành.** Bạn phân biệt được dữ liệu nào thuộc NVS, RTC memory, RAM và SD.
