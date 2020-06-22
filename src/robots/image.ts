import { subClass } from 'gm'
import { google } from 'googleapis'
import imageDownloader  from 'image-downloader'

import state from './state'
import { Content } from './../Content'
import googleCredentials from '../credentials/google-search.json'


const customSearch = google.customsearch('v1')
const graphicsMagick = subClass({ imageMagick: true })

async function robot() {
  const content = state.load()
  await fetchImagesOfAllSentenses(content)
  await downloadAllImages(content)
  await converAllImages(content)
  await createAllSentenseImages(content)
  await createYoutubeThumbnail()
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
    return imageDownloader.image({ url, dest: `./content/${filename}`})
  }

  async function converAllImages(content: Content) {
    for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
      await convertImage(sentenceIndex)
    }
  }

  async function convertImage(sentenceIndex: number) {
    return new Promise((resolve, reject) => {
      const inputFile = `./content/${sentenceIndex}-original.png[0]`
      const outputFile = `./content/${sentenceIndex}-converted.png`
      const width = 1920
      const height = 1080

      //@ts-ignore
      graphicsMagick()
        .in(inputFile)
        .out('(')
          .out('-clone')
          .out('0')
          .out('-background', 'white')
          .out('-blur', '0x9')
          .out('-resize', `${width}x${height}^`)
        .out(')')
        .out('(')
          .out('-clone')
          .out('0')
          .out('-background', 'white')
          .out('-resize', `${width}x${height}`)
        .out(')')
        .out('-delete', '0')
        .out('-gravity', 'center')
        .out('-compose', 'over')
        .out('-composite')
        .out('-extent', `${width}x${height}`)
        .write(outputFile, error => {
          if (error) {
            return reject(error)
          }
          console.log(`> Image converted: ${inputFile}`)
          resolve()
        })
    })
  }

  async function createAllSentenseImages(content: Content) {
    for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
      await createSentenseImage(sentenceIndex, content.sentences[sentenceIndex].text)
    }
  }

  async function createSentenseImage(sentenseIndex: number, sentenseText: string) {
    return new Promise((resolve, reject) => {
      const outputFile = `./content/${sentenseIndex}-sentense.png`

      const templateSettings = {
        0: {
          size: '1920x400',
          gravity: 'center'
        },
        1: {
          size: '1920x1080',
          gravity: 'center'
        },
        2: {
          size: '800x1080',
          gravity: 'west'
        },
        3: {
          size: '1920x400',
          gravity: 'center'
        },
        4: {
          size: '1920x1080',
          gravity: 'west'
        },
        5: {
          size: '800x1080',
          gravity: 'west'
        },
        6: {
          size: '1920x400',
          gravity: 'center'
        },
      }

      //@ts-ignore
      graphicsMagick()
        .out('-size', templateSettings[sentenseIndex].size)
        .out('-gravity', templateSettings[sentenseIndex].gravity)
        .out('-background', 'transparent')
        .out('-fill', 'white')
        .out('-kerning', '-1')
        .out(`caption:${sentenseText}`)
        .write(outputFile, error => {
          if (error) {
            return reject(error)
          }
          console.log(`> Sentense created: ${outputFile}`)
          resolve()
        })
    })
  }
  async function createYoutubeThumbnail() {
    return new Promise((resolve, reject) => {
      //@ts-ignore
      graphicsMagick()
        .in('./content/0-converted.png')
        .write('./content/youtube-thumbnail.jpg', error => {
          if (error) {
            return reject(error)
          }
          console.log(`> Created Youtube thumbnail`)
          resolve()
        })
    })
  }
}

export default robot
