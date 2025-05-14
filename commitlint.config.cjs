const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'references-empty': [1, 'never'],
    'body-max-line-length': [0, 'always'],
    'footer-max-line-length': [0, 'always']
  }
};
