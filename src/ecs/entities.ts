import { Graphics, Text, TextStyle, Container } from 'pixi.js'
import { World } from './World'
import type { Entity } from './components'
import { GAME_CONFIG, UI_LAYOUT } from '../constants'

function getRandomBrickType(): { color: number; points: number } {
  const types = GAME_CONFIG.BRICK_TYPES
  const randomIndex = Math.floor(Math.random() * types.length)
  return types[randomIndex]
}

export function createBall(
  world: World<Entity>,
  sceneWidth: number,
  sceneHeight: number
): Entity {
  const radius = GAME_CONFIG.BALL_RADIUS
  const x = sceneWidth / 2
  const y = sceneHeight * GAME_CONFIG.BALL_START_Y

  const graphics = new Graphics()
  graphics.circle(0, 0, radius)
  graphics.fill(GAME_CONFIG.BALL_COLOR)
  graphics.circle(0, 0, radius)
  graphics.stroke({ width: GAME_CONFIG.BALL_STROKE_WIDTH, color: GAME_CONFIG.BALL_STROKE_COLOR })

  const entity = world.add({
    position: { x, y },
    velocity: { x: 0, y: 0 },
    radius: { value: radius },
    visual: { graphics },
    ball: { isLaunched: false },
    sceneBounds: { width: sceneWidth, height: sceneHeight },
    collision: { tags: ['ball'] }
  })

  return entity
}

export function createPaddle(
  world: World<Entity>,
  sceneWidth: number,
  sceneHeight: number
): Entity {
  const width = sceneWidth * GAME_CONFIG.PADDLE_WIDTH
  const height = sceneHeight * GAME_CONFIG.PADDLE_HEIGHT
  const x = (sceneWidth - width) / 2
  const y = sceneHeight * GAME_CONFIG.PADDLE_Y_POSITION

  const graphics = new Graphics()
  graphics.roundRect(0, 0, width, height, 5)
  graphics.fill(GAME_CONFIG.PADDLE_COLOR)
  graphics.roundRect(0, 0, width, height, 5)
  graphics.stroke({
    width: GAME_CONFIG.PADDLE_STROKE_WIDTH,
    color: GAME_CONFIG.PADDLE_STROKE_COLOR
  })

  const entity = world.add({
    position: { x, y },
    size: { width, height },
    visual: { graphics },
    paddle: {
      speed: GAME_CONFIG.PADDLE_SPEED,
      touchTargetX: null,
      isMouseDown: false
    },
    keyboardInput: { keys: {} },
    sceneBounds: { width: sceneWidth, height: sceneHeight },
    collision: { tags: ['paddle'] }
  })

  return entity
}

export function createBrick(
  world: World<Entity>,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  points: number,
  row: number,
  col: number
): Entity {
  const graphics = new Graphics()
  graphics.roundRect(0, 0, width, height, 3)
  graphics.fill(color)

  graphics.roundRect(0, 0, width, height, 3)
  graphics.stroke({
    width: 2,
    color: GAME_CONFIG.BRICK_STROKE_COLOR,
    alpha: GAME_CONFIG.BRICK_STROKE_ALPHA
  })

  const entity = world.add({
    position: { x, y },
    size: { width, height },
    visual: { graphics },
    brick: {
      points,
      color,
      isDestroyed: false,
      row,
      col
    },
    collision: { tags: ['brick'] }
  })

  return entity
}

export function createBricks(
  world: World<Entity>,
  sceneWidth: number,
  sceneHeight: number
): Entity[] {
  const rows = GAME_CONFIG.BRICK_ROWS
  const cols = GAME_CONFIG.BRICK_COLS
  const padding = GAME_CONFIG.BRICK_PADDING
  const offsetX = sceneWidth * GAME_CONFIG.BRICK_OFFSET_X
  const offsetY = GAME_CONFIG.BRICK_OFFSET_TOP

  const totalPaddingX = padding * (cols + 1) + offsetX * 2
  const brickWidth = (sceneWidth - totalPaddingX) / cols
  const brickHeight = sceneHeight * GAME_CONFIG.BRICK_HEIGHT

  const bricks: Entity[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = offsetX + padding + col * (brickWidth + padding)
      const y = offsetY + padding + row * (brickHeight + padding)

      const brickType = getRandomBrickType()
      const brick = createBrick(
        world,
        x,
        y,
        brickWidth,
        brickHeight,
        brickType.color,
        brickType.points,
        row,
        col
      )
      bricks.push(brick)
    }
  }

  return bricks
}

export function createGameState(world: World<Entity>): Entity {
  const entity = world.add({
    gameState: {
      state: 'PLAYER_INPUT',
      playerName: ''
    }
  })

  return entity
}

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
