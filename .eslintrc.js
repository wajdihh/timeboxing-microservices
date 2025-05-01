module.exports = {
    root: true,
    ignorePatterns: ['**/dist/**'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'filenames', 'boundaries', 'import'],
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
          // Interfaces can call Application
          { from: 'interfaces', allow: ['application'] },
  
          // Application can call Domain and Infrastructure
          { from: 'application', allow: ['domain', 'infrastructure'] },
  
          // Domain is pure — cannot import anything
          { from: 'domain', allow: [] },
  
          // Infrastructure may only call Application (for adapter implementations)
          { from: 'infrastructure', allow: ['application'] },
          // block unknown → unknown
          { from: '*', allow: [], message: 'Unknown layer import blocked' }
        ]
      }],
      //Enforce PascalCase file names with common suffixes
      'filenames/match-regex': [
        'error',
        '^[A-Z][A-Za-z0-9]+(Service|Controller|UseCase|Repository|Entity|Dto|Command|Query|Module|Adapter|Port|Interceptor|Middleware|Util)$',
        true
      ],
     'filenames/match-exported': [2, 'pascal-case'],
    },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'microservices/*/src/domain/**' },
        { type: 'application', pattern: 'microservices/*/src/application/**' },
        { type: 'infrastructure', pattern: 'microservices/*/src/infrastructure/**' },
        { type: 'interfaces', pattern: 'microservices/*/src/interfaces/**' },
        { type: 'shared', pattern: 'shared/src/**' }
      ],
      'boundaries/ignore': ['**/*.spec.ts'],
      'import/resolver': {
          typescript: {
          project: './tsconfig.base.json'
    }
  }
    },
    //Ignore Tests for Filenames Rule
    overrides: [
      {
        files: ['**/main.ts','**/index.ts', '**/*.spec.ts', '**/*.e2e-spec.ts', '**/test/**'],
        rules: {
          'filenames/match-regex': 'off',
          'filenames/match-exported': 'off'
        }
      }
    ]
  };
