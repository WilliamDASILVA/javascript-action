const core = require('@actions/core');
const stats = require('./stats.json')

const chunks = stats.chunks.map(chunk => ({
  id: chunk.id,
  size: chunk.size
}))

// most @actions toolkit packages have async methods
async function run() {
  try { 
    core.debug('Chunks')
    chunks.forEach(chunk => {
      core.debug(`Chunk: ${chunk.id} - Size: ${chunk.size}`)
    })
    core.setOutput('time', new Date().toTimeString());
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
