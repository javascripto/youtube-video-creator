import { google } from 'googleapis'
import imageDownloader  from 'image-downloader'

import state from './state'
import { Content } from './../Content'
import googleCredentials from '../credentials/google-search.json'


const customSearch = google.customsearch('v1')

async function robot() {
  const content = state.load()
  await fetchImagesOfAllSentenses(content)
  await downloadAllImages(content)
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

  async function downloadAllImages(content: Content) {
    content.downloadedImages = []

    for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
      const image = content.sentences[sentenceIndex].images

      for (let imageIndex = 0; imageIndex < image.length; imageIndex++) {
        const imageUrl = image[imageIndex]

        try {
          if (content.downloadedImages.includes(imageUrl)) {
            throw new Error('Imagem já foi baixada')
          }
          await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
          content.downloadedImages.push(imageUrl)
          console.log(`> [${sentenceIndex}][${imageIndex}]Baixou imagem com sucesso: ${imageUrl}`)
          break
        } catch (error) {
          console.log(`> Erro ao baixar(${imageUrl}): ${error}`)
        }
      }
    }
  }

  async function downloadAndSave(url: string, filename: string) {
    return imageDownloader.image({ url, dest: `src/content/${filename}`})
  }
}

export default robot
