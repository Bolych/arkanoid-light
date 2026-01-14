import { Graphics } from 'pixi.js'
import { GAME_CONFIG } from './constants'

export class Brick {
  public graphics: Graphics
  private width: number
  private height: number
  private color: number
  private points: number
  public isDestroyed: boolean = false

  constructor(x: number, y: number, width: number, height: number, color: number, points: number) {
    this.width = width
    this.height = height
    this.color = color
    this.points = points
    
    // Создаем графику кирпича
    this.graphics = new Graphics()
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
    this.isDestroyed = true
    this.graphics.visible = false
  }

  public getBounds() {
    return {
      x: this.graphics.x,
      y: this.graphics.y,
      width: this.width,
      height: this.height
    }
  }

  public checkCollision(ballX: number, ballY: number, ballRadius: number): boolean {
    if (this.isDestroyed) return false

    const bounds = this.getBounds()
    
    // Простая проверка пересечения круга и прямоугольника
    const closestX = Math.max(bounds.x, Math.min(ballX, bounds.x + bounds.width))
    const closestY = Math.max(bounds.y, Math.min(ballY, bounds.y + bounds.height))
    
    const distanceX = ballX - closestX
    const distanceY = ballY - closestY
    const distanceSquared = distanceX * distanceX + distanceY * distanceY
    
    return distanceSquared < (ballRadius * ballRadius)
  }
}
