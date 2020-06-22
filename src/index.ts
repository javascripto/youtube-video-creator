import input from './robots/input'
import text from './robots/text'
import state from './robots/state'

const robots = {
  input,
  text,
  state,
}

async function start() {
  robots.input()
  await robots.text()
  const content = robots.state.load()
  console.dir(content, { depth: null })
}

start()
