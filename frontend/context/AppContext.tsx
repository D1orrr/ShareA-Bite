import React, { createContext, useContext, useState, ReactNode } from "react";

export type IngredientCategory = "Sayuran & Segar" | "Protein" | "Bumbu & Cabai";

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  price: number;
  category: IngredientCategory;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url: string;
  fallback_emoji: string;
  is_ai_generated: boolean;
  target_budget: number;
  actual_cost: number;
  prep_time_minutes: number;
  tags: string[];
  servings: number;
  author: string;
  author_level: string;
  likes: number;
  ingredients: Ingredient[];
  instructions: string[];
}

export interface ShoppingItem extends Ingredient {
  checked: boolean;
  recipe_title?: string;
}

export interface ExpenseRecord {
  id: string;
  week: string;
  label: string;
  amount: number;
  budgetLimit: number;
}

export interface UserProfile {
  name: string;
  campus: string;
  level: number;
  title: string;
  xp: number;
  xpNext: number;
  totalSaved: number;
  recipesCount: number;
}

interface AppContextType {
  recipes: Recipe[];
  shoppingList: ShoppingItem[];
  userProfile: UserProfile;
  weeklyExpenses: ExpenseRecord[];
  activeDraft: Recipe | null;
  toggleShoppingItem: (id: string) => void;
  addShoppingItem: (item: Omit<ShoppingItem, "id" | "checked">) => void;
  removeShoppingItem: (id: string) => void;
  clearCompletedShopping: () => void;
  addRecipeToShoppingList: (recipe: Recipe) => void;
  setActiveDraft: (recipe: Recipe | null) => void;
  publishRecipe: (recipe: Omit<Recipe, "id" | "likes">) => void;
  likeRecipe: (id: string) => void;
  addGeneratedRecipes: (newRecipes: Recipe[]) => void;
}

const INITIAL_RECIPES: Recipe[] = [
  {
    id: "rec-1",
    title: "Tumis Kangkung Tempe Gurih",
    description: "Kombinasi kangkung segar dan tempe goreng potong dadu dengan saus tiram gurih pedas khas warteg.",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    fallback_emoji: "🥬",
    is_ai_generated: true,
    target_budget: 15000,
    actual_cost: 11500,
    prep_time_minutes: 10,
    tags: ["High Protein", "Pedas Gurih", "10 Menit Masak"],
    servings: 1,
    author: "Share'N'Bite AI",
    author_level: "Algoritma Warung",
    likes: 42,
    ingredients: [
      { id: "ing-1", name: "Kangkung 1 Ikat", quantity: "1 ikat", price: 3000, category: "Sayuran & Segar" },
      { id: "ing-2", name: "Tempe Kedelai", quantity: "1/2 papan", price: 3500, category: "Protein" },
      { id: "ing-3", name: "Bawang Merah & Putih", quantity: "4 siung", price: 2000, category: "Bumbu & Cabai" },
      { id: "ing-4", name: "Cabai Rawit Merah", quantity: "5 buah", price: 1500, category: "Bumbu & Cabai" },
      { id: "ing-5", name: "Saus Tiram & Garam", quantity: "1 sdm", price: 1500, category: "Bumbu & Cabai" },
    ],
    instructions: [
      "Potong dadu tempe, goreng setengah matang hingga berkulit lalu tiriskan.",
      "Iris tipis bawang merah, bawang putih, dan cabai rawit.",
      "Tumis bumbu iris hingga harum, masukkan kangkung yang sudah dicuci bersih.",
      "Tambahkan sedikit air, saus tiram, garam, dan masukkan tempe goreng.",
      "Aduk cepat selama 2 menit dengan api besar agar kangkung tetap renyah hijau."
    ]
  },
  {
    id: "rec-2",
    title: "Telur Dadar Crispy Bawang Cabe",
    description: "Telur dadar tebal ala rumah makan padang dengan pinggiran krispi keriting dan irisan daun bawang melimpah.",
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80",
    fallback_emoji: "🍳",
    is_ai_generated: false,
    target_budget: 12000,
    actual_cost: 9000,
    prep_time_minutes: 8,
    tags: ["High Protein", "Porsi Kenyang", "Hemat Parah"],
    servings: 2,
    author: "Dimas Kos Palmerah",
    author_level: "Level 6: Sultan Warteg",
    likes: 89,
    ingredients: [
      { id: "ing-6", name: "Telur Ayam", quantity: "2 butir", price: 5000, category: "Protein" },
      { id: "ing-7", name: "Daun Bawang", quantity: "2 batang", price: 1500, category: "Sayuran & Segar" },
      { id: "ing-8", name: "Cabai Merah Keriting", quantity: "3 buah", price: 1000, category: "Bumbu & Cabai" },
      { id: "ing-9", name: "Tepung Beras & Kaldu", quantity: "1 sdm", price: 1500, category: "Bumbu & Cabai" },
    ],
    instructions: [
      "Kocok lepas telur bersama tepung beras dan kaldu bubuk hingga berbusa.",
      "Iris halus daun bawang dan cabai, campurkan ke dalam adonan telur.",
      "Panaskan minyak agak banyak hingga benar-benar panas berasap.",
      "Tuang telur dari ketinggian agak tinggi agar timbul renda-renda krispi.",
      "Goreng hingga kecokelatan, balik sekali, lalu angkat dan tiriskan."
    ]
  },
  {
    id: "rec-3",
    title: "Tahu Bejek Sambal Matah Kos",
    description: "Tahu putih kukus yang dihancurkan kasar lalu disiram sambal matah serai segar dengan minyak panas.",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
    fallback_emoji: "🥢",
    is_ai_generated: true,
    target_budget: 10000,
    actual_cost: 7500,
    prep_time_minutes: 7,
    tags: ["Tanpa Minyak Jahat", "Pedas Gurih", "Diet Sehat"],
    servings: 1,
    author: "Share'N'Bite AI",
    author_level: "Algoritma Warung",
    likes: 31,
    ingredients: [
      { id: "ing-10", name: "Tahu Putih Sutra", quantity: "2 kotak", price: 4000, category: "Protein" },
      { id: "ing-11", name: "Bawang Merah", quantity: "5 siung", price: 1500, category: "Bumbu & Cabai" },
      { id: "ing-12", name: "Batang Serai", quantity: "1 batang", price: 500, category: "Sayuran & Segar" },
      { id: "ing-13", name: "Cabai Rawit", quantity: "6 buah", price: 1500, category: "Bumbu & Cabai" },
    ],
    instructions: [
      "Rebus atau kukus tahu putih selama 4 menit, lalu bejek kasar dengan garpu di mangkuk.",
      "Iris halus bawang merah, cabai rawit, dan bagian putih batang serai.",
      "Campurkan irisan dengan garam, sedikit gula, dan perasan jeruk limau.",
      "Siram sambal dengan 1 sdm minyak panas mendidih, lalu tuang ke atas tahu bejek."
    ]
  }
];

const INITIAL_SHOPPING: ShoppingItem[] = [
  { id: "shop-1", name: "Kangkung Segar", quantity: "1 ikat", price: 3000, category: "Sayuran & Segar", checked: false, recipe_title: "Tumis Kangkung Tempe" },
  { id: "shop-2", name: "Tempe Papan", quantity: "1 papan", price: 5000, category: "Protein", checked: true, recipe_title: "Tumis Kangkung Tempe" },
  { id: "shop-3", name: "Telur Ayam Negeri", quantity: "4 butir", price: 10000, category: "Protein", checked: false, recipe_title: "Telur Dadar Crispy" },
  { id: "shop-4", name: "Bawang Merah & Putih", quantity: "1 bungkus kecil", price: 3500, category: "Bumbu & Cabai", checked: true, recipe_title: "Bumbu Dapur" },
  { id: "shop-5", name: "Cabai Rawit Campur", quantity: "1 ons", price: 4000, category: "Bumbu & Cabai", checked: false, recipe_title: "Sambal" },
];

const INITIAL_EXPENSES: ExpenseRecord[] = [
  { id: "exp-1", week: "M1", label: "Minggu 1", amount: 125000, budgetLimit: 150000 },
  { id: "exp-2", week: "M2", label: "Minggu 2", amount: 98000, budgetLimit: 150000 },
  { id: "exp-3", week: "M3", label: "Minggu 3", amount: 142000, budgetLimit: 150000 },
  { id: "exp-4", week: "M4", label: "Minggu 4", amount: 85000, budgetLimit: 150000 },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(INITIAL_SHOPPING);
  const [activeDraft, setActiveDraft] = useState<Recipe | null>(null);
  const [weeklyExpenses, setWeeklyExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Rian Pratama",
    campus: "Binus Syahdan",
    level: 4,
    title: "Master Masak Air 🍳",
    xp: 430,
    xpNext: 500,
    totalSaved: 164500,
    recipesCount: 5,
  });

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const addShoppingItem = (item: Omit<ShoppingItem, "id" | "checked">) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `shop-${Date.now()}`,
      checked: false,
    };
    setShoppingList(prev => [newItem, ...prev]);
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearCompletedShopping = () => {
    setShoppingList(prev => prev.filter(item => !item.checked));
  };

  const addRecipeToShoppingList = (recipe: Recipe) => {
    const newItems: ShoppingItem[] = recipe.ingredients.map(ing => ({
      id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: ing.name,
      quantity: ing.quantity,
      price: ing.price,
      category: ing.category,
      checked: false,
      recipe_title: recipe.title,
    }));
    setShoppingList(prev => [...newItems, ...prev]);
  };

  const publishRecipe = (newRecipeData: Omit<Recipe, "id" | "likes">) => {
    const createdRecipe: Recipe = {
      ...newRecipeData,
      id: `rec-${Date.now()}`,
      likes: 1,
    };
    setRecipes(prev => [createdRecipe, ...prev]);
    // Boost XP and stats
    setUserProfile(prev => ({
      ...prev,
      xp: prev.xp + 50 >= prev.xpNext ? 50 : prev.xp + 50,
      level: prev.xp + 50 >= prev.xpNext ? prev.level + 1 : prev.level,
      title: prev.xp + 50 >= prev.xpNext ? "Level 5: Sultan Warteg 👑" : prev.title,
      recipesCount: prev.recipesCount + 1,
    }));
  };

  const likeRecipe = (id: string) => {
    setRecipes(prev =>
      prev.map(r => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  const addGeneratedRecipes = (newRecipes: Recipe[]) => {
    setRecipes(prev => [...newRecipes, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        recipes,
        shoppingList,
        userProfile,
        weeklyExpenses,
        activeDraft,
        toggleShoppingItem,
        addShoppingItem,
        removeShoppingItem,
        clearCompletedShopping,
        addRecipeToShoppingList,
        setActiveDraft,
        publishRecipe,
        likeRecipe,
        addGeneratedRecipes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
