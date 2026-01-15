import { World } from '../World'

export type {
  Position,
  Velocity,
  Size,
  Radius,
  Paddle,
  Ball,
  Brick,
  KeyboardInput,
  SceneBounds,
  Collision,
  CollisionTag,
  Visual,
  UIElement,
  GameState,
  GameStateType,
  Score,
  LaunchCommand
} from '../components/index.js'

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
  score?: Score
  uiElement?: UIElement
}

export const world = new World<Entity>()
