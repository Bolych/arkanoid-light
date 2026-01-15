/**
 * Типы коллизий
 */
export type CollisionTag = 'paddle' | 'ball' | 'brick' | 'wall'

/**
 * Компонент коллизии
 */
export interface Collision {
  /** Теги для определения типов коллизий */
  tags: CollisionTag[]
}
