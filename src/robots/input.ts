import { question, keyInSelect } from 'readline-sync'

import state from './state'
import { Content } from 'src/Content'


function robot() {
  const content: Content = {
    maximunSentenses: 7
  }
  content.searchTerm = askAndReturnSearchTerm()
  content.lang = askAndReturnLanguage()
  content.prefix = askdAndReturnPrefix()
  state.save(content)
  
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

export default robot
