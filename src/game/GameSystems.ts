import type { Application } from 'pixi.js'
import type { World } from '../ecs/World'
import type { Entity } from '../ecs/components'
import {
  MovementSystem,
  GameSystem,
  CollisionSystem,
  RenderSystem,
  ResizeSystem
} from '../ecs/systems'

export function setupGameSystems(
  world: World<Entity>,
  app: Application,
  onGameEnd: () => void
): GameSystem {
  const gameSystem = new GameSystem(world)
  const resizeSystem = new ResizeSystem(world)
  const movementSystem = new MovementSystem(world, app.canvas, app.screen.width, app.screen.height)

  world.addSystem(movementSystem)
  world.addSystem(new CollisionSystem(world, {
    onBrickDestroyed: (points) => gameSystem.addPoints(points),
    onBallLost: onGameEnd,
    onAllBricksDestroyed: onGameEnd
  }))
  world.addSystem(gameSystem)
  world.addSystem(new RenderSystem(world))
  world.addSystem(resizeSystem)

  return gameSystem
}
