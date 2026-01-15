/**
 * Базовые типы и интерфейсы ECS
 */

/**
 * Базовый интерфейс системы
 */
export interface System {
  update(deltaTime?: number): void
}
