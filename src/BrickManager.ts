import { Container } from 'pixi.js'
import { Brick } from './Brick'
import { GAME_CONFIG } from './constants'

export class BrickManager {
  public container: Container
  private bricks: Brick[] = []
  private sceneWidth: number
  private sceneHeight: number

  constructor(sceneWidth: number, sceneHeight: number) {
    this.sceneWidth = sceneWidth
    this.sceneHeight = sceneHeight
    this.container = new Container()
    
    this.createBricks()
  }

  private createBricks(): void {
    const rows = GAME_CONFIG.BRICK_ROWS
    const cols = GAME_CONFIG.BRICK_COLS
    const padding = GAME_CONFIG.BRICK_PADDING
    const offsetX = this.sceneWidth * GAME_CONFIG.BRICK_OFFSET_X
    const offsetY = GAME_CONFIG.BRICK_OFFSET_TOP // Абсолютное значение в пикселях
    
    // Вычисляем размеры кирпича
    const totalPaddingX = padding * (cols + 1) + offsetX * 2
    const brickWidth = (this.sceneWidth - totalPaddingX) / cols
    const brickHeight = this.sceneHeight * GAME_CONFIG.BRICK_HEIGHT

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetX + padding + col * (brickWidth + padding)
        const y = offsetY + padding + row * (brickHeight + padding)
        
        // Выбираем случайный тип кирпича (цвет и очки)
        const brickType = this.getRandomBrickType()
        
        const brick = new Brick(x, y, brickWidth, brickHeight, brickType.color, brickType.points, row, col)
        this.bricks.push(brick)
        this.container.addChild(brick.graphics)
      }
    }
  }

  private getRandomBrickType(): { color: number, points: number } {
    const types = GAME_CONFIG.BRICK_TYPES
    const randomIndex = Math.floor(Math.random() * types.length)
    return types[randomIndex]
  }

  public checkCollisions(ballX: number, ballY: number, ballRadius: number, onBrickDestroyed?: (points: number) => void): { hit: boolean, side: 'top' | 'bottom' | 'left' | 'right' | null } {
    let result = { hit: false, side: null as 'top' | 'bottom' | 'left' | 'right' | null }
    
    for (const brick of this.bricks) {
      const collision = brick.checkCollision(ballX, ballY, ballRadius)
      if (collision.hit) {
        const points = brick.getPoints()
        brick.destroy()
        result = collision
        
        // Вызываем callback при разрушении кирпича с количеством очков
        if (onBrickDestroyed) {
          onBrickDestroyed(points)
        }
        
        break // Только один кирпич за раз
      }
    }
    
    return result
  }

  public resize(newSceneWidth: number, newSceneHeight: number): void {
    // Обновляем размеры сцены
    this.sceneWidth = newSceneWidth
    this.sceneHeight = newSceneHeight
    
    // Пересчитываем параметры сетки
    const rows = GAME_CONFIG.BRICK_ROWS
    const cols = GAME_CONFIG.BRICK_COLS
    const padding = GAME_CONFIG.BRICK_PADDING
    const offsetX = this.sceneWidth * GAME_CONFIG.BRICK_OFFSET_X
    const offsetY = GAME_CONFIG.BRICK_OFFSET_TOP // Абсолютное значение в пикселях
    
    const totalPaddingX = padding * (cols + 1) + offsetX * 2
    const brickWidth = (this.sceneWidth - totalPaddingX) / cols
    const brickHeight = this.sceneHeight * GAME_CONFIG.BRICK_HEIGHT
    
    // Обновляем позиции и размеры существующих кирпичей
    this.bricks.forEach(brick => {
      const x = offsetX + padding + brick.col * (brickWidth + padding)
      const y = offsetY + padding + brick.row * (brickHeight + padding)
      brick.updatePosition(x, y, brickWidth, brickHeight)
    })
  }

  public getAllBricks(): Brick[] {
    return this.bricks
  }

  public getActiveBricksCount(): number {
    return this.bricks.filter(brick => !brick.isDestroyed).length
  }

  public resetBricks(): void {
    // Удаляем старые кирпичи
    this.bricks.forEach(brick => {
      this.container.removeChild(brick.graphics)
    })
    this.bricks = []
    
    // Создаем новые кирпичи
    this.createBricks()
  }

  public update(): void {
    // Обновляем все кирпичи (для fade-эффекта)
    this.bricks.forEach(brick => {
      brick.update()
    })
  }
}
