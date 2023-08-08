import blockLevelTags from './block-level-tags.const';

const AllowedTags = [
  'a',
  'br',
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
