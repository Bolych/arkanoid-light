import { Container, Application } from 'pixi.js'
import type { World } from '../ecs/World'
import type { Entity } from '../ecs/components'
import type { GameSystem } from '../ecs/systems/GameSystem'
import type { UIManager } from '../ui/UIManager.js'
import type { LeaderboardManager } from '../LeaderboardManager'
import { createBricks } from '../ecs/entities'

export class GameFlowController {
  private world: World<Entity>
  private app: Application
  private uiManager: UIManager
  private leaderboardManager: LeaderboardManager
  private gameSystem: GameSystem
  private gameOverOverlay: Container | null = null

  constructor(
    world: World<Entity>,
    app: Application,
    uiManager: UIManager,
    leaderboardManager: LeaderboardManager,
    gameSystem: GameSystem
  ) {
    this.world = world
    this.app = app
    this.uiManager = uiManager
    this.leaderboardManager = leaderboardManager
    this.gameSystem = gameSystem
  }

  public showPlayerInputModal(): void {
    this.app.stage.visible = false
    this.uiManager.showPlayerInputModal((playerName: string) => {
      this.onPlayerNameEntered(playerName)
    })
  }

  public endGame(): void {
    this.gameSystem.endGame()
    
    const playerName = this.gameSystem.getPlayerName()
    const finalScore = this.gameSystem.getScore()
    this.leaderboardManager.saveScore(playerName, finalScore)

    this.gameOverOverlay = this.uiManager.showGameOver(playerName, finalScore)
    this.app.stage.addChild(this.gameOverOverlay)
  }

  public restartGame(): void {
    if (this.gameOverOverlay) {
      this.app.stage.removeChild(this.gameOverOverlay)
      this.gameOverOverlay = null
    }

    this.gameSystem.resetScore()

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

    this.gameSystem.startNewGame()
    this.showPlayerInputModal()
  }

  private onPlayerNameEntered(playerName: string): void {
    this.app.stage.visible = true
    this.gameSystem.setPlayerName(playerName)
    this.gameSystem.startPlaying()
  }
}
