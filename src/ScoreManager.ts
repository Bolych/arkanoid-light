import { Text, TextStyle, Graphics, Container } from 'pixi.js'

export class ScoreManager {
  private score: number = 0
  public scoreText: Text
  public playerNameText: Text
  public uiContainer: Container
  private sceneWidth: number
  private uiBackground: Graphics

  constructor(sceneWidth: number, sceneHeight: number) {
    this.sceneWidth = sceneWidth
    
    // === Общий контейнер для UI панели ===
    this.uiContainer = new Container()
    
    // Фон - полоса во всю ширину вверху
    this.uiBackground = new Graphics()
    this.uiBackground.rect(0, 0, sceneWidth, 50)
    this.uiBackground.fill({ color: 0x2C3E50, alpha: 0.95 })
    this.uiContainer.addChild(this.uiBackground)
    
    // Стиль текста для имени игрока
    const nameStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xFFFF00,
    })

    // Создаем текст имени игрока (слева)
    this.playerNameText = new Text({
      text: '',
      style: nameStyle
    })
    this.playerNameText.x = 15
    this.playerNameText.y = 15
    this.uiContainer.addChild(this.playerNameText)
    
    // Стиль текста для счета
    const scoreStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
    })

    // Создаем текст счета (справа)
    this.scoreText = new Text({
      text: `Очки: ${this.score}`,
      style: scoreStyle
    })
    this.scoreText.y = 15
    this.updateScorePosition(sceneWidth)
    this.uiContainer.addChild(this.scoreText)

    // Позиционируем весь UI контейнер вверху
    this.uiContainer.x = 0
    this.uiContainer.y = 0
  }

  private updateScorePosition(sceneWidth: number): void {
    // Позиционируем счет справа с отступом
    this.scoreText.x = sceneWidth - this.scoreText.width - 15
  }

  public setPlayerName(name: string): void {
    this.playerNameText.text = `Игрок: ${name}`
  }

  public addPoints(points: number): void {
    this.score += points
    this.updateText()
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
    // Обновляем позицию счета справа
    this.updateScorePosition(this.sceneWidth)
  }

  public resize(newSceneWidth: number, newSceneHeight: number): void {
    this.sceneWidth = newSceneWidth
    
    // Обновляем ширину фона
    this.uiBackground.clear()
    this.uiBackground.rect(0, 0, newSceneWidth, 50)
    this.uiBackground.fill({ color: 0x2C3E50, alpha: 0.95 })
    
    // Обновляем позицию счета справа
    this.updateScorePosition(newSceneWidth)
  }
}
