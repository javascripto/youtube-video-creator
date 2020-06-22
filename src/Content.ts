export interface Content {
  searchTerm?: string
  prefix?: string
  lang?: string
  sourceContentOriginal?: string
  sourceContentSanitized?: string
  sentences?: Sentense[]
  maximunSentenses: number
  downloadedImages?: string[]
}

interface Sentense {
  text: string
  keywords: string[]
  images: string[]
  googleSearchQuery?: string
}
