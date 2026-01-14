import { Text, TextStyle } from 'pixi.js'
import { GAME_CONFIG } from './constants'

export class ScoreManager {
  private score: number = 0
  public scoreText: Text
  public playerNameText: Text
  private sceneWidth: number

  constructor(sceneWidth: number, sceneHeight: number) {
    this.sceneWidth = sceneWidth
    
    // Стиль текста для счета
    const scoreStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: { color: 0x000000, width: 3 },
    })

    // Создаем текст счета
    this.scoreText = new Text({
      text: `Очки: ${this.score}`,
      style: scoreStyle
    })

    // Позиционируем в верхнем правом углу
    this.scoreText.x = sceneWidth - 120
    this.scoreText.y = 10

    // Стиль текста для имени игрока
    const nameStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xFFFF00,
      stroke: { color: 0x000000, width: 2 },
    })

    // Создаем текст имени игрока
    this.playerNameText = new Text({
      text: '',
      style: nameStyle
    })

    // Позиционируем в верхнем левом углу
    this.playerNameText.x = 10
    this.playerNameText.y = 10
  }

  public setPlayerName(name: string): void {
    this.playerNameText.text = `Игрок: ${name}`
  }

  public addPoints(points: number): void {
    this.score += points
    this.updateText()
  }

  public addBrickPoints(): void {
    this.addPoints(GAME_CONFIG.BRICK_POINTS)
  }

  public getScore(): number {
    return this.score
  }

  public reset(): void {
    this.score = 0
    this.updateText()
  }

  private updateText(): void {
    this.scoreText.text = `Очки: ${this.score}`
  }

  public resize(newSceneWidth: number, newSceneHeight: number): void {
    this.sceneWidth = newSceneWidth
    // Обновляем позицию в верхнем правом углу
    this.scoreText.x = newSceneWidth - 120
    this.scoreText.y = 10
  }
}
