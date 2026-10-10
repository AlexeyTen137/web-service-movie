"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Clapperboard } from "lucide-react";
import { Dialog } from "./ui/dialog";
import { Search } from "./search";
export function Header({ detail = false }: { detail?: boolean }) {
  const [about, setAbout] = useState(false);
  return (
    <>
      <header className="site-header">
        <Link href="/" className="logo" aria-label="FRAME — главная">
          <span className="logo-mark" />
          FRAME<span className="logo-dot">.</span>
        </Link>
        <span className="brand-caption">КИНО В ДЕТАЛЯХ</span>
        {detail && (
          <div className="film-search-shell">
            <span className="film-perf film-perf-top" aria-hidden="true" />
            <div className="header-search">
              <Search compact />
            </div>
            <span className="film-perf film-perf-bottom" aria-hidden="true" />
            <span className="film-search-index" aria-hidden="true">
              FRAME / FIND / 01
            </span>
          </div>
        )}
        <nav aria-label="Главная навигация">
          <button onClick={() => setAbout(true)}>
            О проекте <ArrowUpRight size={13} />
          </button>
          <span className="demo-pill">
            <span />
            Демо-версия
          </span>
        </nav>
      </header>
      <Dialog
        open={about}
        onOpenChange={setAbout}
        title="Кино заслуживает внимания."
      >
        <div className="about-content">
          <Clapperboard size={34} />
          <p>
            FRAME собирает детали фильма в одном месте: от первой премьеры до
            последней строки титров.
          </p>
          <p className="muted">
            Сейчас это визуальный прототип. Карточка «Интерстеллара» наполнена сведениями из открытых источников со ссылками. В остальных карточках демонстрационные значения отмечены отдельно. Автоматические API и ИИ ещё не подключены.
          </p>
          <div className="note">
            Изображения: демонстрационные материалы из TMDB. Этот продукт
            использует изображения TMDB, но не одобрен и не сертифицирован TMDB.
          </div>
        </div>
      </Dialog>
    </>
  );
}
