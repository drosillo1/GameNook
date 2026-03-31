// src/lib/translate.ts

export async function translateToSpanish(text: string): Promise<string> {
  if (!text?.trim()) return text

  try {
    const url = new URL('https://api.mymemory.translated.net/get')
    url.searchParams.set('q',        text)
    url.searchParams.set('langpair', 'en|es')
    url.searchParams.set('de', 'danirosillo1@gmail.com')

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