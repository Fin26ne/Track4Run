"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

type Action =
  | { type: "SET"; payload: number[] }
  | { type: "ADD"; payload: number }
  | { type: "REMOVE"; payload: number };

function favoritesReducer(state: number[], action: Action): number[] {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD":
      if (state.includes(action.payload)) return state;
      return [...state, action.payload];
    case "REMOVE":
      return state.filter((id) => id !== action.payload);
    default:
      return state;
  }
}

interface FavoritesContextType {
  favorites: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, dispatch] = useReducer(favoritesReducer, []);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      supabase
        .from("favorites")
        .select("product_id")
        .then(({ data, error }) => {
          if (!error && data) {
            const ids = data.map((item: { product_id: number }) => item.product_id);
            dispatch({ type: "SET", payload: ids });
          } else {
            dispatch({ type: "SET", payload: [] });
          }
        });
    } else {
      dispatch({ type: "SET", payload: [] });
    }
  }, [user]);

  const isFavorite = (id: number) => favorites.includes(id);

  const toggleFavorite = async (id: number) => {
    if (!user) return;

    const isFav = favorites.includes(id);

    if (isFav) {
      dispatch({ type: "REMOVE", payload: id });
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("product_id", id);

      if (error) {
        dispatch({ type: "ADD", payload: id });
      }
    } else {
      dispatch({ type: "ADD", payload: id });
      const { error } = await supabase
        .from("favorites")
        .insert({ product_id: id });

      if (error) {
        dispatch({ type: "REMOVE", payload: id });
      }
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
