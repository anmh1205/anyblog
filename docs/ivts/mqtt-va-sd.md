---
slug: "/ivts/mqtt-va-sd"
title: "Bài 5. Theo dõi bản ghi từ MQTT tới SD rồi phát lại"
sidebar_label: "Bài 5 · Gửi và phát lại telemetry"
description: "Theo một bản ghi qua MQTT, SD và xác nhận nhận tin."
---

## Gửi bản ghi lên broker thử nghiệm

1. Chạy `bash tools/host_test.sh at_parser`, `bash tools/host_test.sh record` và `bash tools/host_test.sh payload` ở thư mục tham chiếu trên Linux hoặc WSL. Bài AT kiểm tra cách parser xử lý dòng và khối byte của SIM7600. Hai bài còn lại kiểm tra cách lưu bản ghi nhị phân và tạo JSON.
2. Trong project thực hành, chạy `idf.py @ivtsBuild menuconfig` rồi mở `IVTS > Triển khai (deployment)`. Điền Device ID thử nghiệm tối đa 23 byte, auth token thử nghiệm, địa chỉ broker, port, APN và thông tin đăng nhập broker nếu cần. Đối chiếu cấu hình ở NVS nếu dùng lại board đã provision vì app ưu tiên giá trị đã lưu. Dùng broker lab và thông tin thử nghiệm vì `components/modem/src/modem_mqtt.c` kết nối qua `tcp://`.
3. Mở MQTT client và subscribe `v1/<device_id>/#`, với `<device_id>` là ID đã đặt ở trên. Nạp lại bản build đã cấu hình. Kiểm tra modem lên mạng di động rồi kết nối broker qua log `lte …` và `link -> 2`. Giữ board ở `DRIVING`. Quan sát `v1/<device_id>/rawdata` và đối chiếu `vehicle_mv`, `device_mv`, `message_id` với bản ghi mà firmware tạo. `components/modem/src/modem.c` · `components/modem/src/modem_lte.c` · `components/ivts-core/src/payload/payload.c`

## Làm mất kết nối và kiểm tra phát lại

1. Với SD đã mount, ngắt broker thử nghiệm trong khi board tiếp tục ở `DRIVING`. Đợi mất kết nối và vài chu kỳ lấy bản ghi. Để quan sát, có thể in `storage_queue_pending()` theo nhịp chậm từ task app trong bản thực hành.
2. Bật lại broker và subscribe lại. Sau khi link lên, theo dõi số bản ghi chờ giảm khi nhận được publish ACK. Có thể in `r.boot_id` và `r.seq` ở điểm nạp bản ghi cũ trong `replay_from_slot()` để đối chiếu `message_id` trên broker. Đường phát lại dùng định danh ban đầu dù đã qua một lần khởi động khác.
3. Dự đoán điều xảy ra nếu broker đã nhận bản ghi nhưng thiết bị mất kết nối trước khi nhận ACK. `app_publish_on_ack()` chỉ yêu cầu xóa bản ghi replay khi ACK khớp `tx_id` và báo thành công. Vì thế, sau khi nối lại, cùng `message_id` có thể xuất hiện lần nữa. Một bản gửi mới mà ACK lỗi sẽ được đưa vào queue nếu SD còn ghi được. `components/app/src/app_publish.c` · `components/storage/src/storage_queue.c`

## Mốc kiểm chứng

**Mốc đạt.** Bạn quan sát được RAW mới khi online, số bản ghi chờ tăng khi mất broker, rồi số đó giảm sau khi kết nối lại. Đối chiếu ID của ít nhất một bản replay để phân biệt nó với RAW vừa tạo.
