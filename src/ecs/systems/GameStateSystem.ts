import { World } from '../World'
import type { System } from '../types'
import type { Entity, GameStateType } from '../entities/index.js'

/**
 * Система управления состоянием игры
 */
export class GameStateSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  /**
   * Получает текущее состояние игры
   */
  public getState(): GameStateType {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      return entity.gameState!.state
    }

    return 'PLAYER_INPUT'
  }

  /**
   * Устанавливает состояние игры
   */
  public setState(newState: GameStateType): void {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      entity.gameState!.state = newState
    }
  }

  /**
   * Устанавливает имя игрока
   */
  public setPlayerName(name: string): void {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      entity.gameState!.playerName = name
    }
  }

  /**
   * Получает имя игрока
   */
  public getPlayerName(): string {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      return entity.gameState!.playerName
    }

    return ''
  }

  /**
   * Начинает новую игру
   */
  public startNewGame(): void {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      entity.gameState!.state = 'PLAYER_INPUT'
      entity.gameState!.playerName = ''
    }
  }

  /**
   * Переводит в состояние игры
   */
  public startPlaying(): void {
    this.setState('PLAYING')
  }

  /**
   * Завершает игру
   */
  public endGame(): void {
    this.setState('GAME_OVER')
  }

  /**
   * Проверяет, идет ли игра
   */
  public isPlaying(): boolean {
    return this.getState() === 'PLAYING'
  }

  /**
   * Заглушка для интерфейса System
   * GameStateSystem управляется через методы setState, startPlaying и т.д.
   */
  public update(): void {
    // GameStateSystem не требует обновления каждый кадр
  }
}
