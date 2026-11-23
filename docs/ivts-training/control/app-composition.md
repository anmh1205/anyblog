---
title: Ghép các component trong app
description: Khởi tạo queue, adapter và task theo thứ tự an toàn.
---

# Ghép các component trong app

`app_init.c` là dây nối của hệ thống. Thứ tự khởi tạo không tùy ý vì driver có thể phát event ngay sau khi task của nó chạy.

## Thứ tự init

```text
1. app queue
2. board
3. storage
4. config và boot context
5. modem
6. OBD
7. OTA
8. app task
```

Queue phải có trước producer. Storage phải sẵn sàng trước khi cần boot ID, config hoặc OTA pending context.

## Task và priority

| Task | Priority hiện tại | Vai trò |
| --- | --- | --- |
| modem | 6 | RX/TX AT và tiến trình link |
| app | 5 | single-writer state và FSM |
| OBD | 4 | BLE session và poll PID |
| storage | 3 | ghi file/queue |
| OTA | 3 | tải và ghi image |
| board | 2 | lấy mẫu và I/O chậm |

Priority cao không có nghĩa task được phép block vô hạn. Modem cần phản ứng nhanh với RX nhưng vẫn phải nhường scheduler khi chờ.

## Cấu hình sink chung

App truyền cùng event sink cho các adapter. `ctx` trỏ tới state app hoặc queue. Producer không biết consumer cuối cùng là ai.

## Fatal và degraded

`app_init.c` quyết định lỗi nào làm startup thất bại. Đây là policy composition, không nên để từng driver tự reboot hệ thống. Ví dụ SD hỏng chỉ mất buffer offline, nhưng NVS hỏng làm mất config và OTA state nên nghiêm trọng hơn.

## Dựng bản đầy đủ trong lab

```powershell
foreach ($name in 'board','storage','modem','obd','ota','app') {
    Copy-Item "$ref\components\$name" "$lab\components" -Recurse
}
Copy-Item "$ref\sdkconfig.defaults","$ref\partitions.csv" $lab
Copy-Item "$ref\main\main.c","$ref\main\CMakeLists.txt" "$lab\main"
```

Build vào thư mục riêng để không lẫn với project tối thiểu:

```powershell
$args = @('-B','build-ivts',"-DSDKCONFIG=$lab\sdkconfig.ivts")
idf.py @args build
```

## Điều cần quan sát khi boot

- queue tạo thành công
- board/ADC init thành công
- NVS mở được
- SD, IMU, RTC có trạng thái riêng
- modem task khởi động dù chưa provision
- log cuối báo app init hoàn tất

Không có credential mạng không được làm firmware crash. Nó phải boot ở trạng thái chưa provision.

**Mốc hoàn thành.** Bạn chỉ ra được lý do của từng bước trong init order và phân loại một lỗi mới là fatal hay degraded.
