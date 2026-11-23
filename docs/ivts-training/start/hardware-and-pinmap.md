---
title: Phần cứng và pin map
description: Hiểu các ngoại vi của board IVTS trước khi chạy driver.
---

# Phần cứng và pin map

Pin map là hợp đồng giữa firmware và PCB. Trước khi debug driver, đối chiếu `components/board/include/board/board.h` với sơ đồ đúng revision của board.

## Pin đang được firmware dùng

| Khối | Tín hiệu | GPIO hoặc bus |
| --- | --- | --- |
| I2C | SDA, SCL | GPIO2, GPIO1 |
| IMU | interrupt | GPIO41 |
| ADC nguồn xe | ADC1 channel | GPIO3 |
| ADC nguồn thiết bị | ADC1 channel | GPIO4 |
| SIM7600 UART | TX, RX | GPIO17, GPIO18 |
| SIM7600 control | PWRKEY, RESET | GPIO34, GPIO35 |
| LED | status | GPIO15 |
| SDMMC | CLK, CMD | GPIO10, GPIO9 |
| SDMMC | D0, D1, D2, D3 | GPIO11, GPIO12, GPIO7, GPIO8 |
| SD | card detect | GPIO13 |
| Modem serial | UART | UART1, 115200 baud |

Đây là pin map của firmware hiện tại, không phải pin map mặc định của một devkit ESP32-S3.

## Ngoại vi trên I2C

Firmware dùng hai thiết bị:

- DS3231M ở địa chỉ `0x68` để giữ thời gian.
- LIS3DSH, thử địa chỉ `0x1D` rồi `0x1E`, để phát hiện chuyển động.

Tên chip quan trọng. LIS3DSH không dùng cùng toàn bộ register map với LIS3DH. Nếu phần cứng gắn chip khác, việc “I2C scan thấy địa chỉ” chưa đủ chứng minh driver đúng.

## Đường đo nguồn

Hai kênh ADC đọc điện áp sau mạch chia. Driver:

1. Lấy tám mẫu raw.
2. Dùng curve fitting calibration của ESP-IDF để đổi raw sang mV ở chân ADC.
3. Nhân tỉ lệ chia áp 11:1.
4. Áp hệ số hiệu chuẩn theo ppm cho từng kênh.

Hệ số hiện tại là `1020070 ppm` cho nguồn xe và `1019950 ppm` cho nguồn thiết bị. Nếu eFuse không hỗ trợ calibration, driver trả lỗi thay vì giả định điện áp danh định.

## Hạn chế wake-up của GPIO41

GPIO41 không phải RTC GPIO của ESP32-S3. Vì vậy IMU có thể đánh thức light sleep qua GPIO, nhưng không thể đánh thức deep sleep bằng pin này. Khi cần motion wake, FSM phải chọn light sleep. Khi deep sleep, firmware chỉ dựa vào timer wake.

## Checklist trước khi cấp nguồn

1. Xác nhận PCB revision và pin map.
2. Đo continuity từ đầu vào nguồn tới mạch chia áp.
3. Xác nhận nguồn modem đủ dòng đỉnh.
4. Cắm microSD đúng điện áp và định dạng.
5. Xác nhận anten LTE và GNSS đã gắn trước khi bật modem lâu.
6. Chưa cắm BLE OBD cho tới khi firmware cơ bản boot ổn định.

## Bài tập

Tạo một bảng ba cột gồm “tín hiệu”, “đọc ở file nào”, “event nào được phát”. Ví dụ nguồn xe được đọc ở `board_adc.c`, được lấy mẫu bởi `board_os.c` và trở thành `IVTS_EV_POWER_SAMPLE`.

**Mốc hoàn thành.** Bạn giải thích được vì sao firmware có motion wake ở light sleep nhưng không có ở deep sleep, và biết vị trí đo điện áp nào an toàn.
