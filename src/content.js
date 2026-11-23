export const lessons = [
  {
    slug: 'khoi-dong',
    title: 'Từ project trống đến bản build đầu tiên',
    summary: 'Tạo project ESP-IDF và xem log từ app_main.',
  },
  {
    slug: 'logic-ignition',
    title: 'Suy ra ignition từ điện áp',
    summary: 'Thử ngưỡng, dải trễ và thời gian giữ bằng test C trên PC.',
  },
  {
    slug: 'doc-adc',
    title: 'Đọc điện áp từ ADC',
    summary: 'Nối sự kiện từ board vào logic đã kiểm thử.',
  },
  {
    slug: 'ghep-ung-dung',
    title: 'Ghép ứng dụng và chạy offline',
    summary: 'Nối queue FreeRTOS, máy trạng thái và các component I/O.',
  },
  {
    slug: 'mqtt-va-sd',
    title: 'Gửi và phát lại telemetry',
    summary: 'Theo một bản ghi qua MQTT, SD và xác nhận nhận tin.',
  },
  {
    slug: 'gnss-obd-ngu',
    title: 'GNSS, OBD và chế độ ngủ',
    summary: 'Đọc thêm tín hiệu và kiểm tra cách thiết bị thức dậy.',
  },
  {
    slug: 'ota-va-rollback',
    title: 'Cập nhật OTA và rollback',
    summary: 'Thử xác nhận image mới và quay lại phiên bản đã chạy ổn.',
  },
];

export const articles = [
  {
    slug: 'tu-adc-den-telemetry',
    topic: 'Kiến trúc firmware',
    title: 'Một mẫu điện áp đi đâu trong firmware?',
    summary: 'Theo đường từ ADC và queue FreeRTOS đến bản ghi telemetry.',
  },
  {
    slug: 'mqtt-ack-va-phat-lai',
    topic: 'MQTT và lưu trữ',
    title: 'Vì sao cùng một message_id có thể xuất hiện hai lần?',
    summary: 'Xem điều gì xảy ra khi broker đã nhận dữ liệu nhưng thiết bị chưa thấy ACK.',
  },
];
