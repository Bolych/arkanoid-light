import { SCENE_CONFIG } from '../constants'
export class ResizeHandler {
  private listeners: Array<(width: number, height: number) => void> = []
  private readonly handleResizeBound: () => void

  constructor(onResize?: (width: number, height: number) => void) {
    if (onResize) {
      this.listeners.push(onResize)
    }
    this.handleResizeBound = () => this.handleResize()
  }

  public setupEventListener(): void {
    window.addEventListener('resize', this.handleResizeBound)
  }

  public destroy(): void {
    window.removeEventListener('resize', this.handleResizeBound)
  }

  public addListener(listener: (width: number, height: number) => void): void {
    this.listeners.push(listener)
  }

  public removeListener(listener: (width: number, height: number) => void): void {
    this.listeners = this.listeners.filter(item => item !== listener)
  }

  private handleResize(): void {
    const { width, height } = this.getGameSize()

    for (const listener of this.listeners) {
      listener(width, height)
    }
  }

  public getGameSize(): { width: number; height: number } {
    const isMobile = window.innerWidth < SCENE_CONFIG.MOBILE_BREAKPOINT
    const isPortrait = window.innerHeight > window.innerWidth

    if (isMobile || isPortrait) {
      const width = Math.min(window.innerWidth, SCENE_CONFIG.MOBILE.MAX_WIDTH)
      const height = window.innerHeight

      return { width, height }
    } else {
      const maxWidth = SCENE_CONFIG.DESKTOP.MAX_WIDTH
      const maxHeight = SCENE_CONFIG.DESKTOP.MAX_HEIGHT
      const screenUsage = SCENE_CONFIG.DESKTOP_SCREEN_USAGE
      const aspectRatio = maxWidth / maxHeight

      let width = Math.min(window.innerWidth * screenUsage, maxWidth)
      let height = Math.min(window.innerHeight * screenUsage, maxHeight)

      if (width / height > aspectRatio) {
        width = height * aspectRatio
      } else {
        height = width / aspectRatio
      }

      return { width, height }
    }
  }
}
