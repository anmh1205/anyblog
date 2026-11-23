---
title: LTE và MQTT QoS 1
description: Đưa SIM7600 lên mạng, mở CMQTT session, subscribe command và publish telemetry.
---

# LTE và MQTT QoS 1

`modem_lte.c` quản lý quá trình từ modem sẵn sàng tới packet data. `modem_mqtt.c` chỉ bắt đầu session khi link nền đã đủ điều kiện.

## LTE state machine

Các mốc cần quan sát theo thứ tự:

1. modem trả lời AT
2. SIM sẵn sàng
3. đăng ký mạng
4. APN/PDP context được cấu hình
5. packet data active
6. MQTT client start và connect

Một lần registration query thất bại không đồng nghĩa reset modem ngay. State machine dùng timeout/backoff để tiến triển.

## Topic contract

Với `device_id`, firmware dùng:

```text
v1/<device_id>/rawdata
v1/<device_id>/status
v1/<device_id>/events
v1/<device_id>/firmware
v1/<device_id>/commands
v1/<device_id>/commands/ack
```

Thiết bị publish bốn topic dữ liệu và subscribe command. Command ACK là phản hồi ứng dụng, khác MQTT PUBACK.

## SIM7600 CMQTT

Session dùng nhóm lệnh `AT+CMQTT*` để start service, acquire client, connect, set topic/payload và publish. Payload length phải khớp chính xác bytes gửi sau prompt.

## QoS 1

Publish QoS 1 chỉ hoàn tất khi modem báo ACK tương ứng. App map ACK về `tx_id`. Không được xóa replay chỉ vì UART đã nhận payload hoặc command publish trả `OK` trung gian.

## Provisioning

Kconfig có default broker, port, APN và credential deployment. NVS có thể override. Không commit token thật vào repo tài liệu. Dùng broker lab và credential riêng.

## Kiểm tra bằng MQTT client

Subscribe:

```text
v1/<device_id>/#
```

Sau đó:

1. boot thiết bị
2. quan sát LTE state
3. xác nhận command subscription
4. tạo RAW ở DRIVING
5. so `message_id` và điện áp với serial log
6. ngắt broker để kiểm reconnect/backoff

## Lỗi thường gặp

**LTE registered nhưng MQTT không connect.** Kiểm PDP, DNS, broker reachability, auth và URI `tcp://`.

**Publish `OK` nhưng app không pop queue.** Chưa có publish ACK cuối cùng hoặc `tx_id` không khớp.

**Reconnect quá nhanh.** Backoff bị reset sai hoặc state machine coi một mốc trung gian là thành công hoàn toàn.

**Mốc hoàn thành.** Thiết bị subscribe command và publish một RAW QoS 1 với ACK được map đúng transaction.
