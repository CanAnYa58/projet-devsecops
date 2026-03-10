"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase, Trash2, TrendingUp, TrendingDown,
  Plus, ArrowUpRight, Info,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { PortfolioHoldingWithValue } from "@/types";
import {
  formatPrice, formatPercent, formatLargeNumber, getPnlColor, formatDate,
} from "@/lib/utils";

function EmptyPortfolio() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center mx-auto mb-4">
        <Briefcase className="w-8 h-8 text-accent-blue" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        Portefeuille vide
      </h3>
      <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
        Ajoutez des actions depuis leur page de détail pour suivre vos positions.
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

export default function PortfolioPage() {
  const { portfolio, removeHolding } = useStore();
  const [holdings, setHoldings] = useState<PortfolioHoldingWithValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (portfolio.length === 0) {
      setHoldings([]);
      return;
    }
    setLoading(true);
    const symbols = [...new Set(portfolio.map((h) => h.symbol))].join(",");
    fetch(`/api/quote?symbols=${symbols}`)
      .then((r) => r.json())
      .then((quotes) => {
        const quoteMap = new Map(
          (Array.isArray(quotes) ? quotes : []).map((q: { symbol: string; price: number; currency: string }) => [q.symbol, q])
        );
        const enriched: PortfolioHoldingWithValue[] = portfolio.map((h) => {
          const q = quoteMap.get(h.symbol) as { price: number; currency: string } | undefined;
          const currentPrice = q?.price ?? h.buyPrice;
          const currentValue = currentPrice * h.quantity;
          const totalCost = h.buyPrice * h.quantity;
          const pnl = currentValue - totalCost;
          const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
          return {
            ...h,
            currentPrice,
            currentValue,
            totalCost,
            pnl,
            pnlPercent,
          };
        });
        setHoldings(enriched);
      })
      .catch(() => {
        // show without current price
        const fallback: PortfolioHoldingWithValue[] = portfolio.map((h) => ({
          ...h,
          currentPrice: h.buyPrice,
          currentValue: h.buyPrice * h.quantity,
          totalCost: h.buyPrice * h.quantity,
          pnl: 0,
          pnlPercent: 0,
        }));
        setHoldings(fallback);
      })
      .finally(() => setLoading(false));
  }, [portfolio]);

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const positiveOverall = totalPnl >= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-accent-blue" />
            Mon Portefeuille
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {portfolio.length} position{portfolio.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-2 bg-accent-blue hover:bg-accent-blue/90 rounded-lg text-sm text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Link>
      </div>

      {portfolio.length === 0 ? (
        <EmptyPortfolio />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-bg-card border border-bg-border rounded-xl p-4 col-span-2">
              <div className="text-xs text-slate-400 mb-1">Valeur totale du portefeuille</div>
              <div className="text-2xl font-bold text-white font-mono">
                {loading ? (
                  <div className="skeleton h-7 w-32 rounded" />
                ) : (
                  `${totalValue.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
                )}
              </div>
            </div>

            <div className="bg-bg-card border border-bg-border rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">P&amp;L total</div>
              {loading ? (
                <div className="skeleton h-6 w-24 rounded" />
              ) : (
                <>
                  <div className={`text-xl font-bold font-mono ${getPnlColor(totalPnl)}`}>
                    {totalPnl >= 0 ? "+" : ""}
                    {totalPnl.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs mt-0.5 ${getPnlColor(totalPnl)}`}
                  >
                    {positiveOverall ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {formatPercent(totalPnlPercent)}
                  </div>
                </>
              )}
            </div>

            <div className="bg-bg-card border border-bg-border rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Coût total investi</div>
              {loading ? (
                <div className="skeleton h-6 w-24 rounded" />
              ) : (
                <div className="text-xl font-bold text-white font-mono">
                  {totalCost.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                </div>
              )}
            </div>
          </div>

          {/* Holdings table */}
          <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-bg-border">
              <h2 className="text-sm font-semibold text-white">Positions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bg-border">
                    {[
                      "Titre",
                      "Date achat",
                      "Qté",
                      "Prix achat",
                      "Prix actuel",
                      "Valeur",
                      "P&L",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-border">
                  {holdings.map((h) => (
                    <tr key={h.id} className="hover:bg-bg-hover transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/stocks/${h.symbol}`}
                          className="flex items-center gap-1 font-mono font-semibold text-white hover:text-accent-blue transition-colors"
                        >
                          {h.symbol}
                          <ArrowUpRight className="w-3 h-3 opacity-50" />
                        </Link>
                        <div className="text-xs text-slate-500 truncate max-w-[120px]">
                          {h.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {formatDate(h.buyDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        {h.quantity % 1 === 0 ? h.quantity : h.quantity.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono">
                        {formatPrice(h.buyPrice, h.currency)}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {loading ? (
                          <div className="skeleton h-4 w-16 rounded" />
                        ) : (
                          <span className="text-white">
                            {formatPrice(h.currentPrice, h.currency)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {loading ? (
                          <div className="skeleton h-4 w-20 rounded" />
                        ) : (
                          <span className="text-white font-medium">
                            {formatLargeNumber(h.currentValue)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {loading ? (
                          <div className="skeleton h-5 w-16 rounded-full" />
                        ) : (
                          <div>
                            <div
                              className={`text-sm font-semibold font-mono ${getPnlColor(h.pnl)}`}
                            >
                              {h.pnl >= 0 ? "+" : ""}
                              {h.pnl.toFixed(2)}
                            </div>
                            <div
                              className={`text-xs ${getPnlColor(h.pnl)} opacity-70`}
                            >
                              {formatPercent(h.pnlPercent)}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {confirmDelete === h.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                removeHolding(h.id);
                                setConfirmDelete(null);
                              }}
                              className="text-xs text-accent-red bg-accent-red/10 px-2 py-1 rounded hover:bg-accent-red/20 transition-colors"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-slate-400 px-2 py-1 rounded hover:bg-bg-border transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(h.id)}
                            className="p-1.5 text-slate-600 hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-2 text-xs text-slate-500 bg-bg-card/50 border border-bg-border rounded-lg px-4 py-3">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              Les prix sont indicatifs et mis à jour toutes les ~30 secondes. Les données
              sont stockées localement dans votre navigateur.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
