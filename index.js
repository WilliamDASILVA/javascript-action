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
    const prId = core.getInput('pull_request') || github.context.issue.number
    console.log('PR ID?', prId)
    const myToken = core.getInput('GITHUB_TOKEN');
    // console.log('token', myToken)
    if (prId) {
      const octokit = new github.GitHub(myToken);
      const content = await octokit.markdown.renderRaw({
        data: `
          # This is the title

          Hello world, this is the content of the comment.

          > Hello ??
        `
      })
      console.log('content?', content)
      // octokit.issues.createComment({
      //   owner: github.context.repo.owner,
      //   repo: github.context.repo.repo,
      //   issue_number: prId,
      //   body: `
      //     # This is the title

      //     Hello world, this is the content of the comment.

      //     > Hello ??
      //   `
      // })
    }

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
