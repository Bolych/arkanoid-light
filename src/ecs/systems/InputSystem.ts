import { World, type System } from '../World'
import type { Entity } from '../entities/index.js'
import { UI_LAYOUT } from '../../constants'

interface InputEvent {
  type: 'keydown' | 'keyup' | 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerleave'
  key?: string
  clientX?: number
  clientY?: number
}

export class InputSystem implements System {
  private world: World<Entity>
  private canvasElement: HTMLCanvasElement
  private sceneWidth: number
  private sceneHeight: number
  private inputBuffer: InputEvent[] = []

  constructor(world: World<Entity>, canvas: HTMLCanvasElement, sceneWidth: number, sceneHeight: number) {
    this.world = world
    this.canvasElement = canvas
    this.sceneWidth = sceneWidth
    this.sceneHeight = sceneHeight
    this.setupEventListeners()
  }

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
      this.inputBuffer.push({ type: 'pointerdown', clientX: touch.clientX, clientY: touch.clientY })
      this.inputBuffer.push({ type: 'pointermove', clientX: touch.clientX, clientY: touch.clientY })
    })

    this.canvasElement.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      this.inputBuffer.push({ type: 'pointermove', clientX: touch.clientX, clientY: touch.clientY })
    })

    this.canvasElement.addEventListener('touchend', () => {
      this.inputBuffer.push({ type: 'pointerup' })
    })

    this.canvasElement.addEventListener('mousedown', (e) => {
      this.inputBuffer.push({ type: 'pointerdown', clientX: e.clientX, clientY: e.clientY })
      this.inputBuffer.push({ type: 'pointermove', clientX: e.clientX, clientY: e.clientY })
    })

    this.canvasElement.addEventListener('mousemove', (e) => {
      this.inputBuffer.push({ type: 'pointermove', clientX: e.clientX, clientY: e.clientY })
    })

    this.canvasElement.addEventListener('mouseup', () => {
      this.inputBuffer.push({ type: 'pointerup' })
    })

    this.canvasElement.addEventListener('mouseleave', () => {
      this.inputBuffer.push({ type: 'pointerleave' })
    })
  }

  public update(): void {
    const paddleQuery = this.world.with('paddle', 'keyboardInput', 'size')

    for (const event of this.inputBuffer) {
      for (const entity of paddleQuery) {
        this.processEvent(entity, event)
      }
    }

    this.inputBuffer = []
  }

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
        if (!this.isPointerInGameArea(event.clientY)) {
          return
        }
        if (event.clientX !== undefined && paddle.isMouseDown) {
          const targetX = this.calculateTargetX(event.clientX, size.width)
          paddle.touchTargetX = targetX
        }
        break

      case 'pointerdown':
        if (!this.isPointerInGameArea(event.clientY)) {
          return
        }
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

  private calculateTargetX(clientX: number, paddleWidth: number): number {
    const rect = this.canvasElement.getBoundingClientRect()
    const canvasX = clientX - rect.left
    const scaleX = this.sceneWidth / rect.width
    
    return canvasX * scaleX - paddleWidth / 2
  }

  private isPointerInGameArea(clientY?: number): boolean {
    if (clientY === undefined) {
      return true
    }
    const rect = this.canvasElement.getBoundingClientRect()
    if (clientY < rect.top || clientY > rect.bottom) {
      return false
    }
    const canvasY = (clientY - rect.top) * (this.sceneHeight / rect.height)
    return canvasY > UI_LAYOUT.SCORE_PANEL_HEIGHT
  }

  public resize(newSceneWidth: number, newSceneHeight: number): void {
    this.sceneWidth = newSceneWidth
    this.sceneHeight = newSceneHeight
  }
}
