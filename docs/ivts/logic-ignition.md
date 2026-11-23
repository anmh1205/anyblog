---
slug: "/ivts/logic-ignition"
title: "Bài 2. Tự tính trạng thái ignition từ điện áp"
sidebar_label: "Bài 2 · Suy ra ignition từ điện áp"
description: "Thử ngưỡng, dải trễ và thời gian giữ bằng test C trên PC."
---

IVTS suy ra ignition từ điện áp nguồn xe. Một ngưỡng lên và một ngưỡng xuống giúp trạng thái ổn định khi điện áp dao động. Điện áp còn phải duy trì đủ lâu ở phía bên kia ngưỡng trước khi đổi trạng thái. Cách đó cho phép mô phỏng vài chục giây chỉ bằng cách truyền các mốc thời gian vào hàm.

## Thử ngưỡng và thời gian giữ

1. Đọc `ivts_axes_cfg_t` trong `components/ivts-core/include/ivts_core/fsm/axes.h`. Thử tự viết `ivts_axes_on_power()` theo ba trường hợp. Mẫu đầu chốt ngay. Mẫu sau bắt đầu đếm khi vượt ngưỡng tương ứng. Mẫu quay về phía trạng thái hiện tại sẽ hủy ứng viên đang đếm.
2. So sánh với đoạn đầu `tests/host/test_fsm.c`. Với ngưỡng lên 13.000 mV và dải trễ 500 mV, mẫu 13.900 mV từ `1.000 ms` đủ điều kiện chuyển ON tại `2.500 ms`. Sau đó 12.700 mV vẫn giữ ON. Khi mẫu 11.000 mV xuất hiện ở `6.000 ms` và duy trì liên tục, ignition mới chuyển OFF tại `21.000 ms`.
3. Đưa `components/ivts-core/CMakeLists.txt` vào project thực hành. Dùng `components/ivts-core/src/fsm/axes.c` đối chiếu với phần tự viết. Đọc tiếp `components/ivts-core/src/fsm/fsm.c` và theo dõi hai khâu. `axes.c` suy ra ignition và motion từ tín hiệu. `fsm.c` nhận các trạng thái đó và trả các hành động như bật GNSS, tạo bản ghi hoặc chuẩn bị ngủ.

~~~powershell
Set-Location -LiteralPath $lab
Copy-Item -Path "$ref\components\ivts-core" -Destination .\components -Recurse
~~~

## Chạy test trên Linux hoặc WSL

Chạy test có sẵn từ bản tham chiếu trên Linux hoặc WSL có Bash và GCC. Script biên dịch logic C và mô phỏng dữ liệu đầu vào, có AddressSanitizer và UndefinedBehaviorSanitizer.

~~~bash
cd /duong/dan/toi/ivts-firmware
bash tools/host_test.sh fsm
bash tools/host_test.sh
~~~

## Chạy test trên Windows

Nếu dùng GCC trên Windows, định nghĩa hàm sau trong PowerShell. Chạy `Test-IvtsHost fsm` cho bài này. Ở các bài sau, tên test đứng sau `bash tools/host_test.sh` cũng dùng được với hàm này, chẳng hạn `Test-IvtsHost gnss_parse`. Gọi `Test-IvtsHost` để chạy tất cả. Cách này kiểm thử native với GCC. Để chạy thêm sanitizer, dùng script Bash trên Linux hoặc WSL.

~~~powershell
Set-Location -LiteralPath $ref

function Test-IvtsHost([string]$Pattern = '*') {
    $flags = @(
        '-D__USE_MINGW_ANSI_STDIO=1', '-std=c11', '-Wall', '-Wextra', '-Werror',
        '-Icomponents/ivts-core/include', '-Icomponents/modem/src',
        '-Icomponents/obd/src', '-Itests/host'
    )
    $sources = @(
        (Get-ChildItem components/ivts-core/src -Filter '*.c' -Recurse).FullName
        'components/modem/src/at_parser.c'
        'components/modem/src/at_engine.c'
        'components/modem/src/gnss_parse.c'
        'components/obd/src/elm327.c'
        'components/obd/src/obd_pid.c'
    )
    $cases = @(Get-ChildItem -Path "tests/host/test_$Pattern.c")
    if (!$cases.Count) { throw "Không tìm thấy test: $Pattern" }
    $out = New-Item -ItemType Directory -Path (Join-Path ([IO.Path]::GetTempPath()) "ivts-$([guid]::NewGuid())")
    foreach ($test in $cases) {
        $exe = Join-Path $out.FullName ($test.BaseName + '.exe')
        Write-Host $test.BaseName
        gcc @flags $test.FullName @sources -o $exe
        if ($LASTEXITCODE -ne 0) { throw "Không build được $($test.BaseName)" }
        & $exe
        if ($LASTEXITCODE -ne 0) { throw "Test lỗi: $($test.BaseName)" }
    }
}

Test-IvtsHost fsm
~~~

## Mốc kiểm chứng

**Mốc đạt.** Test FSM báo `0 failed`. Thử thêm một mẫu 11.000 mV ngắn ngay sau khi ignition lên ON, rồi đưa điện áp lại 13.900 mV. Dự đoán giá trị ignition sau từng mẫu trước khi chạy.
