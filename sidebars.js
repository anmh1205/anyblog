import {lessons} from './src/content.js';

export default {
  ivts: [
    'ivts/index',
    {
      type: 'category',
      label: 'Thực hành IVTS',
      collapsed: false,
      items: lessons.map(({slug}) => `ivts/${slug}`),
    },
    'ivts/bai-tap-cuoi',
  ],
};
