import { World } from '../World'
import type { System } from '../types'
import type { Entity } from '../entities/index.js'

export class BallMovementSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  public update(deltaTime?: number): void {
    const timeScale = deltaTime ? deltaTime / 16.6667 : 1
    const ballQuery = this.world.with('ball', 'position', 'velocity', 'radius', 'sceneBounds')
    const paddleQuery = this.world.with('paddle', 'position', 'size')

    for (const ball of ballQuery) {
      const ballComp = ball.ball!
      const pos = ball.position!
      const vel = ball.velocity!
      const radius = ball.radius!.value
      const bounds = ball.sceneBounds!

      // Если мяч не запущен, он следует за платформой
      if (!ballComp.isLaunched) {
        for (const paddle of paddleQuery) {
          const paddlePos = paddle.position!
          const paddleSize = paddle.size!
          pos.x = paddlePos.x + paddleSize.width / 2
          pos.y = paddlePos.y - radius - 2
        }
        continue
      }

      // Обновляем позицию
      pos.x += vel.x * timeScale
      pos.y += vel.y * timeScale

      // Отскок от стен
      if (pos.x - radius <= 0) {
        pos.x = radius
        vel.x = Math.abs(vel.x)
      } else if (pos.x + radius >= bounds.width) {
        pos.x = bounds.width - radius
        vel.x = -Math.abs(vel.x)
      }

      // Отскок от верхней стены
      if (pos.y - radius <= 0) {
        pos.y = radius
        vel.y = Math.abs(vel.y)
      }
    }
  }
}
