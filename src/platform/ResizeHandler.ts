import { SCENE_CONFIG } from '../constants'

/**
 * Обработчик изменения размера окна
 * Вычисляет оптимальные размеры игры для разных устройств
 */
export class ResizeHandler {
  private listeners: Array<(width: number, height: number) => void> = []
  private readonly handleResizeBound: () => void

  /**
   * Конструктор
   * @param onResize - Callback, вызываемый при изменении размера
   */
  constructor(onResize?: (width: number, height: number) => void) {
    if (onResize) {
      this.listeners.push(onResize)
    }
    this.handleResizeBound = () => this.handleResize()
  }

  /**
   * Инициализирует обработчик resize
   */
  public setupEventListener(): void {
    window.addEventListener('resize', this.handleResizeBound)
  }

  /**
   * Удаляет обработчик (для очистки)
   */
  public destroy(): void {
    window.removeEventListener('resize', this.handleResizeBound)
  }

  /**
   * Подписывает новый обработчик на resize
   */
  public addListener(listener: (width: number, height: number) => void): void {
    this.listeners.push(listener)
  }

  /**
   * Отписывает обработчик от resize
   */
  public removeListener(listener: (width: number, height: number) => void): void {
    this.listeners = this.listeners.filter(item => item !== listener)
  }

  /**
   * Обработка изменения размера окна
   */
  private handleResize(): void {
    const { width, height } = this.getGameSize()

    for (const listener of this.listeners) {
      listener(width, height)
    }
  }

  /**
   * Получает оптимальный размер для игры
   */
  public getGameSize(): { width: number; height: number } {
    const isMobile = window.innerWidth < SCENE_CONFIG.MOBILE_BREAKPOINT
    const isPortrait = window.innerHeight > window.innerWidth

    if (isMobile || isPortrait) {
      // Мобильная или портретная ориентация - на всю высоту экрана
      const width = Math.min(window.innerWidth, SCENE_CONFIG.MOBILE.MAX_WIDTH)
      const height = window.innerHeight // Используем всю высоту экрана

      return { width, height }
    } else {
      // Десктоп - классический вертикальный формат Arkanoid с соотношением сторон
      const maxWidth = SCENE_CONFIG.DESKTOP.MAX_WIDTH
      const maxHeight = SCENE_CONFIG.DESKTOP.MAX_HEIGHT
      const screenUsage = SCENE_CONFIG.DESKTOP_SCREEN_USAGE // 95% для десктопа
      const aspectRatio = maxWidth / maxHeight

      let width = Math.min(window.innerWidth * screenUsage, maxWidth)
      let height = Math.min(window.innerHeight * screenUsage, maxHeight)

      // Сохраняем соотношение сторон
      if (width / height > aspectRatio) {
        width = height * aspectRatio
      } else {
        height = width / aspectRatio
      }

      return { width, height }
    }
  }
}
