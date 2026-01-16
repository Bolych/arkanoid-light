import { World, type System } from '../World'
import type { Entity, GameStateType } from '../components'
import { Text, Graphics } from 'pixi.js'
import { GAME_CONFIG, UI_LAYOUT } from '../../constants'

export class GameSystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  public update(): void {
    this.updateScoreUI()
  }

  public getState(): GameStateType {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      return entity.gameState!.state
    }

    return 'PLAYER_INPUT'
  }

  public setState(newState: GameStateType): void {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      entity.gameState!.state = newState
    }
  }

  public setPlayerName(name: string): void {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      entity.gameState!.playerName = name
    }
    
    const scoreEntities = this.world.with('score')
    for (const entity of scoreEntities) {
      entity.score!.playerName = name
    }
  }

  public getPlayerName(): string {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      return entity.gameState!.playerName
    }

    return ''
  }

  public startNewGame(): void {
    const stateEntities = this.world.with('gameState')

    for (const entity of stateEntities) {
      entity.gameState!.state = 'PLAYER_INPUT'
      entity.gameState!.playerName = ''
    }
  }

  public startPlaying(): void {
    this.setState('PLAYING')
  }

  public endGame(): void {
    this.setState('GAME_OVER')
  }

  public isPlaying(): boolean {
    return this.getState() === 'PLAYING'
  }

  public addPoints(points: number): void {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      entity.score!.value += points
    }
  }

  public getScore(): number {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      return entity.score!.value
    }

    return 0
  }

  public resetScore(): void {
    const scoreEntities = this.world.with('score')

    for (const entity of scoreEntities) {
      entity.score!.value = 0
    }
  }

  private updateScoreUI(): void {
    const scoreEntities = this.world.with('score', 'uiElement', 'sceneBounds')

    for (const entity of scoreEntities) {
      const score = entity.score!
      const container = entity.uiElement!.container
      const bounds = entity.sceneBounds!

      const playerNameText = container.children[1] as Text
      const scoreText = container.children[2] as Text

      const newPlayerText = score.playerName ? `Игрок: ${score.playerName}` : ''
      if (playerNameText.text !== newPlayerText) {
        playerNameText.text = newPlayerText
      }

      const newScoreText = `Очки: ${score.value}`
      if (scoreText.text !== newScoreText) {
        scoreText.text = newScoreText
        scoreText.x = bounds.width - scoreText.width - 15
      }
    }
  }

  public resize(newWidth: number, newHeight: number): void {
    const scoreEntities = this.world.with('score', 'uiElement', 'sceneBounds')

    for (const entity of scoreEntities) {
      const container = entity.uiElement!.container
      
      entity.sceneBounds!.width = newWidth
      entity.sceneBounds!.height = newHeight

      const background = container.children[0] as Graphics
      background.clear()
      background.rect(0, 0, newWidth, UI_LAYOUT.SCORE_PANEL_HEIGHT)
      background.fill({
        color: GAME_CONFIG.SCORE_PANEL_COLOR,
        alpha: GAME_CONFIG.SCORE_PANEL_ALPHA
      })

      const scoreText = container.children[2] as Text
      scoreText.x = newWidth - scoreText.width - 15
    }
  }
}
