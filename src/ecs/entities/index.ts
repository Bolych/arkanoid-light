import { World } from 'miniplex'
import type { Graphics } from 'pixi.js'

// Переопределяем типы компонентов локально
export interface Position {
  x: number
  y: number
}

export interface Velocity {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Radius {
  value: number
}

export interface Visual {
  graphics: Graphics
}

export interface Paddle {
  speed: number
  touchTargetX: number | null
  isMouseDown: boolean
}

export interface Ball {
  isLaunched: boolean
}

export interface Brick {
  points: number
  color: number
  isDestroyed: boolean
  row: number
  col: number
}

export interface KeyboardInput {
  keys: { [key: string]: boolean }
}

export interface SceneBounds {
  width: number
  height: number
}

export type CollisionTag = 'paddle' | 'ball' | 'brick' | 'wall'

export interface Collision {
  tags: CollisionTag[]
}

export interface LaunchCommand {}

// Определяем тип сущности
export type Entity = {
  position?: Position
  velocity?: Velocity
  size?: Size
  radius?: Radius
  visual?: Visual
  paddle?: Paddle
  ball?: Ball
  brick?: Brick
  keyboardInput?: KeyboardInput
  sceneBounds?: SceneBounds
  collision?: Collision
  launchCommand?: LaunchCommand
}

// Создаем мир Miniplex
export const world = new World<Entity>()
