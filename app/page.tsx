"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Globe, LineChart } from "lucide-react";
import IndexCard from "@/components/IndexCard";
import StockCard from "@/components/StockCard";
import { StockQuote, MarketIndex } from "@/types";
import { formatPercent } from "@/lib/utils";

interface MarketData {
  indices: MarketIndex[];
  popularStocks: StockQuote[];
  gainers: StockQuote[];
  losers: StockQuote[];
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

function ETFRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-3"><div className="skeleton h-4 w-14 rounded" /></td>
      <td className="px-4 py-3 hidden sm:table-cell"><div className="skeleton h-4 w-40 rounded" /></td>
      <td className="px-4 py-3 text-right"><div className="skeleton h-4 w-16 rounded ml-auto" /></td>
      <td className="px-4 py-3 text-right"><div className="skeleton h-5 w-14 rounded-full ml-auto" /></td>
      <td className="px-4 py-3 text-right hidden md:table-cell"><div className="skeleton h-4 w-12 rounded ml-auto" /></td>
      <td className="px-4 py-3 text-right hidden lg:table-cell"><div className="skeleton h-4 w-16 rounded ml-auto" /></td>
    </tr>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [etfs, setEtfs] = useState<StockQuote[]>([]);
  const [etfsLoading, setEtfsLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMarket = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/market");
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      setData(d);
      setLastUpdated(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchETFs = async () => {
    setEtfsLoading(true);
    try {
      const res = await fetch("/api/etfs");
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      setEtfs(Array.isArray(d) ? d : []);
    } catch {
      setEtfs([]);
    } finally {
      setEtfsLoading(false);
    }
  };

  useEffect(() => {
    // Both start in parallel — ETFs slow won't block main content
    fetchMarket();
    fetchETFs();
    const interval = setInterval(() => {
      fetchMarket(true);
      fetchETFs();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-accent-blue" />
            Marchés Financiers
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Suivez les indices et actions du monde entier en temps réel
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-500 hidden sm:block">
              Mis à jour : {lastUpdated.toLocaleTimeString("fr-FR")}
            </span>
          )}
          <button
            onClick={() => { fetchMarket(true); fetchETFs(); }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-bg-card border border-bg-border rounded-lg text-sm text-slate-300 hover:text-white hover:bg-bg-hover transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:block">Actualiser</span>
          </button>
        </div>
      </div>

      {error && !data && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl p-4 text-accent-red text-sm text-center">
          Impossible de charger les données de marché. Vérifiez votre connexion.
        </div>
      )}

      {/* Indices mondiaux */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-blue" />
          Indices Mondiaux
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.indices.map((idx) => (
                <IndexCard
                  key={idx.symbol}
                  symbol={idx.symbol}
                  name={idx.name}
                  quote={idx.quote}
                />
              ))}
        </div>
      </section>

      {/* Gainers & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-green" />
            Meilleures Hausses
          </h2>
          <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="divide-y divide-bg-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="skeleton h-3 w-16 rounded" />
                      <div className="skeleton h-3 w-28 rounded" />
                    </div>
                    <div className="skeleton h-6 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <tbody className="divide-y divide-bg-border">
                  {data?.gainers.map((s) => (
                    <tr
                      key={s.symbol}
                      className="hover:bg-bg-hover transition-colors cursor-pointer"
                      onClick={() => (window.location.href = `/stocks/${s.symbol}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-semibold text-white text-sm">{s.symbol}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[160px]">{s.name}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-medium text-white">{s.price.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-block bg-accent-green/15 text-accent-green text-xs font-semibold px-2 py-0.5 rounded-full">
                          {formatPercent(s.changePercent)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-accent-red" />
            Plus Fortes Baisses
          </h2>
          <div className="bg-bg-card border border-bg-border rounded-xl overflow-hidden">
            {loading ? (
              <div className="divide-y divide-bg-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="skeleton h-3 w-16 rounded" />
                      <div className="skeleton h-3 w-28 rounded" />
                    </div>
                    <div className="skeleton h-6 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full">
                <tbody className="divide-y divide-bg-border">
                  {data?.losers.map((s) => (
                    <tr
                      key={s.symbol}
                      className="hover:bg-bg-hover transition-colors cursor-pointer"
                      onClick={() => (window.location.href = `/stocks/${s.symbol}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-semibold text-white text-sm">{s.symbol}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[160px]">{s.name}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-medium text-white">{s.price.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-block bg-accent-red/15 text-accent-red text-xs font-semibold px-2 py-0.5 rounded-full">
                          {formatPercent(s.changePercent)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* Popular Stocks */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-purple" />
          Actions Populaires
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.popularStocks.slice(0, 10).map((s) => (
                <StockCard key={s.symbol} quote={s} showMarketCap />
              ))}
        </div>
      </section>

      {/* ETFs — chargement indépendant */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-accent-yellow" />
          ETFs Populaires
          {etfsLoading && (
            <div className="w-3.5 h-3.5 border-2 border-accent-yellow/30 border-t-accent-yellow rounded-full animate-spin ml-1" />
          )}
        </h2>
        <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Symbole</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 hidden sm:table-cell">Nom</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Prix</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Variation</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 hidden md:table-cell">Var. $</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 hidden lg:table-cell">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {etfsLoading
                  ? Array.from({ length: 10 }).map((_, i) => <ETFRowSkeleton key={i} />)
                  : etfs.map((etf) => {
                      const positive = etf.changePercent >= 0;
                      return (
                        <tr
                          key={etf.symbol}
                          className="hover:bg-bg-hover transition-colors cursor-pointer"
                          onClick={() => (window.location.href = `/stocks/${etf.symbol}`)}
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-white">{etf.symbol}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-slate-400 truncate max-w-[200px] block">{etf.name}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-white">
                            {etf.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                              positive ? "bg-accent-green/15 text-accent-green" : "bg-accent-red/15 text-accent-red"
                            }`}>
                              {formatPercent(etf.changePercent)}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right text-sm font-mono hidden md:table-cell ${positive ? "text-accent-green" : "text-accent-red"}`}>
                            {positive ? "+" : ""}{etf.change.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-400 text-xs hidden lg:table-cell">
                            {etf.volume > 1e6
                              ? `${(etf.volume / 1e6).toFixed(1)}M`
                              : etf.volume > 1e3
                              ? `${(etf.volume / 1e3).toFixed(0)}K`
                              : etf.volume}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
