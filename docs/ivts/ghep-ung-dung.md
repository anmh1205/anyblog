---
slug: "/ivts/ghep-ung-dung"
title: "Bài 4. Ghép bản đầy đủ và lấy mốc chạy offline"
sidebar_label: "Bài 4 · Ghép ứng dụng và chạy offline"
description: "Nối queue FreeRTOS, máy trạng thái và các component I/O."
---

## Đường đi của một mẫu ADC

Luồng của một mẫu điện áp trong ứng dụng đầy đủ đi qua queue FreeRTOS. `components/board/src/board_os.c` phát `IVTS_EV_POWER_SAMPLE`. Hàm nhận sự kiện (sink) trong `components/app/src/app_os.c` thử chép event vào queue và trả về ngay. Task `app` rút event, cập nhật snapshot và gọi `ivts_axes_on_power()`. Sau đó, `ivts_fsm_step()` nhận trạng thái ignition mới và trả về hành động cần thực thi. Việc chỉ để task `app` sửa snapshot giữ cho phần dựng bản ghi và phần cập nhật cảm biến nhất quán. `components/app/src/app.c` · `components/app/src/app_state.c`

## Build các component

1. Giữ một bản sao snippet bài 3 nếu muốn quay lại đo ADC. Thêm `storage`, `modem`, `obd`, `ota`, rồi `app`. Đọc `CMakeLists.txt` của từng component để thấy lớp I/O chỉ kéo `ivts-core` và ESP-IDF. `components/app/src/app_init.c` ghép chúng với nhau và mở queue trước khi driver có thể phát sự kiện.
2. Dùng lại entry point và cấu hình của firmware thật. Chú ý `main` lúc này chỉ cần `PRIV_REQUIRES app`. Lệnh bên dưới ghi vào project thực hành và dùng một `sdkconfig` riêng để áp dụng các default của firmware đầy đủ, gồm NimBLE, bảng phân vùng và rollback OTA.

~~~powershell
Set-Location -LiteralPath $lab
foreach ($name in 'storage','modem','obd','ota','app') {
    Copy-Item -Path "$ref\components\$name" -Destination .\components -Recurse
}
Copy-Item -Path "$ref\CMakeLists.txt","$ref\sdkconfig.defaults","$ref\partitions.csv" -Destination .
Copy-Item -Path "$ref\main\main.c","$ref\main\CMakeLists.txt" -Destination .\main

$ivtsBuild = @('-B','build-ivts',"-DSDKCONFIG=$lab\sdkconfig.ivts")
idf.py @ivtsBuild build
Get-Item .\build-ivts\ivts-firmware.bin
~~~

## Kiểm tra khởi động offline

3. Với đúng board IVTS, chạy `idf.py @ivtsBuild -p COM7 flash monitor`. Ở lượt này có thể để modem không gắn SIM. Trên thiết bị thử nghiệm chưa có dữ liệu cấu hình trong NVS và với ID/token để trống, log `init xong … provisioned=0` xác nhận app khởi động khi chưa provision. Kiểm tra `sd=1` khi có thẻ hoạt động. NVS lưu cấu hình và ID của lần khởi động. SD lưu log và bản ghi chờ gửi. IMU, RTC và SD có thể báo lỗi riêng trong khi app vẫn khởi động. `components/storage/src/storage.c` · `components/storage/src/storage_nvs.c`
4. Theo dõi `state INIT -> CHECK_IGN`, sau đó giữ mức điện áp đầu vào tương ứng với ignition ON để thấy `DRIVING`. Nếu chưa sang `DRIVING`, đối chiếu số mV ở bài 3, ngưỡng đang dùng và thời gian giữ trước khi tìm lỗi ở modem.
