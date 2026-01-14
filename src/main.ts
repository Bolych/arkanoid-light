import './style.css'
import { Application } from 'pixi.js'
import { SCENE_CONFIG } from './constants'
import { Paddle } from './Paddle'
import { Ball } from './Ball'

// Создаем PixiJS приложение
const app = new Application()
let paddle: Paddle
let ball: Ball

// Получаем оптимальный размер для игры
function getGameSize() {
  const isMobile = window.innerWidth < SCENE_CONFIG.MOBILE_BREAKPOINT
  const isPortrait = window.innerHeight > window.innerWidth
  
  let maxWidth: number
  let maxHeight: number
  
  if (isMobile || isPortrait) {
    // Мобильная или портретная ориентация - узкая вертикальная сцена
    maxWidth = SCENE_CONFIG.MOBILE.MAX_WIDTH
    maxHeight = SCENE_CONFIG.MOBILE.MAX_HEIGHT
  } else {
    // Десктоп - классический вертикальный формат Arkanoid
    maxWidth = SCENE_CONFIG.DESKTOP.MAX_WIDTH
    maxHeight = SCENE_CONFIG.DESKTOP.MAX_HEIGHT
  }
  
  const aspectRatio = maxWidth / maxHeight

  let width = Math.min(window.innerWidth * SCENE_CONFIG.SCREEN_USAGE, maxWidth)
  let height = Math.min(window.innerHeight * SCENE_CONFIG.SCREEN_USAGE, maxHeight)

  // Сохраняем соотношение сторон
  if (width / height > aspectRatio) {
    width = height * aspectRatio
  } else {
    height = width / aspectRatio
  }

  return { width, height }
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

  // Создаем платформу
  paddle = new Paddle(app.screen.width, app.screen.height)
  app.stage.addChild(paddle.graphics)

  // Создаем шарик
  ball = new Ball(app.screen.width, app.screen.height)
  app.stage.addChild(ball.graphics)

  // Обработка нажатия пробела для запуска шарика
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      ball.launch()
      e.preventDefault() // Предотвращаем прокрутку страницы
    }
  })

  // Обработка изменения размера окна
  window.addEventListener('resize', () => {
    const newSize = getGameSize()
    app.renderer.resize(newSize.width, newSize.height)
    paddle.resize(newSize.width, newSize.height)
    ball.resize(newSize.width, newSize.height)
  })

  // Запускаем игровой цикл
  app.ticker.add(gameLoop)
}

// Игровой цикл
function gameLoop() {
  paddle.update()
  ball.update(paddle)
}

init()
