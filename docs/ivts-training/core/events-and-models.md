---
title: Event và mô hình dữ liệu
description: Đọc ivts_event_t, telemetry snapshot, GNSS và OBD model.
---

# Event và mô hình dữ liệu

Event là dữ kiện vừa xảy ra. Snapshot là hiểu biết hiện tại của app. Record là ảnh chụp bền vững được gán định danh. Không trộn ba khái niệm này.

## Event envelope

Mở `components/ivts-core/include/ivts_core/event/event.h`. Một event có:

- loại event
- timestamp monotonic `ts_ms`
- union chứa payload tương ứng

Các nhóm nguồn gồm board, modem, OBD và OTA. Producer điền đúng nhánh union theo `type`. Consumer phải switch theo `type` trước khi đọc union.

## Sink callback

Adapter nhận một sink khi init. Khi có dữ liệu, adapter gọi sink thay vì biết queue hoặc app cụ thể.

```c
typedef ivts_err_t (*ivts_event_sink_fn)(void *ctx,
                                        const ivts_event_t *ev);
```

Mẫu interface này cho phép test dùng sink giả, còn firmware thật dùng sink chép vào FreeRTOS queue.

## Snapshot telemetry

Snapshot gom dữ liệu gần nhất:

- điện áp xe và điện áp thiết bị
- ignition, motion và vehicle state
- GNSS fix cùng trạng thái thời gian
- các PID OBD đã đọc
- trạng thái link và thông tin hệ thống

App task là single writer. Driver chỉ phát event. Khi cần tạo record, app đọc một snapshot nhất quán.

## GNSS model

Model GNSS phải phân biệt:

- có parse được câu trả lời không
- fix có hợp lệ không
- tọa độ, tốc độ, heading có mặt không
- UTC có đủ tin cậy để đồng bộ RTC không

Một AT command thành công không đồng nghĩa đã có fix.

## OBD model

Mỗi PID có thể chưa có dữ liệu. Đừng dùng giá trị `0` để biểu diễn “không biết”, vì 0 có thể là giá trị hợp lệ. Model cần cờ validity hoặc field presence.

## Event không được giữ con trỏ ngắn hạn

App queue chép toàn bộ `ivts_event_t`. Event không nên trỏ vào buffer AT hoặc notify buffer sẽ bị tái sử dụng sau callback. Nếu payload có độ dài thay đổi, adapter phải copy vào storage có lifetime rõ ràng hoặc giới hạn kích thước event.

## Bài tập tracing

Chọn `IVTS_EV_POWER_SAMPLE` và ghi lại:

1. producer trong `board_os.c`
2. sink trong `app_os.c`
3. dispatch trong `app.c`
4. snapshot update
5. field đi vào record

Lặp lại với GNSS fix và MQTT ACK. Bạn sẽ thấy ACK không cập nhật cảm biến nhưng thay đổi trạng thái publish/replay.

**Mốc hoàn thành.** Bạn giải thích được vì sao event, snapshot và record có cấu trúc khác nhau dù cùng chứa telemetry.
