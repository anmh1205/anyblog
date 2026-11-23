---
title: I2C và DS3231M RTC
description: Khởi tạo bus dùng chung, đọc RTC và xác định timestamp có đáng tin cậy.
---

# I2C và DS3231M RTC

`board_i2c.c` sở hữu bus trên SDA GPIO2 và SCL GPIO1. RTC và IMU dùng chung bus, nên init/deinit và đồng bộ transaction phải có một chủ sở hữu rõ ràng.

## RTC ở địa chỉ 0x68

`board_rtc.c` đọc các thanh ghi ngày giờ của DS3231M. Dữ liệu BCD phải được đổi sang số thập phân và kiểm range trước khi chuyển thành epoch.

## Khi nào RTC được tin

Hai điều kiện hiện tại:

1. Oscillator Stop Flag không bật.
2. Năm nằm từ 2024 đến 2099.

Nếu không đạt, firmware vẫn có thể đọc một con số nhưng đánh dấu thời gian không trusted. Payload phải giữ distinction này.

## Đồng bộ từ GNSS

Khi modem phát GNSS fix có UTC hợp lệ, app có thể:

1. kiểm fix validity
2. chuyển ngày giờ GNSS thành epoch
3. ghi RTC
4. đọc lại để xác minh
5. chuyển timestamp trust sang true

Không ghi RTC từ một chuỗi AT parse được nhưng chưa có fix.

## I2C failure không làm toàn app chết

RTC là degraded dependency. Nếu RTC không trả lời, app vẫn có thể chạy với monotonic time và timestamp không trusted. Tuy nhiên board/ADC cốt lõi vẫn là fatal theo startup policy hiện tại.

## Kiểm tra trên board

1. Boot khi RTC chưa được đặt hoặc tháo pin backup.
2. Quan sát trạng thái untrusted.
3. Cấp GNSS fix hợp lệ.
4. Reset board.
5. Xác nhận RTC vẫn giữ thời gian và OSF đã được xử lý.

## Lỗi thường gặp

**I2C scan thấy 0x68 nhưng thời gian sai.** Bus hoạt động không có nghĩa BCD, century bit hoặc OSF đúng.

**Timeout sau khi bật IMU.** Kiểm concurrency trên bus và lifetime của device handle.

**Thời gian nhảy nhưng timeout FSM cũng nhảy.** Code đã dùng wall clock nhầm chỗ. Timeout phải dùng monotonic milliseconds.

## Bài tập

Viết test host cho civil time với 2024-02-29, cuối năm và một ngày ngoài range. Phần I2C không host-test, nhưng phần chuyển đổi lịch thì có.

**Mốc hoàn thành.** Bạn có thể giải thích riêng “đọc được RTC”, “RTC hợp lệ” và “timestamp trusted”.
