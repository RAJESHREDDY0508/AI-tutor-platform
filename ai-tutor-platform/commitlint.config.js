/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting only
        'refactor', // Code restructuring
        'perf',     // Performance improvement
        'test',     // Tests
        'build',    // Build system / deps
        'ci',       // CI/CD config
        'chore',    // Maintenance
        'revert',   // Revert commit
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'root',
        'frontend',
        'auth-service',
        'session-service',
        'curriculum-service',
        'homework-service',
        'analytics-service',
        'payment-service',
        'llm-wrapper',
        'vector-db',
        'prompt-engine',
        'safety-guardrails',
        'common',
        'docker',
        'ci',
        'docs',
      ],
    ],
    'subject-max-length': [2, 'always', 100],
  },
};
