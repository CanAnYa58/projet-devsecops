"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PortfolioHolding } from "@/types";

interface StoreState {
  favorites: string[];
  portfolio: PortfolioHolding[];
  addFavorite: (symbol: string) => void;
  removeFavorite: (symbol: string) => void;
  isFavorite: (symbol: string) => boolean;
  toggleFavorite: (symbol: string) => void;
  addHolding: (holding: Omit<PortfolioHolding, "id">) => void;
  updateHolding: (id: string, holding: Partial<PortfolioHolding>) => void;
  removeHolding: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      favorites: [],
      portfolio: [],

      addFavorite: (symbol) =>
        set((state) => ({
          favorites: state.favorites.includes(symbol)
            ? state.favorites
            : [...state.favorites, symbol],
        })),

      removeFavorite: (symbol) =>
        set((state) => ({
          favorites: state.favorites.filter((s) => s !== symbol),
        })),

      isFavorite: (symbol) => get().favorites.includes(symbol),

      toggleFavorite: (symbol) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        isFavorite(symbol) ? removeFavorite(symbol) : addFavorite(symbol);
      },

      addHolding: (holding) =>
        set((state) => ({
          portfolio: [
            ...state.portfolio,
            { ...holding, id: `${Date.now()}-${Math.random()}` },
          ],
        })),

      updateHolding: (id, holding) =>
        set((state) => ({
          portfolio: state.portfolio.map((h) =>
            h.id === id ? { ...h, ...holding } : h
          ),
        })),

      removeHolding: (id) =>
        set((state) => ({
          portfolio: state.portfolio.filter((h) => h.id !== id),
        })),
    }),
    { name: "stock-tracker-v1" }
  )
);
