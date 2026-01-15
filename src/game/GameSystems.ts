import type { World } from '../ecs/World'
import type { Entity } from '../ecs/entities/index.js'
import type { Application } from 'pixi.js'
import {
  InputSystem,
  PaddleMovementSystem,
  BallMovementSystem,
  BallLaunchSystem,
  CollisionSystem,
  RenderSystem,
  ResizeSystem,
  ScoreSystem,
  ScoreUISystem,
  GameStateSystem
} from '../ecs/systems'

type GameSystemsDeps = {
  world: World<Entity>
  app: Application
  onBrickDestroyed: (points: number) => void
  onBallLost: () => void
  onAllBricksDestroyed: () => void
}

type GameSystemsResult = {
  scoreSystem: ScoreSystem
  gameStateSystem: GameStateSystem
  resizeSystem: ResizeSystem
}

/**
 * Регистрирует системы и возвращает доступные извне системы.
 */
export const setupGameSystems = ({
  world,
  app,
  onBrickDestroyed,
  onBallLost,
  onAllBricksDestroyed
}: GameSystemsDeps): GameSystemsResult => {
  const scoreSystem = new ScoreSystem(world)
  const gameStateSystem = new GameStateSystem(world)
  const resizeSystem = new ResizeSystem(world)

  world.addSystem(new InputSystem(world, app.canvas, app.screen.width))
  world.addSystem(new PaddleMovementSystem(world))
  world.addSystem(new BallLaunchSystem(world))
  world.addSystem(new BallMovementSystem(world))
  world.addSystem(new CollisionSystem(world, {
    onBrickDestroyed,
    onBallLost,
    onAllBricksDestroyed
  }))
  world.addSystem(new ScoreUISystem(world))
  world.addSystem(new RenderSystem(world))

  world.addSystem(scoreSystem)
  world.addSystem(gameStateSystem)
  world.addSystem(resizeSystem)

  return { scoreSystem, gameStateSystem, resizeSystem }
}
