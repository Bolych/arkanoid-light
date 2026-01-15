import { World } from '../World'
import type { System } from '../types'
import type { Entity } from '../entities/index.js'

/**
 * Система управления счетом
 * Обрабатывает логику начисления очков
 */
export class ScoreSystem implements System {
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

  /**
   * Заглушка для интерфейса System
   * ScoreSystem управляется через методы addPoints, setPlayerName и т.д.
   */
  public update(): void {
    // ScoreSystem не требует обновления каждый кадр
  }
}
