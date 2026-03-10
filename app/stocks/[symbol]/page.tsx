"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Star, Plus, ArrowLeft, TrendingUp, TrendingDown,
  BarChart2, DollarSign, Activity, Info,
} from "lucide-react";
import StockChart from "@/components/StockChart";
import PortfolioModal from "@/components/PortfolioModal";
import { useStore } from "@/lib/store";
import { StockQuote } from "@/types";
import {
  formatPrice, formatPercent, formatLargeNumber,
} from "@/lib/utils";

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-secondary/60 rounded-lg px-3 py-2.5">
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export default function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  const decodedSymbol = decodeURIComponent(symbol);
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useStore();

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fav = quote ? isFavorite(quote.symbol) : false;
  const positive = (quote?.changePercent ?? 0) >= 0;

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/quote?symbols=${decodedSymbol}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuote(data[0]);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [decodedSymbol]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="skeleton h-6 w-32 rounded" />
          <div className="skeleton h-10 w-64 rounded" />
          <div className="skeleton h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="bg-bg-card border border-bg-border rounded-xl p-12">
          <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Action introuvable
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Le symbole &quot;{decodedSymbol}&quot; n&apos;a pas été trouvé.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-accent-blue rounded-lg text-sm text-white hover:bg-accent-blue/90 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const changeColor = positive ? "text-accent-green" : "text-accent-red";

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 fade-in">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        {/* Stock header */}
        <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white font-mono">
                  {quote.symbol}
                </h1>
                <span className="text-xs bg-bg-border text-slate-400 px-2 py-0.5 rounded">
                  {quote.exchange}
                </span>
              </div>
              <p className="text-slate-400">{quote.name}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(quote.symbol)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  fav
                    ? "bg-accent-yellow/15 border-accent-yellow/40 text-accent-yellow"
                    : "bg-bg-secondary border-bg-border text-slate-300 hover:border-accent-yellow/40 hover:text-accent-yellow"
                }`}
              >
                <Star
                  className="w-4 h-4"
                  fill={fav ? "currentColor" : "none"}
                />
                {fav ? "Favori" : "Ajouter aux favoris"}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-accent-blue hover:bg-accent-blue/90 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Portefeuille
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-end gap-4">
            <div className="text-4xl font-bold text-white font-mono">
              {formatPrice(quote.price, quote.currency)}
            </div>
            <div className={`flex items-center gap-2 pb-1 ${changeColor}`}>
              {positive ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span className="text-lg font-semibold">
                {positive ? "+" : ""}
                {quote.change.toFixed(2)}
              </span>
              <span
                className={`text-sm px-2 py-0.5 rounded-full ${
                  positive
                    ? "bg-accent-green/15 text-accent-green"
                    : "bg-accent-red/15 text-accent-red"
                }`}
              >
                {formatPercent(quote.changePercent)}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Clôture précédente : {formatPrice(quote.previousClose, quote.currency)}
          </div>
        </div>

        {/* Chart */}
        <StockChart
          symbol={decodedSymbol}
          currency={quote.currency}
          isPositive={positive}
        />

        {/* Stats grid */}
        <div className="bg-bg-card border border-bg-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accent-blue" />
            Statistiques
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <StatItem label="Ouverture" value={formatPrice(quote.open, quote.currency)} />
            <StatItem label="Haut du jour" value={formatPrice(quote.dayHigh, quote.currency)} />
            <StatItem label="Bas du jour" value={formatPrice(quote.dayLow, quote.currency)} />
            <StatItem
              label="Volume"
              value={formatLargeNumber(quote.volume)}
            />
            {quote.fiftyTwoWeekHigh && (
              <StatItem
                label="Plus haut 52 sem."
                value={formatPrice(quote.fiftyTwoWeekHigh, quote.currency)}
              />
            )}
            {quote.fiftyTwoWeekLow && (
              <StatItem
                label="Plus bas 52 sem."
                value={formatPrice(quote.fiftyTwoWeekLow, quote.currency)}
              />
            )}
            {quote.marketCap && (
              <StatItem
                label="Cap. boursière"
                value={formatLargeNumber(quote.marketCap)}
              />
            )}
            {quote.trailingPE && (
              <StatItem
                label="P/E (trailing)"
                value={quote.trailingPE.toFixed(2)}
              />
            )}
            {quote.eps && (
              <StatItem
                label="BPA"
                value={formatPrice(quote.eps, quote.currency)}
              />
            )}
            {quote.dividendYield && (
              <StatItem
                label="Rendement div."
                value={`${(quote.dividendYield * 100).toFixed(2)}%`}
              />
            )}
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-card border border-bg-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-blue/15 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-blue" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Devise</div>
              <div className="text-sm font-semibold text-white">
                {quote.currency}
              </div>
            </div>
          </div>
          <div className="bg-bg-card border border-bg-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/15 flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent-purple" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Bourse</div>
              <div className="text-sm font-semibold text-white">
                {quote.exchange}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio modal */}
      {showModal && (
        <PortfolioModal quote={quote} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
