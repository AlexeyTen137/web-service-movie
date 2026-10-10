"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="empty-page">
      <h1>Не удалось собрать кадр.</h1>
      <p>Попробуйте загрузить страницу ещё раз.</p>
      <button className="button primary" onClick={reset}>
        Повторить
      </button>
    </main>
  );
}
