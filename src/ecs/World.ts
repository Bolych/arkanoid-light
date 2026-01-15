import type { System } from './types'

// Реэкспортируем System для удобства
export type { System }

/**
 * Простая и эффективная реализация ECS World
 * Управляет сущностями, системами и предоставляет запросы по компонентам
 */
export class World<T extends Record<string, any>> {
  private entities: T[] = []
  private systems: System[] = []
  
  /**
   * Создает новую сущность с указанными компонентами
   * @param components - Набор компонентов для сущности
   * @returns Созданная сущность
   */
  add(components: Partial<T>): T {
    const entity = components as T
    this.entities.push(entity)
    return entity
  }
  
  /**
   * Удаляет сущность из мира
   * @param entity - Сущность для удаления
   */
  remove(entity: T): void {
    const index = this.entities.indexOf(entity)
    if (index > -1) {
      this.entities.splice(index, 1)
    }
  }
  
  /**
   * Возвращает все сущности, имеющие указанные компоненты
   * @param componentNames - Названия компонентов для фильтрации
   * @returns Массив сущностей для итерации
   */
  with<K extends keyof T>(...componentNames: K[]): T[] {
    return this.entities.filter(entity =>
      componentNames.every(name => entity[name] !== undefined)
    )
  }
  
  /**
   * Добавляет компонент к существующей сущности
   * @param entity - Сущность
   * @param name - Название компонента
   * @param value - Значение компонента
   */
  addComponent<K extends keyof T>(entity: T, name: K, value: T[K]): void {
    entity[name] = value
  }
  
  /**
   * Удаляет компонент из сущности
   * @param entity - Сущность
   * @param name - Название компонента
   */
  removeComponent<K extends keyof T>(entity: T, name: K): void {
    delete entity[name]
  }
  
  /**
   * Возвращает все сущности в мире
   * @returns Массив всех сущностей
   */
  all(): T[] {
    return this.entities
  }
  
  /**
   * Возвращает количество сущностей в мире
   * @returns Количество сущностей
   */
  count(): number {
    return this.entities.length
  }
  
  /**
   * Очищает мир, удаляя все сущности
   */
  clear(): void {
    this.entities = []
  }

  /**
   * Добавляет систему в мир
   * @param system - Система для добавления
   */
  addSystem(system: System): void {
    this.systems.push(system)
  }

  /**
   * Удаляет систему из мира
   * @param system - Система для удаления
   */
  removeSystem(system: System): void {
    const index = this.systems.indexOf(system)
    if (index > -1) {
      this.systems.splice(index, 1)
    }
  }

  /**
   * Обновляет все системы
   * @param deltaTime - Время с прошлого кадра (опционально)
   */
  update(deltaTime?: number): void {
    for (const system of this.systems) {
      system.update(deltaTime)
    }
  }

  /**
   * Возвращает все системы
   * @returns Массив систем
   */
  getSystems(): System[] {
    return this.systems
  }
}
