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

/**
 * Управляет high-level потоком игры: UI, конец/рестарт.
 */
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

  /**
   * Показывает модальное окно для ввода имени игрока
   */
  public showPlayerInputModal(): void {
    this.uiManager.showPlayerInputModal((playerName: string) => {
      this.onPlayerNameEntered(playerName)
    })
  }

  /**
   * Окончание игры
   */
  public endGame(): void {
    this.gameStateSystem.endGame()
    
    // Сохраняем результат
    const playerName = this.gameStateSystem.getPlayerName()
    const finalScore = this.scoreSystem.getScore()
    this.leaderboardManager.saveScore(playerName, finalScore)

    // Показываем экран окончания игры
    this.gameOverOverlay = this.uiManager.showGameOver(playerName, finalScore)
    this.app.stage.addChild(this.gameOverOverlay)
  }

  /**
   * Перезапуск игры
   * Находит и удаляет сущности динамически (по эталону)
   */
  public restartGame(): void {
    // Удаляем экран окончания игры
    if (this.gameOverOverlay) {
      this.app.stage.removeChild(this.gameOverOverlay)
      this.gameOverOverlay = null
    }

    // Сбрасываем счет
    this.scoreSystem.reset()

    // Удаляем все кирпичи (находим динамически)
    const bricks = this.world.with('brick', 'visual')
    bricks.forEach((brick: Entity) => {
      this.app.stage.removeChild(brick.visual!.graphics)
      this.world.remove(brick)
    })

    // Создаем новые кирпичи
    const newBricks = createBricks(this.world, this.app.screen.width, this.app.screen.height)
    newBricks.forEach((brick: Entity) => this.app.stage.addChild(brick.visual!.graphics))

    // Сбрасываем мяч (находим динамически)
    const balls = this.world.with('ball', 'velocity')
    if (balls.length > 0) {
      balls[0].ball!.isLaunched = false
      balls[0].velocity!.x = 0
      balls[0].velocity!.y = 0
    }

    // Начинаем новую игру
    this.gameStateSystem.startNewGame()
    this.showPlayerInputModal()
  }

  /**
   * Обработчик ввода имени игрока
   */
  private onPlayerNameEntered(playerName: string): void {
    this.gameStateSystem.setPlayerName(playerName)
    this.scoreSystem.setPlayerName(playerName)
    this.gameStateSystem.startPlaying()
  }
}
