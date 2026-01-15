import { GAME_CONFIG } from '../../../constants'
export function getRandomBrickType(): { color: number; points: number } {
  const types = GAME_CONFIG.BRICK_TYPES
  const randomIndex = Math.floor(Math.random() * types.length)
  return types[randomIndex]
}

