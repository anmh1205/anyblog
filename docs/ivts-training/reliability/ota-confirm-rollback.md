---
title: Xác nhận OTA và rollback
description: Dùng health proof, trusted deadline và uptime fallback để quyết định giữ hoặc quay lại bản cũ.
---

# Xác nhận OTA và rollback

Boot được chưa đủ để coi image mới tốt. Firmware bật rollback của ESP-IDF và giữ image ở trạng thái pending verify cho tới khi có bằng chứng hoạt động.

## Health proof hiện tại

Image mới được xem là healthy khi:

1. broker đang kết nối
2. một status publish đã nhận ACK

Điều này chứng minh scheduler, modem path, MQTT và app publish hoạt động đủ để backend thấy thiết bị.

## Hai loại deadline

`ivts_ota_confirm_decide()` trong core dùng:

- absolute deadline nếu thời gian trusted
- uptime fallback nếu RTC chưa đáng tin

Nhờ vậy thiết bị không chờ vô hạn chỉ vì chưa có GNSS/RTC, và cũng không dùng wall clock sai để rollback tức thì.

## Boot flow

```text
boot image mới
  → đọc OTA pending context từ NVS
  → kiểm running partition state
  → chạy app
  → chờ health proof
  → healthy: mark app valid, xóa pending
  → timeout: mark invalid/rollback, reboot
```

## Context phải được lưu trước reboot

Job ID, expected version, deadline/fallback và trạng thái cần thiết phải tồn tại sau reset. Nếu reboot xảy ra trước commit NVS, image mới có thể thiếu policy confirm.

## Host test policy

```bash
bash tools/host_test.sh ota_confirm
```

Test ma trận:

| Trusted time | Healthy | Deadline | Quyết định |
| --- | --- | --- | --- |
| có | có | chưa hết | accept |
| có | không | đã hết | rollback |
| không | có | uptime chưa hết | accept |
| không | không | uptime đã hết | rollback |
| không | không | chưa hết | wait |

## Test trên board

Lần một, giữ broker online. Xác nhận log pending verify rồi mark valid. Reset lại và đảm bảo vẫn ở version mới.

Lần hai, cài một build lab khác rồi giữ broker offline quá timeout. Xác nhận rollback về slot cũ. Cần image cũ đã biết boot được.

## Không mark valid quá sớm

Mark valid ngay ở `app_main()` chỉ chứng minh CPU chạy vài dòng. Nó vô hiệu hóa mục đích rollback khi modem, config hoặc event loop của bản mới hỏng.

**Mốc hoàn thành.** Bạn tái hiện được cả accept và rollback trên board thử nghiệm.
