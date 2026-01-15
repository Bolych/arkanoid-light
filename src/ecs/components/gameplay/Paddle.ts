/**
 * Компонент платформы
 */
export interface Paddle {
  /** Скорость перемещения при клавиатурном вводе */
  speed: number
  /** Целевая позиция X для touch/mouse управления */
  touchTargetX: number | null
  /** Флаг нажатой кнопки мыши */
  isMouseDown: boolean
}
