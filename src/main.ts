import './style.css'
import { Game } from './Game'

/**
 * Точка входа в приложение (по эталону)
 */
async function main() {
  const game = new Game()
  await game.init()
  game.run() // Разделяем init и run (как в эталоне)
}

// Запускаем игру
main().catch(console.error)
