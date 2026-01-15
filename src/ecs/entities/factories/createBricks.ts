import { World } from 'miniplex'
import type { Entity } from '../index.js'
import { GAME_CONFIG } from '../../../constants'
import { createBrick } from './createBrick'
import { getRandomBrickType } from './utils'

/**
 * Создает массив сущностей кирпичей (сетку кирпичей)
 */
export function createBricks(
  world: World<Entity>,
  sceneWidth: number,
  sceneHeight: number
): Entity[] {
  const rows = GAME_CONFIG.BRICK_ROWS
  const cols = GAME_CONFIG.BRICK_COLS
  const padding = GAME_CONFIG.BRICK_PADDING
  const offsetX = sceneWidth * GAME_CONFIG.BRICK_OFFSET_X
  const offsetY = GAME_CONFIG.BRICK_OFFSET_TOP

  const totalPaddingX = padding * (cols + 1) + offsetX * 2
  const brickWidth = (sceneWidth - totalPaddingX) / cols
  const brickHeight = sceneHeight * GAME_CONFIG.BRICK_HEIGHT

  const bricks: Entity[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = offsetX + padding + col * (brickWidth + padding)
      const y = offsetY + padding + row * (brickHeight + padding)

      const brickType = getRandomBrickType()
      const brick = createBrick(
        world,
        x,
        y,
        brickWidth,
        brickHeight,
        brickType.color,
        brickType.points,
        row,
        col
      )
      bricks.push(brick)
    }
  }

  return bricks
}
