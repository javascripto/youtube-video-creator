import { google } from 'googleapis'

import state from './state'
import { Content } from './../Content';
import googleCredentials from '../credentials/google-search.json'


const customSearch = google.customsearch('v1')

async function robot() {
  const content = state.load()
  await fetchImagesOfAllSentenses(content)
  state.save(content)

  async function fetchImagesOfAllSentenses(content: Content) {
    for (const sentence of content.sentences) {
      const query = `${content.searchTerm} ${sentence.keywords[0]}`
      sentence.images = await fetchGoogleAndReturnImagesLinks(query)
      sentence.googleSearchQuery = query
    }
  }
  async function fetchGoogleAndReturnImagesLinks(query: string) {
    const response = await customSearch.cse.list({
      auth: googleCredentials.apiKey,
      cx: googleCredentials.searchEngineId,
      q: query,
      searchType: 'image',
      imgSize: 'huge',
      num: 2,
    })
    const imagesUrls = response.data.items.map(item => item.link)
    return imagesUrls as string[]
  }
}

export default robot
