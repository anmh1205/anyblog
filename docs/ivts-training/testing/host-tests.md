---
title: Chạy 15 bộ host test
description: Biên dịch logic thuần C bằng GCC trên Windows hoặc WSL với sanitizer.
---

# Chạy 15 bộ host test

Repo có 15 file test dưới `tests/host`. Mỗi file tạo một executable nhỏ bằng `minitest.h`. Đây là vòng phản hồi nhanh nhất của firmware.

## Danh sách test

| Test | Phần được kiểm tra |
| --- | --- |
| `test_base` | utility nền |
| `test_backoff` | retry và giới hạn |
| `test_civil` | ngày giờ/epoch |
| `test_config` | default, validation, CRC |
| `test_event` | event model |
| `test_fsm` | axes, state, action, sleep |
| `test_record` | binary encode/decode |
| `test_json_reader` | command token parser |
| `test_json_writer` | bounded JSON output |
| `test_payload` | MQTT payload |
| `test_at_parser` | AT stream và engine |
| `test_gnss_parse` | GNSS response |
| `test_elm327` | ELM session parser |
| `test_obd_pid` | PID conversion |
| `test_ota_confirm` | accept/wait/rollback policy |

## Chạy trên WSL/Linux

```bash
cd /mnt/c/Users/Admin/Downloads/ivts-firmware
bash tools/host_test.sh
```

Script bật C11, warning-as-error, AddressSanitizer và UndefinedBehaviorSanitizer. Chạy riêng một nhóm:

```bash
bash tools/host_test.sh fsm
bash tools/host_test.sh payload
```

## Chạy GCC native trên Windows

PowerShell cần flag MinGW cho format specifier:

```powershell
$flags = @(
  '-D__USE_MINGW_ANSI_STDIO=1',
  '-std=c11', '-Wall', '-Wextra', '-Werror',
  '-Icomponents/ivts-core/include',
  '-Icomponents/modem/src',
  '-Icomponents/obd/src',
  '-Itests/host'
)
```

Biên dịch test cùng source thuần C mà nó cần. Bản Windows cho logic feedback. Sanitizer vẫn nên chạy ở WSL/Linux.

## Một test tốt có ba phần

```c
// Arrange
ivts_axes_init(&axes);

// Act
ivts_axes_on_power(&axes, &cfg, 13900, 2500);

// Assert
MT_EQ_INT(IVTS_IGN_ON, axes.ign);
```

Test stateful cần ghi rõ timeline. Đừng giấu timestamp trong helper đến mức không nhìn thấy điều kiện hold.

## Thêm test trước khi sửa bug

1. Tạo input nhỏ nhất tái hiện bug.
2. Chạy và thấy test fail vì đúng lý do.
3. Sửa implementation.
4. Chạy test riêng.
5. Chạy toàn bộ 15 bộ.

**Mốc hoàn thành.** Toàn bộ executable kết thúc `0 failed`, warning cũng làm build thất bại và sanitizer không báo lỗi.
