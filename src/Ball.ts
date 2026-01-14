import { Graphics } from 'pixi.js'
import { GAME_CONFIG } from './constants'
import { Paddle } from './Paddle'

export class Ball {
  public graphics: Graphics
  private radius: number = GAME_CONFIG.BALL_RADIUS
  private velocityX: number = 0
  private velocityY: number = 0
  private sceneWidth: number
  private sceneHeight: number
  private isLaunched: boolean = false  // Флаг: запущен ли шарик

  constructor(sceneWidth: number, sceneHeight: number) {
    this.sceneWidth = sceneWidth
    this.sceneHeight = sceneHeight
    
    // Создаем графику шарика
    this.graphics = new Graphics()
    this.draw()
    
    // Начальная позиция - по центру на 70% высоты
    this.graphics.x = sceneWidth / 2
    this.graphics.y = sceneHeight * GAME_CONFIG.BALL_START_Y
  }

  private draw(): void {
    this.graphics.clear()
    this.graphics.circle(0, 0, this.radius)
    this.graphics.fill(GAME_CONFIG.BALL_COLOR)
  }

  public update(paddle: Paddle): void {
    // Если шарик не запущен, он сидит на платформе
    if (!this.isLaunched) {
      const paddleX = paddle.getX()
      const paddleWidth = paddle.getWidth()
      const paddleY = paddle.getY()
      
      // Шарик следует за платформой
      this.graphics.x = paddleX + paddleWidth / 2
      this.graphics.y = paddleY - this.radius - 2
      return
    }

    // Обновляем позицию
    this.graphics.x += this.velocityX
    this.graphics.y += this.velocityY

    // Отскок от левой и правой стены
    if (this.graphics.x - this.radius <= 0) {
      this.graphics.x = this.radius
      this.velocityX = Math.abs(this.velocityX)
    } else if (this.graphics.x + this.radius >= this.sceneWidth) {
      this.graphics.x = this.sceneWidth - this.radius
      this.velocityX = -Math.abs(this.velocityX)
    }

    // Отскок от верхней стены
    if (this.graphics.y - this.radius <= 0) {
      this.graphics.y = this.radius
      this.velocityY = Math.abs(this.velocityY)
    }

    // Проверка столкновения с платформой
    this.checkPaddleCollision(paddle)

    // Если шарик улетел вниз за пределы экрана (проигрыш)
    if (this.graphics.y - this.radius > this.sceneHeight) {
      this.reset()
    }
  }

  private checkPaddleCollision(paddle: Paddle): void {
    const paddleX = paddle.getX()
    const paddleY = paddle.getY()
    const paddleWidth = paddle.getWidth()
    const paddleHeight = paddle.getHeight()

    // Проверяем столкновение с платформой
    if (
      this.velocityY > 0 && // Шарик движется вниз
      this.graphics.x + this.radius > paddleX &&
      this.graphics.x - this.radius < paddleX + paddleWidth &&
      this.graphics.y + this.radius >= paddleY &&
      this.graphics.y - this.radius < paddleY + paddleHeight
    ) {
      // Шарик ударился о платформу
      this.graphics.y = paddleY - this.radius
      this.velocityY = -Math.abs(this.velocityY)

      // Добавляем эффект отскока в зависимости от места удара
      // Если шарик ударился ближе к краю платформы, он отскакивает под углом
      const paddleCenter = paddleX + paddleWidth / 2
      const hitPosition = (this.graphics.x - paddleCenter) / (paddleWidth / 2)
      
      // Изменяем горизонтальную скорость в зависимости от места удара
      this.velocityX = hitPosition * GAME_CONFIG.BALL_SPEED
    }
  }

  public launch(): void {
    if (this.isLaunched) return
    
    // Запускаем шарик
    this.isLaunched = true
    
    // Случайное направление по X (влево или вправо)
    const randomDirection = Math.random() > 0.5 ? 1 : -1
    this.velocityX = GAME_CONFIG.BALL_SPEED * randomDirection * 0.7
    this.velocityY = -GAME_CONFIG.BALL_SPEED
  }

  public reset(): void {
    // Возвращаем шарик на платформу
    this.isLaunched = false
    this.velocityX = 0
    this.velocityY = 0
  }

  public resize(newSceneWidth: number, newSceneHeight: number): void {
    // Сохраняем относительную позицию
    const relativeX = this.graphics.x / this.sceneWidth
    const relativeY = this.graphics.y / this.sceneHeight
    
    // Обновляем размеры сцены
    this.sceneWidth = newSceneWidth
    this.sceneHeight = newSceneHeight
    
    // Восстанавливаем позицию
    this.graphics.x = relativeX * newSceneWidth
    this.graphics.y = relativeY * newSceneHeight
  }

  public getX(): number {
    return this.graphics.x
  }

  public getY(): number {
    return this.graphics.y
  }

  public getRadius(): number {
    return this.radius
  }
}
