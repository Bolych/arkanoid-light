/**
 * Централизованный экспорт всех ECS-компонентов
 */

// Базовые компоненты
export type { Position } from './base/Position'
export type { Velocity } from './base/Velocity'
export type { Size } from './base/Size'
export type { Radius } from './base/Radius'

// Игровые компоненты
export type { Paddle } from './gameplay/Paddle'
export type { Ball } from './gameplay/Ball'
export type { Brick } from './gameplay/Brick'
export type { KeyboardInput } from './gameplay/KeyboardInput'
export type { SceneBounds } from './gameplay/SceneBounds'
export type { Collision, CollisionTag } from './gameplay/Collision'

// Визуальные компоненты
export type { Visual } from './visual/Visual'
export type { UIElement } from './visual/UIElement'

// Компоненты состояния
export type { GameState, GameStateType } from './state/GameState'
export type { Score } from './state/Score'

// Команды
export type { LaunchCommand } from './commands/LaunchCommand'
