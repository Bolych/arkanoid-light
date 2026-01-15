import { Application, Container } from 'pixi.js'
import { LeaderboardManager } from './LeaderboardManager'
import { UIManager } from './UIManager'
import { GameInputHandler } from './GameInputHandler'
import { ResizeHandler } from './ResizeHandler'
import { world } from './ecs/entities/index.js'
import type { Entity } from './ecs/entities/index.js'
import { World } from './ecs/World'
import { createPaddle, createBall, createBricks, createScore, createGameState } from './ecs/entities/factories'
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
} from './ecs/systems'

/**
 * Главный класс игры Arkanoid
 * Координирует ECS world, системы и менеджеры
 */
export class Game {
  // PixiJS приложение
  public app: Application
  
  // ECS мир
  public world: World<Entity>

  // Менеджеры и обработчики (не ECS)
  private leaderboardManager!: LeaderboardManager
  private uiManager!: UIManager
  private gameInputHandler!: GameInputHandler
  private resizeHandler!: ResizeHandler
  private gameOverOverlay: Container | null = null

  // Системы для доступа вне ECS loop
  private gameStateSystem!: GameStateSystem
  private scoreSystem!: ScoreSystem
  private resizeSystem!: ResizeSystem

  constructor() {
    this.app = new Application()
    this.world = world // Используем глобальный world (временно)
  }

  /**
   * Инициализация игры
   */
  async init(): Promise<void> {
    // Создаем обработчик размеров окна
    this.resizeHandler = new ResizeHandler()
    this.resizeHandler.addListener((width, height) => this.handleResize(width, height))
    const { width, height } = this.resizeHandler.getGameSize()

    await this.app.init({
      width,
      height,
      background: 0x808080, // Серый цвет
    })

    // Добавляем canvas в DOM
    const appDiv = document.querySelector<HTMLDivElement>('#app')!
    appDiv.appendChild(this.app.canvas)

    // Создаем менеджеры
    this.leaderboardManager = new LeaderboardManager()
    this.uiManager = new UIManager(this.app.screen.width, this.app.screen.height, this.leaderboardManager)

    // Настраиваем обработчики событий
    this.resizeHandler.setupEventListener()
  }

  /**
   * Запуск игры (после инициализации)
   */
  run(): void {
    // Создаем сущности
    this.populate()

    // Создаем и регистрируем системы в world
    this.setupSystems()

    // Создаем обработчик игрового ввода
    this.gameInputHandler = new GameInputHandler({
      onLaunchBall: () => this.requestBallLaunch(),
      onRestartGame: () => this.restartGame(),
      getGameState: () => this.gameStateSystem.getState()
    })
    this.gameInputHandler.setupEventListeners()

    // Показываем модальное окно ввода имени
    this.showPlayerInputModal()

    // Запускаем игровой цикл
    this.app.ticker.add((ticker) => this.gameLoop(ticker.deltaMS))
  }

  /**
   * Создает игровые сущности (аналог populate в эталоне)
   */
  private populate(): void {
    // Создаем singleton-сущность состояния игры
    createGameState(this.world)

    // Создаем сущность счета
    const scoreEntity = createScore(this.world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(scoreEntity.uiElement!.container)

    // Создаем платформу
    const paddleEntity = createPaddle(this.world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(paddleEntity.visual!.graphics)

    // Создаем мяч
    const ballEntity = createBall(this.world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(ballEntity.visual!.graphics)

    // Создаем кирпичи
    const bricks = createBricks(this.world, this.app.screen.width, this.app.screen.height)
    bricks.forEach(brick => this.app.stage.addChild(brick.visual!.graphics))
  }

  /**
   * Создает и регистрирует системы в world (по эталону)
   */
  private setupSystems(): void {
    // Системы, которые нужны для внешнего доступа
    this.scoreSystem = new ScoreSystem(this.world)
    this.gameStateSystem = new GameStateSystem(this.world)
    this.resizeSystem = new ResizeSystem(this.world)

    // Регистрируем системы в world (обновляются каждый фрейм)
    this.world.addSystem(new InputSystem(this.world, this.app.canvas, this.app.screen.width))
    this.world.addSystem(new PaddleMovementSystem(this.world))
    this.world.addSystem(new BallLaunchSystem(this.world))
    this.world.addSystem(new BallMovementSystem(this.world))
    this.world.addSystem(new CollisionSystem(this.world, {
      onBrickDestroyed: (points: number) => {
        this.scoreSystem.addPoints(points)
      },
      onBallLost: () => {
        this.endGame()
      },
      onAllBricksDestroyed: () => {
        this.endGame()
      }
    }))
    this.world.addSystem(new ScoreUISystem(this.world))
    this.world.addSystem(new RenderSystem(this.world))
    
    // Добавляем системы, которые нужны для внешнего доступа
    // (они имеют пустой метод update())
    this.world.addSystem(this.scoreSystem)
    this.world.addSystem(this.gameStateSystem)
    this.world.addSystem(this.resizeSystem)
  }

  /**
   * Показывает модальное окно для ввода имени игрока
   */
  private showPlayerInputModal(): void {
    this.uiManager.showPlayerInputModal((playerName: string) => {
      this.onPlayerNameEntered(playerName)
    })
  }

  /**
   * Обработчик ввода имени игрока
   */
  private onPlayerNameEntered(playerName: string): void {
    this.gameStateSystem.setPlayerName(playerName)
    this.scoreSystem.setPlayerName(playerName)
    this.gameStateSystem.startPlaying()
  }

  /**
   * Запрашивает запуск мяча через добавление команды
   * Находит сущность мяча динамически (по эталону)
   */
  private requestBallLaunch(): void {
    const balls = this.world.with('ball', 'velocity')
    if (balls.length > 0 && !balls[0].launchCommand) {
      this.world.addComponent(balls[0], 'launchCommand', {})
    }
  }

  /**
   * Обработка изменения размера окна
   */
  private handleResize(width: number, height: number): void {
    this.app.renderer.resize(width, height)

    // Используем ResizeSystem для обновления всех сущностей
    this.resizeSystem.resize(width, height)
    
    // Обновляем UI менеджер
    this.uiManager.resize(width, height)
    
    // Находим InputSystem и обновляем его
    const systems = this.world.getSystems()
    for (const system of systems) {
      if (system instanceof InputSystem) {
        system.resize(width)
      }
      if (system instanceof ScoreUISystem) {
        system.resize(width, height)
      }
    }
  }

  /**
   * Окончание игры
   */
  private endGame(): void {
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
  private restartGame(): void {
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
   * Игровой цикл (по эталону - одна строка!)
   */
  private gameLoop(deltaTime: number): void {
    // Проверяем состояние
    if (this.gameStateSystem.getState() !== 'PLAYING') {
      return
    }

    // Обновляем все системы одной командой (как в эталоне)
    this.world.update(deltaTime)
  }
}
