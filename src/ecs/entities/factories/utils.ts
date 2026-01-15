import { GAME_CONFIG } from '../../../constants'

/**
 * Получает случайный тип кирпича из конфигурации
 */
export function getRandomBrickType(): { color: number; points: number } {
  const types = GAME_CONFIG.BRICK_TYPES
  const randomIndex = Math.floor(Math.random() * types.length)
  return types[randomIndex]
}

/**
 * Получает более темный оттенок цвета
 * @param color Исходный цвет в формате hex
 * @param factor Коэффициент затемнения (по умолчанию 0.7)
 */
export function getDarkerColor(color: number, factor = 0.7): number {
  const r = (color >> 16) & 0xff
  const g = (color >> 8) & 0xff
  const b = color & 0xff

  const darkerR = Math.floor(r * factor)
  const darkerG = Math.floor(g * factor)
  const darkerB = Math.floor(b * factor)

  return (darkerR << 16) | (darkerG << 8) | darkerB
}
