---
slug: /ivts
title: Giáo trình dựng lại firmware IVTS
sidebar_label: Tổng quan
description: Bảy bài thực hành dựng lại firmware IVTS trên ESP32-S3, từ app_main đến OTA.
---

Bạn sẽ tạo một project ESP-IDF trống, kiểm thử logic bằng dữ liệu giả, rồi ghép các component của IVTS theo thứ tự có thể kiểm chứng. Giữ một bản mã nguồn IVTS để đối chiếu. Đường dẫn C và CMake trong bài được tính từ thư mục gốc của firmware.

## Bạn cần chuẩn bị

- PC có ESP-IDF 6.1.1 và GCC trên Windows, Linux hoặc WSL để chạy các bài test C.
- Board ESP32-S3 để xem log và thử ADC. Bản IVTS đầy đủ cấu hình flash 16 MB. Đối chiếu pin map tại `components/board/include/board/board.h` với sơ đồ board trước khi nối ngoại vi.
- SIM7600, SIM, anten, microSD và một broker MQTT thử nghiệm cho bài kết nối. Dùng adapter OBD hoặc IMU tương thích cho bài liên quan.

Bắt đầu bằng các mốc build và host test trên PC. Khi chuyển sang board, dùng thiết bị thực hành để thử từng ngoại vi và quan sát log.

## Bảy bài thực hành

| Bài | Kết quả cần đạt |
| --- | --- |
| [1. Khởi động](./khoi-dong.md) | Build ra `ivts-lab.bin` và đọc log từ `app_main()` |
| [2. Logic ignition](./logic-ignition.md) | Chứng minh một sụt áp ngắn giữ nguyên trạng thái ignition |
| [3. Đọc ADC](./doc-adc.md) | Dùng logic đã kiểm thử với sự kiện từ board |
| [4. Ghép ứng dụng](./ghep-ung-dung.md) | Build đủ component và kiểm tra khởi động khi chưa provision |
| [5. MQTT và SD](./mqtt-va-sd.md) | Gửi một bản ghi, thử mất mạng rồi kiểm tra phát lại |
| [6. GNSS, OBD và ngủ](./gnss-obd-ngu.md) | Kiểm tra tín hiệu đầu vào và nguyên nhân đánh thức |
| [7. OTA và rollback](./ota-va-rollback.md) | Xác nhận bản cập nhật và thử quay lại image trước |

Sau bài 7, dùng [bài tập cuối](./bai-tap-cuoi.md) để theo dõi một kịch bản qua toàn bộ firmware.
