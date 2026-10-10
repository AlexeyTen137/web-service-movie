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
          <div className="film-module-grid">
            <section id="releases" className="film-module module-releases">
              <span className="module-index">01 / PREMIERES</span>
              <h2>Премьеры</h2>
              <div className="module-dates">
                <div><span>WORLD</span><strong>{earliest?.date ? formatDate(earliest.date).replace(" г.", "") : "Ожидается"}</strong></div>
                <div><span>РОССИЯ</span><strong>{m.releases.find(r => r.code === "RU")?.date ? formatDate(m.releases.find(r => r.code === "RU")!.date!).replace(" г.", "") : "Ожидается"}</strong></div>
              </div>
              <span className="module-foot">Первый выход на экран</span>
            </section>
            <section id="box-office" className="film-module module-finance">
              <span className="module-index">02 / BOX OFFICE</span>
              <h2>Мировые сборы</h2>
              <strong className="module-total">{compactMoney(m.finance.worldwide.value)}</strong>
              <span className="module-ratio">{m.finance.budget.value && m.finance.worldwide.value ? `↗ В ${(m.finance.worldwide.value / m.finance.budget.value).toFixed(1)} раза больше бюджета` : "Бюджет не указан"}</span>
              <div className="module-finance-bars" aria-label="Сравнение сборов и бюджета">
                <div><span>Сборы</span><span>{compactMoney(m.finance.worldwide.value)}</span></div>
                <i><b style={{width:"100%"}}/></i>
                <div><span>Бюджет</span><span>{compactMoney(m.finance.budget.value)}</span></div>
                <i><b className="module-budget-bar" style={{width:`${m.finance.budget.value && m.finance.worldwide.value ? Math.min(100,m.finance.budget.value / m.finance.worldwide.value * 100) : 0}%`}}/></i>
              </div>
            </section>
            <section id="videos" className="film-module module-videos">
              <span className="module-index">03 / TRAILERS</span>
              <h2>Трейлеры</h2>
              <div className="module-preview">
                {m.backdrop && <img src={m.backdrop} alt="" loading="lazy"/>}
                <span className="module-play"><Play size={18} fill="currentColor"/></span>
              </div>
              <span className="module-foot">{m.videos.length ? `${m.videos.length} видео · официальный трейлер` : "Видео пока нет"}</span>
            </section>
            <section id="gallery" className="film-module module-gallery">
              <span className="module-index">04 / GALLERY</span>
              <h2>Галерея</h2>
              <div className="module-stills">
                {m.gallery.slice(0,2).map((item) => <img key={item.src} src={item.src} alt={item.title} loading="lazy"/>)}
                {!m.gallery.length && <ImageIcon size={34}/>}
              </div>
              <span className="module-foot">{m.gallery.length ? `${m.gallery.length} изображений · кадры и постеры` : "Изображений пока нет"}</span>
            </section>
          </div>
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
