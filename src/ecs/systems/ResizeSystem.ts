import { World, type System } from '../World'
import type { Entity } from '../entities/index.js'
import { GAME_CONFIG } from '../../constants'

export class ResizeSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  public update(): void {
  }

  public resize(newWidth: number, newHeight: number): void {
    this.updateSceneBounds(newWidth, newHeight)
    this.updatePaddles(newWidth, newHeight)
    this.updateBalls(newWidth, newHeight)
    this.updateBricks(newWidth, newHeight)
  }

  private updateSceneBounds(width: number, height: number): void {
    const entitiesWithBounds = this.world.with('sceneBounds')
    
    for (const entity of entitiesWithBounds) {
      entity.sceneBounds!.width = width
      entity.sceneBounds!.height = height
    }
  }

  private updatePaddles(width: number, height: number): void {
    const paddles = this.world.with('paddle', 'position', 'size', 'sceneBounds', 'visual')
    
    for (const paddle of paddles) {
      const relativeX = paddle.position!.x / paddle.sceneBounds!.width
      
      const newWidth = width * GAME_CONFIG.PADDLE_WIDTH
      const newHeight = height * GAME_CONFIG.PADDLE_HEIGHT
      
      paddle.size!.width = newWidth
      paddle.size!.height = newHeight
      paddle.position!.x = relativeX * width
      paddle.position!.y = height * GAME_CONFIG.PADDLE_Y_POSITION
      
      this.redrawPaddleGraphics(paddle, newWidth, newHeight)
    }
  }

  private updateBalls(width: number, height: number): void {
    const balls = this.world.with('ball', 'position', 'sceneBounds')
    
    for (const ball of balls) {
      const relativeX = ball.position!.x / ball.sceneBounds!.width
      const relativeY = ball.position!.y / ball.sceneBounds!.height
      
      ball.position!.x = relativeX * width
      ball.position!.y = relativeY * height
    }
  }

  private updateBricks(width: number, height: number): void {
    const bricks = this.world.with('brick', 'position', 'size', 'visual')
    
    const cols = GAME_CONFIG.BRICK_COLS
    const padding = GAME_CONFIG.BRICK_PADDING
    const offsetX = width * GAME_CONFIG.BRICK_OFFSET_X
    const offsetY = GAME_CONFIG.BRICK_OFFSET_TOP
    const totalPaddingX = padding * (cols + 1) + offsetX * 2
    const brickWidth = (width - totalPaddingX) / cols
    const brickHeight = height * GAME_CONFIG.BRICK_HEIGHT
    
    for (const brick of bricks) {
      const x = offsetX + padding + brick.brick!.col * (brickWidth + padding)
      const y = offsetY + padding + brick.brick!.row * (brickHeight + padding)
      
      brick.position!.x = x
      brick.position!.y = y
      brick.size!.width = brickWidth
      brick.size!.height = brickHeight
      
      this.redrawBrickGraphics(brick, brickWidth, brickHeight)
    }
  }

  private redrawPaddleGraphics(paddle: Entity, width: number, height: number): void {
    if (!paddle.visual) return
    
    const graphics = paddle.visual.graphics
    graphics.clear()
    graphics.roundRect(0, 0, width, height, 5)
    graphics.fill(GAME_CONFIG.PADDLE_COLOR)
    graphics.roundRect(0, 0, width, height, 5)
    graphics.stroke({
      width: GAME_CONFIG.PADDLE_STROKE_WIDTH,
      color: GAME_CONFIG.PADDLE_STROKE_COLOR
    })
  }

  private redrawBrickGraphics(brick: Entity, width: number, height: number): void {
    if (!brick.visual || !brick.brick) return
    
    const graphics = brick.visual.graphics
    const color = brick.brick.color
    
    graphics.clear()
    graphics.roundRect(0, 0, width, height, 3)
    graphics.fill(color)
    
    graphics.roundRect(0, 0, width, height, 3)
    graphics.stroke({
      width: 2,
      color: GAME_CONFIG.BRICK_STROKE_COLOR,
      alpha: GAME_CONFIG.BRICK_STROKE_ALPHA
    })
  }
}
