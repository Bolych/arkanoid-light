/**
 * Типы состояний игры
 */
export type GameStateType = 'PLAYER_INPUT' | 'PLAYING' | 'GAME_OVER'

/**
 * Компонент глобального состояния игры
 */
export interface GameState {
  /** Текущее состояние игрового процесса */
  state: GameStateType
  /** Имя игрока */
  playerName: string
}
