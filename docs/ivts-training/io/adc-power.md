---
title: ADC và đo nguồn
description: Đọc hai kênh ADC, hiệu chuẩn, lấy trung bình và đổi sang millivolt đầu vào.
---

# ADC và đo nguồn

`board_adc.c` đọc nguồn xe ở GPIO3 và nguồn thiết bị ở GPIO4. Giá trị cuối là millivolt tại đầu vào mạch chia, không phải millivolt ở chân ESP32-S3.

## Pipeline đo

```text
8 mẫu ADC raw
  → lấy trung bình
  → curve fitting calibration
  → mV tại chân ADC
  → nhân tỉ lệ chia áp 11:1
  → áp hệ số gain ppm
  → vehicle_mv / device_mv
```

Lấy tám mẫu giảm nhiễu ngẫu nhiên. Nó không thay thế cho thiết kế analog, tụ lọc hay bảo vệ surge.

## Calibration bắt buộc

Driver tạo calibration handle bằng scheme curve fitting. Nếu chip không có dữ liệu eFuse cần thiết, init thất bại. Firmware không rơi về công thức danh định vì sai số nguồn sẽ làm ignition policy sai mà khó phát hiện.

## Hệ số gain

Hai đường analog có hệ số riêng:

- vehicle `1020070 ppm`
- device `1019950 ppm`

Cách tính theo ppm giữ arithmetic integer và tránh float trong đường đo định kỳ. Cần dùng kiểu trung gian đủ rộng để không overflow khi nhân millivolt.

## Đưa event vào app

`board_os.c` lấy mẫu theo chu kỳ mặc định 500 ms, tạo `IVTS_EV_POWER_SAMPLE` và gọi sink. Event chứa cả hai điện áp cùng timestamp monotonic.

## Lab chỉ dùng board và core

Cho `main` phụ thuộc `board`, rồi khởi tạo axes. Trong sink:

```c
if (ev->type == IVTS_EV_POWER_SAMPLE) {
    ivts_axes_on_power(&axes, &cfg,
                       ev->u.power.vehicle_mv,
                       ev->ts_ms);
    printf("vehicle=%u device=%u ignition=%d\n",
           ev->u.power.vehicle_mv,
           ev->u.power.device_mv,
           axes.ign);
}
```

Giữ sink ngắn. Không ghi SD hoặc chờ serial bên trong callback ở bản hoàn chỉnh.

## Quy trình hiệu chuẩn trên bàn

1. Dùng nguồn giới hạn dòng.
2. Cấp vào đầu vào mạch chia, không cấp vào GPIO.
3. Đo điện áp cùng lúc bằng đồng hồ tham chiếu.
4. Ghi ít nhất ba điểm trong dải hoạt động.
5. Tính sai số theo đường, không chỉnh threshold để che lỗi gain.
6. Sau khi gain đúng, kiểm hysteresis và hold time.

## Lỗi thường gặp

**Giá trị thấp khoảng 11 lần.** Bạn đang in mV ở chân ADC trước khi nhân divider.

**Giá trị luôn 0 hoặc full-scale.** Kiểm pin map, attenuation, mạch chia và mass chung.

**Ignition rung dù điện áp ổn.** Kiểm timestamp, chu kỳ sample và axes config trước khi tăng lọc.

**Mốc hoàn thành.** Sai số ADC được đo bằng đồng hồ, event xuất hiện mỗi 500 ms và ignition đổi đúng sau hold time.
