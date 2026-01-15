import { Text, TextStyle, Graphics, Container } from 'pixi.js'
import { World } from '../../World'
import type { Entity } from '../index.js'

/**
 * Создает сущность счета с UI элементами
 */
export function createScore(
  world: World<Entity>,
  sceneWidth: number,
  sceneHeight: number
): Entity {
  // Создаем контейнер для UI панели
  const uiContainer = new Container()

  // Фон - полоса во всю ширину вверху
  const uiBackground = new Graphics()
  uiBackground.rect(0, 0, sceneWidth, 50)
  uiBackground.fill({ color: 0x2C3E50, alpha: 0.95 })
  uiContainer.addChild(uiBackground)

  // Стиль текста для имени игрока
  const nameStyle = new TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    fill: 0xFFFF00,
  })

  // Создаем текст имени игрока (слева)
  const playerNameText = new Text({
    text: '',
    style: nameStyle
  })
  playerNameText.x = 15
  playerNameText.y = 15
  uiContainer.addChild(playerNameText)

  // Стиль текста для счета
  const scoreStyle = new TextStyle({
    fontFamily: 'Arial, sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    fill: 0xFFFFFF,
  })

  // Создаем текст счета (справа)
  const scoreText = new Text({
    text: 'Очки: 0',
    style: scoreStyle
  })
  scoreText.y = 15
  scoreText.x = sceneWidth - scoreText.width - 15
  uiContainer.addChild(scoreText)

  // Позиционируем весь UI контейнер вверху
  uiContainer.x = 0
  uiContainer.y = 0

  // Создаем сущность
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
