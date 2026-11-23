---
title: Một mẫu điện áp đi đâu trong firmware?
description: Theo một mẫu điện áp từ ADC và queue FreeRTOS đến bản ghi telemetry của IVTS.
slug: tu-adc-den-telemetry
---

Khi điện áp nguồn xe tăng, thiết bị IVTS có thể chuyển sang `DRIVING` và bắt đầu gửi telemetry. Để tìm nguyên nhân nếu quá trình này dừng giữa chừng, thử theo một mẫu qua từng tầng và ghi lại nơi đầu tiên xuất hiện chênh lệch.

<!-- truncate -->

## Từ chân ADC đến sự kiện

`components/board/src/board_adc.c` lấy tám mẫu, hiệu chuẩn điện áp tại chân ADC rồi quy đổi qua mạch chia áp. Task board phát giá trị quy đổi trong sự kiện `IVTS_EV_POWER_SAMPLE`. Tại đây, `vehicle_mv` mang đơn vị mV ở phía nguồn xe.

Nếu log báo giá trị sai so với đồng hồ đo, kiểm tra hệ số và mạch chia áp ở bước này. Hạ ngưỡng ignition có thể làm máy trạng thái đổi sớm hơn, trong khi số đo được lưu trong bản ghi vẫn sai.

## Từ sự kiện đến trạng thái

Task app cập nhật snapshot và chuyển giá trị cho `ivts_axes_on_power()`. Với ngưỡng bật 13.000 mV, dải trễ 500 mV và thời gian giữ bật 1.500 ms, các mẫu 13.900 mV liên tiếp tạo một lần chuyển sang ON sau khi đủ thời gian. Khi đã ON, mẫu 12.700 mV nằm trong dải trễ nên giữ nguyên trạng thái.

Sau đó, `ivts_fsm_step()` dùng trạng thái ignition cùng các tín hiệu khác để quyết định có chuyển sang `DRIVING` hay chưa. Bạn có thể tái hiện chuỗi này trên PC bằng dữ liệu giả trước khi ghép ADC.

## Từ trạng thái đến bản ghi

Khi máy trạng thái yêu cầu gửi RAW, task app tạo bản ghi từ snapshot hiện tại và cấp cặp `boot_id`, `seq`. Nếu không gửi được, bản ghi đi vào hàng đợi trên SD. Mã định danh được giữ lại khi phát lại, nên nó giúp đối chiếu bản ghi qua các lần gửi.

Thực hành luồng này ở [bài suy ra ignition](/docs/ivts/logic-ignition/) và [bài đọc ADC](/docs/ivts/doc-adc/).
