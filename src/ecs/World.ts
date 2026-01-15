export type System = { update(deltaTime?: number): void }

export class World<T extends Record<string, any>> {
  private entities: T[] = []
  private systems: System[] = []
  
  add(components: Partial<T>): T {
    const entity = components as T
    this.entities.push(entity)
    return entity
  }
  
  remove(entity: T): void {
    const index = this.entities.indexOf(entity)
    if (index > -1) {
      this.entities.splice(index, 1)
    }
  }
  
  with<K extends keyof T>(...componentNames: K[]): T[] {
    return this.entities.filter(entity =>
      componentNames.every(name => entity[name] !== undefined)
    )
  }
  
  addComponent<K extends keyof T>(entity: T, name: K, value: T[K]): void {
    entity[name] = value
  }
  
  removeComponent<K extends keyof T>(entity: T, name: K): void {
    delete entity[name]
  }
  
  all(): T[] {
    return this.entities
  }
  
  count(): number {
    return this.entities.length
  }
  
  clear(): void {
    this.entities = []
  }

  addSystem(system: System): void {
    this.systems.push(system)
  }

  removeSystem(system: System): void {
    const index = this.systems.indexOf(system)
    if (index > -1) {
      this.systems.splice(index, 1)
    }
  }

  update(deltaTime?: number): void {
    for (const system of this.systems) {
      system.update(deltaTime)
    }
  }

  getSystems(): System[] {
    return this.systems
  }
}
