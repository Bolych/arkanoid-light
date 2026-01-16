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
    this.entities = this.entities.filter(e => e !== entity)
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
    this.systems = this.systems.filter(s => s !== system)
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
