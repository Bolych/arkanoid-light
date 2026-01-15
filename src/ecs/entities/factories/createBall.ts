import { Graphics } from 'pixi.js'
import { World } from '../../World'
import type { Entity } from '../index.js'
import { GAME_CONFIG } from '../../../constants'

export function createBall(
  world: World<Entity>,
  sceneWidth: number,
  sceneHeight: number
): Entity {
  const radius = GAME_CONFIG.BALL_RADIUS
  const x = sceneWidth / 2
  const y = sceneHeight * GAME_CONFIG.BALL_START_Y

  const graphics = new Graphics()
  graphics.circle(0, 0, radius)
  graphics.fill(GAME_CONFIG.BALL_COLOR)

  const entity = world.add({
    position: { x, y },
    velocity: { x: 0, y: 0 },
    radius: { value: radius },
    visual: { graphics },
    ball: { isLaunched: false },
    sceneBounds: { width: sceneWidth, height: sceneHeight },
    collision: { tags: ['ball'] }
  })

  return entity
}
