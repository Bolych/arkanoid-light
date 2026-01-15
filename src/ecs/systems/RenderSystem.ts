import { World } from '../World'
import type { Entity } from '../entities/index.js'

export class RenderSystem {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  public update(): void {
    // Обновляем позиции всех визуальных объектов
    const visualQuery = this.world.with('visual', 'position')

    for (const entity of visualQuery) {
      const graphics = entity.visual!.graphics
      const pos = entity.position!
      
      graphics.x = pos.x
      graphics.y = pos.y
    }
  }
}
