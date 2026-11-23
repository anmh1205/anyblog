---
title: Cấu hình và thời gian
description: Hiểu default, Kconfig, NVS override, validation và timestamp trust.
---

# Cấu hình và thời gian

Firmware lấy cấu hình từ ba lớp. Default trong code cho policy, Kconfig cho deployment lúc build và NVS cho thay đổi bền vững trên thiết bị.

## Thứ tự nguồn cấu hình

```text
ivts_config_defaults()
        ↓
giá trị Kconfig deployment
        ↓
config hợp lệ đọc từ NVS
        ↓
update_config command cho field được phép
```

Không phải field nào cũng được đổi từ xa. Credential và thông tin nhạy cảm không thuộc payload `update_config` hiện tại. Command chỉ cập nhật các field policy được whitelist.

## Một số default quan trọng

| Nhóm | Giá trị hiện tại |
| --- | --- |
| Power sample | 500 ms |
| Ignition ON hold | 1500 ms |
| Ignition hysteresis | 500 mV |
| GNSS interval | 1 s |
| OBD poll | 1000 ms |
| Queue segment | 32 KiB |
| Queue segment count | 256 |
| Log file cap | 256 KiB |
| Total log cap | 4 MiB |

Các con số là policy hiện tại, không phải chân lý cho mọi xe. Khi thay đổi, cần thêm test ở ranh giới thời gian và dung lượng.

## Validation

Config từ NVS có version và CRC. Sau khi decode vẫn phải kiểm range và quan hệ giữa các field. Ví dụ:

- threshold và hysteresis không được underflow
- interval không được bằng 0 nếu dùng làm chu kỳ task
- chuỗi phải vừa buffer cố định
- quota segment không được vượt khả năng đánh chỉ số

Nếu config hỏng, firmware dùng default an toàn thay vì áp bytes tùy ý.

## Hai loại thời gian

### Monotonic time

Dùng cho debounce, timeout, backoff, OTA uptime deadline và interval. Nó không nhảy khi RTC được đồng bộ.

### Absolute time

Dùng cho timestamp bản ghi và OTA deadline khi RTC đáng tin cậy. RTC DS3231M chỉ được tin nếu:

- oscillator stop flag không bật
- ngày nằm trong khoảng 2024 đến 2099

GNSS fix có UTC hợp lệ có thể giúp đồng bộ RTC.

## Timestamp trust

Payload không nên giả vờ rằng mọi timestamp đều đúng. Record mang cờ cho biết timestamp có đáng tin cậy hay không. Backend có thể quyết định dùng thời gian nhận khi thiết bị chưa có RTC/GNSS đáng tin.

## Bài tập

Tạo config có CRC sai trong test host. Xác nhận decode bị từ chối. Sau đó tạo config đúng CRC nhưng interval ngoài range. Xác nhận validation vẫn từ chối. Hai lớp bảo vệ giải quyết hai loại lỗi khác nhau.

**Mốc hoàn thành.** Bạn mô tả được nguồn của từng field và chọn đúng clock cho timeout hoặc timestamp.
