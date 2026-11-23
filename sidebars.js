export default {
  trainingSidebar: [
    'ivts-training/how-to-start',
    {
      type: 'category',
      label: 'Bắt đầu',
      collapsed: false,
      items: [
        'ivts-training/start/learning-map',
        'ivts-training/start/prerequisites',
        'ivts-training/start/hardware-and-pinmap',
        'ivts-training/start/create-project',
        'ivts-training/start/build-flash-monitor',
      ],
    },
    {
      type: 'category',
      label: 'Kiến trúc và lõi thuần C',
      items: [
        'ivts-training/core/architecture',
        'ivts-training/core/component-boundaries',
        'ivts-training/core/base-utilities',
        'ivts-training/core/events-and-models',
        'ivts-training/core/config-and-time',
        'ivts-training/core/record-and-payload',
      ],
    },
    {
      type: 'category',
      label: 'Trạng thái và luồng ứng dụng',
      items: [
        'ivts-training/control/axes',
        'ivts-training/control/fsm',
        'ivts-training/control/app-composition',
        'ivts-training/control/event-loop',
        'ivts-training/control/sleep-and-wakeup',
      ],
    },
    {
      type: 'category',
      label: 'Board và lưu trữ',
      items: [
        'ivts-training/io/adc-power',
        'ivts-training/io/i2c-rtc',
        'ivts-training/io/imu-motion',
        'ivts-training/io/nvs',
        'ivts-training/io/sd-card',
        'ivts-training/io/offline-queue',
      ],
    },
    {
      type: 'category',
      label: 'Modem, GNSS và OBD',
      items: [
        'ivts-training/connectivity/modem-layers',
        'ivts-training/connectivity/at-engine',
        'ivts-training/connectivity/lte-and-mqtt',
        'ivts-training/connectivity/gnss',
        'ivts-training/connectivity/obd-ble',
        'ivts-training/connectivity/elm327-and-pid',
      ],
    },
    {
      type: 'category',
      label: 'Dữ liệu và độ tin cậy',
      items: [
        'ivts-training/reliability/publish-and-replay',
        'ivts-training/reliability/remote-commands',
        'ivts-training/reliability/ota-download',
        'ivts-training/reliability/ota-confirm-rollback',
        'ivts-training/reliability/diagnostics',
      ],
    },
    {
      type: 'category',
      label: 'Kiểm thử và hoàn thiện',
      items: [
        'ivts-training/testing/host-tests',
        'ivts-training/testing/layer-checks',
        'ivts-training/testing/failure-injection',
        'ivts-training/testing/full-build',
        'ivts-training/testing/end-to-end-lab',
      ],
    },
  ],
};
