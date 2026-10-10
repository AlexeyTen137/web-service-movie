export type Source = {
  name: string;
  asOf: string;
  status: "demo" | "unavailable" | "verified" | "reported";
  url?: string;
};
export type Sourced<T> = { value: T | null; source: Source };
export type Release = {
  country: string;
  code: string;
  region: string;
  date: string | null;
  type: "Фестиваль" | "Кинотеатры" | "Цифровой" | "Мировая премьера" | "Ограниченный прокат" | "Широкий прокат";
  source: Source;
};
export type MovieDetail = {
  id: string;
  title: string;
  originalTitle: string;
  year: number;
  countries: string[];
  duration: number;
  genres: string[];
  age: string;
  rating: Sourced<number>;
  ratings?: { brand: "IMDb" | "RT" | "MC"; label: string; score: string; source: Source }[];
  ratingUnit?: string;
  ratingLabel?: string;
  infoSource?: Source;
  director: string;
  synopsis: string;
  tagline: string;
  poster: string | null;
  backdrop: string | null;
  imdbId: string;
  finance: {
    budget: Sourced<number>;
    opening: Sourced<number>;
    domestic: Sourced<number>;
    worldwide: Sourced<number>;
  };
  releases: Release[];
  videos: {
    id: string;
    title: string;
    type: string;
    language: string;
    published: string | null;
  }[];
  gallery: { src: string; title: string; kind: string }[];
  crew: { role: string; names: string }[];
  cast: string[];
  studios: string[];
  languages: string[];
  technical: { label: string; data: Sourced<string> }[];
};
