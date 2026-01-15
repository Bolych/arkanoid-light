import './style.css'
import { Application, Container } from 'pixi.js'
import { SCENE_CONFIG } from './constants'
import { Paddle } from './Paddle'
import { Ball } from './Ball'
import { BrickManager } from './BrickManager'
import { ScoreManager } from './ScoreManager'
import { GameStateManager } from './GameStateManager'
import { LeaderboardManager } from './LeaderboardManager'
import { UIManager } from './UIManager'

// Создаем PixiJS приложение
const app = new Application()
let paddle: Paddle
let ball: Ball
let brickManager: BrickManager
let scoreManager: ScoreManager
let gameStateManager: GameStateManager
let leaderboardManager: LeaderboardManager
let uiManager: UIManager
let gameOverOverlay: Container | null = null

// Получаем оптимальный размер для игры
function getGameSize() {
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

// Инициализируем приложение
async function init() {
  const { width, height } = getGameSize()
  
  await app.init({
    width,
    height,
    background: 0x808080, // Серый цвет
  })

  // Добавляем canvas в DOM
  const appDiv = document.querySelector<HTMLDivElement>('#app')!
  appDiv.appendChild(app.canvas)

  // Создаем менеджеры
  gameStateManager = new GameStateManager()
  leaderboardManager = new LeaderboardManager()
  uiManager = new UIManager(app.screen.width, app.screen.height, leaderboardManager)

  // Создаем кирпичи
  brickManager = new BrickManager(app.screen.width, app.screen.height)
  app.stage.addChild(brickManager.container)

  // Создаем платформу
  paddle = new Paddle(app.screen.width, app.screen.height, app.canvas)
  app.stage.addChild(paddle.graphics)

  // Создаем шарик
  ball = new Ball(app.screen.width, app.screen.height)
  app.stage.addChild(ball.graphics)

  // Создаем менеджер очков
  scoreManager = new ScoreManager(app.screen.width, app.screen.height)
  app.stage.addChild(scoreManager.uiContainer)

  // Показываем модальное окно ввода имени
  showPlayerInputModal()

  // Обработка нажатия пробела
  window.addEventListener('keydown', handleKeyDown)

  // Обработка касания экрана (для запуска шара на мобильных)
  window.addEventListener('touchstart', handleTouchStart)
  // Обработка клика мыши (также для запуска шара)
  window.addEventListener('click', handleClick)

  // Обработка изменения размера окна
  window.addEventListener('resize', handleResize)

  // Запускаем игровой цикл
  app.ticker.add(gameLoop)
}

// Показать модальное окно для ввода имени
function showPlayerInputModal() {
  const modal = document.getElementById('player-input-modal')!
  const input = document.getElementById('player-name') as HTMLInputElement
  const button = document.getElementById('start-game-btn') as HTMLButtonElement

  modal.classList.add('active')
  input.value = ''
  input.focus()

  const startGame = () => {
    const playerName = input.value.trim()
    if (playerName.length > 0) {
      gameStateManager.setPlayerName(playerName)
      scoreManager.setPlayerName(playerName)
      gameStateManager.startPlaying()
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

// Обработка нажатия клавиш
function handleKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space') {
    e.preventDefault()
    
    if (gameStateManager.getState() === 'PLAYING') {
      ball.launch()
    } else if (gameStateManager.getState() === 'GAME_OVER') {
      restartGame()
    }
  }
}

// Обработка касания экрана
function handleTouchStart(e: TouchEvent) {
  // Проверяем, что касание не по элементам модального окна
  const target = e.target as HTMLElement
  if (target.closest('.modal')) {
    return // Не обрабатываем касания по модальному окну
  }

  if (gameStateManager.getState() === 'PLAYING') {
    ball.launch()
  } else if (gameStateManager.getState() === 'GAME_OVER') {
    restartGame()
  }
}

// Обработка клика мыши
function handleClick(e: MouseEvent) {
  // Проверяем, что клик не по элементам модального окна
  const target = e.target as HTMLElement
  if (target.closest('.modal')) {
    return // Не обрабатываем клики по модальному окну
  }

  if (gameStateManager.getState() === 'PLAYING') {
    ball.launch()
  } else if (gameStateManager.getState() === 'GAME_OVER') {
    restartGame()
  }
}

// Обработка изменения размера окна
function handleResize() {
  const newSize = getGameSize()
  app.renderer.resize(newSize.width, newSize.height)
  brickManager.resize(newSize.width, newSize.height)
  paddle.resize(newSize.width, newSize.height)
  ball.resize(newSize.width, newSize.height)
  scoreManager.resize(newSize.width, newSize.height)
  uiManager.resize(newSize.width, newSize.height)
}

// Окончание игры
function endGame() {
  gameStateManager.endGame()
  
  // Сохраняем результат
  const playerName = gameStateManager.getPlayerName()
  const finalScore = scoreManager.getScore()
  leaderboardManager.saveScore(playerName, finalScore)

  // Показываем экран окончания игры
  gameOverOverlay = uiManager.showGameOver(playerName, finalScore)
  app.stage.addChild(gameOverOverlay)
}

// Перезапуск игры
function restartGame() {
  // Удаляем экран окончания игры
  if (gameOverOverlay) {
    app.stage.removeChild(gameOverOverlay)
    gameOverOverlay = null
  }

  // Сбрасываем счет
  scoreManager.reset()

  // Сбрасываем кирпичи
  brickManager.resetBricks()

  // Сбрасываем шарик
  ball.reset()

  // Начинаем новую игру
  gameStateManager.startNewGame()
  showPlayerInputModal()
}

// Игровой цикл
function gameLoop() {
  // Обновляем только если игра идет
  if (gameStateManager.getState() !== 'PLAYING') {
    return
  }

  paddle.update()
  ball.update(paddle, () => {
    // Callback при потере мяча - заканчиваем игру
    endGame()
  })
  
  // Проверяем столкновения с кирпичами
  const collision = brickManager.checkCollisions(
    ball.getX(), 
    ball.getY(), 
    ball.getRadius(),
    (points: number) => {
      // Callback при разрушении кирпича - начисляем очки в зависимости от цвета
      scoreManager.addPoints(points)
      
      // Проверяем, все ли кирпичи разбиты
      if (brickManager.getActiveBricksCount() === 0) {
        endGame()
      }
    }
  )
  
  // Если был удар по кирпичу, отскакиваем
  if (collision.hit && collision.side) {
    ball.bounceFromBrick(collision.side)
  }
}

init()
