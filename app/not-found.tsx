import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-page">
      <span className="eyebrow">КАДР НЕ НАЙДЕН · 404</span>
      <h1>Этой истории здесь пока нет.</h1>
      <p>Вернитесь к поиску и найдите другой фильм.</p>
      <Link className="button primary" href="/">
        На главную
      </Link>
    </main>
  );
}
