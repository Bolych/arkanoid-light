export type GameState = 'PLAYER_INPUT' | 'PLAYING' | 'GAME_OVER'

export class GameStateManager {
  private state: GameState = 'PLAYER_INPUT'
  private playerName: string = ''

  public getState(): GameState {
    return this.state
  }

  public setState(newState: GameState): void {
    this.state = newState
  }

  public setPlayerName(name: string): void {
    this.playerName = name
  }

  public getPlayerName(): string {
    return this.playerName
  }

  public startNewGame(): void {
    this.setState('PLAYER_INPUT')
    this.playerName = ''
  }

  public startPlaying(): void {
    this.setState('PLAYING')
  }

  public endGame(): void {
    this.setState('GAME_OVER')
  }

  public isPlaying(): boolean {
    return this.state === 'PLAYING'
  }
}
