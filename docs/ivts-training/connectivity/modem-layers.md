---
title: Kiến trúc modem SIM7600
description: Tách UART, AT parser, transaction engine, LTE, MQTT, GNSS và HTTP.
---

# Kiến trúc modem SIM7600

Component modem không phải một hàm `send_at()`. Nó gồm nhiều lớp để UART bất đồng bộ, URC và command response không giẫm lên nhau.

## Các lớp

```text
modem_os.c       task, UART, timer, synchronization
at_parser.c      byte stream → line / prompt / binary block
at_engine.c      command transaction, timeout, expected response
modem_lte.c      power và network registration state machine
modem_mqtt.c     SIM7600 CMQTT session
modem_gnss.c     GNSS command và parse result
modem_http.c     HTTP transfer cho OTA
modem.c          public API, topic và event bridge
```

`at_parser.c`, `at_engine.c` và `gnss_parse.c` được viết để test trên host. UART và FreeRTOS chỉ nằm ở adapter OS.

## Một task sở hữu modem

Mọi lệnh AT đi qua task modem priority 6. Nếu app, GNSS và OTA cùng ghi UART trực tiếp, response sẽ không còn owner rõ ràng. Request được serialize và completion đi ngược về caller/event.

## URC và response

SIM7600 có thể phát Unsolicited Result Code bất kỳ lúc nào, kể cả trong một transaction. Parser phải phân biệt:

- echo của command
- response line
- terminal `OK` hoặc `ERROR`
- prompt để gửi payload
- URC link/network
- binary data có length

Không thể coi “dòng đầu sau command” là response duy nhất.

## Power control

Board nối PWRKEY GPIO34 và RESET GPIO35. Sequence bật/tắt cần timing riêng của SIM7600. Reset cứng là phương án phục hồi cuối, không phải retry mặc định cho mọi AT timeout.

## Public state

Modem phát event link, publish ACK, command payload, GNSS fix và HTTP progress/result. App không đọc biến nội bộ của task modem.

## Cách đọc component

1. Đọc `modem.h` để biết contract.
2. Đọc `at_parser.c` và test.
3. Đọc `at_engine.c` và test transaction.
4. Đọc LTE state machine.
5. Đọc từng feature MQTT/GNSS/HTTP.
6. Cuối cùng đọc `modem_os.c` để thấy chúng được schedule.

**Mốc hoàn thành.** Bạn đặt được một bug mới vào đúng lớp, ví dụ lỗi tách line thuộc parser còn mất registration thuộc LTE state machine.
