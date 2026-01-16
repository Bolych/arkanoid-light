import type { Application } from 'pixi.js'
import type { World } from '../ecs/World'
import type { Entity } from '../ecs/components'
import type { UIManager } from '../ui/UIManager.js'
import { SCENE_CONFIG } from '../constants'

export function getGameSize(): { width: number; height: number } {
  const isMobile = window.innerWidth < SCENE_CONFIG.MOBILE_BREAKPOINT
  const isPortrait = window.innerHeight > window.innerWidth

  if (isMobile || isPortrait) {
    return {
      width: Math.min(window.innerWidth, SCENE_CONFIG.MOBILE.MAX_WIDTH),
      height: window.innerHeight
    }
  }

  const maxWidth = SCENE_CONFIG.DESKTOP.MAX_WIDTH
  const maxHeight = SCENE_CONFIG.DESKTOP.MAX_HEIGHT
  const aspectRatio = maxWidth / maxHeight

  let width = Math.min(window.innerWidth * SCENE_CONFIG.DESKTOP_SCREEN_USAGE, maxWidth)
  let height = Math.min(window.innerHeight * SCENE_CONFIG.DESKTOP_SCREEN_USAGE, maxHeight)

  if (width / height > aspectRatio) {
    width = height * aspectRatio
  } else {
    height = width / aspectRatio
  }

  return { width, height }
}

export function setupResize(
  app: Application,
  world: World<Entity>,
  uiManager: UIManager
): () => void {
  const handleResize = () => {
    const { width, height } = getGameSize()
    
    app.renderer.resize(width, height)
    uiManager.resize(width, height)
    
    world.getSystems().forEach(system => {
      if ('resize' in system && typeof system.resize === 'function') {
        system.resize(width, height)
      }
    })
  }

  window.addEventListener('resize', handleResize)
  
  return () => window.removeEventListener('resize', handleResize)
}
