# Arkanoid

Облегченная версия Arkanoid на TypeScript + PixiJS + ECS.

## Запуск

```
npm install
npm run dev
```

## Управление

| Действие | Desktop | Mobile |
|----------|---------|--------|
| Движение | ← → / A D | Тап + drag |
| Запуск мяча | Пробел / клик | Тап |

## Очки

| Блок | Очки |
|------|------|
| 🔵 Синий | 1 |
| 🔴 Красный | 2 |
| 🟢 Зелёный | 3 |

## Лидерборд

Топ-5 результатов сохраняется в localStorage.

## Как работает

```
┌─────────────────────────────────────────────────────────────┐
│                        ИНИЦИАЛИЗАЦИЯ                        │
├─────────────────────────────────────────────────────────────┤
│  main.ts                                                    │
│    └→ new Game()                                            │
│         ├→ setup()                                          │
│         │    ├→ PixiJS Application.init()                   │
│         │    ├→ LeaderboardManager                          │
│         │    ├→ UIManager                                   │
│         │    └→ ResizeManager (подписка на resize)          │
│         │                                                   │
│         └→ run()                                            │
│              ├→ populateWorld() — создание entities         │
│              │    ├→ GameState                              │
│              │    ├→ Score (UI панель)                      │
│              │    ├→ Paddle                                 │
│              │    ├→ Ball                                   │
│              │    └→ Bricks (5×8)                           │
│              │                                              │
│              ├→ setupSystems() — регистрация ECS систем     │
│              │    ├→ MovementSystem                         │
│              │    ├→ CollisionSystem                        │
│              │    ├→ GameSystem                             │
│              │    ├→ RenderSystem                           │
│              │    └→ ResizeSystem                           │
│              │                                              │
│              ├→ GameFlowController                          │
│              ├→ GameInputHandler                            │
│              └→ ticker.add(gameLoop)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     ИГРОВОЙ ЦИКЛ (ECS)                      │
├─────────────────────────────────────────────────────────────┤
│  gameLoop(deltaTime)                                        │
│    └→ World.update()                                        │
│         ├→ MovementSystem  — ввод, движение paddle/ball     │
│         ├→ CollisionSystem — paddle↔ball, ball↔brick        │
│         ├→ GameSystem      — очки, состояние игры           │
│         ├→ RenderSystem    — sync position → graphics       │
│         └→ ResizeSystem    — адаптация при resize           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      GAME FLOW                              │
├─────────────────────────────────────────────────────────────┤
│  PLAYER_INPUT → PLAYING → GAME_OVER → restart ─┐            │
│       ↑                                        │            │
│       └────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```
