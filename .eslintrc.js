module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  ignorePatterns: ['**/*.scss'],
  plugins: [
    'react',
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/array-type': [1, {default: 'array-simple'}],
    '@typescript-eslint/ban-types': 1,
    '@typescript-eslint/comma-dangle': [1, 'always-multiline'],
    '@typescript-eslint/comma-spacing': [1, { 'before': false, 'after': true }],
    '@typescript-eslint/consistent-type-definitions': [1, 'interface'],
    '@typescript-eslint/consistent-type-imports': [1, {prefer: 'type-imports'}],
    '@typescript-eslint/func-call-spacing': [1, 'never'],
    '@typescript-eslint/keyword-spacing': [1, {before: true, after: true}],
    '@typescript-eslint/member-delimiter-style': [1, {
      multiline: {delimiter: 'semi'},
      singleline: {delimiter: 'semi'}
    }],
    '@typescript-eslint/method-signature-style': [1, 'property'],
    '@typescript-eslint/naming-convention': [1,
      {selector: 'variableLike', format: ['camelCase', 'PascalCase']},
      {selector: 'memberLike', format: ['camelCase']},
      {selector: 'typeLike', format: ['PascalCase']},
      {selector: 'property', format: ['camelCase']},
      {selector: 'method', format: ['camelCase']}
    ],
    '@typescript-eslint/no-confusing-non-null-assertion': 1,
    '@typescript-eslint/no-dupe-class-members': 1,
    '@typescript-eslint/no-duplicate-imports': [1, { 'includeExports': true }],
    '@typescript-eslint/no-dynamic-delete': 1,
    '@typescript-eslint/no-empty-function': 1,
    '@typescript-eslint/no-empty-interface': 1,
    'no-empty-pattern': 1,
    '@typescript-eslint/no-explicit-any': 1,
    '@typescript-eslint/no-extra-parens': 1,
    '@typescript-eslint/no-extra-semi': 1,
    '@typescript-eslint/no-inferrable-types': 1,
    '@typescript-eslint/no-invalid-void-type': 1,
    '@typescript-eslint/no-loop-func': 1,
    '@typescript-eslint/no-parameter-properties': 1,
    '@typescript-eslint/no-shadow': 1,
    '@typescript-eslint/no-this-alias': 1,
    '@typescript-eslint/no-unused-expressions': 1,
    '@typescript-eslint/no-unused-vars': 1,
    '@typescript-eslint/no-use-before-define': 1,
    '@typescript-eslint/no-useless-constructor': 1,
    '@typescript-eslint/no-var-requires': 1,
    '@typescript-eslint/object-curly-spacing': 1,
    '@typescript-eslint/prefer-enum-initializers': 1,
    '@typescript-eslint/prefer-optional-chain': 1,
    '@typescript-eslint/quotes': ['warn', 'single', {'avoidEscape': true}],
    '@typescript-eslint/semi': 1,
    '@typescript-eslint/sort-type-union-intersection-members': 1,
    '@typescript-eslint/space-before-function-paren': [1, {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'never'
    }],
    '@typescript-eslint/type-annotation-spacing': [1, {before: false, after: true}],
    '@typescript-eslint/unified-signatures': 1,
    'arrow-body-style': [1, 'as-needed', {'requireReturnForObjectLiteral': true}],
    'arrow-parens': [1, 'always'],
    'arrow-spacing': 1,
    'block-spacing': [1, 'never'],
    'brace-style': [1, '1tbs', {'allowSingleLine': true}],
    'comma-dangle': 'off',
    'comma-spacing': 'off',
    'curly': 1,
    'eol-last': [1, 'always'],
    'eqeqeq': 1,
    'func-call-spacing': 'off',
    'jsx-quotes': ['warn', 'prefer-single'],
    'key-spacing': [1, { 'beforeColon': false, 'afterColon': true, 'mode': 'strict' }],
    'max-nested-callbacks': [1, 6],
    'no-case-declarations': 1,
    'no-confusing-arrow': 1,
    'no-console': 1,
    'no-control-regex': 0,
    'no-debugger': 1,
    'no-duplicate-imports': 'off',
    'no-extend-native': 1,
    'no-extra-bind': 1,
    'no-extra-boolean-cast': 1,
    'no-extra-semi': 1,
    'no-fallthrough': 1,
    'no-inner-declarations': 1,
    'no-irregular-whitespace': 1,
    'no-lonely-if': 1,
    'no-mixed-spaces-and-tabs': 1,
    'no-multi-spaces': 1,
    'no-multiple-empty-lines': [1, {'max': 2, 'maxEOF': 1}],
    'no-prototype-builtins': 1,
    'no-trailing-spaces': 1,
    'no-undef-init': 1,
    'no-undef': 1,
    'no-unexpected-multiline': 1,
    'no-unused-expressions': 'off',
    'no-useless-escape': 1,
    'no-useless-rename': 1,
    'no-var': 1,
    'no-whitespace-before-property': 1,
    'one-var': ['warn', 'never'],
    'prefer-const': 1,
    'prefer-spread': 1,
    'quotes': 'off',
    'react/jsx-boolean-value': 1,
    'react/jsx-no-undef': 2,
    'react/jsx-sort-prop-types': 0,
    'react/jsx-sort-props': 0,
    'react/jsx-uses-react': 2,
    'react/jsx-uses-vars': 2,
    'react/no-did-mount-set-state': 0,
    'react/no-did-update-set-state': 2,
    'react/no-multi-comp': 0,
    'react/no-unknown-property': 0,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 2,
    'react/self-closing-comp': 2,
    'react/wrap-multilines': 0,
    'semi-spacing': [1, {'before': false, 'after': true}],
    'semi-style': [1, 'last'],
    'semi': 'off',
    'space-before-function-paren': 'off',
    'space-in-parens': [1, 'never'],
    'space-infix-ops': 1,
    'strict': 1,
  },
  globals: {
    inject: false,
    module: false,
    describe: false,
    it: false,
    before: false,
    beforeEach: false,
    after: false,
    afterEach: false,
    expect: false,
    window: false,
    document: false,
    Parse: false,
    chai: true,
    t: 'readonly',
    $: 'readonly',
    ga: 'readonly'
  }
}
