import blockLevelTags from './block-level-tags.const';

const AllowedTags = [
  'a',
  'code',
  'del',
  'em',
  'span',
  'strong',
  'sub',
  'sup',
  ...blockLevelTags,
];

export default AllowedTags;
