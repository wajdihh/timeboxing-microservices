module.exports = {
    root: true,
    env: {
      node: true
    },
    ignorePatterns: ['**/dist/**','**/generated/**', '**/config/**'],
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
          // Application can call Domain and Infrastructure
          { from: 'application', allow: ['domain'] },
  
          // Domain is pure — cannot import anything
          { from: 'domain', allow: [] },
  
          // Infrastructure may only call Application and domain(for Port & repository implementations)
          { from: 'infrastructure', allow: ['domain','application'] },
          // block unknown → unknown
          { from: '*', allow: [], message: 'Unknown layer import blocked' }
        ]
      }],
      //Enforce PascalCase file names with common suffixes
      'filenames/match-regex': [
        'error',
        `^[A-Z][A-Za-z0-9]+(Service|Controller|UseCase|Repository|Entity|Dto|Filter|Module|Adapter|Port|Interceptor|Mapper|Middleware|Util|Value|Decorator|Exception|Error|Factory)$`,
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
        files: ['**/main.ts','**/index.ts','**/.eslintrc.js', '**/*.spec.ts', '**/*.e2e-spec.ts', '**/test/**'],
        rules: {
          'filenames/match-regex': 'off',
          'filenames/match-exported': 'off'
        }
      }
    ]
  };
