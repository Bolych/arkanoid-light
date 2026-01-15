/**
 * Обработчик высокоуровневого пользовательского ввода для игровых команд
 * Отвечает за обработку команд запуска мяча, рестарта и т.д.
 */
export class GameInputHandler {
  private onLaunchBall?: () => void
  private onRestartGame?: () => void
  private getGameState?: () => string

  /**
   * Конструктор
   * @param callbacks - Объект с callback-функциями для игровых действий
   */
  constructor(callbacks: {
    onLaunchBall?: () => void
    onRestartGame?: () => void
    getGameState?: () => string
  }) {
    this.onLaunchBall = callbacks.onLaunchBall
    this.onRestartGame = callbacks.onRestartGame
    this.getGameState = callbacks.getGameState
  }

  /**
   * Инициализирует обработчики событий
   */
  public setupEventListeners(): void {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e))
    window.addEventListener('touchstart', (e) => this.handleTouchStart(e))
    window.addEventListener('click', (e) => this.handleClick(e))
  }

  /**
   * Удаляет обработчики событий (для очистки)
   */
  public destroy(): void {
    window.removeEventListener('keydown', (e) => this.handleKeyDown(e))
    window.removeEventListener('touchstart', (e) => this.handleTouchStart(e))
    window.removeEventListener('click', (e) => this.handleClick(e))
  }

  /**
   * Обработка нажатия клавиш
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Проверяем Space по разным вариантам кода клавиши
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault()
      this.handleGameCommand()
    }
  }

  /**
   * Обработка касания экрана
   */
  private handleTouchStart(e: TouchEvent): void {
    // Проверяем, что касание не по элементам модального окна
    const target = e.target as HTMLElement
    if (target.closest('.modal')) {
      return
    }

    this.handleGameCommand()
  }

  /**
   * Обработка клика мыши
   */
  private handleClick(e: MouseEvent): void {
    // Проверяем, что клик не по элементам модального окна
    const target = e.target as HTMLElement
    if (target.closest('.modal')) {
      return
    }

    this.handleGameCommand()
  }

  /**
   * Обработка игровой команды в зависимости от состояния
   */
  private handleGameCommand(): void {
    if (!this.getGameState) return

    const state = this.getGameState()

    if (state === 'PLAYING' && this.onLaunchBall) {
      this.onLaunchBall()
    } else if (state === 'GAME_OVER' && this.onRestartGame) {
      this.onRestartGame()
    }
  }
}
