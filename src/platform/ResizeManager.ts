import type { Application } from 'pixi.js'
import type { World } from '../ecs/World'
import type { Entity } from '../ecs/entities/index.js'
import type { UIManager } from '../ui/UIManager.js'
import { InputSystem, ScoreUISystem } from '../ecs/systems'
import { SCENE_CONFIG } from '../constants'

type ResizeManagerDeps = {
  app: Application
  world: World<Entity>
  uiManager: UIManager
}

export class ResizeManager {
  private app: Application
  private world: World<Entity>
  private uiManager: UIManager
  private readonly handleResizeBound: () => void

  constructor({ app, world, uiManager }: ResizeManagerDeps) {
    this.app = app
    this.world = world
    this.uiManager = uiManager
    this.handleResizeBound = () => this.handleResize()
  }

  public static getGameSize(): { width: number; height: number } {
    const isMobile = window.innerWidth < SCENE_CONFIG.MOBILE_BREAKPOINT
    const isPortrait = window.innerHeight > window.innerWidth

    if (isMobile || isPortrait) {
      const width = Math.min(window.innerWidth, SCENE_CONFIG.MOBILE.MAX_WIDTH)
      const height = window.innerHeight
      return { width, height }
    }

    const maxWidth = SCENE_CONFIG.DESKTOP.MAX_WIDTH
    const maxHeight = SCENE_CONFIG.DESKTOP.MAX_HEIGHT
    const screenUsage = SCENE_CONFIG.DESKTOP_SCREEN_USAGE
    const aspectRatio = maxWidth / maxHeight

    let width = Math.min(window.innerWidth * screenUsage, maxWidth)
    let height = Math.min(window.innerHeight * screenUsage, maxHeight)

    if (width / height > aspectRatio) {
      width = height * aspectRatio
    } else {
      height = width / aspectRatio
    }

    return { width, height }
  }

  public setupEventListener(): void {
    window.addEventListener('resize', this.handleResizeBound)
  }

  public destroy(): void {
    window.removeEventListener('resize', this.handleResizeBound)
  }

  public apply(width: number, height: number): void {
    this.app.renderer.resize(width, height)
    this.updateResizeSystem(width, height)
    this.uiManager.resize(width, height)
    this.updateSystemDeps(width, height)
  }

  private handleResize(): void {
    const { width, height } = ResizeManager.getGameSize()
    this.apply(width, height)
  }

  private updateResizeSystem(width: number, height: number): void {
    const systems = this.world.getSystems()
    for (const system of systems) {
      if ('resize' in system && typeof system.resize === 'function') {
        system.resize(width, height)
      }
    }
  }

  private updateSystemDeps(width: number, height: number): void {
    const systems = this.world.getSystems()
    for (const system of systems) {
      if (system instanceof InputSystem) {
        system.resize(width, height)
      }
      if (system instanceof ScoreUISystem) {
        system.resize(width, height)
      }
    }
  }
}
