import { World, type System } from '../World'
import type { Entity } from '../entities/index.js'

export class PaddleMovementSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  public update(deltaTime?: number): void {
    const timeScale = deltaTime ? deltaTime / 16.6667 : 1
    const paddleQuery = this.world.with('paddle', 'position', 'size', 'keyboardInput', 'sceneBounds')

    for (const entity of paddleQuery) {
      const paddle = entity.paddle!
      const position = entity.position!
      const size = entity.size!
      const keys = entity.keyboardInput!.keys
      const bounds = entity.sceneBounds!

      if (paddle.touchTargetX !== null) {
        const diff = paddle.touchTargetX - position.x
        const moveSpeed = paddle.speed * 1.5 * timeScale

        if (Math.abs(diff) > 2) {
          if (diff > 0) {
            position.x += Math.min(moveSpeed, diff)
          } else {
            position.x += Math.max(-moveSpeed, diff)
          }
        } else {
          position.x = paddle.touchTargetX
        }
      } else {
        if (keys['ArrowLeft'] || keys['KeyA']) {
          position.x -= paddle.speed * timeScale
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
          position.x += paddle.speed * timeScale
        }
      }

      if (position.x < 0) {
        position.x = 0
      }
      if (position.x + size.width > bounds.width) {
        position.x = bounds.width - size.width
      }
    }
  }
}
