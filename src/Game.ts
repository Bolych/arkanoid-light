import { Application, Container } from 'pixi.js'
import { SCENE_CONFIG } from './constants'
import { ScoreManager } from './ScoreManager'
import { GameStateManager } from './GameStateManager'
import { LeaderboardManager } from './LeaderboardManager'
import { UIManager } from './UIManager'
import { world } from './ecs/entities/index.js'
import type { Entity } from './ecs/entities/index.js'
import { createPaddle, createBall, createBricks } from './ecs/entities/factories'
import {
  InputSystem,
  PaddleMovementSystem,
  BallMovementSystem,
  BallLaunchSystem,
  CollisionSystem,
  RenderSystem,
  ResizeSystem
} from './ecs/systems'

/**
 * Главный класс игры Arkanoid
 * Инкапсулирует всю игровую логику, системы, менеджеры и сущности
 */
export class Game {
  // PixiJS приложение
  private app: Application

  // ECS системы
  private inputSystem!: InputSystem
  private paddleMovementSystem!: PaddleMovementSystem
  private ballMovementSystem!: BallMovementSystem
  private ballLaunchSystem!: BallLaunchSystem
  private collisionSystem!: CollisionSystem
  private renderSystem!: RenderSystem
  private resizeSystem!: ResizeSystem

  // Менеджеры (не ECS)
  private scoreManager!: ScoreManager
  private gameStateManager!: GameStateManager
  private leaderboardManager!: LeaderboardManager
  private uiManager!: UIManager
  private gameOverOverlay: Container | null = null

  // Сущности
  private paddleEntity!: Entity
  private ballEntity!: Entity
  private brickEntities: Entity[] = []

  constructor() {
    this.app = new Application()
  }

  /**
   * Инициализация игры
   */
  async init(): Promise<void> {
    const { width, height } = this.getGameSize()

    await this.app.init({
      width,
      height,
      background: 0x808080, // Серый цвет
    })

    // Добавляем canvas в DOM
    const appDiv = document.querySelector<HTMLDivElement>('#app')!
    appDiv.appendChild(this.app.canvas)

    // Создаем менеджеры
    this.gameStateManager = new GameStateManager()
    this.leaderboardManager = new LeaderboardManager()
    this.uiManager = new UIManager(this.app.screen.width, this.app.screen.height, this.leaderboardManager)

    // Создаем менеджер очков
    this.scoreManager = new ScoreManager(this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(this.scoreManager.uiContainer)

    // Создаем сущности
    this.createEntities()

    // Создаем системы
    this.createSystems()

    // Показываем модальное окно ввода имени
    this.showPlayerInputModal()

    // Настраиваем обработчики событий
    this.setupEventListeners()

    // Запускаем игровой цикл
    this.app.ticker.add(() => this.gameLoop())
  }

  /**
   * Создает игровые сущности
   */
  private createEntities(): void {
    this.paddleEntity = createPaddle(world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(this.paddleEntity.visual!.graphics)

    this.ballEntity = createBall(world, this.app.screen.width, this.app.screen.height)
    this.app.stage.addChild(this.ballEntity.visual!.graphics)

    this.brickEntities = createBricks(world, this.app.screen.width, this.app.screen.height)
    this.brickEntities.forEach(brick => this.app.stage.addChild(brick.visual!.graphics))
  }

  /**
   * Создает ECS системы
   */
  private createSystems(): void {
    this.inputSystem = new InputSystem(world, this.app.canvas, this.app.screen.width)
    this.paddleMovementSystem = new PaddleMovementSystem(world)
    this.ballMovementSystem = new BallMovementSystem(world)
    this.ballLaunchSystem = new BallLaunchSystem(world)
    this.collisionSystem = new CollisionSystem(world, {
      onBrickDestroyed: (points: number) => {
        this.scoreManager.addPoints(points)
      },
      onBallLost: () => {
        this.endGame()
      },
      onAllBricksDestroyed: () => {
        this.endGame()
      }
    })
    this.renderSystem = new RenderSystem(world)
    this.resizeSystem = new ResizeSystem(world)
  }

  /**
   * Настраивает обработчики событий
   */
  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e))
    window.addEventListener('touchstart', (e) => this.handleTouchStart(e))
    window.addEventListener('click', (e) => this.handleClick(e))
    window.addEventListener('resize', () => this.handleResize())
  }

  /**
   * Показывает модальное окно для ввода имени игрока
   */
  private showPlayerInputModal(): void {
    const modal = document.getElementById('player-input-modal')!
    const input = document.getElementById('player-name') as HTMLInputElement
    const button = document.getElementById('start-game-btn') as HTMLButtonElement

    modal.classList.add('active')
    input.value = ''
    input.focus()

    const startGame = () => {
      const playerName = input.value.trim()
      if (playerName.length > 0) {
        this.gameStateManager.setPlayerName(playerName)
        this.scoreManager.setPlayerName(playerName)
        this.gameStateManager.startPlaying()
        modal.classList.remove('active')
      }
    }

    button.onclick = startGame
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        startGame()
      }
    }
  }

  /**
   * Обработка нажатия клавиш
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Проверяем Space по разным вариантам кода клавиши
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault()

      if (this.gameStateManager.getState() === 'PLAYING') {
        this.requestBallLaunch()
      } else if (this.gameStateManager.getState() === 'GAME_OVER') {
        this.restartGame()
      }
    }
  }

  /**
   * Обработка касания экрана
   */
  private handleTouchStart(e: TouchEvent): void {
    // Проверяем, что касание не по элементам модального окна
    const target = e.target as HTMLElement
    if (target.closest('.modal')) {
      return
    }

    this.handleUserAction()
  }

  /**
   * Обработка клика мыши
   */
  private handleClick(e: MouseEvent): void {
    // Проверяем, что клик не по элементам модального окна
    const target = e.target as HTMLElement
    if (target.closest('.modal')) {
      return
    }

    this.handleUserAction()
  }

  /**
   * Обработка действия пользователя (клик или тач)
   */
  private handleUserAction(): void {
    if (this.gameStateManager.getState() === 'PLAYING') {
      this.requestBallLaunch()
    } else if (this.gameStateManager.getState() === 'GAME_OVER') {
      this.restartGame()
    }
  }

  /**
   * Запрашивает запуск мяча через добавление команды
   */
  private requestBallLaunch(): void {
    if (!this.ballEntity.launchCommand) {
      // Используем правильный API Miniplex для добавления компонента
      world.addComponent(this.ballEntity, 'launchCommand', {})
    }
  }

  /**
   * Обработка изменения размера окна
   */
  private handleResize(): void {
    const newSize = this.getGameSize()
    this.app.renderer.resize(newSize.width, newSize.height)

    // Используем ResizeSystem для обновления всех сущностей
    this.resizeSystem.resize(newSize.width, newSize.height)

    // Обновляем менеджеры
    this.scoreManager.resize(newSize.width, newSize.height)
    this.uiManager.resize(newSize.width, newSize.height)
    this.inputSystem.resize(newSize.width)
  }

  /**
   * Получает оптимальный размер для игры
   */
  private getGameSize(): { width: number; height: number } {
    const isMobile = window.innerWidth < SCENE_CONFIG.MOBILE_BREAKPOINT
    const isPortrait = window.innerHeight > window.innerWidth

    if (isMobile || isPortrait) {
      // Мобильная или портретная ориентация - на всю высоту экрана
      const width = Math.min(window.innerWidth, SCENE_CONFIG.MOBILE.MAX_WIDTH)
      const height = window.innerHeight // Используем всю высоту экрана

      return { width, height }
    } else {
      // Десктоп - классический вертикальный формат Arkanoid с соотношением сторон
      const maxWidth = SCENE_CONFIG.DESKTOP.MAX_WIDTH
      const maxHeight = SCENE_CONFIG.DESKTOP.MAX_HEIGHT
      const screenUsage = SCENE_CONFIG.DESKTOP_SCREEN_USAGE // 95% для десктопа
      const aspectRatio = maxWidth / maxHeight

      let width = Math.min(window.innerWidth * screenUsage, maxWidth)
      let height = Math.min(window.innerHeight * screenUsage, maxHeight)

      // Сохраняем соотношение сторон
      if (width / height > aspectRatio) {
        width = height * aspectRatio
      } else {
        height = width / aspectRatio
      }

      return { width, height }
    }
  }

  /**
   * Окончание игры
   */
  private endGame(): void {
    this.gameStateManager.endGame()

    // Сохраняем результат
    const playerName = this.gameStateManager.getPlayerName()
    const finalScore = this.scoreManager.getScore()
    this.leaderboardManager.saveScore(playerName, finalScore)

    // Показываем экран окончания игры
    this.gameOverOverlay = this.uiManager.showGameOver(playerName, finalScore)
    this.app.stage.addChild(this.gameOverOverlay)
  }

  /**
   * Перезапуск игры
   */
  private restartGame(): void {
    // Удаляем экран окончания игры
    if (this.gameOverOverlay) {
      this.app.stage.removeChild(this.gameOverOverlay)
      this.gameOverOverlay = null
    }

    // Сбрасываем счет
    this.scoreManager.reset()

    // Удаляем старые кирпичи
    this.brickEntities.forEach(brick => {
      if (brick.visual) {
        this.app.stage.removeChild(brick.visual.graphics)
      }
      world.remove(brick)
    })

    // Создаем новые кирпичи
    this.brickEntities = createBricks(world, this.app.screen.width, this.app.screen.height)
    this.brickEntities.forEach(brick => this.app.stage.addChild(brick.visual!.graphics))

    // Сбрасываем мяч
    this.ballEntity.ball!.isLaunched = false
    this.ballEntity.velocity!.x = 0
    this.ballEntity.velocity!.y = 0

    // Начинаем новую игру
    this.gameStateManager.startNewGame()
    this.showPlayerInputModal()
  }

  /**
   * Игровой цикл
   */
  private gameLoop(): void {
    // InputSystem обрабатывается всегда, чтобы очищать буфер событий
    this.inputSystem.update()

    // Остальные системы обновляются только если игра идет
    if (this.gameStateManager.getState() !== 'PLAYING') {
      return
    }

    // Обновляем игровые системы ECS
    this.paddleMovementSystem.update()
    this.ballLaunchSystem.update()
    this.ballMovementSystem.update()
    this.collisionSystem.update()
    this.renderSystem.update()
  }
}
