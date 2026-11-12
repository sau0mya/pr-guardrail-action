const { analyzePullRequestFiles } = require('./checker');

describe('PR Guardrail Rule Engine', () => {
  test('flags DROP TABLE in SQL migration files', () => {
    const mockFiles = [
      {
        filename: 'migrations/004_cleanup.sql',
        patch: '@@ -1,2 +1,3 @@\n+DROP TABLE legacy_users;',
      },
    ];

    const result = analyzePullRequestFiles(mockFiles);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/Risky Migration/);
  });

  test('flags hardcoded secrets in source code', () => {
    const mockFiles = [
      {
        filename: 'src/config.js',
        patch: '@@ -1,1 +1,2 @@\n+const api_key = "sk_live_1234567890abcdef";',
      },
    ];

    const result = analyzePullRequestFiles(mockFiles);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/Security Risk/);
  });

  test('warns when source code changes lack test updates', () => {
    const mockFiles = [
      {
        filename: 'src/auth.js',
        patch: '@@ -10,1 +10,2 @@\n+function verifyToken() { return true; }',
      },
    ];

    const result = analyzePullRequestFiles(mockFiles);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/Test Coverage/);
  });

  test('passes cleanly when source changes include unit tests', () => {
    const mockFiles = [
      {
        filename: 'src/auth.js',
        patch: '@@ -10,1 +10,2 @@\n+function verifyToken() { return true; }',
      },
      {
        filename: 'src/auth.test.js',
        patch: '@@ -1,1 +1,2 @@\n+test("verifies token", () => {});',
      },
    ];

    const result = analyzePullRequestFiles(mockFiles);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});