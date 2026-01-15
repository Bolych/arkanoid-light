/**
 * Компонент клавиатурного ввода
 */
export interface KeyboardInput {
  /** Карта нажатых клавиш */
  keys: { [key: string]: boolean }
}
