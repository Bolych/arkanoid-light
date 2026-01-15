import { World } from '../World'
import type { System } from '../types'
import type { Entity } from '../entities/index.js'
import { GAME_CONFIG } from '../../constants'
import { getDarkerColor } from '../entities/factories/utils'

export class ResizeSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  /**
   * Заглушка для интерфейса System
   * ResizeSystem не обновляется каждый кадр, а вызывается по событию
   */
  public update(): void {
    // ResizeSystem обновляется только при вызове resize()
  }

  /**
   * Обновляет все сущности при изменении размера экрана
   */
  public resize(newWidth: number, newHeight: number): void {
    this.updateSceneBounds(newWidth, newHeight)
    this.updatePaddles(newWidth, newHeight)
    this.updateBalls(newWidth, newHeight)
    this.updateBricks(newWidth, newHeight)
  }

  /**
   * Обновляет границы сцены для всех сущностей
   */
  private updateSceneBounds(width: number, height: number): void {
    const entitiesWithBounds = this.world.with('sceneBounds')
    
    for (const entity of entitiesWithBounds) {
      entity.sceneBounds!.width = width
      entity.sceneBounds!.height = height
    }
  }

  /**
   * Обновляет размер и позицию платформы
   */
  private updatePaddles(width: number, height: number): void {
    const paddles = this.world.with('paddle', 'position', 'size', 'sceneBounds', 'visual')
    
    for (const paddle of paddles) {
      // Сохраняем относительную позицию
      const relativeX = paddle.position!.x / paddle.sceneBounds!.width
      
      // Вычисляем новые размеры
      const newWidth = width * GAME_CONFIG.PADDLE_WIDTH
      const newHeight = height * GAME_CONFIG.PADDLE_HEIGHT
      
      // Обновляем компоненты
      paddle.size!.width = newWidth
      paddle.size!.height = newHeight
      paddle.position!.x = relativeX * width
      paddle.position!.y = height * GAME_CONFIG.PADDLE_Y_POSITION
      
      // Перерисовываем графику
      this.redrawPaddleGraphics(paddle, newWidth, newHeight)
    }
  }

  /**
   * Обновляет позицию мяча
   */
  private updateBalls(width: number, height: number): void {
    const balls = this.world.with('ball', 'position', 'sceneBounds')
    
    for (const ball of balls) {
      // Сохраняем относительную позицию
      const relativeX = ball.position!.x / ball.sceneBounds!.width
      const relativeY = ball.position!.y / ball.sceneBounds!.height
      
      // Обновляем позицию
      ball.position!.x = relativeX * width
      ball.position!.y = relativeY * height
    }
  }

  /**
   * Обновляет размер и позицию всех кирпичей
   */
  private updateBricks(width: number, height: number): void {
    const bricks = this.world.with('brick', 'position', 'size', 'visual')
    
    // Вычисляем параметры сетки кирпичей
    const cols = GAME_CONFIG.BRICK_COLS
    const padding = GAME_CONFIG.BRICK_PADDING
    const offsetX = width * GAME_CONFIG.BRICK_OFFSET_X
    const offsetY = GAME_CONFIG.BRICK_OFFSET_TOP
    const totalPaddingX = padding * (cols + 1) + offsetX * 2
    const brickWidth = (width - totalPaddingX) / cols
    const brickHeight = height * GAME_CONFIG.BRICK_HEIGHT
    
    for (const brick of bricks) {
      // Вычисляем новую позицию на основе row и col
      const x = offsetX + padding + brick.brick!.col * (brickWidth + padding)
      const y = offsetY + padding + brick.brick!.row * (brickHeight + padding)
      
      // Обновляем компоненты
      brick.position!.x = x
      brick.position!.y = y
      brick.size!.width = brickWidth
      brick.size!.height = brickHeight
      
      // Перерисовываем графику
      this.redrawBrickGraphics(brick, brickWidth, brickHeight)
    }
  }

  /**
   * Перерисовывает графику платформы
   */
  private redrawPaddleGraphics(paddle: Entity, width: number, height: number): void {
    if (!paddle.visual) return
    
    const graphics = paddle.visual.graphics
    graphics.clear()
    graphics.roundRect(0, 0, width, height, 5)
    graphics.fill(GAME_CONFIG.PADDLE_COLOR)
  }

  /**
   * Перерисовывает графику кирпича
   */
  private redrawBrickGraphics(brick: Entity, width: number, height: number): void {
    if (!brick.visual || !brick.brick) return
    
    const graphics = brick.visual.graphics
    const color = brick.brick.color
    
    graphics.clear()
    graphics.roundRect(0, 0, width, height, 3)
    graphics.fill(color)
    
    // Добавляем более темную обводку
    const darkerColor = getDarkerColor(color)
    graphics.roundRect(0, 0, width, height, 3)
    graphics.stroke({ width: 2, color: darkerColor })
  }
}
