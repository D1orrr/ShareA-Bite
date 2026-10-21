import { useEffect, useState } from "react";
import type { Recipe } from "../constants/data";
import { useStore } from "../context/AppStore";

/** Load a recipe by id (cache → API → offline samples). `undefined` while loading, `null` if not found. */
export function useRecipe(id: string | number | undefined) {
  const { cachedRecipe, getRecipe, ready } = useStore();
  const n = Number(id);
  const [r, setR] = useState<Recipe | null | undefined>(() => cachedRecipe(n));
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    const hit = cachedRecipe(n);
    if (hit) setR(hit);
    else {
      setR(undefined);
      getRecipe(n).then(x => alive && setR(x));
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, ready]);
  return r;
}

/** Seed recipe ids pre-rendered for the static web export (other ids still work in-app). */
export const STATIC_RECIPE_IDS = Array.from({ length: 15 }, (_, i) => ({ id: String(i + 1) }));
