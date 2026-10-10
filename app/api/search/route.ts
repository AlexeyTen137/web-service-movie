import { NextRequest, NextResponse } from "next/server";
import { movieProvider } from "@/lib/providers";
import { rateLimit, cacheHeaders } from "@/lib/api";
export async function GET(req: NextRequest) {
  const blocked = rateLimit();
  if (blocked) return blocked;
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length > 100)
    return NextResponse.json(
      { error: "Слишком длинный запрос" },
      { status: 400 },
    );
  try {
    return NextResponse.json(await movieProvider.search(q), {
      headers: cacheHeaders,
    });
  } catch {
    return NextResponse.json(
      { error: "Поиск временно недоступен" },
      { status: 503 },
    );
  }
}
