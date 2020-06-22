import { writeFileSync, readFileSync } from 'fs'

import { Content } from '../Content'


const contentFilePath = './content.json'

function save(content: Content) {
  const contentString = JSON.stringify(content, null, 2)
  return writeFileSync(contentFilePath, contentString)
}

function load(): Content {
  const fileBuffer = readFileSync(contentFilePath, 'utf-8')
  return JSON.parse(fileBuffer)
}

export default {
  save,
  load,
}
