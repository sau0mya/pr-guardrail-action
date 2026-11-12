# PR Guardrail – Automated CI Check & Migration Linter

A custom GitHub Action built with Node.js that inspects Pull Request diffs prior to code review to catch destructive database migrations, hardcoded credentials, and missing unit tests.

## Features
* **Risky SQL Migration Detection:** Flags destructive statements (`DROP TABLE`, `TRUNCATE`, `ALTER TABLE ... DROP`) in `.sql` files before review.
* **Secret Scanning:** Blocks PRs containing exposed API keys, private keys, or hardcoded JWT secrets.
* **Test Coverage Guardrail:** Warns developers when source files (`*.js`) are modified without accompanying unit test (`*.test.js`) updates.

## Usage in a Workflow

Add this step to any `.github/workflows/ci.yml` file:

```yaml
- name: Run PR Guardrail
  uses: sau0mya/pr-guardrail-action@main
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}