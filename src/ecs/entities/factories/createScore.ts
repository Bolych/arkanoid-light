import { Text, TextStyle, Graphics, Container } from 'pixi.js'
import { World } from '../../World'
import { GAME_CONFIG, UI_LAYOUT } from '../../../constants'
import type { Entity } from '../index.js'

export function createScore(
  world: World<Entity>,
  sceneWidth: number,
  sceneHeight: number
): Entity {
  const uiContainer = new Container()

  const uiBackground = new Graphics()
  uiBackground.rect(0, 0, sceneWidth, UI_LAYOUT.SCORE_PANEL_HEIGHT)
  uiBackground.fill({
    color: GAME_CONFIG.SCORE_PANEL_COLOR,
    alpha: GAME_CONFIG.SCORE_PANEL_ALPHA
  })
  uiContainer.addChild(uiBackground)

  const nameStyle = new TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    fill: GAME_CONFIG.SCORE_NAME_COLOR,
  })

  const playerNameText = new Text({
    text: '',
    style: nameStyle
  })
  playerNameText.x = 15
  playerNameText.y = 15
  uiContainer.addChild(playerNameText)

  const scoreStyle = new TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    fill: GAME_CONFIG.SCORE_VALUE_COLOR,
  })

  const scoreText = new Text({
    text: 'Очки: 0',
    style: scoreStyle
  })
  scoreText.y = 15
  scoreText.x = sceneWidth - scoreText.width - 15
  uiContainer.addChild(scoreText)

  uiContainer.x = 0
  uiContainer.y = 0

  const entity = world.add({
    score: {
      value: 0,
      playerName: ''
    },
    uiElement: {
      container: uiContainer
    },
    sceneBounds: { width: sceneWidth, height: sceneHeight }
  })

  return entity
}
