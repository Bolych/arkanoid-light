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
  
  // Управление касанием для мобильных устройств
  private touchTargetX: number | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private isMouseDown: boolean = false

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
    
    // Настраиваем обработку касаний для мобильных устройств
    this.setupTouchControls()
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

  private setupTouchControls(): void {
    // Получаем canvas элемент
    setTimeout(() => {
      this.canvasElement = document.querySelector('canvas')
      
      if (this.canvasElement) {
        // Обработка касаний (touchstart, touchmove)
        this.canvasElement.addEventListener('touchstart', (e) => {
          e.preventDefault()
          this.handleTouchMove(e)
        })

        this.canvasElement.addEventListener('touchmove', (e) => {
          e.preventDefault()
          this.handleTouchMove(e)
        })

        this.canvasElement.addEventListener('touchend', () => {
          this.touchTargetX = null
        })

        // Обработка мыши (работает только при зажатой кнопке)
        this.canvasElement.addEventListener('mousedown', (e) => {
          this.isMouseDown = true
          this.handleMouseMove(e)
        })

        this.canvasElement.addEventListener('mousemove', (e) => {
          // Обрабатываем только если кнопка мыши зажата
          if (this.isMouseDown) {
            this.handleMouseMove(e)
          }
        })

        this.canvasElement.addEventListener('mouseup', () => {
          this.isMouseDown = false
          this.touchTargetX = null
        })

        this.canvasElement.addEventListener('mouseleave', () => {
          this.isMouseDown = false
          this.touchTargetX = null
        })
      }
    }, 100)
  }

  private handleTouchMove(e: TouchEvent): void {
    if (!this.canvasElement || e.touches.length === 0) return

    const touch = e.touches[0]
    const rect = this.canvasElement.getBoundingClientRect()
    
    // Переводим координаты касания в координаты игры
    const canvasX = touch.clientX - rect.left
    const scaleX = this.sceneWidth / rect.width
    
    // Устанавливаем целевую позицию с учетом центра платформы
    this.touchTargetX = canvasX * scaleX - this.width / 2
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.canvasElement) return

    const rect = this.canvasElement.getBoundingClientRect()
    
    // Переводим координаты мыши в координаты игры
    const canvasX = e.clientX - rect.left
    const scaleX = this.sceneWidth / rect.width
    
    // Устанавливаем целевую позицию с учетом центра платформы
    this.touchTargetX = canvasX * scaleX - this.width / 2
  }

  public update(): void {
    // Приоритет у касания/мыши - если есть целевая позиция, двигаемся к ней
    if (this.touchTargetX !== null) {
      const diff = this.touchTargetX - this.graphics.x
      const moveSpeed = this.speed * 1.5 // Немного быстрее для касания
      
      if (Math.abs(diff) > 2) {
        // Плавно двигаемся к целевой позиции
        if (diff > 0) {
          this.graphics.x += Math.min(moveSpeed, diff)
        } else {
          this.graphics.x += Math.max(-moveSpeed, diff)
        }
      } else {
        // Если очень близко, просто устанавливаем позицию
        this.graphics.x = this.touchTargetX
      }
    } else {
      // Управление клавиатурой (только если нет касания)
      // Движение влево
      if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
        this.graphics.x -= this.speed
      }
      
      // Движение вправо
      if (this.keys['ArrowRight'] || this.keys['KeyD']) {
        this.graphics.x += this.speed
      }
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
