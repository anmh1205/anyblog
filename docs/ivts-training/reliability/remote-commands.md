---
title: Lệnh từ xa và ACK ứng dụng
description: Parse command JSON có giới hạn, dispatch lệnh và trả kết quả theo command_id.
---

# Lệnh từ xa và ACK ứng dụng

Thiết bị subscribe `v1/<device_id>/commands`. Payload tối thiểu có `command_id`, `command` và object `params` tùy lệnh.

## Bốn lệnh hiện tại

| Command | Tác dụng |
| --- | --- |
| `ota_update` | yêu cầu tải và cài firmware |
| `update_config` | cập nhật field policy được phép |
| `request_location` | yêu cầu lấy/gửi vị trí |
| `reboot` | khởi động lại có kiểm soát |

## Parse có giới hạn

`json_reader.c` dùng tối đa 64 token và depth 4. Parser kiểm:

- JSON syntax
- kiểu của từng field
- chiều dài chuỗi
- field bắt buộc
- range số
- token và nesting limit

Payload hợp lệ về JSON nhưng vượt policy vẫn bị từ chối.

## Dispatch trong app

`app_cmd.c` nhận model đã parse và quyết định hành động. Không để JSON reader tự gọi OTA hoặc reboot. Parser là cơ chế, app là policy.

## Command ACK

Thiết bị phản hồi trên:

```text
v1/<device_id>/commands/ack
```

ACK cần chứa `command_id` để server correlate và status đủ rõ như accepted, rejected hoặc completed tùy contract. Đây không phải MQTT PUBACK.

## Idempotency

QoS 1 có thể giao command trùng. Lệnh `reboot` hoặc `ota_update` cần xem xét `command_id` đã xử lý để tránh lặp side effect. Nếu firmware chưa persist dedup history, backend phải cẩn thận và tài liệu contract phải nói rõ giới hạn.

## Bảo vệ credential

`update_config` chỉ cập nhật field policy whitelist, không mở đường thay device token hay credential qua JSON chung. Thay credential cần provisioning flow riêng có authentication và lifecycle rõ ràng.

## Test payload xấu

Gửi lần lượt:

- thiếu `command_id`
- command không biết
- string vượt buffer
- nested object sâu hơn 4
- hơn 64 token
- `ota_update` có SHA không đủ 64 hex
- `update_config` có field không được phép

Thiết bị phải từ chối mà không reset hoặc leak state.

**Mốc hoàn thành.** Mọi command có đường parse, validate, dispatch và ACK tách biệt.
