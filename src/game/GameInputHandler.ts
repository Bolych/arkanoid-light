import type { Application } from 'pixi.js'
import type { World } from '../ecs/World'
import type { Entity } from '../ecs/components'
import { UI_LAYOUT } from '../constants'

export class GameInputHandler {
  private world: World<Entity>
  private app: Application
  private onRestartGame?: () => void
  private getGameState?: () => string
  
  private handleKeyDownBound = this.handleKeyDown.bind(this)
  private handleTouchStartBound = this.handleTouchStart.bind(this)
  private handleClickBound = this.handleClick.bind(this)

  constructor(
    world: World<Entity>,
    app: Application,
    onRestartGame?: () => void,
    getGameState?: () => string
  ) {
    this.world = world
    this.app = app
    this.onRestartGame = onRestartGame
    this.getGameState = getGameState
  }

  public setupEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDownBound)
    window.addEventListener('touchstart', this.handleTouchStartBound)
    window.addEventListener('click', this.handleClickBound)
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDownBound)
    window.removeEventListener('touchstart', this.handleTouchStartBound)
    window.removeEventListener('click', this.handleClickBound)
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault()
      this.handleGameCommand()
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    const target = e.target as HTMLElement
    if (target.closest('.modal')) {
      return
    }

    const touch = e.touches[0]
    if (!touch || !this.isPointerInGameArea(touch.clientX, touch.clientY)) {
      return
    }

    this.handleGameCommand()
  }

  private handleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement
    if (target.closest('.modal')) {
      return
    }

    if (!this.isPointerInGameArea(e.clientX, e.clientY)) {
      return
    }

    this.handleGameCommand()
  }

  private handleGameCommand(): void {
    if (!this.getGameState) return

    const state = this.getGameState()

    if (state === 'PLAYING') {
      this.requestBallLaunch()
    } else if (state === 'GAME_OVER' && this.onRestartGame) {
      this.onRestartGame()
    }
  }

  private requestBallLaunch(): void {
    const balls = this.world.with('ball', 'velocity')
    if (balls.length > 0 && !balls[0].launchCommand) {
      this.world.addComponent(balls[0], 'launchCommand', {})
    }
  }

  private isPointerInGameArea(clientX: number, clientY: number): boolean {
    const rect = this.app.canvas.getBoundingClientRect()
    if (
      clientX < rect.left
      || clientX > rect.right
      || clientY < rect.top
      || clientY > rect.bottom
    ) {
      return false
    }

    const scaleY = this.app.screen.height / rect.height
    const canvasY = (clientY - rect.top) * scaleY
    return canvasY > UI_LAYOUT.SCORE_PANEL_HEIGHT
  }
}
