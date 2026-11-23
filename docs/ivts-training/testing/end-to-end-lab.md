---
title: Bài thực hành end-to-end
description: Dựng và kiểm chứng toàn bộ vòng đời ignition, telemetry, mất mạng, replay, sleep và OTA.
---

# Bài thực hành end-to-end

Bài cuối không thêm API mới. Nó buộc bạn nối mọi lớp và giải thích hệ thống từ input vật lý tới bằng chứng trên broker, SD và bootloader.

## Kịch bản A: Chuyến đi và sụt áp ngắn

1. Boot với ignition OFF.
2. Nâng nguồn xe trên 13 V trong ít nhất 1,5 giây.
3. Xác nhận DRIVING, GNSS và OBD start.
4. Hạ xuống 11 V trong 5 giây rồi nâng lại.
5. Xác nhận vẫn DRIVING.
6. Hạ dưới 12,5 V liên tục ít nhất 15 giây.
7. Xác nhận PARKED và OBD stop.

Trước khi chạy, viết timeline dự đoán state/action.

## Kịch bản B: Mất broker và replay

1. Khi DRIVING online, ghi ba `message_id`.
2. Ngắt broker.
3. Tạo ít nhất năm record.
4. Xác nhận queue pending tăng.
5. Reset thiết bị.
6. Khôi phục broker.
7. Xác nhận replay giữ ID cũ và pop sau ACK.
8. Ghi nhận duplicate nếu có và giải thích cửa sổ gây ra nó.

## Kịch bản C: Motion và sleep

1. Đưa ignition OFF và chờ PARKED.
2. Tạo motion, xác nhận ALARM.
3. Đợi quiet time, xác nhận trở lại PARKED.
4. Với motion wake bật, xác nhận light sleep.
5. Với timer-only, xác nhận deep sleep.
6. Kiểm state sau từng wake reason.

## Kịch bản D: OTA hai nhánh

### Nhánh accept

1. Cài image mới đúng hash.
2. Giữ broker online.
3. Chờ status ACK.
4. Xác nhận image được mark valid.
5. Reset và kiểm vẫn ở version mới.

### Nhánh rollback

1. Cài một image lab khác.
2. Giữ broker offline quá confirm timeout.
3. Xác nhận rollback về image cũ.
4. Kiểm firmware event báo kết quả ở lần boot sau.

## Hồ sơ hoàn thành

Lưu:

- output 15 host test
- output 9 layer rule
- full build và size
- serial log bốn kịch bản
- MQTT capture
- queue pending trước/sau replay
- SHA/version của hai OTA image
- bảng dự đoán và chỗ dự đoán sai

## Câu hỏi tự đánh giá

1. Event nào có thể bị drop và hậu quả là gì?
2. Vì sao record replay giữ boot ID cũ?
3. Tại sao motion wake buộc light sleep?
4. Khi nào OTA được mark valid?
5. Lỗi ở đâu nếu BLE connect nhưng không tìm thấy service?

**Mốc hoàn thành.** Bạn không chỉ làm firmware chạy. Bạn có bằng chứng cho happy path, mất mạng, mất nguồn, sleep và rollback.
