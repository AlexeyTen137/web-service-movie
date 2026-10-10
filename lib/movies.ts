import type { MovieDetail, Source, Sourced, Release } from "./types";
export const demoSource: Source = {
  name: "Локальный демонстрационный набор",
  asOf: "2026-10-10",
  status: "demo",
};
const publicSource = (name: string, url: string): Source => ({ name, url, asOf: "2026-10-10", status: "reported" });
const mojoSource = publicSource("Box Office Mojo", "https://www.boxofficemojo.com/title/tt0816692.htm/");
const releaseSource = publicSource("Box Office Mojo · первый прокат", "https://www.boxofficemojo.com/releasegroup/gr459297285/");
const wikipediaSource = publicSource("Википедия", "https://ru.wikipedia.org/wiki/Интерстеллар");
const ascSource = publicSource("American Cinematographer / ASC", "https://theasc.com/articles/dunkirk-discussion-with-hoyte-van-hoytema-asc-fsf-nsc");
const sourced = <T>(v: T, source: Source): Sourced<T> => ({ value: v, source });
const interstellarReleases: Release[] = [
  {country:"США",code:"US",region:"Америка",date:"2014-10-26",type:"Мировая премьера",source:wikipediaSource},
  {country:"США",code:"US",region:"Америка",date:"2014-11-05",type:"Ограниченный прокат",source:publicSource("The Numbers", "https://www.the-numbers.com/movie/Interstellar-(2014)")},
  {country:"США",code:"US",region:"Америка",date:"2014-11-07",type:"Широкий прокат",source:publicSource("The Numbers", "https://www.the-numbers.com/movie/Interstellar-(2014)")},
  {country:"Россия",code:"RU",region:"Европа",date:"2014-11-06",type:"Кинотеатры",source:wikipediaSource},
  {country:"Великобритания",code:"GB",region:"Европа",date:"2014-11-07",type:"Кинотеатры",source:releaseSource},
  {country:"Франция",code:"FR",region:"Европа",date:"2014-11-05",type:"Кинотеатры",source:releaseSource},
  {country:"Германия",code:"DE",region:"Европа",date:"2014-11-06",type:"Кинотеатры",source:releaseSource},
  {country:"Япония",code:"JP",region:"Азия",date:"2014-11-22",type:"Кинотеатры",source:releaseSource},
  {country:"Китай",code:"CN",region:"Азия",date:"2014-11-12",type:"Кинотеатры",source:releaseSource},
];
const value = <T>(v: T | null): Sourced<T> => ({
  value: v,
  source: demoSource,
});
const releases = (year: number): Release[] =>
  [
    ["США", "US", "Америка", `${year}-11-07`, "Кинотеатры"],
    ["Великобритания", "GB", "Европа", `${year}-11-07`, "Кинотеатры"],
    ["Россия", "RU", "Европа", null, "Кинотеатры"],
    ["Япония", "JP", "Азия", `${year}-11-22`, "Кинотеатры"],
    ["Китай", "CN", "Азия", `${year}-11-12`, "Кинотеатры"],
    ["Франция", "FR", "Европа", `${year}-11-05`, "Кинотеатры"],
    ["Германия", "DE", "Европа", `${year}-11-06`, "Кинотеатры"],
    ["Канада", "CA", "Америка", `${year}-11-07`, "Кинотеатры"],
    ["Австралия", "AU", "Океания", null, "Кинотеатры"],
    ["США", "US", "Америка", `${year}-10-26`, "Фестиваль"],
    ["США", "US", "Америка", `${year + 1}-03-31`, "Цифровой"],
  ].map(([country, code, region, date, type]) => ({
    country: country!,
    code: code!,
    region: region!,
    date,
    type: type as Release["type"],
    source: demoSource,
  }));
export const movies: MovieDetail[] = [
  {
    id: "interstellar",
    title: "Интерстеллар",
    originalTitle: "Interstellar",
    year: 2014,
    countries: ["США", "Великобритания"],
    duration: 169,
    genres: ["Фантастика", "Драма", "Приключения"],
    age: "PG-13 · США",
    rating: sourced(87, publicSource("Rotten Tomatoes", "https://www.rottentomatoes.com/m/interstellar_2014")),
    ratings: [
      { brand: "IMDb", label: "Зрители", score: "8.7/10", source: publicSource("IMDb", "https://www.imdb.com/title/tt0816692/ratings/") },
      { brand: "RT", label: "Критики", score: "73%", source: publicSource("Rotten Tomatoes", "https://www.rottentomatoes.com/m/interstellar_2014") },
      { brand: "RT", label: "Зрители", score: "87%", source: publicSource("Rotten Tomatoes", "https://www.rottentomatoes.com/m/interstellar_2014") },
      { brand: "MC", label: "Metascore", score: "74/100", source: publicSource("Metacritic", "https://www.metacritic.com/movie/interstellar/") },
    ],
    ratingUnit: "%",
    ratingLabel: "Оценка зрителей",
    infoSource: wikipediaSource,
    director: "Кристофер Нолан",
    synopsis:
      "Когда Земля становится непригодной для жизни, бывший пилот Купер отправляется за пределы нашей галактики, чтобы найти для человечества новый дом. Но самое большое расстояние — между ним и теми, кого он оставил.",
    tagline: "Путешествие за пределы пространства. История о том, что связывает нас.",
    poster: "/images/interstellar-poster.jpg",
    backdrop: "/images/interstellar-backdrop.jpg",
    imdbId: "tt0816692",
    finance: {
      budget: sourced(165000000, mojoSource),
      opening: sourced(47510360, mojoSource),
      domestic: sourced(203227580, mojoSource),
      worldwide: sourced(782967041, mojoSource),
    },
    releases: interstellarReleases,
    videos: [
      {
        id: "zSWdZVtXT7E",
        title: "Официальный трейлер",
        type: "Трейлер",
        language: "English",
        published: null,
      },
      {
        id: "ePbKGoIGAXY",
        title: "Первый взгляд",
        type: "Тизер",
        language: "English",
        published: null,
      },
    ],
    gallery: [
      {
        src: "/images/interstellar-backdrop.jpg",
        title: "За пределами знакомого мира",
        kind: "Кадр из фильма",
      },
      {
        src: "/images/interstellar-poster.jpg",
        title: "Interstellar",
        kind: "Оригинальный постер",
      },
    ],
    crew: [
      { role: "Режиссёр", names: "Кристофер Нолан" },
      { role: "Сценарий", names: "Джонатан Нолан, Кристофер Нолан" },
      { role: "Оператор", names: "Хойте ван Хойтема" },
      { role: "Композитор", names: "Ханс Циммер" },
      { role: "Монтаж", names: "Ли Смит" },
    ],
    cast: ["Мэттью Макконахи", "Энн Хэтэуэй", "Джессика Честейн", "Майкл Кейн"],
    studios: ["Legendary Pictures", "Syncopy", "Lynda Obst Productions"],
    languages: ["Английский"],
    technical: [
      { label: "Камеры и объективы", data: value<string>(null) },
      { label: "Формат съёмки", data: sourced("IMAX + 35 мм, анаморфотная плёнка", ascSource) },
      { label: "Звуковые форматы", data: sourced("Datasat, Dolby Digital", publicSource("Rotten Tomatoes", "https://www.rottentomatoes.com/m/interstellar_2014")) },
    ],
  },
  {
    id: "dune-2",
    title: "Дюна: Часть вторая",
    originalTitle: "Dune: Part Two",
    year: 2024,
    countries: ["США", "Канада"],
    duration: 166,
    genres: ["Фантастика", "Приключения", "Драма"],
    age: "16+",
    rating: value(8.5),
    director: "Дени Вильнёв",
    synopsis:
      "Пол Атрейдес объединяется с Чани и фременами, чтобы отомстить заговорщикам, уничтожившим его семью. Между любовью и судьбой целой вселенной ему предстоит сделать выбор.",
    tagline: "Да здравствуют бойцы.",
    poster: "/images/dune-poster.jpg",
    backdrop: "/images/dune-backdrop.jpg",
    imdbId: "tt15239678",
    finance: {
      budget: value(190000000),
      opening: value(82500000),
      domestic: value(282144358),
      worldwide: value(714444358),
    },
    releases: releases(2024).map((r) => ({
      ...r,
      date: r.date
        ? r.date.replace("-11-", "-03-").replace("-10-", "-02-")
        : null,
    })),
    videos: [
      {
        id: "Way9Dexny3w",
        title: "Официальный трейлер",
        type: "Трейлер",
        language: "English",
        published: null,
      },
      {
        id: "U2Qp5pL3ovA",
        title: "Трейлер № 2",
        type: "Трейлер",
        language: "English",
        published: null,
      },
    ],
    gallery: [
      {
        src: "/images/dune-backdrop.jpg",
        title: "Пески Арракиса",
        kind: "Кадр из фильма",
      },
      {
        src: "/images/dune-poster.jpg",
        title: "Dune: Part Two",
        kind: "Оригинальный постер",
      },
    ],
    crew: [
      { role: "Режиссёр", names: "Дени Вильнёв" },
      { role: "Сценарий", names: "Дени Вильнёв, Джон Спэйтс" },
      { role: "Оператор", names: "Грег Фрейзер" },
      { role: "Композитор", names: "Ханс Циммер" },
      { role: "Монтаж", names: "Джо Уокер" },
    ],
    cast: ["Тимоти Шаламе", "Зендея", "Ребекка Фергюсон", "Остин Батлер"],
    studios: ["Legendary Pictures", "Warner Bros."],
    languages: ["Английский"],
    technical: [
      { label: "Камеры и объективы", data: value<string>(null) },
      { label: "Формат изображения", data: value<string>(null) },
    ],
  },
  {
    id: "cheburashka",
    title: "Чебурашка",
    originalTitle: "Cheburashka",
    year: 2023,
    countries: ["Россия"],
    duration: 113,
    genres: ["Семейный", "Комедия"],
    age: "6+",
    rating: value<number>(null),
    director: "Дмитрий Дьяченко",
    synopsis:
      "Маленький ушастый герой оказывается в приморском городе и знакомится с нелюдимым садовником Геной. Новая дружба меняет жизнь каждого из них.",
    tagline: "Иногда, чтобы вернуть счастье, нужен один маленький друг.",
    poster: null,
    backdrop: null,
    imdbId: "tt18272388",
    finance: {
      budget: value<number>(null),
      opening: value<number>(null),
      domestic: value<number>(null),
      worldwide: value<number>(null),
    },
    releases: [
      {
        country: "Россия",
        code: "RU",
        region: "Европа",
        date: null,
        type: "Кинотеатры",
        source: demoSource,
      },
    ],
    videos: [],
    gallery: [],
    crew: [{ role: "Режиссёр", names: "Дмитрий Дьяченко" }],
    cast: ["Сергей Гармаш", "Ольга Кузьмина", "Елена Яковлева"],
    studios: [],
    languages: ["Русский"],
    technical: [],
  },
  {
    id: "rrr",
    title: "RRR",
    originalTitle: "RRR — Rise Roar Revolt",
    year: 2022,
    countries: ["Индия"],
    duration: 187,
    genres: ["Боевик", "Драма", "Приключения"],
    age: "16+",
    rating: value(7.8),
    director: "С. С. Раджамули",
    synopsis:
      "История невероятной дружбы двух революционеров. Их пути пересекаются в Индии 1920-х годов, где личная верность сталкивается с борьбой за свободу.",
    tagline: "Восстать. Зарычать. Воспротивиться.",
    poster: null,
    backdrop: null,
    imdbId: "tt8178634",
    finance: {
      budget: value<number>(null),
      opening: value<number>(null),
      domestic: value<number>(null),
      worldwide: value<number>(null),
    },
    releases: [
      {
        country: "Индия",
        code: "IN",
        region: "Азия",
        date: null,
        type: "Кинотеатры",
        source: demoSource,
      },
    ],
    videos: [],
    gallery: [],
    crew: [
      { role: "Режиссёр", names: "С. С. Раджамули" },
      { role: "Композитор", names: "М. М. Киравани" },
    ],
    cast: ["Н. Т. Рама Рао — младший", "Рам Чаран", "Алия Бхатт"],
    studios: ["DVV Entertainment"],
    languages: ["Телугу"],
    technical: [],
  },
];
export function searchMovies(query: string) {
  const q = query.trim().toLocaleLowerCase("ru").replaceAll("ё", "е");
  return movies.filter((m) =>
    `${m.title} ${m.originalTitle} ${m.year}`
      .toLocaleLowerCase("ru")
      .replaceAll("ё", "е")
      .includes(q),
  );
}
