import type { Application } from 'pixi.js'
import type { World } from '../ecs/World'
import type { Entity } from '../ecs/components'
import { createPaddle, createBall, createBricks, createScore, createGameState } from '../ecs/entities'

export function populateWorld(world: World<Entity>, app: Application): void {
  createGameState(world)

  const score = createScore(world, app.screen.width, app.screen.height)
  app.stage.addChild(score.uiElement!.container)

  const paddle = createPaddle(world, app.screen.width, app.screen.height)
  app.stage.addChild(paddle.visual!.graphics)

  const ball = createBall(world, app.screen.width, app.screen.height)
  app.stage.addChild(ball.visual!.graphics)

  const bricks = createBricks(world, app.screen.width, app.screen.height)
  bricks.forEach(brick => app.stage.addChild(brick.visual!.graphics))
}
