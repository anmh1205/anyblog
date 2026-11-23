---
title: Kiểm thử lỗi và mất nguồn
description: Tạo fault matrix cho ADC, queue, SD, modem, OBD và OTA.
---

# Kiểm thử lỗi và mất nguồn

Happy path chỉ chứng minh hệ thống hoạt động khi mọi dependency hợp tác. Firmware trên xe cần chứng minh điều xảy ra khi nguồn, mạng và storage dừng ở thời điểm xấu nhất.

## Fault matrix

| Khối | Lỗi đưa vào | Kết quả cần giữ |
| --- | --- | --- |
| ADC | calibration không có, sample lỗi | startup fail rõ ràng, không dùng số giả |
| RTC | OSF set, ngày sai | timestamp untrusted, app vẫn chạy |
| IMU | không probe được | degraded mode, ignition vẫn hoạt động |
| SD | không mount | online publish vẫn chạy |
| Queue | cắt frame cuối | truncate tail, frame cũ còn đọc được |
| LTE | mất registration | backoff, không reset storm |
| MQTT | mất ACK | record còn queue, có thể duplicate |
| BLE | disconnect giữa PID | cleanup và reconnect được |
| OTA | hash sai | không đổi boot partition |
| OTA confirm | broker offline | rollback sau deadline |

## Cắt nguồn có kiểm soát

Không cắt nguồn ngẫu nhiên rồi chỉ nhìn “boot được”. Chọn checkpoint:

- giữa ghi queue header
- giữa payload
- sau CRC nhưng trước cursor persist
- sau OTA context commit
- sau set boot partition
- trước health ACK

Gắn log/checkpoint hoặc fixture để tăng xác suất chạm đúng cửa sổ.

## Invariant sau phục hồi

Mỗi test phải có invariant:

- queue không đọc frame rác
- record đã ACK không quay lại ngoài cửa sổ cursor policy
- record chưa ACK không biến mất
- image hash sai không boot
- config CRC sai không được áp
- app không deadlock sau reconnect

## Kiểm tra retry storm

Giữ broker offline lâu. Đo số lần connect theo phút. Khoảng retry phải tăng tới cap và reset sau một lần thành công thật, không reset vì AT trung gian.

## Hardware safety

Fault injection nguồn chỉ làm trên board lab và nguồn giới hạn dòng. Không ngắt nguồn trong khi thiết bị đang gắn vào hệ thống xe thật.

## Báo cáo một fault test

Ghi rõ firmware version, setup, fault timing, log trước/sau, invariant, kết quả và khả năng lặp lại. “Đã thử mất mạng” không đủ để tái hiện.

**Mốc hoàn thành.** Mỗi component có ít nhất một fault case và một invariant tự kiểm chứng.
