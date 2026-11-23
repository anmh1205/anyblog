---
title: GNSS qua SIM7600
description: Bật GNSS, parse hai định dạng lệnh, xác định fix validity và đồng bộ RTC.
---

# GNSS qua SIM7600

`modem_gnss.c` thử `AT+CGNSSINFO` trước, rồi fallback `AT+CGPSINFO` nếu cần. `gnss_parse.c` chuyển chuỗi modem thành model thuần C.

## Tách command và parser

Feature layer quyết định command nào gửi và khi nào poll. Parser chỉ nhận một chuỗi và trả dữ liệu hoặc lỗi. Nhờ vậy transcript thật có thể đưa vào host test.

## Parse tọa độ

Modem thường trả vĩ độ/kinh độ dạng độ-phút cùng hemisphere. Parser cần:

1. kiểm field có mặt
2. tách phần độ và phút theo loại tọa độ
3. đổi phút sang phần của độ
4. áp dấu âm cho South/West
5. kiểm range vĩ độ và kinh độ

Không dùng `0,0` để đại diện no-fix.

## Fix validity

Response AT thành công chỉ nói modem trả lời. Fix hợp lệ cần đủ field và trạng thái phù hợp. Telemetry phải giữ cờ valid để backend không dùng tọa độ rác.

## Thời gian UTC

UTC từ fix hợp lệ có thể cập nhật DS3231M. App kiểm trust và chỉ ghi RTC khi dữ liệu đủ. Timeout FSM vẫn dùng monotonic clock.

## Host test

```bash
bash tools/host_test.sh gnss_parse
```

Thêm ca:

- fix Bắc/Đông
- fix Nam/Tây
- field rỗng
- câu bị cắt
- giá trị ngoài range
- ngày giờ không hợp lệ
- chuỗi có khoảng trắng hoặc prefix mong đợi

## Kiểm tra trên board

1. Đặt anten ở nơi nhìn trời.
2. Vào DRIVING để FSM yêu cầu GNSS ON.
3. Ghi command được dùng và raw response.
4. So tọa độ parse với một nguồn tham chiếu.
5. Kiểm GNSS event cập nhật snapshot.
6. Kiểm RTC trust sau fix.

## Lỗi thường gặp

**Có response nhưng không có fix.** Đây có thể là môi trường anten, không phải parser.

**Tọa độ lệch lớn.** Kiểm đổi độ-phút, không coi nó là decimal degree trực tiếp.

**Mốc hoàn thành.** Cùng một sample GNSS cho kết quả host test và telemetry board giống nhau.
