module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'filenames', 'boundaries'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
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
      }],
      //Enforce PascalCase file names with common suffixes
    //'filenames/match-regex': [2, '^[A-Z][a-z0-9]+[A-Z][a-zA-Z0-9]*\\.ts$'],
    //File name must match exported class or function
    'filenames/match-exported': [2, null]
    },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/*' },
        { type: 'application', pattern: 'src/application/*' },
        { type: 'infrastructure', pattern: 'src/infrastructure/*' }
      ]
    }
  };
