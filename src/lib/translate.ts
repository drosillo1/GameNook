// src/lib/translate.ts
import 'server-only'

// SOLO SERVIDOR

const MYMEMORY_MAX_LENGTH = 500  // límite del endpoint gratuito

export async function translateToSpanish(text: string): Promise<string> {
  if (!text?.trim()) return text

  try {
    const url = new URL('https://api.mymemory.translated.net/get')
    url.searchParams.set('q',        text.slice(0, MYMEMORY_MAX_LENGTH))
    url.searchParams.set('langpair', 'en|es')

    const contactEmail = process.env.MYMEMORY_EMAIL
    if (contactEmail) url.searchParams.set('de', contactEmail)

    const res = await fetch(url.toString())

    if (!res.ok) {
      console.error('MyMemory error:', res.status)
      return text
    }

    const data = await res.json()

    // MyMemory devuelve status 200 incluso con errores — hay que comprobar el responseStatus
    if (data.responseStatus !== 200) {
      console.error('MyMemory translation failed:', data.responseMessage)
      return text
    }

    const translated = data.responseData?.translatedText
    return translated ?? text

  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}