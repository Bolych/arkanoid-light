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
    const offsetY = this.sceneHeight * GAME_CONFIG.BRICK_OFFSET_TOP
    
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
        
        const brick = new Brick(x, y, brickWidth, brickHeight, brickType.color, brickType.points)
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

  public checkCollisions(ballX: number, ballY: number, ballRadius: number, onBrickDestroyed?: (points: number) => void): boolean {
    let hit = false
    
    for (const brick of this.bricks) {
      if (brick.checkCollision(ballX, ballY, ballRadius)) {
        const points = brick.getPoints()
        brick.destroy()
        hit = true
        
        // Вызываем callback при разрушении кирпича с количеством очков
        if (onBrickDestroyed) {
          onBrickDestroyed(points)
        }
        
        break // Только один кирпич за раз
      }
    }
    
    return hit
  }

  public resize(newSceneWidth: number, newSceneHeight: number): void {
    // Удаляем старые кирпичи
    this.bricks.forEach(brick => {
      this.container.removeChild(brick.graphics)
    })
    this.bricks = []
    
    // Обновляем размеры
    this.sceneWidth = newSceneWidth
    this.sceneHeight = newSceneHeight
    
    // Создаем новые кирпичи
    this.createBricks()
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
}
