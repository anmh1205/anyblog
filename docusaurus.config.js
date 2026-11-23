import {themes as prismThemes} from 'prism-react-renderer';

export default {
  title: 'Anyblog',
  tagline: 'Firmware và hệ thống nhúng',
  favicon: 'img/favicon.png',
  url: process.env.SITE_URL || 'https://anyblog-ivts-lab.botanicalpeony8.chatgpt.site',
  baseUrl: '/',
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
        docs: {sidebarPath: './sidebars.js', sidebarCollapsed: false},
        blog: {
          blogTitle: 'Ghi chép kỹ thuật',
          blogDescription: 'Giải thích các quyết định thiết kế trong firmware IVTS.',
          blogSidebarTitle: 'Bài viết',
          blogSidebarCount: 'ALL',
          feedOptions: {type: ['rss', 'atom']},
          onUntruncatedBlogPosts: 'throw',
        },
        theme: {customCss: './src/css/custom.css'},
      },
    ],
  ],
  themeConfig: {
    image: 'img/firmware-bench.webp',
    navbar: {
      title: 'anyblog',
      items: [
        {to: '/docs/ivts/', label: 'Tài liệu', position: 'left', activeBasePath: '/docs'},
        {to: '/blog/', label: 'Blog', position: 'left'},
      ],
    },
    footer: {
      links: [
        {
          title: 'Anyblog',
          items: [
            {label: 'Trang chủ', to: '/'},
            {label: 'Giáo trình IVTS', to: '/docs/ivts/'},
            {label: 'Ghi chép kỹ thuật', to: '/blog/'},
          ],
        },
      ],
      copyright: 'Anyblog · Firmware và hệ thống nhúng',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'c', 'cmake', 'powershell'],
    },
  },
};
