import { Graphics } from 'pixi.js'
import { GAME_CONFIG } from './constants'

export class Brick {
  public graphics: Graphics
  private width: number
  private height: number
  private color: number
  private points: number
  public isDestroyed: boolean = false
  private isFading: boolean = false
  private fadeSpeed: number = 0.05 // Скорость исчезновения (чем выше, тем быстрее)

  constructor(x: number, y: number, width: number, height: number, color: number, points: number) {
    this.width = width
    this.height = height
    this.color = color
    this.points = points
    
    // Создаем графику кирпича
    this.graphics = new Graphics()
    this.graphics.alpha = 1 // Начальная прозрачность
    this.draw()
    
    // Устанавливаем позицию
    this.graphics.x = x
    this.graphics.y = y
  }

  public getPoints(): number {
    return this.points
  }

  private draw(): void {
    this.graphics.clear()
    this.graphics.roundRect(0, 0, this.width, this.height, 3)
    this.graphics.fill(this.color)
    
    // Добавляем небольшую обводку для визуального эффекта (темнее основного цвета)
    const darkerColor = this.getDarkerColor(this.color)
    this.graphics.roundRect(0, 0, this.width, this.height, 3)
    this.graphics.stroke({ width: 2, color: darkerColor })
  }

  private getDarkerColor(color: number): number {
    // Получаем компоненты цвета
    const r = (color >> 16) & 0xFF
    const g = (color >> 8) & 0xFF
    const b = color & 0xFF
    
    // Делаем цвет темнее (умножаем на 0.7)
    const darkerR = Math.floor(r * 0.7)
    const darkerG = Math.floor(g * 0.7)
    const darkerB = Math.floor(b * 0.7)
    
    return (darkerR << 16) | (darkerG << 8) | darkerB
  }

  public destroy(): void {
    // Вместо мгновенного исчезновения запускаем fade-эффект
    this.isFading = true
  }

  public update(): void {
    // Если кирпич в процессе исчезновения
    if (this.isFading) {
      this.graphics.alpha -= this.fadeSpeed
      
      // Если прозрачность достигла нуля, помечаем как уничтоженный
      if (this.graphics.alpha <= 0) {
        this.graphics.alpha = 0
        this.isDestroyed = true
        this.graphics.visible = false
      }
    }
  }

  public getBounds() {
    return {
      x: this.graphics.x,
      y: this.graphics.y,
      width: this.width,
      height: this.height
    }
  }

  public checkCollision(ballX: number, ballY: number, ballRadius: number): { hit: boolean, side: 'top' | 'bottom' | 'left' | 'right' | null } {
    // Кирпич не может столкнуться, если он уничтожен или уже исчезает
    if (this.isDestroyed || this.isFading) return { hit: false, side: null }

    const bounds = this.getBounds()
    
    // Простая проверка пересечения круга и прямоугольника
    const closestX = Math.max(bounds.x, Math.min(ballX, bounds.x + bounds.width))
    const closestY = Math.max(bounds.y, Math.min(ballY, bounds.y + bounds.height))
    
    const distanceX = ballX - closestX
    const distanceY = ballY - closestY
    const distanceSquared = distanceX * distanceX + distanceY * distanceY
    
    if (distanceSquared >= (ballRadius * ballRadius)) {
      return { hit: false, side: null }
    }

    // Определяем сторону столкновения
    const centerX = bounds.x + bounds.width / 2
    const centerY = bounds.y + bounds.height / 2
    
    const dx = ballX - centerX
    const dy = ballY - centerY
    
    // Определяем, с какой стороны произошло столкновение
    const widthRatio = Math.abs(dx) / bounds.width
    const heightRatio = Math.abs(dy) / bounds.height
    
    let side: 'top' | 'bottom' | 'left' | 'right'
    
    if (widthRatio > heightRatio) {
      // Столкновение слева или справа
      side = dx > 0 ? 'right' : 'left'
    } else {
      // Столкновение сверху или снизу
      side = dy > 0 ? 'bottom' : 'top'
    }
    
    return { hit: true, side }
  }
}
