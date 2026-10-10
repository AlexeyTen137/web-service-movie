"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Play,
  Clock3,
  Star,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowDownUp,
  Info,
  Send,
  Bookmark,
  Check,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import type { MovieDetail } from "@/lib/types";
import { Header } from "./header";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
const money = (n: number | null) =>
  n === null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n);
const compactMoney = (n: number | null) =>
  n === null
    ? "—"
    : `$${new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 0,
      }).format(n / 1_000_000)} млн`;
const flag = (code: string) =>
  String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
export function MoviePage({ movie: m }: { movie: MovieDetail }) {
  const reduceMotion = useReducedMotion();
  const [video, setVideo] = useState<number | null>(null);
  const [image, setImage] = useState<number | null>(null);
  const [region, setRegion] = useState("Все регионы");
  const [type, setType] = useState("Все релизы");
  const [country, setCountry] = useState("");
  const [all, setAll] = useState(false);
  const [ascending, setAscending] = useState(true);
  const [galleryType, setGalleryType] = useState("Все");
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("frame-saved-v1") ?? "[]");
      setSaved(Array.isArray(ids) && ids.includes(m.id));
    } catch {
      setSaved(false);
    }
  }, [m.id]);
  useEffect(() => {
    const syncSection = () => {
      const id = window.location.hash.slice(1);
      if (["overview", "box-office", "releases", "videos"].includes(id)) {
        setActiveSection(id);
      }
    };
    syncSection();
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);
  const publicSample = Boolean(m.infoSource);
  const rows = m.releases
    .filter(
      (r) =>
        (region === "Все регионы" || r.region === region) &&
        (type === "Все релизы" || r.type === type) &&
        r.country.toLowerCase().includes(country.toLowerCase()),
    )
    .toSorted(
      (a, b) =>
        a.country.localeCompare(b.country, "ru") ||
        (a.date ?? "9999").localeCompare(b.date ?? "9999") *
          (ascending ? 1 : -1),
    );
  const sortedCountries = [...new Set(rows.map((r) => r.country))].sort(
    (a, b) => {
      const da = rows.find((r) => r.country === a)?.date ?? "9999";
      const db = rows.find((r) => r.country === b)?.date ?? "9999";
      return da.localeCompare(db) * (ascending ? 1 : -1);
    },
  );
  const grouped = sortedCountries.flatMap((c) =>
    rows.filter((r) => r.country === c),
  );
  const defaultCount = 3;
  const shown = all ? grouped : grouped.slice(0, defaultCount);
  const earliest = m.releases
    .filter((r) => r.date)
    .toSorted((a, b) => a.date!.localeCompare(b.date!))[0];
  const gallery = m.gallery.filter(
    (i) =>
      galleryType === "Все" ||
      (galleryType === "Постеры"
        ? i.kind.includes("постер")
        : i.kind.includes("Кадр")),
  );
  async function ask(q: string) {
    if (!q.trim() || busy) return;
    setQuestion(q);
    setBusy(true);
    setAnswer("");
    try {
      const r = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: m.id, question: q }),
      });
      const d = await r.json();
      setAnswer(r.ok ? d.answer : d.error);
    } catch {
      setAnswer("Не удалось связаться с помощником. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }
  function toggleSaved() {
    const next = !saved;
    setSaved(next);
    try {
      const ids: unknown = JSON.parse(
        localStorage.getItem("frame-saved-v1") ?? "[]",
      );
      const list = Array.isArray(ids)
        ? ids.filter((id) => typeof id === "string")
        : [];
      localStorage.setItem(
        "frame-saved-v1",
        JSON.stringify(
          next
            ? [...new Set([...list, m.id])]
            : list.filter((id) => id !== m.id),
        ),
      );
    } catch {
      /* The page remains usable without browser storage. */
    }
  }
  const renderVideo = (v: MovieDetail["videos"][number], i: number) => (
                <button
                  className="video-card"
                  key={v.id}
                  onClick={() => setVideo(i)}
                >
                  <div className="video-thumb">
                    {m.backdrop && (
                      <img src={m.backdrop} alt="" loading="lazy" />
                    )}
                    <span className="play-circle">
                      <Play size={23} fill="currentColor" />
                    </span>
                    <span className="video-badge">{v.type}</span>
                  </div>
                  <strong>
                    {v.title}
                    <ArrowUpRight size={17} />
                  </strong>
                  <small>{v.language} · YouTube · дата не указана</small>
                </button>
  );
  return (
    <div className="movie-page">
      <Header detail />
      <main>
        <div className={`movie-hero ${!m.poster && !m.backdrop ? "no-backdrop" : ""}`} id="overview">
          <div className="container hero-inner">
            <div className="film-cover">
              {(m.poster || m.backdrop) && (
                <img
                  className="movie-backdrop"
                  src={m.poster || m.backdrop!}
                  alt={`Постер фильма «${m.title}»`}
                />
              )}
              <div className="hero-toolbar">
                <Link href="/" aria-label="Назад к поиску" className="hero-icon-button">
                  <ChevronLeft size={23} />
                </Link>
                <span>FRAME / FILM 001</span>
                <button
                  className={`hero-icon-button ${saved ? "saved" : ""}`}
                  aria-label={saved ? "Убрать отметку" : "Отметить фильм"}
                  aria-pressed={saved}
                  onClick={toggleSaved}
                >
                  {saved ? <Check size={20} /> : <Bookmark size={20} />}
                </button>
              </div>
              <div className="box-office-sticker" aria-label={`Мировые сборы ${compactMoney(m.finance.worldwide.value)}`}>
                <strong>{compactMoney(m.finance.worldwide.value)}</strong>
                <span>мировой сбор</span>
              </div>
              <div className="movie-copy">
                <div className="title-kicker">ФИЛЬМ КРИСТОФЕРА НОЛАНА</div>
                <div className="title-lockup">
                  <h1>{m.title}</h1>
                </div>
                <div className="movie-subline">{m.originalTitle} · {m.year}</div>
                <div className="movie-meta">
                  <span><Clock3 size={15}/>{m.duration} мин</span>
                  <span>{m.countries[0]}</span>
                  <span className="age">{m.age}</span>
                </div>
                <div className="genre-bubbles">{m.genres.map(g => <span key={g}>{g}</span>)}</div>
                <div className="hero-actions">
                  <Button onClick={() => setVideo(0)} disabled={!m.videos.length}>
                    <Play size={17} fill="currentColor"/>Смотреть трейлер <ArrowUpRight size={16}/>
                  </Button>
                </div>
              </div>
            </div>
            <div className="rating-grid" aria-label="Рейтинги фильма">
              {m.ratings ? m.ratings.map((r,i) => <a key={`${r.brand}-${r.label}`} href={r.source.url} target="_blank" rel="noopener noreferrer" className="rating-item" aria-label={`${r.source.name}: ${r.label}, ${r.score}`} title={`${r.source.name} · ${r.label} · ${r.source.asOf}`}><span className={`rating-brand brand-${r.brand.toLowerCase()}`}>{r.brand === "RT" ? <><span className="rt-mark">{r.label === "Критики" ? <Star size={13} fill="currentColor"/> : <Users size={14}/>}</span>RT</> : r.brand === "MC" ? <><span className="mc-mark">m</span>Metacritic</> : "IMDb"}</span><strong>{r.score}</strong><span className="rating-label">{r.label}<ArrowUpRight size={11}/></span></a>) : <a className="rating-item" href={m.rating.source.url}><span className="rating-brand">{m.ratingLabel ?? "Демо-рейтинг"}</span><strong>{m.rating.value ?? "—"}{m.ratingUnit}</strong><span className="rating-label">{m.rating.source.name}</span></a>}
            </div>
            <p className="synopsis">{m.synopsis}</p>
            <nav className="film-tabs" aria-label="Разделы фильма">
              {[
                ["overview", "Обзор"],
                ["box-office", "Касса"],
                ["releases", "Даты"],
                ["videos", "Видео"],
              ].map(([id, title]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={activeSection === id ? "active" : ""}
                  onClick={() => setActiveSection(id)}
                >
                  {title}
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="container movie-content">
          <motion.section initial={false} whileInView={reduceMotion ? {} : { y: 0 }} style={{ y: reduceMotion ? 0 : 16 }} viewport={{once:true,amount:0.12}} transition={{duration:0.45}} id="releases" className="content-section">
            <SectionTitle
              title="Премьеры"
            />
            <div className="premiere-cards">
              {[
                {label: "Впервые в мире", release: earliest, icon: "WORLD"},
                {label: "В России", release: m.releases.find(r => r.code === "RU"), icon: "RU"},
              ].map(({label,release,icon}) => <div className="premiere-card" key={label}><span className="premiere-icon" aria-hidden="true">{icon}</span><div><span>{label}</span><strong>{release?.date ? formatDate(release.date) : "Дата не объявлена"}</strong></div></div>)}
            </div>
            <details className="feed-details"><summary>Все даты премьер <ChevronDown size={18}/></summary>
            <div className="release-filters">
              <label className="country-search">
                Страна
                <input
                  placeholder="Найти страну…"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </label>
              <label>
                Регион
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  {["Все регионы", "Европа", "Америка", "Азия", "Океания"].map(
                    (v) => (
                      <option key={v}>{v}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Тип релиза
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  {["Все релизы", ...new Set(m.releases.map(r => r.type))].map(
                    (v) => (
                      <option key={v}>{v}</option>
                    ),
                  )}
                </select>
              </label>
              <button
                className="sort-button"
                onClick={() => setAscending(!ascending)}
              >
                <ArrowDownUp size={15} />
                По дате {ascending ? "↑" : "↓"}
              </button>
            </div>
            <div className="release-list">
              {shown.map((r,i) => <div className="release-item" key={`${r.code}-${r.type}-${i}`}><span className="flag">{flag(r.code)}</span><div><strong>{r.country}</strong><small>{r.type}</small></div><time>{r.date ? formatDate(r.date) : "Дата не объявлена"}</time></div>)}
              {!rows.length && <p className="empty-inline">Нет релизов с такими фильтрами.</p>}
            </div>
            {rows.length > defaultCount && (
              <button
                className="text-button all-countries"
                onClick={() => setAll(!all)}
              >
                {all ? "Свернуть" : "Все страны и релизы"}{" "}
                <span>{rows.length}</span>
                <ChevronDown size={15} className={all ? "rotate" : ""} />
              </button>
            )}
            <p className="data-notice">{publicSample ? "Даты первого проката. Источники:" : "Даты — демонстрационный пример."}</p>
            {publicSample && <div className="source-links">{[...new Map(m.releases.map(r => [r.source.url,r.source])).values()].map(source => <SourceLink key={source.url} source={source}/>)}</div>}
            </details>
          </motion.section>
          <motion.section initial={false} whileInView={reduceMotion ? {} : { y: 0 }} style={{ y: reduceMotion ? 0 : 16 }} viewport={{once:true,amount:0.12}} transition={{duration:0.45}} id="box-office" className="content-section">
            <h2 className="sr-only">Кассовые сборы</h2>
            <div className="box-office-card">
              <div className="finance-caption"><span className="stat-label">Мировые сборы</span><TrendingUp size={24} strokeWidth={1.3}/></div>
              <strong className="big-total">{money(m.finance.worldwide.value)}</strong>
              {m.finance.budget.value && m.finance.worldwide.value ? <>
                <span className="ratio-bubble"><TrendingUp size={16}/>В {(m.finance.worldwide.value / m.finance.budget.value).toFixed(1)} раза больше бюджета</span>
                <div className="ratio-chart">
                  <div><span>Сборы по всему миру</span><strong>{money(m.finance.worldwide.value)}</strong></div>
                  <div className="chart-track"><motion.div className="bar worldwide-bar" initial={{scaleX:reduceMotion ? 1 : 0}} whileInView={{scaleX:1}} viewport={{once:true,amount:0.8}} transition={{duration:0.8}}/></div>
                  <div><span>Бюджет фильма</span><strong>{money(m.finance.budget.value)}</strong></div>
                  <div className="chart-track"><motion.div className="bar budget-bar" style={{width:`${Math.min(100,m.finance.budget.value / m.finance.worldwide.value * 100)}%`}} initial={{scaleX:reduceMotion ? 1 : 0}} whileInView={{scaleX:1}} viewport={{once:true,amount:0.8}} transition={{duration:0.8,delay:0.12}}/></div>
                </div>
                <p className="chart-note">Сборы — это выручка кинотеатров, а не прибыль фильма.</p>
              </> : <p className="chart-note">Данных для сравнения пока недостаточно.</p>}
            </div>
            <details className="feed-details"><summary>Подробнее о сборах <ChevronDown size={18}/></summary>
              <dl className="money-details">{Object.entries(m.finance).map(([key,data],i) => <div key={key}><dt>{["Бюджет","Первый уикенд · США и Канада","США и Канада","Весь мир"][i]}</dt><dd>{money(data.value)}</dd></div>)}</dl>
              <p className="data-notice">{publicSample ? "Все релизы, включая повторный прокат." : "Демонстрационные значения."} <SourceLink source={m.finance.worldwide.source}/> · {formatDate(m.finance.worldwide.source.asOf)}</p>
            </details>
          </motion.section>
          <motion.section initial={false} whileInView={reduceMotion ? {} : { y: 0 }} style={{ y: reduceMotion ? 0 : 16 }} viewport={{once:true,amount:0.12}} transition={{duration:0.45}} id="videos" className="content-section">
            <SectionTitle
              title="Трейлеры"
            />
            <div className="video-grid">
              {m.videos.slice(0,1).map(renderVideo)}
            </div>
            {m.videos.length > 1 && <details className="feed-details"><summary>Ещё видео <ChevronDown size={18}/></summary><div className="video-grid">{m.videos.slice(1).map((v,i) => renderVideo(v,i+1))}</div></details>}
            {!m.videos.length && (
              <Empty
                text="Трейлеры пока не добавлены"
                detail="Когда будет подключён источник, здесь появятся официальные ролики."
              />
            )}
          </motion.section>
          <motion.section initial={false} whileInView={reduceMotion ? {} : { y: 0 }} style={{ y: reduceMotion ? 0 : 16 }} viewport={{once:true,amount:0.12}} transition={{duration:0.45}} id="gallery" className="content-section">
            <SectionTitle
              title="Галерея"
            />
            <div
              className="gallery-tabs"
              role="group"
              aria-label="Тип изображений"
            >
              {["Все", "Кадры", "Постеры"].map((t) => (
                <button
                  key={t}
                  aria-pressed={galleryType === t}
                  className={galleryType === t ? "active" : ""}
                  onClick={() => setGalleryType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="gallery-grid">
              {gallery.map((i) => (
                <button
                  className={`gallery-item ${i.kind.includes("постер") ? "gallery-poster" : ""}`}
                  key={i.src}
                  onClick={() =>
                    setImage(m.gallery.findIndex((a) => a.src === i.src))
                  }
                >
                  <img src={i.src} alt={i.title} loading="lazy" />
                  <span>
                    {i.kind}
                    <ArrowUpRight size={16} />
                  </span>
                </button>
              ))}
            </div>
            {!gallery.length && (
              <Empty
                text="Изображений пока нет"
                detail="Официальные материалы появятся после подключения источника."
              />
            )}
          </motion.section>
          <motion.section initial={false} whileInView={reduceMotion ? {} : { y: 0 }} style={{ y: reduceMotion ? 0 : 16 }} viewport={{once:true,amount:0.12}} transition={{duration:0.45}} id="production" className="content-section">
            <div className="credits-heading">
              <span>05 / CREDITS</span>
              <h2>Создатели</h2>
            </div>
            <div className="production-grid">
              <div>
                <h3 className="subheading">Съёмочная группа</h3>
                <dl className="crew-list">
                  {m.crew.map((c) => (
                    <div key={c.role}>
                      <dt>{c.role}</dt>
                      <dd>{c.names}</dd>
                    </div>
                  ))}
                </dl>
                <h3 className="subheading cast-title">В главных ролях</h3>
                <div className="cast-list">
                  {m.cast.map((c, i) => (
                    <div key={c}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
              <details className="technical-panel feed-details"><summary><span><b>Техническая сторона</b><small>Камеры · формат · звук · студии</small></span><ChevronDown size={18}/></summary><div className="technical-body">
                <dl className="crew-list">
                  {m.technical.map((t) => (
                    <div key={t.label}>
                      <dt>{t.label}</dt>
                      <dd>{t.data.value ?? "Нет данных"}{t.data.value && <small className="technical-source"><SourceLink source={t.data.source}/></small>}</dd>
                    </div>
                  ))}
                  <div>
                    <dt>Страны</dt>
                    <dd>{m.countries.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Языки</dt>
                    <dd>{m.languages.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Студии</dt>
                    <dd>{m.studios.join(", ") || "Нет данных"}</dd>
                  </div>
                </dl>
                <p>
                  Модели камер и объективов пока не указаны. Подтверждённые сведения приведены со ссылками.
                </p>
                <a
                  className="text-button"
                  href={`https://www.imdb.com/title/${m.imdbId}/technical/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Характеристики на IMDb <ArrowUpRight size={15} />
                </a>
              </div></details>
            </div>
            <p className="data-notice">
              <Info size={14} />
              {m.infoSource ? <>Сведения о фильме и команде: <SourceLink source={m.infoSource}/>. Сохранённый пример, без автоматического обновления.</> : "Сведения о команде — локальная демонстрационная запись без подключённой верификации."}
            </p>
          </motion.section>
          <section className="assistant-section">
            <div className="assistant-heading">
              <Sparkles size={23} />
              <div>
                
                <h2>Спросите FRAME</h2>
              </div>
              <span className="small-demo">ДЕМО</span>
            </div>
            <p>
              Детали, которые вам интересны. Ответы на основе карточки фильма.
            </p>
            <div className="question-examples">
              {[
                "Когда фильм вышел в России?",
                "На какие камеры его снимали?",
                "Сколько он заработал относительно бюджета?",
                "Какие фильмы похожи по атмосфере?",
              ].slice(0,2).map((q) => (
                <button disabled={busy} onClick={() => ask(q)} key={q}>
                  {q}
                  <ArrowUpRight size={13} />
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(question);
              }}
              className="assistant-input"
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={1000}
                placeholder="Что вы хотите узнать о фильме?"
                aria-label="Вопрос о фильме"
              />
              <button
                disabled={busy || !question.trim()}
                aria-label="Отправить вопрос"
              >
                <Send size={19} />
              </button>
            </form>
            {busy && (
              <p className="assistant-answer" role="status">
                Проверяем локальную карточку…
              </p>
            )}
            {answer && (
              <p className="assistant-answer" role="status">
                {answer}
              </p>
            )}
            <small>
              Демонстрационный помощник · языковая модель ещё не подключена
            </small>
          </section>
        </div>
      </main>
      <footer className="detail-footer container">
        <Link href="/" className="logo">
          FRAME<span className="logo-dot">.</span>
        </Link>
        <span>Каждый фильм — больше, чем история.</span>
        <small>Демонстрационный прототип © 2026</small>
      </footer>
      <Dialog
        className="film-dialog"
        open={video !== null}
        onOpenChange={(o) => !o && setVideo(null)}
        title={video !== null ? (m.videos[video]?.title ?? "Видео") : "Видео"}
        wide
      >
        {video !== null && m.videos[video] && (
          <>
            <div className="player">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${m.videos[video].id}?autoplay=1`}
                title={m.videos[video].title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="player-note">
              {m.title} · {m.videos[video].language}{" "}
              <a
                href={`https://www.youtube.com/watch?v=${m.videos[video].id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть на YouTube <ArrowUpRight size={13} />
              </a>
            </p>
          </>
        )}
      </Dialog>
      <Dialog
        className="film-dialog"
        open={image !== null}
        onOpenChange={(o) => !o && setImage(null)}
        title={
          image !== null
            ? (m.gallery[image]?.title ?? "Изображение")
            : "Изображение"
        }
        wide
      >
        {image !== null && m.gallery[image] && (
          <>
            <div className="lightbox">
              <img src={m.gallery[image].src} alt={m.gallery[image].title} />
              {m.gallery.length > 1 && (
                <>
                  <button
                    className="lightbox-prev icon-button"
                    aria-label="Предыдущее изображение"
                    onClick={() =>
                      setImage(
                        (image - 1 + m.gallery.length) % m.gallery.length,
                      )
                    }
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    className="lightbox-next icon-button"
                    aria-label="Следующее изображение"
                    onClick={() => setImage((image + 1) % m.gallery.length)}
                  >
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>
            <p className="player-note">
              {m.gallery[image].kind}
              <span>
                {image + 1} / {m.gallery.length}
              </span>
            </p>
          </>
        )}
      </Dialog>
    </div>
  );
}
function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <div className="section-title">
      <h2 className="section-bubble">{title}</h2>
    </div>
  );
}
function Empty({ text, detail }: { text: string; detail: string }) {
  return (
    <div className="empty-inline">
      <ImageIcon size={25} />
      <strong>{text}</strong>
      <p>{detail}</p>
    </div>
  );
}

function SourceLink({source}:{source: import('@/lib/types').Source}) { return source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.name} ↗</a> : <span>{source.name}</span>; }
