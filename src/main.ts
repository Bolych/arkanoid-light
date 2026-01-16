import './style.css'
import { Game } from './game/Game'

async function main() {
  const game = new Game()
  await game.setup()
  game.run()
}

main().catch(console.error)
