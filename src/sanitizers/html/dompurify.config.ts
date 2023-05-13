const options: DOMPurify.Config = {
  ALLOWED_TAGS: ['a', 'code', 'del', 'em', 'span', 'strong'],
  ALLOWED_ATTR: ['style', 'href'],
};

export default options;
