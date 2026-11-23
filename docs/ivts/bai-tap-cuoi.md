---
slug: "/ivts/bai-tap-cuoi"
title: "Bài thực hành cuối"
description: "Theo dõi kịch bản bật máy, mất kết nối và phát lại telemetry qua toàn bộ firmware."
---

Tạo một chuỗi mẫu mô phỏng bật máy, sụt áp ngắn, tắt máy và mất broker trong lúc đang `DRIVING`. Với từng mốc, dự đoán ignition, state, số bản ghi SD và thời điểm một bản replay có thể bị xóa. Sau đó chạy host test cho phần logic và dùng log thiết bị, SD cùng MQTT client cho phần giao tiếp. Khi một dự đoán sai, tìm điểm đầu tiên khác kỳ vọng trong chuỗi `mV → event → FSM → bản ghi → ACK`.

Để viết thêm bài theo kiểu EmbeddedFun, đặt tên bài theo việc bạn sẽ làm, cho một đầu vào nhỏ, ghi rõ đầu ra cần thấy và kết thúc bằng một biến thể khiến bạn phải dự đoán trước khi chạy. Dùng link tới file C tại chỗ bạn cần hiểu một quyết định. [Cách EmbeddedFun mở đầu khóa học](https://embeddedfun.org/docs/zephyr-training/how-to-start/) · [Bài thực hành kiểm thử của EmbeddedFun](https://embeddedfun.org/docs/zephyr-training/testing/ztest/first-test/)
