import { Text, TextStyle, Graphics, Container } from 'pixi.js'
import { World } from '../../World'
import type { Entity } from '../index.js'

export function createScore(
  world: World<Entity>,
  sceneWidth: number,
  sceneHeight: number
): Entity {
  const uiContainer = new Container()

  const uiBackground = new Graphics()
  uiBackground.rect(0, 0, sceneWidth, 50)
  uiBackground.fill({ color: 0x2C3E50, alpha: 0.95 })
  uiContainer.addChild(uiBackground)

  const nameStyle = new TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    fill: 0xFFFF00,
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
    fill: 0xFFFFFF,
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
