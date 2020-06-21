import { question, keyInSelect }  from 'readline-sync'

import text from './robots/text'
import { Content } from './Content'


const robots = {
  text
}

async function start() {
  const content: Content = {
    maximunSentenses: 7,
  }

  content.searchTerm = askAndReturnSearchTerm()
  content.lang = askAndReturnLanguage()
  content.prefix = askdAndReturnPrefix()

  await robots.text(content)

  function askAndReturnSearchTerm() {
    return question('Type a Wikipedia search term: ')
  }

  function askAndReturnLanguage() {
    const languages = ['pt', 'en']
    const selectedPrefixIdex = keyInSelect(languages, 'Choose a language:')
    return languages[selectedPrefixIdex]
  }

  function askdAndReturnPrefix() {
    const prefixes = ['Who is', 'What is', 'The history of']
    const selectedPrefixIdex = keyInSelect(prefixes, 'Choose one option:')
    return prefixes[selectedPrefixIdex]
  }
}

start()
