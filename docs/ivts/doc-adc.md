---
slug: "/ivts/doc-adc"
title: "Bài 3. Đưa tín hiệu ADC vào logic vừa kiểm thử"
sidebar_label: "Bài 3 · Đọc điện áp từ ADC"
description: "Nối sự kiện từ board vào logic đã kiểm thử."
---

## Ghép component board

1. Chạy `Set-Location -LiteralPath $lab` rồi `Copy-Item -Path "$ref\components\board" -Destination .\components -Recurse`. Trong `main/CMakeLists.txt` đổi đăng ký thành `idf_component_register(SRCS "main.c" PRIV_REQUIRES board)`. `board` công khai phụ thuộc `ivts-core` nên `main` cũng thấy các header của core.
2. Lần theo `components/board/src/board_adc.c`. Driver lấy tám mẫu ở ADC1, chuyển sang mV tại chân ADC, rồi nhân với tỉ lệ chia áp và hệ số hiệu chuẩn để suy ra mV ở đầu vào. Trên bàn đo, đưa điện áp thử vào **đầu vào mạch chia áp của board**, theo sơ đồ phần cứng. Các số 12.400 và 13.900 trong bài test là mV phía nguồn xe.
3. Thay `main/main.c` bằng đoạn dưới đây. Trong lượt này, chỉ task board gọi callback `on_event()` sau khi khởi tạo. `now` là timestamp của sự kiện, nên có thể thay ADC bằng chuỗi mẫu giả ở bài 2 để kiểm tra lại cùng logic.

~~~c
#include <stdio.h>
#include "board/board.h"
#include "ivts_core/fsm/axes.h"

static ivts_axes_t axes;
static const ivts_axes_cfg_t axes_cfg = {
    .on_threshold_mv = 13000u,
    .hysteresis_mv = 500u,
    .on_hold_ms = 1500u,
    .off_hold_ms = 15000u,
    .motion_quiet_ms = 30000u,
};

static ivts_err_t on_event(void *ctx, const ivts_event_t *ev)
{
    (void)ctx;
    if (ev->type == IVTS_EV_POWER_SAMPLE) {
        unsigned mv = ev->u.power.vehicle_mv;
        (void)ivts_axes_on_power(&axes, &axes_cfg, ev->u.power.vehicle_mv,
                                 ev->ts_ms);
        printf("vehicle_mv=%u ignition=%d\n", mv, (int)axes.ign);
    }
    return IVTS_OK;
}

void app_main(void)
{
    ivts_axes_init(&axes);
    const board_cfg_t cfg = {
        .sink = { .fn = on_event },
        .power_sample_ms = 500u,
        .imu_enabled = false,
        .task_prio = 2u,
        .task_stack = 3072u,
    };
    ivts_err_t err = board_init(&cfg);
    if (err != IVTS_OK) {
        printf("board_init: %s\n", ivts_err_name(err));
    }
}
~~~

## Build và đọc log

Chạy `idf.py build` từ `$lab`. Nếu có đúng board, flash và quan sát log. So sánh `vehicle_mv` với đồng hồ đo, sau đó giữ đầu vào trên ngưỡng lên và dưới ngưỡng xuống đủ thời gian. Log của mẫu 500 ms chỉ cho thấy chuyển trạng thái ở lần lấy mẫu kế tiếp đủ điều kiện. Nếu sai số lớn, kiểm tra tỉ lệ chia áp và ADC trước khi chỉnh ngưỡng ignition.
