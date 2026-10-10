"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  ArrowUpRight,
  LoaderCircle,
  CornerDownLeft,
} from "lucide-react";
import type { MovieDetail } from "@/lib/types";
export function Search({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<MovieDetail[]>([]);
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (!q.trim()) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!r.ok) throw Error();
        setResults(await r.json());
        setIndex(-1);
      } catch (e) {
        if ((e as Error).name !== "AbortError")
          setError("Не удалось загрузить результаты. Попробуйте ещё раз.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const shortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", shortcut);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", shortcut);
    };
  }, []);
  const go = (m: MovieDetail) => {
    setOpen(false);
    setQ("");
    router.push(`/movie/${m.id}`);
  };
  return (
    <div className={`search-root ${compact ? "compact" : ""}`} ref={root}>
      <div className="search-field">
        <SearchIcon size={compact ? 18 : 23} />
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLoading(Boolean(e.target.value.trim()));
            setResults([]);
            setIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          role="combobox"
          aria-label="Поиск фильма"
          aria-expanded={open && !!q.trim()}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={index >= 0 ? `result-${index}` : undefined}
          placeholder={
            compact
              ? "> НАЙТИ ФИЛЬМ_"
              : "Название фильма или оригинальное название…"
          }
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setIndex((i) => Math.min(i + 1, results.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setIndex((i) => Math.max(i - 1, 0));
            }
            if (e.key === "Enter" && results.length)
              go(results[index >= 0 ? index : 0]);
          }}
        />
        {loading ? <LoaderCircle className="spin" size={20} /> : <kbd>⌘ K</kbd>}
        <button
          className="search-submit"
          aria-label="Открыть результат поиска"
          disabled={!results.length}
          onClick={() => results.length && go(results[index >= 0 ? index : 0])}
        >
          <ArrowUpRight size={23} />
        </button>
      </div>
      {open && q.trim() && (
        <div
          className="search-results"
          id="search-results"
          role="listbox"
          aria-label="Найденные фильмы"
        >
          {loading ? (
            <p className="search-message" role="status">
              Ищем ваш фильм…
            </p>
          ) : error ? (
            <p className="search-message" role="alert">
              {error}
            </p>
          ) : results.length ? (
            results.map((m, i) => (
              <button
                key={m.id}
                role="option"
                aria-selected={i === index}
                id={`result-${i}`}
                className={`search-result ${i === index ? "selected" : ""}`}
                onClick={() => go(m)}
                onMouseEnter={() => setIndex(i)}
              >
                {m.poster ? (
                  <img src={m.poster} alt="" width={40} height={60} />
                ) : (
                  <span className="mini-poster">F</span>
                )}
                <span>
                  <strong>{m.title}</strong>
                  <small>
                    {m.originalTitle} · {m.year}
                  </small>
                </span>
                <CornerDownLeft size={17} />
              </button>
            ))
          ) : (
            <p className="search-message">
              Пока не найдено. Попробуйте «Интерстеллар», Dune, «Чебурашка» или
              RRR.
            </p>
          )}
          <div className="search-hint">
            ↑ ↓ выбрать <span>↵ открыть</span>
            <span>esc закрыть</span>
          </div>
        </div>
      )}
    </div>
  );
}
