---
slug: "/ivts/gnss-obd-ngu"
title: "Bài 6. Bổ sung GNSS, dữ liệu OBD và chế độ ngủ"
sidebar_label: "Bài 6 · GNSS, OBD và chế độ ngủ"
description: "Đọc thêm tín hiệu và kiểm tra cách thiết bị thức dậy."
---

## GNSS

Chạy `bash tools/host_test.sh gnss_parse`. Trên board, giữ `DRIVING` để FSM yêu cầu bật GNSS. Theo dõi `IVTS_EV_GNSS_FIX` và dữ liệu vị trí trong RAW. SIM7600 thử `AT+CGNSSINFO` trước rồi mới dùng `AT+CGPSINFO` nếu cần. Khi có thời gian UTC từ fix hợp lệ, app có thể đồng bộ RTC mà nó vừa đọc được nhưng chưa tin cậy. `components/modem/src/modem_gnss.c` · `components/app/src/app_state.c`

## OBD qua BLE

Chạy `bash tools/host_test.sh elm327` và `bash tools/host_test.sh obd_pid` trước khi ghép adapter thử nghiệm. Theo dõi từng mốc từ BLE kết nối, ELM327 sẵn sàng tới mẫu PID xuất hiện. Driver tìm service `0x18F0`, nhận qua notify `0x2AF0` và ghi vào `0x2AF1`. Nếu adapter kết nối BLE được nhưng thiếu service hoặc characteristic đó, dừng ở bước GATT và đối chiếu adapter trước khi sửa bộ giải mã PID. `components/obd/src/obd_ble.c` · `components/obd/src/obd_os.c`

## Ngủ và đánh thức

Đọc `test_sleep_modes()` trong `tests/host/test_fsm.c` để dự đoán mode ngủ theo khả năng đánh thức của board. Khi thử trên bàn, đưa ignition về OFF, đợi `PARKED` rồi theo dõi `sleep mode=…`. Thử thức bằng timer và, với light sleep đã bật nguồn đánh thức từ IMU, thử tạo chuyển động. Tín hiệu INT của IMU nối vào GPIO41. Với pin map này, khi vào deep sleep firmware chỉ cấu hình thức theo timer. Đối chiếu lý do thức trong log với mode ngủ vừa ghi nhận. `components/app/src/app_sleep.c` · `components/board/src/board_power.c`
