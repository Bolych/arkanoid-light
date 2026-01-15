import { World } from '../../World'
import type { Entity } from '../index.js'

/**
 * Создает singleton-сущность состояния игры
 */
export function createGameState(world: World<Entity>): Entity {
  const entity = world.add({
    gameState: {
      state: 'PLAYER_INPUT',
      playerName: ''
    }
  })

  return entity
}
