import { World, type System } from '../World'
import type { Entity } from '../entities/index.js'

export class ScoreSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  public addPoints(points: number): void {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      entity.score!.value += points
    }
  }

  public setPlayerName(name: string): void {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      entity.score!.playerName = name
    }
  }

  public getScore(): number {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      return entity.score!.value
    }

    return 0
  }

  public reset(): void {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      entity.score!.value = 0
    }
  }

  public update(): void {
  }
}
