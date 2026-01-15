export type GameStateType = 'PLAYER_INPUT' | 'PLAYING' | 'GAME_OVER'

export interface GameState {
  state: GameStateType
  playerName: string
}
