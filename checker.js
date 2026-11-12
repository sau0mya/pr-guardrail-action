/**
 * Analyzes an array of changed PR file objects:
 * [{ filename: string, patch: string }]
 */
function analyzePullRequestFiles(files) {
  const errors = [];
  const warnings = [];

  // Patterns to catch risky operations & secrets
  const destructiveSqlRegex = /\b(DROP\s+TABLE|TRUNCATE\s+TABLE|ALTER\s+TABLE\s+\w+\s+DROP)\b/i;
  const secretRegex = /(AKIA[0-9A-Z]{16}|-----BEGIN\s+PRIVATE\s+KEY-----|jwt_secret\s*=\s*['"][^'"]+['"]|api_key\s*=\s*['"][^'"]+['"])/i;

  let hasSourceCodeChanges = false;
  let hasTestChanges = false;

  for (const file of files) {
    const { filename, patch = '' } = file;

    // Extract only newly added lines in the git diff (lines starting with '+' but not '+++')
    const addedLines = patch
      .split('\n')
      .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
      .join('\n');

    // Rule 1: Flag destructive SQL migrations
    if (filename.endsWith('.sql') && destructiveSqlRegex.test(addedLines)) {
      errors.push(
        `[Risky Migration] Destructive SQL statement detected in "${filename}". Manual DBA sign-off required.`
      );
    }

    // Rule 2: Block hardcoded secrets/keys
    if (secretRegex.test(addedLines)) {
      errors.push(
        `[Security Risk] Potential hardcoded secret or private key detected in "${filename}".`
      );
    }

    // Track source vs test modifications
    if (filename.endsWith('.js') && !filename.endsWith('.test.js') && filename !== 'index.js') {
      hasSourceCodeChanges = true;
    }
    if (filename.endsWith('.test.js')) {
      hasTestChanges = true;
    }
  }

  // Rule 3: Warn if source files changed without accompanying unit tests
  if (hasSourceCodeChanges && !hasTestChanges) {
    warnings.push(
      '[Test Coverage] Source code was modified without corresponding *.test.js updates.'
    );
  }

  return { errors, warnings };
}

module.exports = { analyzePullRequestFiles };