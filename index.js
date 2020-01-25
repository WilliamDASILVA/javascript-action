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

const getSizeText = size => {
  if (size === 0) {
    return '0';
  }

  const abbreviations = ['bytes', 'KiB', 'MiB', 'GiB'];
  const index = Math.floor(Math.log(Math.abs(size)) / Math.log(1024));

  return `${+(size / Math.pow(1024, index)).toPrecision(3)} ${
    abbreviations[index]
  }`;
};


async function run() {
  try {
    const octokit = new github.GitHub(core.getInput('token'));

    // Find PR ID
    console.log('context', github.context)
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
      ['Old size', 'New size', 'Diff'],
      [getSizeText(diff.total.oldSize), getSizeText(diff.total.newSize), `${getSizeText(diff.total.diff)} (${diff.total.diffPercentage.toFixed(2)}%)`]
    ])

    const formattedAssets = []
    ['added', 'removed', 'bigger', 'smaller']
      .forEach(field => {
        const assets = diff[field];
        if (assets.length > 0) {
          const tableData = [
            ...assets.map(asset => [
              asset.name,
              getSizeText(asset.oldSize),
              getSizeText(asset.newSize),
              getSizeText(asset.diff),
              `${asset.diffPercentage.toFixed(2)} %`
            ])
          ];

          formattedAssets.push(tableData)
        }
      });

    const assets = markdownTable([
      ['Asset', 'Old size', 'New size', 'Diff'],
      ...formattedAssets
    ])

    await octokit.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prId,
      body: `# Bundle difference:
## Total summary

${totalSummary}

## Assets
${assets}
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
