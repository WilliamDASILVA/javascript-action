const path = require('path');
const fs = require('fs');
const github = require('@actions/github');
const core = require('@actions/core');
const markdownTable = require('markdown-table')
const { getStatsDiff, printStatsDiff } = require('webpack-stats-diff');

const checkPathExists = p => {
  if (!fs.existsSync(p)) {
    throw new Error(`Error: ${p} does not exist!`);
  }
};

async function run() {
  try {
    const octokit = new github.GitHub(core.getInput('token'));

    // Find PR ID
    const prId = github.context.issue.number
    if (!prId) {
      throw new Error('Cannot find the PR id.')
    }

    const oldStats = core.getInput('old_stats')
    const newStats = core.getInput('new_stats')

    const oldPath = path.resolve(process.cwd(), oldStats);
    const newPath = path.resolve(process.cwd(), newStats);

    checkPathExists(oldPath);
    checkPathExists(newPath);

    const oldAssets = require(oldPath).assets;
    const newAssets = require(newPath).assets;

    const diff = getStatsDiff(oldAssets, newAssets, {})
    console.log('diff', diff)
    printStatsDiff(getStatsDiff(oldAssets, newAssets, {}));

    const totalSummary = markdownTable([
      ['Old size', diff.total.oldSize],
      ['New size', diff.total.newSize],
      ['Diff', `${diff.total.diff} (${diff.total.diffPercentage}%)`]
    ])

    await octokit.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prId,
      body: `# Bundle difference with \`${github.base_ref}\`:

        ## Total summary

        ${totalSummary}
      `
    })

    core.setOutput('pull_request', github.context.issue.number);
    core.setOutput('diff', diff);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
