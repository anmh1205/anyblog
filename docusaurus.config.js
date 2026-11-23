import {themes as prismThemes} from 'prism-react-renderer';

export default {
  title: 'IVTS Firmware Training',
  tagline: 'Dựng lại firmware IVTS trên ESP32-S3 từ mã nguồn thật',
  favicon: 'img/favicon.png',
  url: 'https://anmh1205.github.io',
  baseUrl: '/anyblog/',
  organizationName: 'anmh1205',
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
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'IVTS Firmware Training',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'trainingSidebar',
          label: 'Khóa học',
          position: 'left',
        },
        {
          href: 'https://github.com/anmh1205/anyblog',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: 'IVTS Firmware Training · Docusaurus 3.10.1 · GitHub Pages',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'c', 'cmake', 'powershell'],
    },
  },
};
