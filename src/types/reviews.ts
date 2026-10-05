// src/types/reviews.ts

/**
 * Forma del autor de una reseña tal como la consumen los componentes.
 *
 * Existe por dos motivos:
 *  1. ReviewCard, ReviewList y ProfileReviewsList declaraban cada uno su propia
 *     interfaz local, y esa duplicación ya causó fallos de build.
 *  2. Desde el cambio de RGPD de octubre 2026, `Review.userId` es nullable
 *     (`onDelete: SetNull`), así que Prisma puede devolver `user: null` en una
 *     reseña cuyo autor borró su cuenta.
 *
 * El contrato es: los componentes SIEMPRE reciben un objeto, nunca null. La
 * normalización ocurre en el servidor, en un único sitio.
 */
export interface ReviewUser {
  /** null cuando la cuenta fue eliminada. */
  id:          string | null
  name:        string | null
  /** null cuando la cuenta fue eliminada. No construir una URL de perfil sin comprobarlo. */
  username:    string | null
  /** Siempre presente: es lo que se pinta. "Cuenta eliminada" para autores borrados. */
  displayName: string
  image:       string | null
  avatar:      string | null
  /**
   * true cuando el autor borró su cuenta.
   *
   * Opcional a propósito: así un consumidor intermedio que aún no lo propague
   * sigue compilando. Quien lo lea debe usar el fallback `?? user.id === null`.
   */
  isDeleted?:  boolean
}

/** Forma mínima que devuelve Prisma al seleccionar el autor de una reseña. */
type PrismaReviewUser = {
  id:        string
  name:      string | null
  username:  string | null
  image:     string | null
  avatar:    string | null
  email?:    string | null
} | null

/**
 * Convierte el autor que devuelve Prisma en el que esperan los componentes.
 */
export function normalizeReviewUser(user: PrismaReviewUser): ReviewUser {
  if (!user) {
    return {
      id:          null,
      name:        null,
      username:    null,
      displayName: 'Cuenta eliminada',
      image:       null,
      avatar:      null,
      isDeleted:   true,
    }
  }

  return {
    id:          user.id,
    name:        user.name,
    username:    user.username,
    displayName: user.name ?? user.email?.split('@')[0] ?? 'Usuario',
    image:       user.image,
    avatar:      user.avatar,
    isDeleted:   false,
  }
}