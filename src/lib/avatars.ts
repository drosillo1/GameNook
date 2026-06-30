// src/lib/avatars.ts

export interface AvatarOption {
  id:    string
  label: string
}

export const AVATARS: AvatarOption[] = [
  { id: 'knight',    label: 'Caballero' },
  { id: 'mage',      label: 'Mago' },
  { id: 'rogue',     label: 'Pícaro' },
  { id: 'archer',    label: 'Arquero' },
  { id: 'healer',    label: 'Sanador' },
  { id: 'ninja',     label: 'Ninja' },
  { id: 'viking',    label: 'Vikingo' },
  { id: 'pirate',    label: 'Pirata' },
  { id: 'astronaut', label: 'Astronauta' },
  { id: 'robot',     label: 'Robot' },
  { id: 'dragon',    label: 'Dragón' },
  { id: 'alchemist', label: 'Alquimista' },
  { id: 'samurai',   label: 'Samurái' },
  { id: 'witch',     label: 'Bruja' },
  { id: 'dwarf',     label: 'Enano' },
  { id: 'elf',       label: 'Elfo' },
  { id: 'demon',     label: 'Demonio' },
  { id: 'hacker',    label: 'Hacker' },
  { id: 'shaman',    label: 'Chamán' },
  { id: 'ghost',     label: 'Fantasma' },
]

const VALID_IDS = new Set(AVATARS.map(a => a.id))

export function isValidAvatar(id: string): boolean {
  return VALID_IDS.has(id)
}

export function getAvatarUrl(id: string): string {
  return `/avatars/${id}.svg`
}

export function getAvatarLabel(id: string): string | undefined {
  return AVATARS.find(a => a.id === id)?.label
}