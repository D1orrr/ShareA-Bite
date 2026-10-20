/**
 * Mock data for the MVP. Shapes are kept close to what the FastAPI backend
 * will eventually return, so screens can later swap these for API calls.
 */

export type Category = "Sayuran" | "Protein" | "Bumbu" | "Karbo";

export interface Ingredient {
  name: string;
  qty: number;
  unit: string;
  price: number;
  cat: Category;
  /** Cheaper alternative suggestion, if any. */
  swap?: string;
}

export interface Step {
  text: string;
  /** Timer length in seconds (0 = no timer). */
  seconds: number;
}

export interface Recipe {
  id: number;
  title: string;
  emoji: string;
  /** Accent colour behind the plate illustration. */
  color: string;
  minutes: number;
  kcal: number;
  protein: number;
  carbs: number;
  /** Nutrition score 0-100. */
  score: number;
  tip: string;
  ingredients: Ingredient[];
  steps: Step[];
}

export interface CartItem extends Omit<Ingredient, "swap"> {
  done: boolean;
}

export type PostType = "Resep" | "Info Warung" | "Trik Masak";

export interface Post {
  id: string;
  author: string;
  campus: string;
  time: string;
  type: PostType;
  recipeId?: number;
  imageUri?: string;
  cost?: number;
  title: string;
  body: string;
  location?: string;
  cookTime?: string;
  perPortion?: string;
  likes: number;
  comments: number;
}

export interface Spot {
  name: string;
  distance: string;
  hours: string;
  price: number;
  rating: string;
  tags: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: 1,
    title: "Nasi Telur Kecap Cabai Rawit",
    emoji: "🍳",
    color: "#F4B82E",
    minutes: 15,
    kcal: 540,
    protein: 22,
    carbs: 78,
    score: 82,
    tip: "Api kecil biar telurnya nggak gosong.",
    ingredients: [
      { name: "Nasi putih", qty: 1, unit: "porsi", price: 3000, cat: "Karbo" },
      { name: "Telur ayam", qty: 2, unit: "btr", price: 4000, cat: "Protein", swap: "Tahu 2 pcs, hemat Rp2.000" },
      { name: "Kecap manis", qty: 1, unit: "sdm", price: 500, cat: "Bumbu" },
      { name: "Cabai rawit", qty: 5, unit: "bh", price: 800, cat: "Bumbu" },
      { name: "Bawang merah", qty: 2, unit: "siung", price: 700, cat: "Bumbu" },
      { name: "Minyak goreng", qty: 2, unit: "sdm", price: 500, cat: "Bumbu" },
    ],
    steps: [
      { text: "Panaskan minyak, tumis bawang merah dan cabai sampai harum.", seconds: 60 },
      { text: "Kocok telur, tuang, orak-arik sampai set.", seconds: 90 },
      { text: "Tambah kecap, aduk rata, sajikan di atas nasi hangat.", seconds: 0 },
    ],
  },
  {
    id: 2,
    title: "Tumis Kangkung Tempe Orek",
    emoji: "🥬",
    color: "#7FBF8F",
    minutes: 20,
    kcal: 480,
    protein: 18,
    carbs: 70,
    score: 76,
    tip: "Kangkung masuk paling akhir biar tetap hijau.",
    ingredients: [
      { name: "Nasi putih", qty: 1, unit: "porsi", price: 3000, cat: "Karbo" },
      { name: "Kangkung", qty: 1, unit: "ikat", price: 3000, cat: "Sayuran" },
      { name: "Tempe", qty: 1, unit: "papan", price: 4000, cat: "Protein", swap: "Tahu putih, hemat Rp1.500" },
      { name: "Bawang putih", qty: 2, unit: "siung", price: 600, cat: "Bumbu" },
      { name: "Cabai rawit", qty: 5, unit: "bh", price: 800, cat: "Bumbu" },
      { name: "Kecap manis", qty: 2, unit: "sdm", price: 1000, cat: "Bumbu" },
    ],
    steps: [
      { text: "Potong tempe dadu kecil, goreng sampai garing.", seconds: 180 },
      { text: "Tumis bawang putih dan cabai, masukkan tempe plus kecap.", seconds: 60 },
      { text: "Masukkan kangkung, aduk 1 menit lalu angkat.", seconds: 60 },
    ],
  },
  {
    id: 3,
    title: "Indomie Rebus Sayur Telur",
    emoji: "🍜",
    color: "#F2A27E",
    minutes: 12,
    kcal: 610,
    protein: 21,
    carbs: 84,
    score: 68,
    tip: "Telur dimasukkan pas air mendidih, jangan diaduk dulu.",
    ingredients: [
      { name: "Indomie", qty: 1, unit: "bks", price: 3500, cat: "Karbo" },
      { name: "Telur ayam", qty: 1, unit: "btr", price: 2000, cat: "Protein" },
      { name: "Sawi hijau", qty: 1, unit: "ikat", price: 2500, cat: "Sayuran" },
      { name: "Bawang merah", qty: 2, unit: "siung", price: 700, cat: "Bumbu" },
      { name: "Cabai rawit", qty: 3, unit: "bh", price: 500, cat: "Bumbu" },
      { name: "Kecap manis", qty: 1, unit: "sdm", price: 500, cat: "Bumbu" },
    ],
    steps: [
      { text: "Rebus air 400 ml dengan bawang merah iris.", seconds: 120 },
      { text: "Masukkan mie dan telur, masak sampai matang.", seconds: 180 },
      { text: "Tambah sawi dan bumbu, aduk 30 detik, sajikan.", seconds: 30 },
    ],
  },
];

export const getRecipe = (id: number | string) => RECIPES.find((r) => r.id === Number(id)) ?? RECIPES[0];

export const INITIAL_CART: CartItem[] = [
  { name: "Kangkung", qty: 1, unit: "ikat", price: 3000, cat: "Sayuran", done: true },
  { name: "Telur", qty: 6, unit: "btr", price: 12000, cat: "Protein", done: false },
  { name: "Tempe", qty: 1, unit: "papan", price: 5000, cat: "Protein", done: false },
  { name: "Bawang merah", qty: 1, unit: "ons", price: 1700, cat: "Bumbu", done: true },
  { name: "Cabai rawit", qty: 50, unit: "g", price: 1000, cat: "Bumbu", done: false },
  { name: "Indomie", qty: 5, unit: "bks", price: 5000, cat: "Karbo", done: false },
];

export const CATEGORIES: Category[] = ["Sayuran", "Protein", "Bumbu", "Karbo"];

export const INITIAL_POSTS: Post[] = [
  {
    id: "p1",
    author: "Rina",
    campus: "UI Depok",
    time: "2 jam lalu",
    type: "Resep",
    recipeId: 2,
    cost: 7000,
    title: "Mendoan Renyah Sambal Kecap Cuma Rp7.000!",
    body: "Beli tempe papan di Pasar Kober cuma Rp4.000, tepung bumbu sachet Rp2.500, daun bawang minta bonus pedagang. Goreng dadakan langsung gurih mantap!",
    likes: 142,
    comments: 38,
  },
  {
    id: "p2",
    author: "Budi",
    campus: "Kukusan",
    time: "5 jam lalu",
    type: "Info Warung",
    title: "Tips belanja telur eceran di Warung Madura Jl. Kober hemat Rp3rb/kg",
    body: "Kalau beli setelah jam 4 sore sering ada harga pas Rp27.000/kg dan boleh pilih telur yang fresh. Cocok buat stok lauk seminggu anak kosan.",
    location: "Warung Madura Berkah, Jl. Kober No. 14",
    likes: 89,
    comments: 16,
  },
  {
    id: "p3",
    author: "Dimas",
    campus: "Pocin",
    time: "Kemarin",
    type: "Trik Masak",
    recipeId: 1,
    cost: 5500,
    title: "Tumis Toge Tahu Saus Tiram: Modal Rp5.500 Buat Sarapan",
    body: "Tahu kuning 2 biji (Rp2.000) goreng sebentar, toge seplastik kecil (Rp2.000), sachet saus tiram mini (Rp1.500). Masak 5 menit di rice cooker pun jadi!",
    cookTime: "5 - 7 Menit",
    perPortion: "Rp2.750 / org",
    likes: 204,
    comments: 45,
  },
];

export const SPOTS: Spot[] = [
  { name: "Warung Bu Tini", distance: "250 m", hours: "06.00 sampai 21.00", price: 9000, rating: "4,7", tags: ["Nasi", "Protein", "Buka sekarang"] },
  { name: "Pasar Pagi Margonda", distance: "600 m", hours: "05.00 sampai 11.00", price: 7500, rating: "4,5", tags: ["Sayur", "Protein"] },
  { name: "Tahu Tempe Pak Yanto", distance: "900 m", hours: "07.00 sampai 17.00", price: 5000, rating: "4,8", tags: ["Protein", "Buka sekarang"] },
  { name: "Lapak Sayur Mbak Wati", distance: "1,1 km", hours: "06.00 sampai 15.00", price: 4000, rating: "4,6", tags: ["Sayur", "Buka sekarang"] },
];

/** Daily spend history (Rp) shown on the profile chart. */
export const INITIAL_HISTORY = [12500, 9500, 14000, 8800, 11000, 7500];

/** Mock: what the user has spent on food today (drives the home status stamp). */
export const TODAY_SPENT = 9500;

/** Shopping-trip budget used on the Daftar Belanja screen. */
export const SHOP_BUDGET = 35000;

export const PROFILE = {
  name: "Dinda Aprilia",
  first: "Dinda",
  campus: "Universitas Indonesia, Depok",
  level: "Lv.3 Anak Kos Pintar",
  shared: 12,
  savedThisMonth: "Rp148rb",
};
