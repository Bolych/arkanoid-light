import { World } from '../World'
import type { System } from '../types'
import type { Entity } from '../entities/index.js'
import { GAME_CONFIG } from '../../constants'

/**
 * Система запуска мяча
 * Обрабатывает компонент-команду launchCommand
 */
export class BallLaunchSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  /**
   * Обновляет систему: проверяет мячи с командой запуска
   */
  public update(): void {
    // Ищем мячи с командой запуска
    const ballsToLaunch = this.world.with('ball', 'velocity', 'launchCommand')

    for (const ball of ballsToLaunch) {
      // Проверяем, что мяч еще не запущен
      if (!ball.ball!.isLaunched) {
        this.launchBall(ball)
      }

      // Удаляем команду после выполнения используя правильный API
      this.world.removeComponent(ball, 'launchCommand')
    }
  }

  /**
   * Запускает мяч
   */
  private launchBall(ball: Entity): void {
    ball.ball!.isLaunched = true
    
    // Случайное направление влево или вправо
    const randomDirection = Math.random() > 0.5 ? 1 : -1
    
    ball.velocity!.x = GAME_CONFIG.BALL_SPEED * randomDirection * 0.7
    ball.velocity!.y = -GAME_CONFIG.BALL_SPEED
  }
}
