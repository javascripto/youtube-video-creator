//@ts-ignore
import algorithmia from 'algorithmia'
import sentenceBoundaryDetection from 'sbd'
import NaturalLanguageUnderstandingV1
from 'watson-developer-cloud/natural-language-understanding/v1'

import { Content } from "../Content"
import watsonCredentials from '../credentials/watson-nlu.json'
import { apiKey as algorithmiaApiKey } from '../credentials/algorithmia.json'


const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2018-05-04',
  url: watsonCredentials.url,
  iam_apikey: watsonCredentials.apikey,
})

async function robot(content: Content) {
  await fetchContentFromWikipedia(content)
  sanitizeContent(content)
  breakContentIntoSentences(content)
  await fetchKeyWordsOfAllSentences(content)
}

async function fetchContentFromWikipedia(content: Content) {
  const authenticated = algorithmia(algorithmiaApiKey)
  const wikipediaAlgorithm = authenticated.algo('web/WikipediaParser/0.1.2')
  const wikipediaResponse = await wikipediaAlgorithm.pipe({
    articleName: content.searchTerm,
    lang: content.lang
  })
  const wikipediaContent = wikipediaResponse.get()
  content.sourceContentOriginal = wikipediaContent.content
}

function sanitizeContent(content: Content) {
  const { sourceContentOriginal } = content
  const withoutBlankLines = removeBlankLinesAndMarkup(sourceContentOriginal!)
  const withoutDatesInParentheses = removeDatasInParentheses(withoutBlankLines)
  content.sourceContentSanitized = withoutDatesInParentheses
  function removeBlankLinesAndMarkup(text: string) {
    const allLines = text.split('\n')
    return allLines.filter(line => {
      const isBlankLine = !line.trim()
      const hasMarkup = line.trim().startsWith('=')
      return !isBlankLine && !hasMarkup
    }).join(' ')
  }
}

function removeDatasInParentheses(text: string) {
  return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
}

async function breakContentIntoSentences(content: Content) {
  const { sentences } = sentenceBoundaryDetection
  content.sentences = sentences(content.sourceContentSanitized!)
    .map(sentence => ({
      text: sentence,
      keywords: [],
      images: []
    }))
    .filter((sentense, index) => index < content.maximunSentenses)
}

async function fetchWatsonAndReturnKeyWords(text: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const params = { text, features: { keywords: {} }}
    naturalLanguageUnderstanding.analyze(params, (error, response) => {
      if (error) {
        return reject(error)
      }
      const keywords = response.keywords.map(keyword => keyword.text)
      return resolve(keywords)
    })
  })
}

async function fetchKeyWordsOfAllSentences(content: Content) {
  for (const sentence of content.sentences!) {
    try {
      sentence.keywords = await fetchWatsonAndReturnKeyWords(sentence.text)
    } catch (error) {
      console.error(error)
    }
  }
}

export default robot
