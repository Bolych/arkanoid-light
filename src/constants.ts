// Константы для игровых элементов
export const GAME_CONFIG = {
  // Зона кирпичей - верхние 60%
  BRICKS_ZONE_HEIGHT: 0.6,
  BRICKS_START_Y: 0.05,  // Отступ сверху (5%)
  
  // Платформа - в нижней части
  PADDLE_Y_POSITION: 0.9,  // 90% от высоты
  PADDLE_WIDTH: 0.15,      // 15% от ширины сцены
  PADDLE_HEIGHT: 0.02,     // 2% от высоты сцены
  PADDLE_SPEED: 12,         // Скорость движения платформы (пикселей за кадр)
  PADDLE_COLOR: 0x4A90E2,  // Синий цвет платформы
  
  // Шарик
  BALL_RADIUS: 8,          // Радиус шарика в пикселях
  BALL_SPEED: 6,           // Скорость движения шарика
  BALL_COLOR: 0xFFFFFF,    // Белый цвет шарика
  BALL_START_Y: 0.7,       // Начальная позиция по Y (70% от высоты)
  
  // Зона игры мяча - между кирпичами и платформой
  PLAY_ZONE_START: 0.65,
  PLAY_ZONE_END: 0.88,
}

// Размеры игровой сцены
export const SCENE_CONFIG = {
  // Мобильные устройства
  MOBILE: {
    MAX_WIDTH: 450,
    MAX_HEIGHT: 800,
  },
  // Десктоп
  DESKTOP: {
    MAX_WIDTH: 600,
    MAX_HEIGHT: 800,
  },
  // Breakpoint для определения мобильного устройства
  MOBILE_BREAKPOINT: 768,
  // Процент использования экрана
  SCREEN_USAGE: 0.95,
}
