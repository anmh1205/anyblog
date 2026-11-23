---
title: Chuẩn bị môi trường
description: Cài và kiểm tra ESP-IDF 6.1.1, GCC, Git, Node.js và thiết bị thực hành.
---

# Chuẩn bị môi trường

Firmware tham chiếu được build với ESP-IDF 6.1.1 cho ESP32-S3. Không dùng “bản mới nhất” một cách tùy ý vì API mbedTLS, NimBLE và hành vi Kconfig có thể khác.

## 1. Kiểm tra ESP-IDF

Mở PowerShell và kích hoạt profile của Espressif:

```powershell
. 'C:\Espressif\tools\Microsoft.v6.1.1.PowerShell_profile.ps1'
idf.py --version
```

Kết quả cần chứa `ESP-IDF v6.1.1`. Sau đó kiểm tra Python và CMake mà IDF đang dùng:

```powershell
python --version
cmake --version
ninja --version
```

:::warning
Đừng trộn terminal ESP-IDF 5.x với cache build đã sinh bởi 6.1.1. Nếu đổi SDK, xóa riêng thư mục build bằng `idf.py fullclean` rồi cấu hình lại target.
:::

## 2. Kiểm tra compiler cho host test

Trên Windows:

```powershell
gcc --version
```

Trên WSL:

```bash
gcc --version
bash --version
```

Script `tools/host_test.sh` bật `-Wall -Wextra -Werror`, AddressSanitizer và UndefinedBehaviorSanitizer. GCC native trên Windows dùng được để chạy logic, nhưng bài kiểm tra sanitizer nên chạy trong WSL hoặc Linux.

## 3. Tạo hai đường dẫn làm việc

```powershell
$ref = 'C:\Users\Admin\Downloads\ivts-firmware'
$lab = Join-Path $env:USERPROFILE 'ivts-lab'

Test-Path $ref
Test-Path (Join-Path $ref 'components\ivts-core')
```

Cả hai lệnh phải trả về `True`. `$ref` chỉ dùng để đọc và copy từng component. `$lab` là nơi bạn tự dựng.

## 4. Công cụ quan sát

Chuẩn bị trước các công cụ sau:

| Công cụ | Dùng ở đâu | Điều cần quan sát |
| --- | --- | --- |
| Serial monitor | Mọi bài trên board | boot log, state, lỗi driver |
| Đồng hồ đo | ADC và nguồn | điện áp thật tại đầu vào chia áp |
| MQTT client | publish, replay, command, OTA | topic, payload, trùng `message_id` |
| Đầu đọc microSD | queue | file segment và dung lượng |
| BLE scanner | OBD | service và characteristic của adapter |
| HTTP server lab | OTA | status, content length và image bytes |

## 5. Nguyên tắc an toàn phần cứng

- Không đưa trực tiếp 12 V vào chân ADC ESP32-S3.
- Điện áp xe chỉ đi qua đầu vào mạch chia áp đúng thiết kế.
- Dùng nguồn giới hạn dòng khi thử trên bàn.
- Luôn nối chung mass giữa nguồn thử và board.
- OTA lần đầu dùng board thử nghiệm có cổng serial và image cũ đã xác nhận boot được.

## Kết quả mong đợi

Bạn chạy được `idf.py --version`, `gcc --version`, đọc được repo tham chiếu và có một đường dẫn lab riêng. Chưa cần cắm board ở bài này.

## Lỗi thường gặp

**`idf.py` không được nhận diện.** Profile ESP-IDF chưa được dot-source trong terminal hiện tại.

**CMake tìm nhầm Python.** Chạy lại từ ESP-IDF PowerShell thay vì terminal hệ thống.

**GCC Windows báo lỗi định dạng `printf`.** Các bài sau thêm `-D__USE_MINGW_ANSI_STDIO=1`.

**Mốc hoàn thành.** Lưu kết quả của bốn lệnh version vào ghi chú lab để lần sau biết môi trường nào đã tạo image.
