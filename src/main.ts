import './style.css'
import { Game } from './Game'

/**
 * Точка входа в приложение
 */
async function main() {
  const game = new Game()
  await game.init()
}

// Запускаем игру
main().catch(console.error)
