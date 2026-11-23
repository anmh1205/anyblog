---
slug: "/ivts/ota-va-rollback"
title: "Bài 7. Cập nhật OTA và quay lại bản cũ"
sidebar_label: "Bài 7 · Cập nhật OTA và rollback"
description: "Thử xác nhận image mới và quay lại phiên bản đã chạy ổn."
---

## Chính sách xác nhận image

1. Chạy `bash tools/host_test.sh ota_confirm`. Với đồng hồ tin cậy, firmware so với deadline đã lưu. Khi thiếu giờ tin cậy, nó dùng uptime của lần boot. App xem bản mới đủ điều kiện xác nhận khi broker đang kết nối và thiết bị đã nhận ACK cho bản tin `status`.
## Chuẩn bị và gửi bản cập nhật

2. Dùng board thử nghiệm với `partitions.csv` và một image trước đó đã biết chạy được. Chuẩn bị bản mới có version khác, đẩy file `ivts-firmware.bin` lên máy chủ lab mà SIM7600 tải được, và tính SHA-256 bằng `Get-FileHash -Algorithm SHA256 <đường-dẫn-bin>`. Dùng một version cụ thể trong `version.txt` ở root project thực hành trước mỗi lần build để phân biệt `ota_running_version()`. Kiểm tra kích thước image ở log build so với slot 1536 KiB.
3. Khi ignition OFF và pin đáp ứng ngưỡng OTA, gửi lệnh `ota_update` qua `v1/<device_id>/commands`. Nếu board ngủ trước khi nhận được lệnh, đặt `sleep_enabled: false` qua lệnh `update_config` trên broker lab khi board còn online. Mẫu sau là payload OTA. Thay URL, SHA-256, kích thước và version bằng giá trị thực của file vừa build. `components/app/src/app_cmd.c` · `components/ota/src/ota.c`

   ~~~json
   {
     "command_id": "ota-lab-01",
     "command": "ota_update",
     "params": {
       "job_id": "lab-01",
       "version": "1.0.1",
       "url": "http://firmware.example/ivts-firmware.bin",
       "sha256": "<64 ký tự hex từ Get-FileHash>",
       "size": 123456,
       "confirm_timeout_sec": 180
     }
   }
   ~~~

   Theo dõi topic `v1/<device_id>/firmware` và log serial. Firmware tải theo đoạn, kiểm tra hash và image rồi mới chọn phân vùng boot mới. Task app lưu ngữ cảnh chờ xác nhận vào NVS trước khi khởi động lại.

## Thử xác nhận và rollback

4. Chạy một lần với broker hoạt động sau reboot. Mốc đạt là log `image PENDING_VERIFY` rồi `image hợp lệ: đã mark valid`, và version mới vẫn chạy sau lần reset tiếp theo. Chạy lần khác khi có phân vùng cũ có thể boot. Đợi tải và reboot xong rồi giữ broker offline quá thời hạn confirm. Mốc đạt là log `quá hạn confirm: rollback` và version hoặc phân vùng trở lại bản cũ. `components/app/src/app.c` · `components/app/src/app_init.c`
