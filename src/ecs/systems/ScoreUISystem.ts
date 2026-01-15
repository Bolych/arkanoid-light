import { World, type System } from '../World'
import type { Entity } from '../entities/index.js'
import { Text, Graphics } from 'pixi.js'
import { GAME_CONFIG, UI_LAYOUT } from '../../constants'

export class ScoreUISystem implements System {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  public update(): void {
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
