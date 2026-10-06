// src/lib/translate.ts
import 'server-only'

const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get'

//Aviso posible limite
const MYMEMORY_WARNING_PREFIX = 'MYMEMORY WARNING'

export async function translateToSpanish(text: string): Promise<string> {
  if (!text?.trim()) return text

  try {
    const url = new URL(MYMEMORY_ENDPOINT)
    url.searchParams.set('q',        text)
    url.searchParams.set('langpair', 'en|es')

    const email = process.env.MYMEMORY_EMAIL
    if (email) {
      url.searchParams.set('de', email)
    } else {
      console.warn('[translate] MYMEMORY_EMAIL no definida — cuota anónima reducida')
    }

    const res = await fetch(url.toString())

    if (!res.ok) {
      console.error('[translate] MyMemory HTTP error:', res.status)
      return text
    }

    const data = await res.json()

    if (data.responseStatus !== 200) {
      console.error('[translate] MyMemory translation failed:', data.responseMessage)
      return text
    }

    const translated: unknown = data.responseData?.translatedText
    if (typeof translated !== 'string' || !translated.trim()) {
      return text
    }

    if (translated.trim().toUpperCase().startsWith(MYMEMORY_WARNING_PREFIX)) {
      console.error('[translate] MyMemory devolvió un aviso en lugar de traducción:', translated)
      return text
    }

    return translated

  } catch (error) {
    console.error('[translate] Error inesperado:', error)
    return text
  }
}