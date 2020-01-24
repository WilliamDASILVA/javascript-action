const github = require('@actions/github');
const core = require('@actions/core');
const stats = require('./stats.json')

const chunks = stats.chunks.map(chunk => ({
  id: chunk.id,
  size: chunk.size
}))

console.log('testing?', chunks)

// most @actions toolkit packages have async methods
async function run() {
  try { 
    console.log('PR ID?', core.getInput('pull_request'))
    // const myToken = core.getInput('GITHUB_TOKEN');
    // console.log('token', myToken)
    // const octokit = new github.GitHub(myToken);
    
    // octokit.pulls.createComment({
    //   owner,
    //   repo,
    //   pull_number,
    //   body,
    //   commit_id,
    //   path
    // })
    console.log('run??')
    chunks.forEach(chunk => {
      console.log(`Chunk: ${chunk.id} - Size: ${chunk.size}`)
    })
    core.setOutput('time', new Date().toTimeString());
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
