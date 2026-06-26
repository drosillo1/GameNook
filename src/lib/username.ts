// src/lib/username.ts

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/

/**
 * Convierte un texto libre (ej. el "name" del usuario) en un username
 * válido como slug: minúsculas, sin tildes, sin espacios ni símbolos.
 */
export function slugifyUsername(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes/acentos
    .replace(/[^a-z0-9_\s]/g, '')                       // quita símbolos no permitidos
    .trim()
    .replace(/\s+/g, '_')                               // espacios → guion bajo
    .slice(0, 20)
}

/**
 * Valida que un username cumple el formato requerido.
 * No comprueba unicidad contra la BD — eso se hace en el endpoint.
 */
export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username)
}

export function getUsernameValidationError(username: string): string | null {
  if (!username) return 'El nombre de usuario no puede estar vacío'
  if (username.length < 3) return 'Debe tener al menos 3 caracteres'
  if (username.length > 20) return 'No puede superar los 20 caracteres'
  if (!USERNAME_REGEX.test(username)) {
    return 'Solo se permiten minúsculas, números y guion bajo (_)'
  }
  return null
}