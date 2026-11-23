---
title: Vì sao cùng một message_id có thể xuất hiện hai lần?
description: Tìm hiểu cách hàng đợi telemetry của IVTS xử lý xác nhận MQTT bị mất.
slug: mqtt-ack-va-phat-lai
---

Một bản ghi telemetry đã đến broker. Ngay sau đó kết nối mất trước khi firmware nhận kết quả publish. Khi kết nối trở lại, bạn có thể thấy cùng `message_id` xuất hiện lần nữa.

<!-- truncate -->

## Theo dấu hai mã định danh

`message_id` nhận diện bản ghi. Firmware tạo nó từ `boot_id` và `seq` khi chụp snapshot. Replay dùng lại hai giá trị đó, kể cả khi board đã khởi động lại.

`tx_id` nhận diện một lần gửi đang chờ kết quả. Task app so khớp `tx_id` khi nhận `IVTS_EV_MQTT_ACK`. Cùng một bản ghi có thể đi qua nhiều lần gửi, mỗi lần có `tx_id` riêng.

## Khi nào SD bỏ bản ghi?

Với bản ghi replay, task app yêu cầu storage bỏ bản ghi đầu hàng đợi sau khi nhận ACK thành công khớp lần gửi. Nếu đang gửi mà đường truyền gián đoạn, bản ghi có thể còn trên SD, dù broker đã nhận được. Khi nối lại, thiết bị thử gửi tiếp. Kiểm tra `app_publish_on_ack()` và `replay_from_slot()` trong `components/app/src/app_publish.c`.

Một phép thử trên bàn là ngắt broker trong lúc thiết bị đang gửi RAW, đếm số bản ghi còn chờ rồi nối lại. Dùng `message_id` để khớp bản ghi phát lại với dữ liệu quan sát trên broker. Các bước cụ thể nằm trong [bài MQTT và SD](/docs/ivts/mqtt-va-sd/).
