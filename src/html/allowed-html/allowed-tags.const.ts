import blockLevelTags from './allowed-block-level-tags.const';
import allowedVoidTags from './allowed-void-elements.const';

const AllowedTags = [
  'a',
  'code',
  'del',
  'em',
  'span',
  'strong',
  'sub',
  'sup',
  ...allowedVoidTags,
  ...blockLevelTags,
];

export default AllowedTags;
