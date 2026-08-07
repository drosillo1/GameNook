// src/lib/translateClient.ts
'use client'



export async function translateToSpanishClient(text: string): Promise<string> {
  if (!text?.trim()) return text

  try {
    const res = await fetch('/api/translate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text }),
    })

    if (!res.ok) {
      console.error('Translate proxy error:', res.status)
      return text
    }

    const data = await res.json()
    return data.translated || text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}