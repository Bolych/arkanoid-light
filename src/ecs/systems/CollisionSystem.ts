import { World } from '../World'
import type { System } from '../types'
import type { Entity } from '../entities/index.js'
import { GAME_CONFIG } from '../../constants'

export class CollisionSystem implements System {
  private world: World<Entity>
  private onBrickDestroyed?: (points: number) => void
  private onBallLost?: () => void
  private onAllBricksDestroyed?: () => void

  constructor(
    world: World<Entity>,
    callbacks?: {
      onBrickDestroyed?: (points: number) => void
      onBallLost?: () => void
      onAllBricksDestroyed?: () => void
    }
  ) {
    this.world = world
    this.onBrickDestroyed = callbacks?.onBrickDestroyed
    this.onBallLost = callbacks?.onBallLost
    this.onAllBricksDestroyed = callbacks?.onAllBricksDestroyed
  }

  public update(): void {
    this.checkBallPaddleCollision()
    this.checkBallBrickCollision()
    this.checkBallLost()
  }

  private checkBallPaddleCollision(): void {
    const ballQuery = this.world.with('ball', 'position', 'velocity', 'radius')
    const paddleQuery = this.world.with('paddle', 'position', 'size')

    for (const ball of ballQuery) {
      if (!ball.ball!.isLaunched) continue

      const ballPos = ball.position!
      const ballVel = ball.velocity!
      const radius = ball.radius!.value

      for (const paddle of paddleQuery) {
        const paddlePos = paddle.position!
        const paddleSize = paddle.size!

        if (
          ballVel.y > 0 && // Мяч движется вниз
          ballPos.x + radius > paddlePos.x &&
          ballPos.x - radius < paddlePos.x + paddleSize.width &&
          ballPos.y + radius >= paddlePos.y &&
          ballPos.y - radius < paddlePos.y + paddleSize.height
        ) {
          // Столкновение с платформой
          ballPos.y = paddlePos.y - radius
          ballVel.y = -Math.abs(ballVel.y)

          // Эффект отскока в зависимости от места удара
          const paddleCenter = paddlePos.x + paddleSize.width / 2
          const hitPosition = (ballPos.x - paddleCenter) / (paddleSize.width / 2)
          ballVel.x = hitPosition * GAME_CONFIG.BALL_SPEED
        }
      }
    }
  }

  private checkBallBrickCollision(): void {
    const ballQuery = this.world.with('ball', 'position', 'velocity', 'radius')
    const brickQuery = this.world.with('brick', 'position', 'size')

    for (const ball of ballQuery) {
      if (!ball.ball!.isLaunched) continue

      const ballPos = ball.position!
      const ballVel = ball.velocity!
      const radius = ball.radius!.value

      for (const brick of brickQuery) {
        if (brick.brick!.isDestroyed) continue

        const brickPos = brick.position!
        const brickSize = brick.size!

        // Проверка пересечения круга и прямоугольника
        const closestX = Math.max(brickPos.x, Math.min(ballPos.x, brickPos.x + brickSize.width))
        const closestY = Math.max(brickPos.y, Math.min(ballPos.y, brickPos.y + brickSize.height))

        const distanceX = ballPos.x - closestX
        const distanceY = ballPos.y - closestY
        const distanceSquared = distanceX * distanceX + distanceY * distanceY

        if (distanceSquared < radius * radius) {
          // Столкновение обнаружено
          brick.brick!.isDestroyed = true
          if (brick.visual) {
            brick.visual.graphics.visible = false
          }

          // Определяем сторону столкновения
          const centerX = brickPos.x + brickSize.width / 2
          const centerY = brickPos.y + brickSize.height / 2
          const dx = ballPos.x - centerX
          const dy = ballPos.y - centerY
          const widthRatio = Math.abs(dx) / brickSize.width
          const heightRatio = Math.abs(dy) / brickSize.height

          if (widthRatio > heightRatio) {
            // Столкновение слева или справа
            ballVel.x = -ballVel.x
            ballPos.x += ballVel.x * 2
          } else {
            // Столкновение сверху или снизу
            ballVel.y = -ballVel.y
            ballPos.y += ballVel.y * 2
          }

          // Callback при разрушении кирпича
          if (this.onBrickDestroyed) {
            this.onBrickDestroyed(brick.brick!.points)
          }

          // Проверяем, все ли кирпичи разбиты
          const activeBricks = this.world.with('brick').filter(b => !b.brick!.isDestroyed)
          if (activeBricks.length === 0 && this.onAllBricksDestroyed) {
            this.onAllBricksDestroyed()
          }

          break // Только один кирпич за раз
        }
      }
    }
  }

  private checkBallLost(): void {
    const ballQuery = this.world.with('ball', 'position', 'radius', 'sceneBounds')

    for (const ball of ballQuery) {
      if (!ball.ball!.isLaunched) continue

      const pos = ball.position!
      const radius = ball.radius!.value
      const bounds = ball.sceneBounds!

      if (pos.y - radius > bounds.height) {
        // Мяч улетел за пределы
        if (this.onBallLost) {
          this.onBallLost()
        }
      }
    }
  }
}
