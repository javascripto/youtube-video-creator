import input from './robots/input'
import text from './robots/text'
import state from './robots/state'
import image from './robots/image'


const robots = {
  input,
  text,
  state,
  image,
}

async function start() {
  robots.input()
  await robots.text()
  await robots.image()

  // const content = robots.state.load()
  // console.dir(content, { depth: null })
}

start()
