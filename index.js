import * as core from '@actions/core';
import * as github from '@actions/github';
import { analyzePullRequestFiles } from './checker.js';

async function run() {
  try {
    const token = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit(token);
    const context = github.context;

    if (!context.payload.pull_request) {
      core.info('Not a pull request event. Skipping PR Guardrail checks.');
      return;
    }

    const { owner, repo } = context.repo;
    const pull_number = context.payload.pull_request.number;

    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number,
    });

    const { errors, warnings } = analyzePullRequestFiles(files);

    warnings.forEach((warning) => core.warning(warning));

    if (errors.length > 0) {
      errors.forEach((err) => core.error(err));
      core.setFailed(`PR Guardrail failed with ${errors.length} blocking issue(s).`);
    } else {
      core.info('All PR Guardrail checks passed!');
    }
  } catch (error) {
    core.setFailed(`Action execution failed: ${error.message}`);
  }
}

run();