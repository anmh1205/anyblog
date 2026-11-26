import {themes as prismThemes} from 'prism-react-renderer';

export default {
  title: 'AnyLab',
  tagline: 'Dựng firmware IVTS trên ESP32-S3 từ một thư mục rỗng',
  favicon: 'img/favicon.png',
  url: 'https://anylabvn.github.io',
  baseUrl: '/anyblog/',
  organizationName: 'anylabvn',
  projectName: 'anyblog',
  trailingSlash: true,
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {onBrokenMarkdownLinks: 'throw'},
  },
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          sidebarCollapsed: true,
          routeBasePath: 'docs',
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      },
    ],
  ],
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 60,
      },
    ],
  ],
  themeConfig: {
    image: 'img/firmware-bench.webp',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'ivts-course-rebuild',
      content:
        '🧭 Khóa thực hành IVTS: tự viết firmware theo từng checkpoint chạy được — <a href="/anyblog/docs/ivts-training/how-to-start/"><strong>bắt đầu từ đây</strong></a>',
      backgroundColor: '#2563eb',
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: 'AnyLab',
      logo: {
        alt: 'AnyLab',
        src: 'img/favicon.png',
        width: 30,
        height: 30,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'trainingSidebar',
          label: 'Khóa IVTS',
          position: 'left',
        },
        {
          to: '/docs/ivts-training/core/architecture',
          label: 'Lõi C',
          position: 'left',
        },
        {
          to: '/docs/ivts-training/io/adc-power',
          label: 'Phần cứng',
          position: 'left',
        },
        {
          to: '/docs/ivts-training/connectivity/modem-layers',
          label: 'Kết nối',
          position: 'left',
        },
        {
          to: '/docs/ivts-training/testing/host-tests',
          label: 'Kiểm thử',
          position: 'left',
        },
        {
          href: 'https://github.com/anylabvn/anyblog',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Khóa học',
          items: [
            {
              label: 'Bắt đầu',
              to: '/docs/ivts-training/how-to-start/',
            },
            {
              label: 'Lõi C và FSM',
              to: '/docs/ivts-training/core/architecture/',
            },
            {
              label: 'Kiểm thử',
              to: '/docs/ivts-training/testing/host-tests/',
            },
          ],
        },
        {
          title: 'Dự án',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/anylabvn/anyblog',
            },
            {
              label: 'Báo lỗi nội dung',
              href: 'https://github.com/anylabvn/anyblog/issues',
            },
          ],
        },
      ],
      copyright: 'Built with Docusaurus. © 2026 AnyLab VN.',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'c', 'cmake', 'json', 'powershell'],
    },
  },
};
