import { Application } from 'pixi.js'
import { LeaderboardManager } from '../LeaderboardManager'
import { UIManager } from '../ui/UIManager.js'
import { GameInputHandler } from './GameInputHandler.js'
import { GameFlowController } from './GameFlowController.js'
import { getGameSize, setupResize } from '../platform/ResizeManager.ts'
import { createPaddle, createBall, createBricks, createScore, createGameState } from '../ecs/entities'
import type { Entity } from '../ecs/components'
import { World } from '../ecs/World'
import { GAME_CONFIG } from '../constants'
import {
  MovementSystem,
  GameSystem,
  CollisionSystem,
  RenderSystem,
  ResizeSystem
} from '../ecs/systems'

export class Game {

  public app: Application
  public world: World<Entity>

  private leaderboardManager!: LeaderboardManager
  private uiManager!: UIManager
  private gameInputHandler!: GameInputHandler
  private flowController!: GameFlowController

  private gameSystem!: GameSystem

  constructor() {
    this.app = new Application()
    this.world = new World<Entity>()
  }

  async setup(): Promise<void> {
    const { width, height } = getGameSize()

    await this.app.init({
      width,
      height,
      background: GAME_CONFIG.GAME_BACKGROUND_COLOR,
    })

    const appDiv = document.querySelector<HTMLDivElement>('#app')!
    appDiv.appendChild(this.app.canvas)

    this.leaderboardManager = new LeaderboardManager()
    this.uiManager = new UIManager(this.app.screen.width, this.app.screen.height, this.leaderboardManager)
    
    setupResize(this.app, this.world, this.uiManager)
  }

  run(): void {
    this.populateWorld()
    this.setupSystems()

    this.flowController = new GameFlowController(
      this.world,
      this.app,
      this.uiManager,
      this.leaderboardManager,
      this.gameSystem
    )

    this.world.update(0)

    this.gameInputHandler = new GameInputHandler(
      this.world,
      this.app,
      () => this.flowController.restartGame(),
      () => this.gameSystem.getState()
    )
    this.gameInputHandler.setupEventListeners()

    this.flowController.showPlayerInputModal()

    this.app.ticker.add((ticker) => this.gameLoop(ticker.deltaMS))
  }

  private populateWorld(): void {
    createGameState(this.world)

    const score = createScore(this.world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(score.uiElement!.container)

    const paddle = createPaddle(this.world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(paddle.visual!.graphics)

    const ball = createBall(this.world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(ball.visual!.graphics)

    const bricks = createBricks(this.world, this.app.screen.width, this.app.screen.height)
    bricks.forEach(brick => this.app.stage.addChild(brick.visual!.graphics))
  }

  private setupSystems(): void {
    this.gameSystem = new GameSystem(this.world)

    this.world.addSystem(new MovementSystem(this.world, this.app.canvas, this.app.screen.width, this.app.screen.height))
    this.world.addSystem(new CollisionSystem(this.world, {
      onBrickDestroyed: (points) => this.gameSystem.addPoints(points),
      onBallLost: () => this.flowController.endGame(),
      onAllBricksDestroyed: () => this.flowController.endGame()
    }))
    this.world.addSystem(this.gameSystem)
    this.world.addSystem(new RenderSystem(this.world))
    this.world.addSystem(new ResizeSystem(this.world))
  }

  private gameLoop(deltaTime: number): void {
    if (this.gameSystem.getState() !== 'PLAYING') {
      return
    }
    this.world.update(deltaTime)
  }

}
