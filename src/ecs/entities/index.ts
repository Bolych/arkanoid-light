import { World } from '../World'

// Импортируем все компоненты из централизованной папки
export type {
  // Базовые
  Position,
  Velocity,
  Size,
  Radius,
  // Игровые
  Paddle,
  Ball,
  Brick,
  KeyboardInput,
  SceneBounds,
  Collision,
  CollisionTag,
  // Визуальные
  Visual,
  UIElement,
  // Состояние
  GameState,
  GameStateType,
  Score,
  // Команды
  LaunchCommand
} from '../components/index.js'

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
  score?: Score
  uiElement?: UIElement
}

// Создаем мир Miniplex
export const world = new World<Entity>()
