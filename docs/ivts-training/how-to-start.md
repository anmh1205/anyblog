---
title: How to Start
description: Bắt đầu khóa dựng lại firmware IVTS trên ESP32-S3 từ một project ESP-IDF trống.
slug: /ivts-training/how-to-start
---

# Dựng lại firmware IVTS từ đầu

Khóa học này dùng chính codebase `ivts-firmware` làm bản tham chiếu. Bạn sẽ không chép cả repo rồi cố hiểu ngược. Bạn tạo một project ESP-IDF trống, đưa từng lớp vào theo đúng thứ tự, viết test cho logic thuần C, sau đó mới ghép ADC, SD, modem, GNSS, BLE OBD và OTA.

## Kết quả cuối khóa

Sau khi hoàn thành, bạn có thể giải thích và tự dựng lại toàn bộ đường đi sau:

```text
điện áp xe / IMU / RTC / GNSS / OBD
              ↓
          ivts_event_t
              ↓
      app queue + snapshot
              ↓
       axes → state machine
              ↓
      record → JSON payload
              ↓
 MQTT QoS 1 hoặc queue trên SD
              ↓
       ACK → xóa bản replay
```

Bạn cũng sẽ dựng được chuỗi OTA đầy đủ, từ lệnh từ xa, tải image qua SIM7600, kiểm SHA-256, đổi boot partition, xác nhận bản mới và rollback khi bản mới không chứng minh được nó hoạt động.

## Cần chuẩn bị

- Windows với PowerShell và ESP-IDF 6.1.1
- GCC trên Windows, hoặc WSL/Linux để chạy test có sanitizer
- ESP32-S3 có flash 16 MB và đúng mạch ngoại vi IVTS nếu muốn kiểm tra phần cứng
- SIM7600, SIM, anten và broker thử nghiệm cho phần LTE/MQTT/GNSS
- microSD cho log và hàng đợi offline
- BLE ELM327 tương thích service `0x18F0` cho phần OBD

Bạn vẫn có thể học phần kiến trúc, lõi C, parser, payload, FSM và OTA policy chỉ bằng máy tính. Không có phần cứng không phải lý do để bỏ qua test host.

## Lộ trình

| Chặng | Bạn sẽ dựng | Mốc kiểm chứng |
| --- | --- | --- |
| [Bắt đầu](../start/learning-map) | Project trống, toolchain, pin map | Có file `.bin`, biết phần nào cần phần cứng |
| [Kiến trúc và lõi C](../core/architecture) | Component graph, utility, event, config, record, JSON | Logic biên dịch bằng GCC không cần ESP-IDF |
| [Trạng thái và app](../control/axes) | Ignition, motion, FSM, queue, task | Dự đoán đúng state và action ở từng mốc thời gian |
| [Board và lưu trữ](../io/adc-power) | ADC, RTC, IMU, NVS, SD, queue | Đo được nguồn và phục hồi được queue sau reset |
| [Kết nối](../connectivity/modem-layers) | AT, LTE, MQTT, GNSS, BLE OBD | Nhận fix, PID và publish QoS 1 |
| [Độ tin cậy](../reliability/publish-and-replay) | Replay, command, OTA, diagnostics | Mất mạng không mất dữ liệu, OTA lỗi quay về bản cũ |
| [Kiểm thử](../testing/host-tests) | Test host, layer check, fault injection, release build | Toàn bộ test xanh và image vừa phân vùng |

## Cách học mỗi bài

Mỗi bài dùng cùng một vòng lặp:

1. Đọc mục tiêu và dự đoán đầu ra.
2. Mở đúng file được chỉ ra trong codebase tham chiếu.
3. Tự viết phần nhỏ trong project lab.
4. Build hoặc chạy test.
5. So sánh đầu ra thật với phần “Kết quả mong đợi”.
6. Thực hiện biến thể ở cuối bài trước khi sang bài tiếp theo.

:::tip
Đừng bắt đầu bằng `app.c`. Hãy bắt đầu ở các hàm thuần C có input và output nhỏ. Một state machine chỉ dễ hiểu khi bạn đã tách được tín hiệu, trạng thái, action và side effect.
:::

## Codebase tham chiếu

Trong các lệnh PowerShell, tài liệu dùng biến `$ref` trỏ tới repo thật và `$lab` trỏ tới project bạn tự dựng:

```powershell
$ref = 'C:\Users\Admin\Downloads\ivts-firmware'
$lab = Join-Path $env:USERPROFILE 'ivts-lab'
```

Không sửa repo tham chiếu trong lúc học. Mọi thay đổi thực hành nằm trong `$lab`. Khi kết quả khác nhau, diff đúng một lớp thay vì phải phân biệt thay đổi học tập với firmware đang dùng.

## Thời lượng gợi ý

Phần host-only cần khoảng 12 đến 18 giờ. Phần board và kết nối cần thêm 15 đến 25 giờ vì còn thời gian đấu nối, chờ mạng, kiểm tra nguồn và tái hiện lỗi. OTA và fault injection nên làm trên board thử nghiệm, không làm lần đầu trên thiết bị đang vận hành.

Tiếp theo, mở [Bản đồ firmware](../start/learning-map) để biết 39 bài liên hệ với codebase như thế nào.
