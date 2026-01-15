import { World } from '../World'
import type { Entity } from '../entities/index.js'

/**
 * Система управления счетом
 * Обрабатывает логику начисления очков
 */
export class ScoreSystem {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  /**
   * Добавляет очки к счету
   */
  public addPoints(points: number): void {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      entity.score!.value += points
    }
  }

  /**
   * Устанавливает имя игрока
   */
  public setPlayerName(name: string): void {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      entity.score!.playerName = name
    }
  }

  /**
   * Получает текущий счет
   */
  public getScore(): number {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      return entity.score!.value
    }

    return 0
  }

  /**
   * Сбрасывает счет
   */
  public reset(): void {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      entity.score!.value = 0
    }
  }
}
