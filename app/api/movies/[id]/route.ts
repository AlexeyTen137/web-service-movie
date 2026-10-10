import { NextResponse } from "next/server";
import { movieProvider } from "@/lib/providers";
import { rateLimit, cacheHeaders } from "@/lib/api";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = rateLimit();
  if (blocked) return blocked;
  const movie = await movieProvider.getDetail((await params).id);
  return movie
    ? NextResponse.json(movie, { headers: cacheHeaders })
    : NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
}
