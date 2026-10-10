import { NextResponse } from "next/server";
// Coarse instance-wide limiter for this local prototype; production needs shared storage.
let windowStart = Date.now();
let count = 0;
export function rateLimit() {
  if (Date.now() - windowStart > 60000) {
    windowStart = Date.now();
    count = 0;
  }
  return ++count > 120
    ? NextResponse.json(
        { error: "Слишком много запросов. Попробуйте через минуту." },
        { status: 429, headers: { "Retry-After": "60" } },
      )
    : null;
}
export const cacheHeaders = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
};
