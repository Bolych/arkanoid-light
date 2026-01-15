import { World } from '../World'
import type { Entity } from '../entities/index.js'
import { Text, Graphics } from 'pixi.js'

/**
 * Система визуализации счета
 * Обновляет UI элементы на основе компонента Score
 */
export class ScoreUISystem {
  private world: World<Entity>

  constructor(world: World<Entity>) {
    this.world = world
  }

  /**
   * Обновляет UI счета
   */
  public update(): void {
    const scoreEntities = this.world.with('score', 'uiElement', 'sceneBounds')

    for (const entity of scoreEntities) {
      const score = entity.score!
      const container = entity.uiElement!.container
      const bounds = entity.sceneBounds!

      // Получаем UI элементы из контейнера
      const playerNameText = container.children[1] as Text  // Второй child - текст имени
      const scoreText = container.children[2] as Text       // Третий child - текст счета

      // Обновляем текст имени игрока
      const newPlayerText = score.playerName ? `Игрок: ${score.playerName}` : ''
      if (playerNameText.text !== newPlayerText) {
        playerNameText.text = newPlayerText
      }

      // Обновляем текст счета
      const newScoreText = `Очки: ${score.value}`
      if (scoreText.text !== newScoreText) {
        scoreText.text = newScoreText
        // Обновляем позицию счета справа
        scoreText.x = bounds.width - scoreText.width - 15
      }
    }
  }

  /**
   * Обновляет размеры UI при ресайзе
   */
  public resize(newWidth: number, newHeight: number): void {
    const scoreEntities = this.world.with('score', 'uiElement', 'sceneBounds')

    for (const entity of scoreEntities) {
      const container = entity.uiElement!.container
      
      // Обновляем sceneBounds
      entity.sceneBounds!.width = newWidth
      entity.sceneBounds!.height = newHeight

      // Обновляем ширину фона
      const background = container.children[0] as Graphics
      background.clear()
      background.rect(0, 0, newWidth, 50)
      background.fill({ color: 0x2C3E50, alpha: 0.95 })

      // Обновляем позицию счета
      const scoreText = container.children[2] as Text
      scoreText.x = newWidth - scoreText.width - 15
    }
  }
}
