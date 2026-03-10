"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ExternalLink } from "lucide-react";

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (symbol: string) => {
    setQuery("");
    setOpen(false);
    setResults([]);
    router.push(`/stocks/${symbol}`);
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            search(e.target.value);
          }}
          onFocus={() => query && setOpen(true)}
          placeholder="Rechercher une action, ETF, indice…"
          className="w-full bg-bg-card border border-bg-border rounded-lg pl-9 pr-8 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30 transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="absolute right-2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && (results.length > 0 || loading) && (
        <div className="absolute top-full mt-1 w-full bg-bg-card border border-bg-border rounded-xl shadow-2xl z-50 overflow-hidden fade-in">
          {loading ? (
            <div className="flex items-center justify-center p-4 text-slate-500 text-sm">
              <div className="w-4 h-4 border-2 border-accent-blue/40 border-t-accent-blue rounded-full animate-spin mr-2" />
              Recherche…
            </div>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={r.symbol}>
                  <button
                    onClick={() => handleSelect(r.symbol)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors text-left"
                  >
                    <div>
                      <span className="font-semibold text-white text-sm">
                        {r.symbol}
                      </span>
                      <span className="text-slate-400 text-sm ml-2 truncate">
                        {r.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500">{r.exchange}</span>
                      <ExternalLink className="w-3 h-3 text-slate-600" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
