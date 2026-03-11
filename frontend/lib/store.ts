"use client";

import { create } from "zustand";
import { PortfolioHolding } from "@/types";
import * as api from "./api";

interface StoreState {
  favorites: string[];
  portfolio: PortfolioHolding[];
  isLoading: boolean;
  
  // Favorites
  loadFavorites: () => Promise<void>;
  addFavorite: (symbol: string) => Promise<void>;
  removeFavorite: (symbol: string) => Promise<void>;
  isFavorite: (symbol: string) => boolean;
  toggleFavorite: (symbol: string) => Promise<void>;
  
  // Portfolio
  loadPortfolio: () => Promise<void>;
  addHolding: (holding: Omit<PortfolioHolding, "id">) => Promise<void>;
  updateHolding: (id: string, holding: Partial<PortfolioHolding>) => Promise<void>;
  removeHolding: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>()((set, get) => ({
  favorites: [],
  portfolio: [],
  isLoading: false,

  // Load favorites from backend
  loadFavorites: async () => {
    try {
      const favorites = await api.getFavorites();
      set({ favorites: Array.isArray(favorites) ? favorites : [] });
    } catch (error) {
      console.error("Failed to load favorites:", error);
      set({ favorites: [] });
    }
  },

  addFavorite: async (symbol) => {
    try {
      await api.addFavorite(symbol);
      set((state) => ({
        favorites: state.favorites.includes(symbol)
          ? state.favorites
          : [...state.favorites, symbol],
      }));
    } catch (error) {
      console.error("Failed to add favorite:", error);
    }
  },

  removeFavorite: async (symbol) => {
    try {
      await api.removeFavorite(symbol);
      set((state) => ({
        favorites: state.favorites.filter((s) => s !== symbol),
      }));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  },

  isFavorite: (symbol) => get().favorites.includes(symbol),

  toggleFavorite: async (symbol) => {
    const { isFavorite, addFavorite, removeFavorite } = get();
    if (isFavorite(symbol)) {
      await removeFavorite(symbol);
    } else {
      await addFavorite(symbol);
    }
  },

  // Load portfolio from backend
  loadPortfolio: async () => {
    try {
      const portfolio = await api.getPortfolio();
      set({ portfolio: Array.isArray(portfolio) ? portfolio : [] });
    } catch (error) {
      console.error("Failed to load portfolio:", error);
      set({ portfolio: [] });
    }
  },

  addHolding: async (holding) => {
    try {
      const newHolding = await api.addHolding(holding);
      set((state) => ({
        portfolio: [...state.portfolio, newHolding],
      }));
    } catch (error) {
      console.error("Failed to add holding:", error);
      throw error;
    }
  },

  updateHolding: async (id, holding) => {
    try {
      await api.updateHolding(id, holding);
      set((state) => ({
        portfolio: state.portfolio.map((h) =>
          h.id === id ? { ...h, ...holding } : h
        ),
      }));
    } catch (error) {
      console.error("Failed to update holding:", error);
      throw error;
    }
  },

  removeHolding: async (id) => {
    try {
      await api.removeHolding(id);
      set((state) => ({
        portfolio: state.portfolio.filter((h) => h.id !== id),
      }));
    } catch (error) {
      console.error("Failed to remove holding:", error);
      throw error;
    }
  },
}));
