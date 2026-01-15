import { World } from 'miniplex'
import type { Entity } from '../entities/index.js'

export class InputSystem {
  private world: World<Entity>
  private canvasElement: HTMLCanvasElement
  private sceneWidth: number

  constructor(world: World<Entity>, canvas: HTMLCanvasElement, sceneWidth: number) {
    this.world = world
    this.canvasElement = canvas
    this.sceneWidth = sceneWidth
    this.setupControls()
  }

  private setupControls(): void {
    const paddleQuery = this.world.with('paddle', 'keyboardInput')

    // Клавиатура
    window.addEventListener('keydown', (e) => {
      for (const entity of paddleQuery) {
        entity.keyboardInput!.keys[e.code] = true
      }
    })

    window.addEventListener('keyup', (e) => {
      for (const entity of paddleQuery) {
        entity.keyboardInput!.keys[e.code] = false
      }
    })

    // Тачскрин и мышь
    this.canvasElement.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      this.handlePointerMove(touch.clientX)
    })

    this.canvasElement.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      this.handlePointerMove(touch.clientX)
    })

    this.canvasElement.addEventListener('touchend', () => {
      for (const entity of paddleQuery) {
        entity.paddle!.touchTargetX = null
      }
    })

    this.canvasElement.addEventListener('mousedown', (e) => {
      for (const entity of paddleQuery) {
        entity.paddle!.isMouseDown = true
      }
      this.handlePointerMove(e.clientX)
    })

    this.canvasElement.addEventListener('mousemove', (e) => {
      for (const entity of paddleQuery) {
        if (entity.paddle!.isMouseDown) {
          this.handlePointerMove(e.clientX)
        }
      }
    })

    this.canvasElement.addEventListener('mouseup', () => {
      for (const entity of paddleQuery) {
        entity.paddle!.isMouseDown = false
        entity.paddle!.touchTargetX = null
      }
    })

    this.canvasElement.addEventListener('mouseleave', () => {
      for (const entity of paddleQuery) {
        entity.paddle!.isMouseDown = false
        entity.paddle!.touchTargetX = null
      }
    })
  }

  private handlePointerMove(clientX: number): void {
    const rect = this.canvasElement.getBoundingClientRect()
    const canvasX = clientX - rect.left
    const scaleX = this.sceneWidth / rect.width
    
    const paddleQuery = this.world.with('paddle', 'size')
    for (const entity of paddleQuery) {
      entity.paddle!.touchTargetX = canvasX * scaleX - entity.size!.width / 2
    }
  }

  public resize(newSceneWidth: number): void {
    this.sceneWidth = newSceneWidth
  }
}
