import { Graphics } from 'pixi.js'
import { World } from 'miniplex'
import type { Entity } from '../index.js'
import { getDarkerColor } from './utils'

/**
 * Создает одну сущность кирпича
 */
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
  // Создаем графику
  const graphics = new Graphics()
  graphics.roundRect(0, 0, width, height, 3)
  graphics.fill(color)

  // Добавляем обводку
  const darkerColor = getDarkerColor(color)
  graphics.roundRect(0, 0, width, height, 3)
  graphics.stroke({ width: 2, color: darkerColor })

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
