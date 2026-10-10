import { notFound } from "next/navigation";
import { movieProvider } from "@/lib/providers";
import { MoviePage } from "@/components/movie-page";
import { movies } from "@/lib/movies";
export function generateStaticParams() {
  return movies.map((m) => ({ id: m.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const m = await movieProvider.getDetail((await params).id);
  return { title: m?.title ?? "Фильм не найден" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const m = await movieProvider.getDetail((await params).id);
  if (!m) notFound();
  return <MoviePage key={m.id} movie={m} />;
}
