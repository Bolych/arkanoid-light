import { Container, Application } from 'pixi.js'
import type { Entity } from '../ecs/entities/index.js'
import { createBricks } from '../ecs/entities/factories'
import type { World } from '../ecs/World'
import type { UIManager } from '../ui/UIManager.js'
import type { LeaderboardManager } from '../LeaderboardManager'
import type { GameStateSystem } from '../ecs/systems/GameStateSystem'
import type { ScoreSystem } from '../ecs/systems/ScoreSystem'

type GameFlowDeps = {
  world: World<Entity>
  app: Application
  uiManager: UIManager
  leaderboardManager: LeaderboardManager
  gameStateSystem: GameStateSystem
  scoreSystem: ScoreSystem
}

export class GameFlowController {
  private world: World<Entity>
  private app: Application
  private uiManager: UIManager
  private leaderboardManager: LeaderboardManager
  private gameStateSystem: GameStateSystem
  private scoreSystem: ScoreSystem
  private gameOverOverlay: Container | null = null

  constructor({
    world,
    app,
    uiManager,
    leaderboardManager,
    gameStateSystem,
    scoreSystem
  }: GameFlowDeps) {
    this.world = world
    this.app = app
    this.uiManager = uiManager
    this.leaderboardManager = leaderboardManager
    this.gameStateSystem = gameStateSystem
    this.scoreSystem = scoreSystem
  }

  public showPlayerInputModal(): void {
    this.uiManager.showPlayerInputModal((playerName: string) => {
      this.onPlayerNameEntered(playerName)
    })
  }

  public endGame(): void {
    this.gameStateSystem.endGame()
    
    const playerName = this.gameStateSystem.getPlayerName()
    const finalScore = this.scoreSystem.getScore()
    this.leaderboardManager.saveScore(playerName, finalScore)

    this.gameOverOverlay = this.uiManager.showGameOver(playerName, finalScore)
    this.app.stage.addChild(this.gameOverOverlay)
  }

  public restartGame(): void {
    if (this.gameOverOverlay) {
      this.app.stage.removeChild(this.gameOverOverlay)
      this.gameOverOverlay = null
    }

    this.scoreSystem.reset()

    const bricks = this.world.with('brick', 'visual')
    bricks.forEach((brick: Entity) => {
      this.app.stage.removeChild(brick.visual!.graphics)
      this.world.remove(brick)
    })

    const newBricks = createBricks(this.world, this.app.screen.width, this.app.screen.height)
    newBricks.forEach((brick: Entity) => this.app.stage.addChild(brick.visual!.graphics))

    const balls = this.world.with('ball', 'velocity')
    if (balls.length > 0) {
      balls[0].ball!.isLaunched = false
      balls[0].velocity!.x = 0
      balls[0].velocity!.y = 0
    }

    this.gameStateSystem.startNewGame()
    this.showPlayerInputModal()
  }

  private onPlayerNameEntered(playerName: string): void {
    this.gameStateSystem.setPlayerName(playerName)
    this.scoreSystem.setPlayerName(playerName)
    this.gameStateSystem.startPlaying()
  }
}
