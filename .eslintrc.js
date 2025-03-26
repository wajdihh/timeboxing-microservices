module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'filenames', 'boundaries'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:filenames/recommended',
      'plugin:boundaries/recommended',
      'prettier'
    ],
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'domain', allow: ['application'] },
          { from: 'application', allow: ['infrastructure'] }
        ]
      }]
    },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/*' },
        { type: 'application', pattern: 'src/application/*' },
        { type: 'infrastructure', pattern: 'src/infrastructure/*' }
      ]
    }
  };
  