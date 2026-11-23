---
title: Build, flash và đọc boot log
description: Nạp image tối thiểu lên ESP32-S3 và phân biệt lỗi build, flash, boot và monitor.
---

# Build, flash và đọc boot log

Bài này tách bốn giai đoạn thường bị gọi chung là “không chạy”: biên dịch, ghi flash, boot và xem console.

## 1. Xác định cổng serial

```powershell
[System.IO.Ports.SerialPort]::GetPortNames()
```

Ghi lại danh sách trước và sau khi cắm board. Cổng mới thường là cổng cần dùng, nhưng board có thể có cả USB-JTAG và UART bridge.

## 2. Flash image

```powershell
Set-Location -LiteralPath $lab
idf.py -p COM7 flash
```

Thay `COM7` bằng cổng thật. `idf.py` dùng các offset trong `flash_args`, nên không tự đoán offset cho từng file.

## 3. Mở monitor

```powershell
idf.py -p COM7 monitor
```

Nhấn reset trên board nếu cần. Mốc đạt là:

```text
IVTS LAB: app_main reached
```

Thoát monitor bằng `Ctrl+]`.

## Đọc boot log theo lớp

| Log dừng ở đâu | Nhóm nguyên nhân cần kiểm tra |
| --- | --- |
| Không mở được COM | driver, cổng sai, ứng dụng khác đang giữ cổng |
| esptool không đồng bộ | boot mode, cáp, reset/boot strap |
| Bootloader chạy nhưng app không chạy | partition table, image offset, image lỗi |
| App chạy nhưng không thấy `puts` | console output, baud, reset timing |
| Reset lặp | watchdog, panic, nguồn yếu, brownout |

## Flash và monitor trong một lệnh

```powershell
idf.py -p COM7 flash monitor
```

Lệnh gộp thuận tiện sau khi từng bước đã hoạt động. Khi đang debug, tách hai lệnh để biết lỗi thuộc flash hay monitor.

## Lưu log làm bằng chứng

Serial monitor là quan sát, không phải kết luận. Ở các bài sau, ghi lại:

- commit hoặc trạng thái source đã build
- version ESP-IDF
- cổng serial và baud
- thời điểm reset
- đoạn log từ bootloader tới mốc cần kiểm tra

## Lỗi nguồn khi modem chưa được ghép

Project tối thiểu không bật SIM7600. Nếu board vẫn reset hoặc brownout ở bước này, lỗi không nằm ở LTE/MQTT. Hãy kiểm tra nguồn, strap và phần cứng cơ bản trước.

## Biến thể

Thêm một bộ đếm static và in ra mỗi lần boot. Nhấn reset ba lần. Sau đó tắt nguồn hoàn toàn. Biến static không giữ qua reset, giúp bạn phân biệt RAM thông thường với RTC memory và NVS sẽ học sau.

**Mốc hoàn thành.** Bạn flash được image, đọc được boot log và có thể phân loại lỗi theo đúng giai đoạn.
