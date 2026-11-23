---
title: BLE transport cho OBD
description: Dùng NimBLE central để scan, connect và tìm service 0x18F0 của adapter ELM327.
---

# BLE transport cho OBD

Component OBD dùng ESP32-S3 làm NimBLE central. Nó kết nối tới adapter, discover GATT và tạo một kênh byte cho ELM327 session.

## GATT contract hiện tại

| Thành phần | UUID |
| --- | --- |
| Service | `0x18F0` |
| Notify RX | `0x2AF0` |
| Write TX | `0x2AF1` |

Nhiều adapter khác dùng service `FFF0` hoặc UUID vendor riêng. Kết nối BLE thành công nhưng không có service trên vẫn là adapter không tương thích với driver hiện tại.

## Chọn target

Nếu cấu hình có BLE address, driver tìm đúng adapter. Nếu address rỗng, driver scan và discover theo tiêu chí hỗ trợ. Với nhiều adapter xung quanh, cấu hình address cụ thể giúp test lặp lại được.

## Lifecycle

```text
scan
  → connect
  → service discovery
  → characteristic discovery
  → subscribe notify
  → transport ready
  → ELM327 initialization
```

Mỗi bước có timeout và đường cleanup. Disconnect phải đưa session về state có thể scan lại, không giữ handle cũ.

## Notify path

Notify có thể chia response ELM327 ở bất kỳ ranh giới nào. BLE layer chỉ đưa bytes lên session parser, không giả định mỗi notify là một dòng hoàn chỉnh.

## Kiểm tra adapter trước

Dùng BLE scanner:

1. ghi tên và địa chỉ adapter
2. connect
3. tìm service `0x18F0`
4. xác nhận `0x2AF0` có notify
5. xác nhận `0x2AF1` cho write phù hợp

Nếu thiếu, đừng sửa PID parser.

## Failure cases

- scan timeout
- connect fail
- service không tồn tại
- subscribe fail
- disconnect giữa command
- notify đến sau khi session đã reset

Mỗi case phải giải phóng connection state và cho phép retry có backoff.

**Mốc hoàn thành.** Bạn phân biệt được lỗi BLE transport, lỗi ELM327 session và lỗi PID decode bằng mốc log cụ thể.
