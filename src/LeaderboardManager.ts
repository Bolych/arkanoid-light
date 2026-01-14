interface PlayerScore {
  name: string
  score: number
  date: string
}

export class LeaderboardManager {
  private readonly STORAGE_KEY = 'arkanoid_leaderboard'
  private readonly MAX_ENTRIES = 5

  public saveScore(playerName: string, score: number): void {
    const scores = this.getScores()
    
    // Добавляем новый результат
    scores.push({
      name: playerName,
      score: score,
      date: new Date().toLocaleDateString('ru-RU')
    })

    // Сортируем по убыванию очков
    scores.sort((a, b) => b.score - a.score)

    // Оставляем только топ-5
    const topScores = scores.slice(0, this.MAX_ENTRIES)

    // Сохраняем в localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores))
  }

  public getScores(): PlayerScore[] {
    const data = localStorage.getItem(this.STORAGE_KEY)
    if (!data) return []
    
    try {
      return JSON.parse(data)
    } catch (e) {
      return []
    }
  }

  public getTopScores(count: number = 5): PlayerScore[] {
    return this.getScores().slice(0, count)
  }

  public clearScores(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
