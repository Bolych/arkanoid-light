import { World, type System } from '../World'
import type { Entity } from '../components'
import { GAME_CONFIG, UI_LAYOUT } from '../../constants'

interface InputEvent {
  type: 'keydown' | 'keyup' | 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerleave'
  key?: string
  clientX?: number
  clientY?: number
}

export class MovementSystem implements System {
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

  public update(deltaTime?: number): void {
    this.processInput()
    this.updatePaddleMovement(deltaTime)
    this.updateBallMovement(deltaTime)
    this.processBallLaunch()
  }

  private processInput(): void {
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

  private updatePaddleMovement(deltaTime?: number): void {
    const timeScale = deltaTime ? deltaTime / 16.6667 : 1
    const paddleQuery = this.world.with('paddle', 'position', 'size', 'keyboardInput', 'sceneBounds')

    for (const entity of paddleQuery) {
      const paddle = entity.paddle!
      const position = entity.position!
      const size = entity.size!
      const keys = entity.keyboardInput!.keys
      const bounds = entity.sceneBounds!

      if (paddle.touchTargetX !== null) {
        const diff = paddle.touchTargetX - position.x
        const moveSpeed = paddle.speed * 1.5 * timeScale

        if (Math.abs(diff) > 2) {
          if (diff > 0) {
            position.x += Math.min(moveSpeed, diff)
          } else {
            position.x += Math.max(-moveSpeed, diff)
          }
        } else {
          position.x = paddle.touchTargetX
        }
      } else {
        if (keys['ArrowLeft'] || keys['KeyA']) {
          position.x -= paddle.speed * timeScale
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
          position.x += paddle.speed * timeScale
        }
      }

      if (position.x < 0) {
        position.x = 0
      }
      if (position.x + size.width > bounds.width) {
        position.x = bounds.width - size.width
      }
    }
  }

  private updateBallMovement(deltaTime?: number): void {
    const timeScale = deltaTime ? deltaTime / 16.6667 : 1
    const ballQuery = this.world.with('ball', 'position', 'velocity', 'radius', 'sceneBounds')
    const paddleQuery = this.world.with('paddle', 'position', 'size')

    for (const ball of ballQuery) {
      const ballComp = ball.ball!
      const pos = ball.position!
      const vel = ball.velocity!
      const radius = ball.radius!.value
      const bounds = ball.sceneBounds!

      if (!ballComp.isLaunched) {
        for (const paddle of paddleQuery) {
          const paddlePos = paddle.position!
          const paddleSize = paddle.size!
          pos.x = paddlePos.x + paddleSize.width / 2
          pos.y = paddlePos.y - radius - 2
        }
        continue
      }

      pos.x += vel.x * timeScale
      pos.y += vel.y * timeScale

      if (pos.x - radius <= 0) {
        pos.x = radius
        vel.x = Math.abs(vel.x)
      } else if (pos.x + radius >= bounds.width) {
        pos.x = bounds.width - radius
        vel.x = -Math.abs(vel.x)
      }

      if (pos.y - radius <= 0) {
        pos.y = radius
        vel.y = Math.abs(vel.y)
      }
    }
  }

  private processBallLaunch(): void {
    const ballsToLaunch = this.world.with('ball', 'velocity', 'launchCommand')

    for (const ball of ballsToLaunch) {
      if (!ball.ball!.isLaunched) {
        this.launchBall(ball)
      }

      this.world.removeComponent(ball, 'launchCommand')
    }
  }

  private launchBall(ball: Entity): void {
    ball.ball!.isLaunched = true
    
    const randomDirection = Math.random() > 0.5 ? 1 : -1
    
    ball.velocity!.x = GAME_CONFIG.BALL_SPEED * randomDirection * 0.7
    ball.velocity!.y = -GAME_CONFIG.BALL_SPEED
  }

  public resize(newSceneWidth: number, newSceneHeight: number): void {
    this.sceneWidth = newSceneWidth
    this.sceneHeight = newSceneHeight
  }
}
