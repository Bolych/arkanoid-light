import type { Application } from 'pixi.js'
import type { World } from '../ecs/World'
import type { Entity } from '../ecs/entities/index.js'
import { createPaddle, createBall, createBricks, createScore, createGameState } from '../ecs/entities/factories'

type GameSpawnerDeps = {
  world: World<Entity>
  app: Application
}

export class GameSpawner {
  private world: World<Entity>
  private app: Application

  constructor({ world, app }: GameSpawnerDeps) {
    this.world = world
    this.app = app
  }

  public populate(): void {
    createGameState(this.world)

    const scoreEntity = createScore(this.world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(scoreEntity.uiElement!.container)

    const paddleEntity = createPaddle(this.world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(paddleEntity.visual!.graphics)

    const ballEntity = createBall(this.world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(ballEntity.visual!.graphics)

    const bricks = createBricks(this.world, this.app.screen.width, this.app.screen.height)
    bricks.forEach(brick => this.app.stage.addChild(brick.visual!.graphics))
  }
}
