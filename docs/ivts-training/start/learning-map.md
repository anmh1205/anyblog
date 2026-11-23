---
title: Bản đồ firmware và thứ tự học
description: Ánh xạ component, nhiệm vụ và bài học của firmware IVTS.
---

# Bản đồ firmware và thứ tự học

Firmware không phải một chương trình tuyến tính. Nó là sáu component I/O bao quanh một lõi thuần C, rồi được ghép ở component `app`. Nếu đọc theo tên file, bạn dễ nhảy qua lại giữa driver và policy. Hãy đọc theo chiều phụ thuộc.

## Cây component

```text
main
└── app                       composition root
    ├── board                 ADC, I2C, RTC, IMU, sleep
    ├── storage               NVS, SD, offline queue
    ├── modem                 SIM7600, LTE, MQTT, GNSS, HTTP
    ├── obd                   NimBLE, ELM327, PID
    ├── ota                   image writer, SHA-256, boot slot
    └── ivts-core             model, parser, policy, FSM

board ─────┐
storage ───┤
modem ─────┼──> ivts-core
obd ───────┤
ota ───────┘
```

`ivts-core` không gọi ESP-IDF. Nhờ vậy các bài test ở `tests/host` có thể biên dịch bằng GCC trên PC. Các component I/O không được phụ thuộc chéo. `app` là nơi duy nhất biết toàn bộ hệ thống.

## Đọc theo bốn đường dữ liệu

### Tín hiệu tới quyết định

```text
board_os.c
  → IVTS_EV_POWER_SAMPLE / IVTS_EV_MOTION
  → app_os.c queue
  → app.c dispatch
  → axes.c
  → fsm.c
  → action flags
```

Đọc nhóm bài Trạng thái trước khi đọc sleep hoặc publish. Action chỉ có ý nghĩa khi bạn biết state nào phát nó.

### Telemetry tới broker

```text
app_state.c snapshot
  → record.c binary record
  → payload.c JSON
  → app_publish.c
  → modem_mqtt.c
  → SIM7600
```

Nếu broker không ACK, `app_publish.c` đẩy record vào queue trên SD. Khi link trở lại, record được đọc bằng peek, publish lại và chỉ pop sau ACK phù hợp.

### Lệnh tới thay đổi hệ thống

```text
MQTT command topic
  → modem event
  → app_cmd.c
  → json_reader.c
  → update_config / request_location / reboot / ota_update
```

Parser chỉ chuyển JSON thành dữ liệu có giới hạn. `app_cmd.c` quyết định lệnh nào được phép và gọi component tương ứng.

### OTA tới rollback

```text
ota_update command
  → modem_http.c
  → ota.c write + hash
  → set boot partition
  → pending context in NVS
  → reboot
  → confirm.c policy
  → mark valid hoặc rollback
```

## Thứ tự dựng

| Lần ghép | Thành phần | Vì sao ở vị trí này |
| --- | --- | --- |
| 1 | `ivts-core/base` | Không có dependency, test nhanh nhất |
| 2 | event, model, config, record, JSON | Tạo ngôn ngữ chung cho mọi component |
| 3 | axes và FSM | Policy phải chạy đúng trước khi có driver |
| 4 | `board` | Cấp event thật cho logic đã test |
| 5 | `storage` | Cho phép boot ID, cấu hình và queue bền vững |
| 6 | `app` tối thiểu | Tạo queue, snapshot và composition root |
| 7 | `modem` và `obd` | Thêm I/O bất đồng bộ sau khi event loop ổn định |
| 8 | publish/replay | Kết nối record, broker và SD |
| 9 | `ota` | Tính năng có rủi ro cao nhất, ghép cuối |

## Bài tập kiểm tra bản đồ

Không mở code, hãy trả lời ba câu sau rồi mới đối chiếu:

1. File nào được phép gọi cả `board_init()` và `modem_init()`?
2. `storage_queue.c` có được include header riêng của modem không?
3. Hàm quyết định rollback nên nằm trong `ota` hay `ivts-core`?

Đáp án lần lượt là `app_init.c`, không, và policy thuần nằm ở `ivts-core/ota/confirm.c` còn thao tác ESP-IDF nằm ở component `ota`.

**Mốc hoàn thành.** Bạn có thể đặt một file bất kỳ trong repo vào đúng một trong ba nhóm: policy thuần, adapter I/O hoặc composition.
