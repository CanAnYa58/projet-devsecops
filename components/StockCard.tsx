"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { StockQuote } from "@/types";
import { useStore } from "@/lib/store";
import { formatPrice, formatPercent, formatLargeNumber } from "@/lib/utils";

interface StockCardProps {
  quote: StockQuote;
  showMarketCap?: boolean;
}

export default function StockCard({ quote, showMarketCap = false }: StockCardProps) {
  const { isFavorite, toggleFavorite } = useStore();
  const fav = isFavorite(quote.symbol);
  const positive = quote.changePercent >= 0;
  const color = positive ? "text-accent-green" : "text-accent-red";
  const bgColor = positive
    ? "bg-accent-green/10 text-accent-green"
    : "bg-accent-red/10 text-accent-red";

  return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-4 hover:border-accent-blue/40 hover:bg-bg-hover transition-all duration-200 group relative">
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(quote.symbol);
        }}
        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors ${
          fav
            ? "text-accent-yellow bg-accent-yellow/10"
            : "text-slate-600 hover:text-slate-400 hover:bg-bg-border"
        }`}
        title={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <Star className="w-3.5 h-3.5" fill={fav ? "currentColor" : "none"} />
      </button>

      <Link href={`/stocks/${quote.symbol}`} className="block">
        <div className="pr-7">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="font-mono font-semibold text-white text-sm">
                {quote.symbol}
              </div>
              <div className="text-slate-400 text-xs mt-0.5 truncate max-w-[140px]">
                {quote.name}
              </div>
            </div>
            <div
              className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${bgColor}`}
            >
              {formatPercent(quote.changePercent)}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold text-white">
                {formatPrice(quote.price, quote.currency)}
              </div>
              <div className={`text-xs ${color}`}>
                {positive ? "+" : ""}
                {formatPrice(quote.change, quote.currency)}
              </div>
            </div>
            {showMarketCap && quote.marketCap && (
              <div className="text-right">
                <div className="text-xs text-slate-500">Cap. boursière</div>
                <div className="text-xs text-slate-300 font-medium">
                  {formatLargeNumber(quote.marketCap)}
                </div>
              </div>
            )}
          </div>

          {!showMarketCap && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-bg-border">
              <span className="text-xs text-slate-500">{quote.exchange}</span>
              <span className="text-xs text-slate-500">
                Vol. {formatLargeNumber(quote.volume)}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
