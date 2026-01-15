import { Application } from 'pixi.js'
import { LeaderboardManager } from '../LeaderboardManager'
import { UIManager } from '../ui/UIManager.js'
import { GameInputHandler } from './GameInputHandler.js'
import { ResizeHandler } from '../platform/ResizeHandler.ts'
import { GameFlowController } from './GameFlowController.js'
import { ResizeApplier } from '../platform/ResizeApplier.ts'
import { GameSpawner } from './GameSpawner.js'
import { setupGameSystems } from './GameSystems.js'
import { world } from '../ecs/entities/index.js'
import type { Entity } from '../ecs/entities/index.js'
import { World } from '../ecs/World'
import type { ScoreSystem, GameStateSystem } from '../ecs/systems'

export class Game {

  public app: Application
  
  public world: World<Entity>

  private leaderboardManager!: LeaderboardManager
  private uiManager!: UIManager
  private gameInputHandler!: GameInputHandler
  private resizeHandler!: ResizeHandler
  private flowController!: GameFlowController
  private resizeApplier!: ResizeApplier
  private spawner!: GameSpawner

  private gameStateSystem!: GameStateSystem
  private scoreSystem!: ScoreSystem

  constructor() {
    this.app = new Application()
    this.world = world
  }

  async init(): Promise<void> {
    this.resizeHandler = new ResizeHandler()
    this.resizeHandler.addListener((width, height) => this.resizeApplier.apply(width, height))
    const { width, height } = this.resizeHandler.getGameSize()

    await this.app.init({
      width,
      height,
      background: 0x808080,
    })

    const appDiv = document.querySelector<HTMLDivElement>('#app')!
    appDiv.appendChild(this.app.canvas)

    this.leaderboardManager = new LeaderboardManager()
    this.uiManager = new UIManager(this.app.screen.width, this.app.screen.height, this.leaderboardManager)
    this.resizeApplier = new ResizeApplier({ app: this.app, world: this.world, uiManager: this.uiManager })

    this.resizeHandler.setupEventListener()
  }

  run(): void {
    this.spawner = new GameSpawner({ world: this.world, app: this.app })
    this.spawner.populate()
    this.setupSystems()

    this.flowController = new GameFlowController({
      world: this.world,
      app: this.app,
      uiManager: this.uiManager,
      leaderboardManager: this.leaderboardManager,
      gameStateSystem: this.gameStateSystem,
      scoreSystem: this.scoreSystem
    })

    this.gameInputHandler = new GameInputHandler({
      world: this.world,
      onRestartGame: () => this.flowController.restartGame(),
      getGameState: () => this.gameStateSystem.getState()
    })
    this.gameInputHandler.setupEventListeners()

    this.flowController.showPlayerInputModal()

    this.app.ticker.add((ticker) => this.gameLoop(ticker.deltaMS))
  }

  private setupSystems(): void {
    const { scoreSystem, gameStateSystem } = setupGameSystems({
      world: this.world,
      app: this.app,
      onBrickDestroyed: (points: number) => {
        scoreSystem.addPoints(points)
      },
      onBallLost: () => {
        this.flowController.endGame()
      },
      onAllBricksDestroyed: () => {
        this.flowController.endGame()
      }
    })
    this.scoreSystem = scoreSystem
    this.gameStateSystem = gameStateSystem
  }

  private gameLoop(deltaTime: number): void {
    if (this.gameStateSystem.getState() !== 'PLAYING') {
      return
    }
    this.world.update(deltaTime)
  }
}