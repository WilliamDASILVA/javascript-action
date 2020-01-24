const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  try { 
    core.setOutput('pull_request', github.context.issue.number);
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
