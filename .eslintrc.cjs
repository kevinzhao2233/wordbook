module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    'vue/setup-compiler-macros': true,
  },
  extends: ['plugin:vue/vue3-recommended', 'airbnb-base'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['vue', '@typescript-eslint', 'import'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 3,
        },
        multiline: {
          max: 1,
        },
      },
    ],
    'vue/html-indent': [
      'error',
      2,
      {
        attribute: 1,
        baseIndent: 1,
        closeBracket: 0,
        alignAttributesVertically: true,
        ignores: [],
      },
    ],
    'vue/no-unused-vars': ['warn', { ignorePattern: '^_' }],
    'vue/one-component-per-file': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    // 'vue/name-property-casing': ['error', 'PascalCase'],
    'vue/name-property-casing': 'off',
    'vue/no-v-html': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/no-v-model-argument': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/member-delimiter-style': ['error', {
      multiline: {
        delimiter: 'semi',
        requireLast: true,
      },
      singleline: {
        delimiter: 'semi',
        requireLast: false,
      },
    }],
    '@typescript-eslint/type-annotation-spacing': ['error', {
      before: false,
      after: true,
      overrides: {
        arrow: {
          before: true,
          after: true,
        },
      },
    }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-restricted-syntax': 'off',
    // TS 项目中关闭此配置，但是打开 @typescript-eslint/no-unused-vars
    'no-unused-vars': 'off',
    'no-param-reassign': 'off',
    'no-unused-expressions': 'off',
    'no-lonely-if': 'off',
    'no-use-before-define': ['off'],
    'prefer-promise-reject-errors': 'off',
    'symbol-description': 'off',
    'max-len': [
      'error',
      {
        code: 140,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'prefer-destructuring': 'off',
    camelcase: 'off',
    'no-redeclare': 'off',
    'no-nested-ternary': 'off',
    'func-names': ['error', 'as-needed'],
  },
};
