import { Graphics } from 'pixi.js'
import { GAME_CONFIG } from './constants'

export class Paddle {
  public graphics: Graphics
  private width: number
  private height: number
  private sceneWidth: number
  private sceneHeight: number
  private speed: number = GAME_CONFIG.PADDLE_SPEED
  
  // Управление клавиатурой
  private keys: { [key: string]: boolean } = {}

  constructor(sceneWidth: number, sceneHeight: number) {
    this.sceneWidth = sceneWidth
    this.sceneHeight = sceneHeight
    
    // Размеры платформы
    this.width = sceneWidth * GAME_CONFIG.PADDLE_WIDTH
    this.height = sceneHeight * GAME_CONFIG.PADDLE_HEIGHT
    
    // Создаем графику платформы
    this.graphics = new Graphics()
    this.draw()
    
    // Начальная позиция - по центру внизу
    this.graphics.x = (sceneWidth - this.width) / 2
    this.graphics.y = sceneHeight * GAME_CONFIG.PADDLE_Y_POSITION
    
    // Настраиваем обработку клавиатуры
    this.setupKeyboardControls()
  }

  private draw(): void {
    this.graphics.clear()
    this.graphics.roundRect(0, 0, this.width, this.height, 5)
    this.graphics.fill(GAME_CONFIG.PADDLE_COLOR)
  }

  private setupKeyboardControls(): void {
    // Отслеживаем нажатие клавиш
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
    })

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })
  }

  public update(): void {
    // Движение влево
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.graphics.x -= this.speed
    }
    
    // Движение вправо
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.graphics.x += this.speed
    }

    // Ограничиваем движение границами поля
    if (this.graphics.x < 0) {
      this.graphics.x = 0
    }
    
    if (this.graphics.x + this.width > this.sceneWidth) {
      this.graphics.x = this.sceneWidth - this.width
    }
  }

  public resize(newSceneWidth: number, newSceneHeight: number): void {
    // Сохраняем относительную позицию
    const relativeX = this.graphics.x / this.sceneWidth
    
    // Обновляем размеры сцены
    this.sceneWidth = newSceneWidth
    this.sceneHeight = newSceneHeight
    
    // Пересчитываем размеры платформы
    this.width = newSceneWidth * GAME_CONFIG.PADDLE_WIDTH
    this.height = newSceneHeight * GAME_CONFIG.PADDLE_HEIGHT
    
    // Перерисовываем
    this.draw()
    
    // Восстанавливаем позицию
    this.graphics.x = relativeX * newSceneWidth
    this.graphics.y = newSceneHeight * GAME_CONFIG.PADDLE_Y_POSITION
    
    // Проверяем границы
    if (this.graphics.x + this.width > this.sceneWidth) {
      this.graphics.x = this.sceneWidth - this.width
    }
  }

  public getX(): number {
    return this.graphics.x
  }

  public getY(): number {
    return this.graphics.y
  }

  public getWidth(): number {
    return this.width
  }

  public getHeight(): number {
    return this.height
  }
}
