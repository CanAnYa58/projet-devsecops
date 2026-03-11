"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, RefreshCw, Plus } from "lucide-react";
import StockCard from "@/components/StockCard";
import { useStore } from "@/lib/store";
import { StockQuote } from "@/types";
import * as api from "@/lib/api";

function EmptyFavorites() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-accent-yellow/10 flex items-center justify-center mx-auto mb-4">
        <Star className="w-8 h-8 text-accent-yellow" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Aucun favori
      </h3>
      <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
        Ajoutez des actions en favori depuis leur fiche ou depuis les cartes sur le
        tableau de bord.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue rounded-lg text-sm text-white hover:bg-accent-blue/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Parcourir les marchés
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-4 space-y-3">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-6 w-32 rounded" />
      <div className="skeleton h-3 w-16 rounded" />
    </div>
  );
}

export default function FavoritesPage() {
  const { favorites, loadFavorites } = useStore();
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load favorites from backend on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const fetchQuotes = async (isRefresh = false) => {
    if (favorites.length === 0) {
      setQuotes([]);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await api.fetchQuote(favorites);
      if (Array.isArray(data)) {
        // Preserve favorites order
        const orderedQuotes = favorites
          .map((sym) => data.find((q: StockQuote) => q.symbol === sym))
          .filter(Boolean) as StockQuote[];
        setQuotes(orderedQuotes);
        setLastUpdated(new Date());
      }
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [favorites]);

  useEffect(() => {
    if (favorites.length === 0) return;
    const interval = setInterval(() => fetchQuotes(true), 60000);
    return () => clearInterval(interval);
  }, [favorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-accent-yellow" fill="currentColor" />
            Mes Favoris
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {favorites.length} action{favorites.length > 1 ? "s" : ""} suivie
            {favorites.length > 1 ? "s" : ""}
          </p>
        </div>
        {favorites.length > 0 && (
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-500 hidden sm:block">
                Mis à jour : {lastUpdated.toLocaleTimeString("fr-FR")}
              </span>
            )}
            <button
              onClick={() => fetchQuotes(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-300 hover:text-white hover:bg-bg-hover transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:block">Actualiser</span>
            </button>
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: favorites.length }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : (quotes || []).map((q) => <StockCard key={q.symbol} quote={q} showMarketCap />)}
        </div>
      )}
    </div>
  );
}
