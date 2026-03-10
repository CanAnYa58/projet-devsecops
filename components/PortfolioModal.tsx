"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { StockQuote } from "@/types";
import { formatPrice } from "@/lib/utils";

interface PortfolioModalProps {
  quote: StockQuote;
  onClose: () => void;
}

export default function PortfolioModal({ quote, onClose }: PortfolioModalProps) {
  const { addHolding } = useStore();
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState(quote.price.toFixed(2));
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split("T")[0]);
  const [saved, setSaved] = useState(false);

  const totalCost =
    parseFloat(quantity || "0") * parseFloat(buyPrice || "0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || !buyPrice) return;
    addHolding({
      symbol: quote.symbol,
      name: quote.name,
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
      buyDate,
      currency: quote.currency,
    });
    setSaved(true);
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-bg-card border border-bg-border rounded-2xl w-full max-w-md shadow-2xl fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-bg-border">
          <div>
            <h2 className="text-white font-semibold">Ajouter au portefeuille</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              {quote.symbol} · {quote.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-bg-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current price badge */}
        <div className="px-5 py-3 bg-bg-secondary/50">
          <span className="text-xs text-slate-400">Prix actuel : </span>
          <span className="text-sm font-semibold text-white">
            {formatPrice(quote.price, quote.currency)}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Quantité *
            </label>
            <input
              type="number"
              step="any"
              min="0.000001"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="ex. 10"
              className="w-full bg-bg-secondary border border-bg-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Prix d&apos;achat ({quote.currency}) *
            </label>
            <input
              type="number"
              step="any"
              min="0.000001"
              required
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="w-full bg-bg-secondary border border-bg-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Date d&apos;achat *
            </label>
            <input
              type="date"
              required
              value={buyDate}
              onChange={(e) => setBuyDate(e.target.value)}
              className="w-full bg-bg-secondary border border-bg-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30"
            />
          </div>

          {/* Cost preview */}
          {totalCost > 0 && (
            <div className="bg-bg-secondary rounded-lg px-3 py-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Coût total estimé</span>
                <span className="font-semibold text-white">
                  {formatPrice(totalCost, quote.currency)}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saved}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              saved
                ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                : "bg-accent-blue hover:bg-accent-blue/90 text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
            {saved ? "Ajouté !" : "Ajouter la position"}
          </button>
        </form>
      </div>
    </div>
  );
}
