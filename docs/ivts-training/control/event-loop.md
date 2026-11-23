---
title: Queue và event loop
description: Hiểu non-blocking event sink, queue overflow, dispatch và tick 200 ms.
---

# Queue và event loop

App queue có độ dài 32. Producer gọi sink non-blocking với timeout 0. Quyết định này bảo vệ task driver khỏi bị treo vì app chậm, nhưng buộc hệ thống phải đo và xử lý event drop.

## Event sink

Luồng trong `app_os.c` tương đương:

```c
if (xQueueSend(queue, ev, 0) != pdTRUE) {
    dropped_events++;
    return IVTS_ERR_BUSY;
}
return IVTS_OK;
```

Callback phải copy event. Producer có quyền tái sử dụng buffer sau khi callback trả về.

## Vòng lặp app

`app.c` xen kẽ hai loại công việc:

- dispatch event nhận từ queue
- tick logic khoảng mỗi 200 ms

Dispatch cập nhật snapshot, publish state hoặc OTA context. Tick dựng input FSM từ snapshot hiện tại, gọi `ivts_fsm_step()` rồi thực thi action.

## Vì sao không block trong app task

Nếu app task tự chờ HTTP download hoặc AT response:

- queue đầy
- power/motion event bị drop
- ACK tới trễ
- watchdog có thể kích hoạt
- snapshot không còn phản ánh thời gian thực

Tác vụ dài chạy trong task adapter. Khi hoàn thành, adapter phát event.

## Single-writer snapshot

Mọi event được serialize qua một queue. App task là writer duy nhất của snapshot. Reader trong cùng task không cần mutex phức tạp. Adapter giữ state riêng của nó nhưng không sửa trực tiếp telemetry snapshot.

## Queue overflow không được im lặng

Firmware đếm event drop. Diagnostics cần xuất counter này. Khi test stress, một drop có thể chấp nhận tùy loại event, nhưng không được biến mất khỏi quan sát.

## Thử nghiệm tải

Trong bản lab:

1. Tạm thêm delay 500 ms vào dispatch một event ít quan trọng.
2. Tăng tần suất producer.
3. Quan sát counter drop.
4. Bỏ delay.
5. Xác nhận queue phục hồi và counter không tự giảm.

Không dùng thử nghiệm này trên firmware vận hành.

## Chính sách coalescing

Power sample mới có thể làm mẫu cũ ít giá trị hơn, nhưng ACK hoặc OTA completion không thể tùy ý bỏ. Nếu sau này cần coalescing, phải thiết kế theo loại event thay vì tăng queue vô hạn.

**Mốc hoàn thành.** Bạn mô tả được lifetime của event và giải thích vì sao sink không chờ nhưng vẫn cần telemetry về drop.
