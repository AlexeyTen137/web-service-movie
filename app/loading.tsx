export default function Loading() {
  return (
    <main
      className="loading-page"
      aria-busy="true"
      aria-label="Загрузка страницы"
    >
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-panel" />
      <p>Собираем детали фильма…</p>
    </main>
  );
}
