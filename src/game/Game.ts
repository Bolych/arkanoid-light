import { Application } from 'pixi.js'
import { LeaderboardManager } from '../LeaderboardManager'
import { UIManager } from '../ui/UIManager.js'
import { GameInputHandler } from './GameInputHandler.js'
import { GameFlowController } from './GameFlowController.js'
import { getGameSize, setupResize } from '../platform/ResizeManager.ts'
import { populateWorld } from './GameSpawner.js'
import { setupGameSystems } from './GameSystems.js'
import type { Entity } from '../ecs/components'
import { World } from '../ecs/World'
import { GAME_CONFIG } from '../constants'
import type { GameSystem } from '../ecs/systems'

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
    populateWorld(this.world, this.app)
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

  private setupSystems(): void {
    this.gameSystem = setupGameSystems(
      this.world,
      this.app,
      () => this.flowController.endGame()
    )
  }

  private gameLoop(deltaTime: number): void {
    if (this.gameSystem.getState() !== 'PLAYING') {
      return
    }
    this.world.update(deltaTime)
  }

}