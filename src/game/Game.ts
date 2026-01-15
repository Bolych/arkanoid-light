import { Application } from 'pixi.js'
import { LeaderboardManager } from '../LeaderboardManager'
import { UIManager } from '../ui/UIManager.js'
import { GameInputHandler } from './GameInputHandler.js'
import { GameFlowController } from './GameFlowController.js'
import { ResizeManager } from '../platform/ResizeManager.ts'
import { GameSpawner } from './GameSpawner.js'
import { setupGameSystems } from './GameSystems.js'
import { world } from '../ecs/entities/index.js'
import type { Entity } from '../ecs/entities/index.js'
import { World } from '../ecs/World'
import { GAME_CONFIG } from '../constants'
import type { ScoreSystem, GameStateSystem } from '../ecs/systems'

export class Game {

  public app: Application
  
  public world: World<Entity>

  private leaderboardManager!: LeaderboardManager
  private uiManager!: UIManager
  private gameInputHandler!: GameInputHandler
  private resizeManager!: ResizeManager
  private flowController!: GameFlowController
  private spawner!: GameSpawner

  private gameStateSystem!: GameStateSystem
  private scoreSystem!: ScoreSystem

  constructor() {
    this.app = new Application()
    this.world = world
  }

  async init(): Promise<void> {
    const { width, height } = ResizeManager.getGameSize()

    await this.app.init({
      width,
      height,
      background: GAME_CONFIG.GAME_BACKGROUND_COLOR,
    })

    const appDiv = document.querySelector<HTMLDivElement>('#app')!
    appDiv.appendChild(this.app.canvas)

    this.leaderboardManager = new LeaderboardManager()
    this.uiManager = new UIManager(this.app.screen.width, this.app.screen.height, this.leaderboardManager)
    this.resizeManager = new ResizeManager({ app: this.app, world: this.world, uiManager: this.uiManager })
    this.resizeManager.setupEventListener()
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

    // Ensure visuals are positioned before the game starts.
    this.world.update(0)

    this.gameInputHandler = new GameInputHandler({
      world: this.world,
      app: this.app,
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
      onGameEnd: () => this.flowController.endGame()
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