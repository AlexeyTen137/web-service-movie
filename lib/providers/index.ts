import "server-only";
import { movies, searchMovies } from "../movies";
import type { MovieDetail } from "../types";
export interface MovieProvider {
  search(query: string): Promise<MovieDetail[]>;
  getDetail(id: string): Promise<MovieDetail | null>;
}
export class MockMovieProvider implements MovieProvider {
  async search(q: string) {
    return searchMovies(q);
  }
  async getDetail(id: string) {
    return movies.find((m) => m.id === id) ?? null;
  }
}
// Contracts only: connect these after approval of the visual prototype.
export interface TMDBProvider extends MovieProvider {
  readonly name: "tmdb";
}
export interface IMDbProvider {
  getProduction(
    imdbId: string,
  ): Promise<Pick<MovieDetail, "crew" | "technical"> | null>;
}
export interface BoxOfficeProvider {
  getFinance(imdbId: string): Promise<MovieDetail["finance"] | null>;
}
export interface AIProvider {
  answer(movie: MovieDetail, question: string): Promise<string>;
}
export class MockAIProvider implements AIProvider {
  async answer(movie: MovieDetail, question: string) {
    if (/камер|объектив|технич/i.test(question))
      return "Сведения о камерах и объективах пока не подключены. На странице есть ссылка на технические характеристики IMDb. Я не буду подставлять неподтверждённую информацию.";
    if (/росси|премьер|вышел/i.test(question)) {
      const release = movie.releases.find(r => r.code === "RU" && r.date && r.source.status === "reported");
      if (release) return `Первый кинотеатральный релиз «${movie.title}» в России — 6 ноября 2014 года. Источник: ${release.source.name}. Это сохранённый пример карточки, а не автоматически обновляемая информация.`;
      return `Достоверные даты премьер «${movie.title}» пока не подключены. Таблица показывает только демонстрационные состояния; по ней нельзя устанавливать реальные даты выхода.`;
    }
    if (/бюджет|заработ|сбор/i.test(question)) {
      const { budget, worldwide } = movie.finance;
      return budget.value && worldwide.value
        ? `${worldwide.source.status === "demo" ? "На демонстрационных числах" : "По сохранённым данным Box Office Mojo"} мировые сборы составляют ${(worldwide.value / budget.value).toFixed(1)} производственного бюджета. Это не прибыль: здесь не учтены маркетинг, доля кинотеатров и другие расходы. Автоматическое обновление данных ещё не подключено.`
        : "Финансовые данные для этого фильма пока недоступны. Для расчёта нужны сборы и производственный бюджет из подключённых источников.";
    }
    return `Это демонстрационный помощник, без подключённой языковой модели. В локальной карточке «${movie.title}» указаны режиссёр ${movie.director} и жанры: ${movie.genres.join(", ")}. Могу показать состояние данных о премьерах, камерах или бюджете.`;
  }
}
export const movieProvider = new MockMovieProvider();
export const aiProvider: AIProvider = new MockAIProvider();
