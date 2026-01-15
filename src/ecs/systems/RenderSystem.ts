import { World } from '../World'
import type { System } from '../types'
import type { Entity } from '../entities/index.js'

export class RenderSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  public update(): void {
    const visualQuery = this.world.with('visual', 'position')

    for (const entity of visualQuery) {
      const graphics = entity.visual!.graphics
      const pos = entity.position!
      
      graphics.x = pos.x
      graphics.y = pos.y
    }
  }
}