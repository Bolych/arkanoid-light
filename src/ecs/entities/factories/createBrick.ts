import { Graphics } from 'pixi.js'
import { World } from '../../World'
import type { Entity } from '../index.js'
import { GAME_CONFIG } from '../../../constants'
export function createBrick(
  world: World<Entity>,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  points: number,
  row: number,
  col: number
): Entity {
  const graphics = new Graphics()
  graphics.roundRect(0, 0, width, height, 3)
  graphics.fill(color)

  graphics.roundRect(0, 0, width, height, 3)
  graphics.stroke({
    width: 2,
    color: GAME_CONFIG.BRICK_STROKE_COLOR,
    alpha: GAME_CONFIG.BRICK_STROKE_ALPHA
  })

  const entity = world.add({
    position: { x, y },
    size: { width, height },
    visual: { graphics },
    brick: {
      points,
      color,
      isDestroyed: false,
      row,
      col
    },
    collision: { tags: ['brick'] }
  })

  return entity
}
