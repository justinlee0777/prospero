import blockLevelTags from './block-level-tags.const';

const options: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'a',
    'code',
    'del',
    'em',
    'span',
    'strong',
    'sub',
    'sup',
    ...blockLevelTags,
  ],
  ALLOWED_ATTR: ['style', 'href'],
};

export default options;
