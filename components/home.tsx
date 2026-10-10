"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Globe2,
  ChartNoAxesCombined,
  Film,
  ArrowDown,
} from "lucide-react";
import { Header } from "./header";
import { Search } from "./search";
export function Home() {
  const reduced = useReducedMotion();
  return (
    <div className="home">
      <div className="home-image" />
      <div className="home-shade" />
      <Header />
      <main className="home-main">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
        >
          <div className="eyebrow home-eyebrow">
            <span className="tiny-line" /> ДЛЯ ТЕХ, КТО СМОТРИТ ГЛУБЖЕ
          </div>
          <h1>
            Всё о кино.
            <br />
            <em>В одном кадре.</em>
          </h1>
          <p className="home-description">
            Мировые премьеры, кассовые сборы, трейлеры
            <br className="desktop-break" /> и история создания — достаточно
            знать название фильма.
          </p>
          <Search />
          <div className="examples">
            <span>Например</span>
            <Link href="/movie/interstellar">Интерстеллар</Link>
            <Link href="/movie/dune-2">Дюна: Часть вторая</Link>
            <Link href="/movie/cheburashka">Чебурашка</Link>
            <Link href="/movie/rrr">
              RRR <ArrowUpRight size={12} />
            </Link>
          </div>
        </motion.div>
      </main>
      <div className="home-bottom">
        <div className="value-strip">
          <span>
            <Globe2 size={17} />
            Премьеры по всему миру
          </span>
          <span>
            <ChartNoAxesCombined size={17} />
            Кино в цифрах
          </span>
          <span>
            <Film size={17} />
            История за кадром
          </span>
        </div>
        <Link className="frame-caption" href="/movie/interstellar">
          <span>В ЭТОМ КАДРЕ</span>
          <strong>
            Интерстеллар <ArrowUpRight size={14} />
          </strong>
          <small>2014 · Кристофер Нолан</small>
        </Link>
      </div>
      <footer className="home-footer">
        <span>Каждый фильм — больше, чем история.</span>
        <span>
          FRAME © 2026 <span className="footer-divider">/</span> Независимый
          взгляд на кино
        </span>
      </footer>
    </div>
  );
}
