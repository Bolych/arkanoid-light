import { World, type System } from '../World'
import type { Entity, GameStateType } from '../entities/index.js'

export class GameStateSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  public getState(): GameStateType {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      return entity.gameState!.state
    }

    return 'PLAYER_INPUT'
  }

  public setState(newState: GameStateType): void {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      entity.gameState!.state = newState
    }
  }

  public setPlayerName(name: string): void {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      entity.gameState!.playerName = name
    }
  }

  public getPlayerName(): string {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      return entity.gameState!.playerName
    }

    return ''
  }

  public startNewGame(): void {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      entity.gameState!.state = 'PLAYER_INPUT'
      entity.gameState!.playerName = ''
    }
  }

  public startPlaying(): void {
    this.setState('PLAYING')
  }

  public endGame(): void {
    this.setState('GAME_OVER')
  }

  public isPlaying(): boolean {
    return this.getState() === 'PLAYING'
  }

  public update(): void {
  }
}
