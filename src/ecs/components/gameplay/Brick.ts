/**
 * Компонент кирпича
 */
export interface Brick {
  /** Количество очков за разрушение */
  points: number
  /** Цвет кирпича */
  color: number
  /** Флаг: кирпич уничтожен */
  isDestroyed: boolean
  /** Индекс строки в сетке */
  row: number
  /** Индекс столбца в сетке */
  col: number
}
