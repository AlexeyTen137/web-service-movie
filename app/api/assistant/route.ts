import { NextResponse } from "next/server";
import { movieProvider, aiProvider } from "@/lib/providers";
import { rateLimit } from "@/lib/api";
export async function POST(req: Request) {
  const blocked = rateLimit();
  if (blocked) return blocked;
  try {
    const body = await req.json();
    if (
      typeof body.question !== "string" ||
      !body.question.trim() ||
      body.question.length > 1000 ||
      typeof body.movieId !== "string"
    )
      return NextResponse.json(
        { error: "Введите вопрос до 1000 символов" },
        { status: 400 },
      );
    const movie = await movieProvider.getDetail(body.movieId);
    if (!movie)
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    return NextResponse.json({
      answer: await aiProvider.answer(movie, body.question),
      mode: "demo",
    });
  } catch {
    return NextResponse.json(
      { error: "Не удалось обработать запрос" },
      { status: 400 },
    );
  }
}
