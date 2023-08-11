import allowedVoidTags from './allowed-void-elements.const';

const voidTags = [
  ...allowedVoidTags,
  'area',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
];

export default voidTags;
