import { World } from '../World'
import type { System } from '../types'
import type { Entity } from '../entities/index.js'

interface InputEvent {
  type: 'keydown' | 'keyup' | 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerleave'
  key?: string
  clientX?: number
}

/**
 * Система ввода
 * Собирает события в буфер и обрабатывает их в игровом цикле
 */
export class InputSystem implements System {
  private world: World<Entity>
  private canvasElement: HTMLCanvasElement
  private sceneWidth: number
  private inputBuffer: InputEvent[] = []

  constructor(world: World<Entity>, canvas: HTMLCanvasElement, sceneWidth: number) {
    this.world = world
    this.canvasElement = canvas
    this.sceneWidth = sceneWidth
    this.setupEventListeners()
  }

  /**
   * Настраивает обработчики событий (только сбор в буфер)
   */
  private setupEventListeners(): void {

    window.addEventListener('keydown', (e) => {
      if (e.code !== 'Space' && e.key !== ' ') {
        this.inputBuffer.push({ type: 'keydown', key: e.code })
      }
    })

    window.addEventListener('keyup', (e) => {
      if (e.code !== 'Space' && e.key !== ' ') {
        this.inputBuffer.push({ type: 'keyup', key: e.code })
      }
    })

    this.canvasElement.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      this.inputBuffer.push({ type: 'pointerdown', clientX: touch.clientX })
      this.inputBuffer.push({ type: 'pointermove', clientX: touch.clientX })
    })

    this.canvasElement.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      this.inputBuffer.push({ type: 'pointermove', clientX: touch.clientX })
    })

    this.canvasElement.addEventListener('touchend', () => {
      this.inputBuffer.push({ type: 'pointerup' })
    })

    this.canvasElement.addEventListener('mousedown', (e) => {
      this.inputBuffer.push({ type: 'pointerdown', clientX: e.clientX })
      this.inputBuffer.push({ type: 'pointermove', clientX: e.clientX })
    })

    this.canvasElement.addEventListener('mousemove', (e) => {
      this.inputBuffer.push({ type: 'pointermove', clientX: e.clientX })
    })

    this.canvasElement.addEventListener('mouseup', () => {
      this.inputBuffer.push({ type: 'pointerup' })
    })

    this.canvasElement.addEventListener('mouseleave', () => {
      this.inputBuffer.push({ type: 'pointerleave' })
    })
  }

  /**
   * Обновление системы - обрабатывает накопленные события
   */
  public update(): void {
    const paddleQuery = this.world.with('paddle', 'keyboardInput', 'size')

    // Обрабатываем все события из буфера
    for (const event of this.inputBuffer) {
      for (const entity of paddleQuery) {
        this.processEvent(entity, event)
      }
    }

    this.inputBuffer = []
  }

  /**
   * Обрабатывает одно событие для сущности
   */
  private processEvent(entity: Entity, event: InputEvent): void {
    const paddle = entity.paddle!
    const keyboardInput = entity.keyboardInput!
    const size = entity.size!

    switch (event.type) {
      case 'keydown':
        if (event.key) {
          keyboardInput.keys[event.key] = true
        }
        break

      case 'keyup':
        if (event.key) {
          keyboardInput.keys[event.key] = false
        }
        break

      case 'pointermove':
        if (event.clientX !== undefined && paddle.isMouseDown) {
          const targetX = this.calculateTargetX(event.clientX, size.width)
          paddle.touchTargetX = targetX
        }
        break

      case 'pointerdown':
        paddle.isMouseDown = true
        if (event.clientX !== undefined) {
          const targetX = this.calculateTargetX(event.clientX, size.width)
          paddle.touchTargetX = targetX
        }
        break

      case 'pointerup':
      case 'pointerleave':
        paddle.isMouseDown = false
        paddle.touchTargetX = null
        break
    }
  }

  /**
   * Вычисляет целевую X позицию для платформы на основе clientX
   */
  private calculateTargetX(clientX: number, paddleWidth: number): number {
    const rect = this.canvasElement.getBoundingClientRect()
    const canvasX = clientX - rect.left
    const scaleX = this.sceneWidth / rect.width
    
    return canvasX * scaleX - paddleWidth / 2
  }

  public resize(newSceneWidth: number): void {
    this.sceneWidth = newSceneWidth
  }
}
