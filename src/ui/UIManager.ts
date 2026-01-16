import { Container, Text, TextStyle, Graphics } from 'pixi.js'
import { LeaderboardManager } from '../LeaderboardManager'

export class UIManager {
  private leaderboardManager: LeaderboardManager
  private sceneWidth: number
  private sceneHeight: number

  constructor(sceneWidth: number, sceneHeight: number, leaderboardManager: LeaderboardManager) {
    this.sceneWidth = sceneWidth
    this.sceneHeight = sceneHeight
    this.leaderboardManager = leaderboardManager
  }

  public showGameOver(playerName: string, finalScore: number): Container {
    const overlay = new Container()

    const bg = new Graphics()
    bg.rect(0, 0, this.sceneWidth, this.sceneHeight)
    bg.fill({ color: 0x000000, alpha: 0.8 })
    overlay.addChild(bg)

    const titleStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: { color: 0x000000, width: 4 },
    })

    const title = new Text({
      text: 'ИГРА ОКОНЧЕНА',
      style: titleStyle
    })
    title.anchor.set(0.5)
    title.x = this.sceneWidth / 2
    title.y = 60
    overlay.addChild(title)

    const scoreStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 28,
      fill: 0xFFFF00,
      stroke: { color: 0x000000, width: 3 },
    })

    const playerScoreText = new Text({
      text: `${playerName}: ${finalScore} очков`,
      style: scoreStyle
    })
    playerScoreText.anchor.set(0.5)
    playerScoreText.x = this.sceneWidth / 2
    playerScoreText.y = 130
    overlay.addChild(playerScoreText)

    const leaderboardTitle = new Text({
      text: 'ТОП-5 ИГРОКОВ',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 32,
        fontWeight: 'bold',
        fill: 0xFFFFFF,
        stroke: { color: 0x000000, width: 3 },
      })
    })
    leaderboardTitle.anchor.set(0.5)
    leaderboardTitle.x = this.sceneWidth / 2
    leaderboardTitle.y = 200
    overlay.addChild(leaderboardTitle)

    const topScores = this.leaderboardManager.getTopScores()
    const entryStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 22,
      fill: 0xFFFFFF,
      stroke: { color: 0x000000, width: 2 },
    })

    topScores.forEach((entry, index) => {
      const text = new Text({
        text: `${index + 1}. ${entry.name} - ${entry.score} очков`,
        style: entryStyle
      })
      text.anchor.set(0.5)
      text.x = this.sceneWidth / 2
      text.y = 260 + index * 40
      overlay.addChild(text)
    })

    const restartText = new Text({
      text: 'Нажмите ПРОБЕЛ для новой игры',
      style: new TextStyle({
        fontFamily: 'Arial, sans-serif',
        fontSize: 20,
        fill: 0xAAAAAA,
        stroke: { color: 0x000000, width: 2 },
      })
    })
    restartText.anchor.set(0.5)
    restartText.x = this.sceneWidth / 2
    restartText.y = this.sceneHeight - 50
    overlay.addChild(restartText)

    return overlay
  }

  public showPlayerInputModal(onPlayerNameEntered: (playerName: string) => void): void {
    const modal = document.getElementById('player-input-modal')
    const input = document.getElementById('player-name') as HTMLInputElement | null
    const button = document.getElementById('start-game-btn') as HTMLButtonElement | null

    if (!modal || !input || !button) {
      console.error('Player input modal elements not found')
      return
    }

    modal.classList.add('active')
    input.value = ''
    input.focus()

    const startGame = () => {
      const playerName = input.value.trim()
      if (playerName.length > 0) {
        modal.classList.remove('active')
        onPlayerNameEntered(playerName)
      }
    }

    button.onclick = null
    input.onkeypress = null

    button.onclick = startGame
    input.onkeypress = (e) => {
      if (e.key === 'Enter') {
        startGame()
      }
    }
  }

  public hidePlayerInputModal(): void {
    const modal = document.getElementById('player-input-modal')
    if (modal) {
      modal.classList.remove('active')
    }
  }

  public resize(newSceneWidth: number, newSceneHeight: number): void {
    this.sceneWidth = newSceneWidth
    this.sceneHeight = newSceneHeight
  }
}
