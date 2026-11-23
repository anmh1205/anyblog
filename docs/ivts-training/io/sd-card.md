---
title: SDMMC và quản lý log
description: Mount thẻ ở /sd, không tự format và giới hạn dung lượng log.
---

# SDMMC và quản lý log

`storage_sd.c` mount thẻ tại `/sd` qua SDMMC 4-bit. Pin CLK/CMD/D0..D3 lần lượt là GPIO10, 9, 11, 12, 7 và 8. Card detect ở GPIO13.

## Không tự format khi mount lỗi

Firmware không bật auto-format. Mount lỗi có thể do:

- không có thẻ
- filesystem hỏng
- pin map hoặc pull-up sai
- nguồn thẻ không ổn
- format không được hỗ trợ

Tự format sẽ biến lỗi phần cứng thành mất dữ liệu. Thiết bị chạy degraded và báo `sd=0`.

## Hai vùng sử dụng

```text
/sd/log/...       log xoay vòng
/sd/q/...         segment của offline queue
```

Không để log chiếm hết không gian queue. Config hiện tại giới hạn mỗi log file 256 KiB và tổng log 4 MiB.

## Lifecycle

1. Kiểm card detect nếu có.
2. Mount filesystem.
3. Tạo các thư mục cần thiết.
4. Quét/khôi phục queue.
5. Cho task storage nhận request.
6. Trước sleep hoặc shutdown, flush dữ liệu cần thiết.

## Storage task

Filesystem operation có thể chậm. App không ghi file trực tiếp từ event loop. Component storage sở hữu task priority 3 để serialize I/O và trả kết quả bằng API/event phù hợp.

## Kiểm tra degraded mode

1. Boot không có thẻ.
2. Xác nhận app vẫn chạy và có thể publish online.
3. Gắn thẻ theo quy trình hỗ trợ của board.
4. Boot lại và xác nhận mount.
5. Ngắt broker để queue tăng.

Không giả định hot-plug an toàn nếu driver không triển khai remount lifecycle.

## Lỗi thường gặp

**Mount lúc được lúc không.** Kiểm pull-up SDMMC, độ dài dây và nguồn trước filesystem.

**Log đầy thẻ.** Kiểm rotation và total quota, không chỉ max file size.

**Thẻ lỗi làm app reset.** Startup policy hoặc error propagation đã biến degraded dependency thành fatal ngoài ý muốn.

**Mốc hoàn thành.** Firmware boot được cả khi có và không có SD, và log không vượt quota thiết kế.
