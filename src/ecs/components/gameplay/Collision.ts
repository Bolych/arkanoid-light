export type CollisionTag = 'paddle' | 'ball' | 'brick' | 'wall'

export interface Collision {
  tags: CollisionTag[]
}
