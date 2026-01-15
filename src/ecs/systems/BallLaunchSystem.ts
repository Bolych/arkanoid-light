import { World, type System } from '../World'
import type { Entity } from '../entities/index.js'
import { GAME_CONFIG } from '../../constants'

export class BallLaunchSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  public update(): void {
    const ballsToLaunch = this.world.with('ball', 'velocity', 'launchCommand')

    for (const ball of ballsToLaunch) {
      if (!ball.ball!.isLaunched) {
        this.launchBall(ball)
      }

      this.world.removeComponent(ball, 'launchCommand')
    }
  }

  private launchBall(ball: Entity): void {
    ball.ball!.isLaunched = true
    
    const randomDirection = Math.random() > 0.5 ? 1 : -1
    
    ball.velocity!.x = GAME_CONFIG.BALL_SPEED * randomDirection * 0.7
    ball.velocity!.y = -GAME_CONFIG.BALL_SPEED
  }
}
