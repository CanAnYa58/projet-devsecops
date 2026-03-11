"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { StockQuote } from "@/types";
import { formatPrice, formatPercent, formatLargeNumber } from "@/lib/utils";

interface IndexCardProps {
  symbol: string;
  name: string;
  quote: StockQuote;
}

export default function IndexCard({ symbol, name, quote }: IndexCardProps) {
  // Safety check: if quote is undefined or missing required properties, return null
  if (!quote || typeof quote.changePercent !== 'number' || typeof quote.price !== 'number') {
    return null;
  }

  const positive = quote.changePercent >= 0;
  const color = positive ? "text-accent-green" : "text-accent-red";
  const borderColor = positive ? "border-accent-green/20" : "border-accent-red/20";
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <Link href={`/stocks/${encodeURIComponent(symbol)}`}>
      <div
        className={`bg-bg-card border ${borderColor} rounded-xl p-4 hover:bg-bg-hover transition-all duration-200 cursor-pointer group`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs font-medium text-slate-400">{name}</div>
            <div className="text-xs text-slate-600 mt-0.5">{symbol}</div>
          </div>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              positive ? "bg-accent-green/15" : "bg-accent-red/15"
            }`}
          >
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        </div>

        <div className="text-xl font-bold text-white font-mono">
          {quote.price > 1000
            ? formatLargeNumber(quote.price)
            : formatPrice(quote.price, quote.currency)}
        </div>

        <div className={`flex items-center gap-2 mt-1.5`}>
          <span className={`text-sm font-medium ${color}`}>
            {formatPercent(quote.changePercent)}
          </span>
          <span className={`text-xs ${color} opacity-70`}>
            {positive ? "+" : ""}
            {quote.change.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
