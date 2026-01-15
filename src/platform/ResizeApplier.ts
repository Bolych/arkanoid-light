import type { Application } from 'pixi.js'
import type { World } from '../ecs/World'
import type { Entity } from '../ecs/entities/index.js'
import type { UIManager } from '../ui/UIManager.js'
import { InputSystem, ScoreUISystem } from '../ecs/systems'

type ResizeApplierDeps = {
  app: Application
  world: World<Entity>
  uiManager: UIManager
}

export class ResizeApplier {
  private app: Application
  private world: World<Entity>
  private uiManager: UIManager

  constructor({ app, world, uiManager }: ResizeApplierDeps) {
    this.app = app
    this.world = world
    this.uiManager = uiManager
  }

  public apply(width: number, height: number): void {
    this.app.renderer.resize(width, height)

    this.updateResizeSystem(width, height)
    
    this.uiManager.resize(width, height)
    
    this.updateSystemDeps(width, height)
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
        system.resize(width)
      }
      if (system instanceof ScoreUISystem) {
        system.resize(width, height)
      }
    }
  }
}
