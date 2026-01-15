import { Graphics } from 'pixi.js'
import { World } from '../../World'
import type { Entity } from '../index.js'
import { GAME_CONFIG } from '../../../constants'
export function createPaddle(
  world: World<Entity>,
  sceneWidth: number,
  sceneHeight: number
): Entity {
  const width = sceneWidth * GAME_CONFIG.PADDLE_WIDTH
  const height = sceneHeight * GAME_CONFIG.PADDLE_HEIGHT
  const x = (sceneWidth - width) / 2
  const y = sceneHeight * GAME_CONFIG.PADDLE_Y_POSITION

  const graphics = new Graphics()
  graphics.roundRect(0, 0, width, height, 5)
  graphics.fill(GAME_CONFIG.PADDLE_COLOR)

  const entity = world.add({
    position: { x, y },
    size: { width, height },
    visual: { graphics },
    paddle: {
      speed: GAME_CONFIG.PADDLE_SPEED,
      touchTargetX: null,
      isMouseDown: false
    },
    keyboardInput: { keys: {} },
    sceneBounds: { width: sceneWidth, height: sceneHeight },
    collision: { tags: ['paddle'] }
  })

  return entity
}
