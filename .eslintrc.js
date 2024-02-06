module.exports = {
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  rules: {
    'import/extensions': 0,
    'import/no-amd': 0,
    'import/no-dynamic-require': 0,
    'import/prefer-default-export': 0,
    'max-len': 0,
    'no-console': 0,
    'no-param-reassign': 0,
    'no-restricted-globals': 0,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
  },
};
