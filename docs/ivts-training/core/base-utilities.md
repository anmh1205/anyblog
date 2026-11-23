---
title: Tiện ích nền tảng
description: Hiểu error, CRC32, backoff, civil time và helper chuỗi trong ivts-core.
---

# Tiện ích nền tảng

Các file nhỏ trong `ivts-core/base` quyết định cách toàn hệ thống biểu diễn lỗi, kiểm tra dữ liệu và tính thời gian. Chúng phải được hiểu trước record, queue và retry.

## Error model

`err.h` định nghĩa `ivts_err_t`. Component trả mã lỗi có tên ổn định thay vì trả thẳng `esp_err_t` qua mọi lớp. `ivts_err_name()` cho log dễ đọc.

Nguyên tắc dùng:

- API public của IVTS trả `ivts_err_t`
- adapter chuyển lỗi ESP-IDF tại biên
- không dùng `bool` khi caller cần biết nguyên nhân
- không log và nuốt lỗi ở nhiều lớp cùng lúc

## CRC32

`crc32.c` được dùng để phát hiện record hoặc config bị hỏng. CRC không phải chữ ký bảo mật. Nó trả lời “bytes có thay đổi ngoài ý muốn không”, không trả lời “ai tạo dữ liệu này”.

Thứ tự xử lý record bền vững:

1. serialize các field theo version cố định
2. tính CRC trên vùng dữ liệu đã quy ước
3. ghi frame
4. khi đọc, kiểm magic và length trước
5. tính lại CRC
6. chỉ decode khi hợp lệ

## Exponential backoff

`backoff.c` giới hạn tốc độ retry của thao tác mạng. Backoff cần có:

- giá trị ban đầu
- giới hạn tối đa
- tăng sau thất bại
- reset sau thành công

Test `test_backoff.c` chạy hàng nghìn trường hợp để bắt overflow và sai biên. Không dùng phép nhân không kiểm soát trên integer vì backoff có thể wrap về giá trị nhỏ và tạo retry storm.

## Civil time

`civil.c` chuyển đổi ngày tháng và epoch mà không dựa vào timezone của máy host. Đây là phần quan trọng khi modem hoặc RTC cung cấp trường lịch.

Tách hai khái niệm:

- monotonic milliseconds cho debounce, timeout và uptime
- wall-clock/epoch cho timestamp gửi lên server

Không dùng wall clock để đo khoảng thời gian vì RTC có thể được chỉnh sau GNSS fix.

## Helper chuỗi

`str.c` cung cấp thao tác chuỗi có giới hạn. Firmware không thể giả định payload hoặc AT line luôn vừa buffer. Mọi copy cần biết capacity và luôn kết thúc NUL khi API yêu cầu C string.

## Chạy test riêng

Trong WSL hoặc Linux:

```bash
cd /mnt/c/Users/Admin/Downloads/ivts-firmware
bash tools/host_test.sh base
bash tools/host_test.sh backoff
bash tools/host_test.sh civil
```

Mỗi executable phải kết thúc `0 failed`.

## Biến thể

Thêm test cho ngày nhuận, timestamp sát ranh giới ngày và backoff gần giá trị tối đa. Dự đoán trước giá trị rồi mới chạy.

**Mốc hoàn thành.** Bạn phân biệt được CRC với authentication, monotonic time với wall clock và biết lỗi phải được chuyển đổi ở biên adapter.
