import type { Graphics, Container } from 'pixi.js'

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

export interface UIElement {
  container: Container
}

export interface Ball {
  isLaunched: boolean
}

export interface Paddle {
  speed: number
  touchTargetX: number | null
  isMouseDown: boolean
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

export type GameStateType = 'PLAYER_INPUT' | 'PLAYING' | 'GAME_OVER'

export interface GameState {
  state: GameStateType
  playerName: string
}

export interface Score {
  value: number
  playerName: string
}

export interface LaunchCommand {}

export type Entity = {
  position?: Position
  velocity?: Velocity
  size?: Size
  radius?: Radius
  visual?: Visual
  uiElement?: UIElement
  paddle?: Paddle
  ball?: Ball
  brick?: Brick
  keyboardInput?: KeyboardInput
  sceneBounds?: SceneBounds
  collision?: Collision
  gameState?: GameState
  score?: Score
  launchCommand?: LaunchCommand
}
