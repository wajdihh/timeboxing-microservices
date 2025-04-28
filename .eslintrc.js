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
      'filenames/match-regex': [
        'error',
        '^[A-Z][A-Za-z0-9]+(Service|Controller|UseCase|Repository|Entity|Dto|Command|Query|Module|Adapter|Port)$',
        true
      ],
     'filenames/match-exported': [2, 'pascal-case'],
    },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/*' },
        { type: 'application', pattern: 'src/application/*' },
        { type: 'infrastructure', pattern: 'src/infrastructure/*' }
      ]
    },
    //Ignore Tests for Filenames Rule
    overrides: [
      {
        files: ['**/main.ts', '**/*.spec.ts', '**/*.e2e-spec.ts', '**/test/**'],
        rules: {
          'filenames/match-regex': 'off',
          'filenames/match-exported': 'off'
        }
      }
    ]
  };
