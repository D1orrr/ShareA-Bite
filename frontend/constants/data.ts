// Data types + offline sample data. The real data comes from the FastAPI backend
// (see lib/api.ts); these samples are only used when the backend is not running.

export type Category = "Karbo" | "Protein" | "Bumbu" | "Sayuran";

export type SwapTo = { to: string; qty: number; unit: string; saving: number };

export type Ingredient = {
  id?: number;
  name: string;
  qty: number;
  unit: string;
  price: number;
  cat: Category;
  /** Human text of the cheaper swap, e.g. "Tahu 2 pcs, hemat Rp2.000". */
  swap?: string;
  /** Structured swap the app can apply. */
  swapTo?: SwapTo | null;
  /** First cooking step that uses this ingredient. */
  step?: number;
  /** Staple usually already at the kos (rice, oil, kecap, salt). */
  pantry?: boolean;
};

export type Step = { text: string; sec: number };

export type Recipe = {
  id: number;
  title: string;
  color: string;
  min: number;
  cal: number;
  pro: number;
  carb: number;
  score: number;
  tip: string;
  ing: Ingredient[];
  steps: Step[];
  /** Plate illustration (1-3). Falls back to the id for the sample recipes. */
  art?: number;
  /** Total cost from the backend (same as the sum of ingredient prices). */
  cost?: number;
  /** What the user pays, e.g. without staples when "Bahan ada" is on. */
  pay?: number;
  pantryCost?: number;
  /** Set on "versi hemat" variants made by a cheaper swap. */
  parentId?: number | null;
  ai?: boolean;
  tools?: string[];
  tags?: string[];
};

export const RECIPES: Recipe[] = [
  {
    id: 1,
    title: "Nasi Telur Kecap Cabai Rawit",
    color: "#F4B82E",
    min: 15,
    cal: 540,
    pro: 22,
    carb: 78,
    score: 82,
    tip: "Api kecil biar telurnya nggak gosong.",
    ing: [
      { name: "Nasi putih", qty: 1, unit: "porsi", price: 3000, cat: "Karbo" },
      { name: "Telur ayam", qty: 2, unit: "btr", price: 4000, cat: "Protein", swap: "Tahu 2 pcs, hemat Rp2.000", swapTo: { to: "Tahu", qty: 2, unit: "pcs", saving: 2000 } },
      { name: "Kecap manis", qty: 1, unit: "sdm", price: 500, cat: "Bumbu" },
      { name: "Cabai rawit", qty: 5, unit: "bh", price: 800, cat: "Bumbu" },
      { name: "Bawang merah", qty: 2, unit: "siung", price: 700, cat: "Bumbu" },
      { name: "Minyak goreng", qty: 2, unit: "sdm", price: 500, cat: "Bumbu" },
    ],
    steps: [
      { text: "Panaskan minyak, tumis bawang merah dan cabai sampai harum.", sec: 60 },
      { text: "Kocok telur, tuang, orak-arik sampai set.", sec: 90 },
      { text: "Tambah kecap, aduk rata, sajikan di atas nasi hangat.", sec: 0 },
    ],
  },
  {
    id: 2,
    title: "Tumis Kangkung Tempe Orek",
    color: "#7FBF8F",
    min: 20,
    cal: 480,
    pro: 18,
    carb: 70,
    score: 76,
    tip: "Kangkung masuk paling akhir biar tetap hijau.",
    ing: [
      { name: "Nasi putih", qty: 1, unit: "porsi", price: 3000, cat: "Karbo" },
      { name: "Kangkung", qty: 1, unit: "ikat", price: 3000, cat: "Sayuran" },
      { name: "Tempe", qty: 1, unit: "papan", price: 4000, cat: "Protein", swap: "Tahu putih 2 pcs, hemat Rp2.000", swapTo: { to: "Tahu putih", qty: 2, unit: "pcs", saving: 2000 } },
      { name: "Bawang putih", qty: 2, unit: "siung", price: 600, cat: "Bumbu" },
      { name: "Cabai rawit", qty: 5, unit: "bh", price: 800, cat: "Bumbu" },
      { name: "Kecap manis", qty: 2, unit: "sdm", price: 1000, cat: "Bumbu" },
    ],
    steps: [
      { text: "Potong tempe dadu kecil, goreng sampai garing.", sec: 180 },
      { text: "Tumis bawang putih dan cabai, masukkan tempe plus kecap.", sec: 60 },
      { text: "Masukkan kangkung, aduk 1 menit lalu angkat.", sec: 60 },
    ],
  },
  {
    id: 3,
    title: "Indomie Rebus Sayur Telur",
    color: "#F2A27E",
    min: 12,
    cal: 610,
    pro: 21,
    carb: 84,
    score: 68,
    tip: "Telur dimasukkan pas air mendidih, jangan diaduk dulu.",
    ing: [
      { name: "Indomie", qty: 1, unit: "bks", price: 3500, cat: "Karbo" },
      { name: "Telur ayam", qty: 1, unit: "btr", price: 2000, cat: "Protein" },
      { name: "Sawi hijau", qty: 1, unit: "ikat", price: 2500, cat: "Sayuran" },
      { name: "Bawang merah", qty: 2, unit: "siung", price: 700, cat: "Bumbu" },
      { name: "Cabai rawit", qty: 3, unit: "bh", price: 500, cat: "Bumbu" },
      { name: "Kecap manis", qty: 1, unit: "sdm", price: 500, cat: "Bumbu" },
    ],
    steps: [
      { text: "Rebus air 400 ml dengan bawang merah iris.", sec: 120 },
      { text: "Masukkan mie dan telur, masak sampai matang.", sec: 180 },
      { text: "Tambah sawi dan bumbu, aduk 30 detik, sajikan.", sec: 30 },
    ],
  },
];

export const recipeById = (id: number) => RECIPES.find(r => r.id === id) ?? RECIPES[0];

export const recipeCost = (r: Recipe) => r.cost ?? r.ing.reduce((sum, x) => sum + x.price, 0);

/** What the user actually pays for this recipe. */
export const recipePay = (r: Recipe) => r.pay ?? recipeCost(r);

export const formatTimer = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

export type PostType = "Resep" | "Info Warung" | "Trik Masak";

export type Post = {
  key: string;
  id?: number;
  imageUrl?: string | null;
  liked?: boolean;
  saved?: boolean;
  mine?: boolean;
  badge?: string;
  name: string;
  campus: string;
  time: string;
  type: PostType;
  recipeId?: number;
  cost?: number;
  title: string;
  text: string;
  loc?: string;
  cookTime?: string;
  perPortion?: string;
  likes: number;
  comments: number;
};

export const POSTS: Post[] = [
  {
    key: "p1",
    name: "Rina",
    campus: "BINUS Alam Sutera",
    time: "2 jam lalu",
    type: "Resep",
    recipeId: 2,
    cost: 9500,
    title: "Tumis Kangkung Tempe Orek cuma Rp9.500 sepiring!",
    text: "Kangkung seikat Rp2.500 sama tempe papan Rp4.000 dari tukang sayur dekat kos. Sisanya bumbu dapur. Kangkung masuk terakhir biar tetap hijau!",
    likes: 142,
    comments: 38,
  },
  {
    key: "p2",
    name: "Budi",
    campus: "Kos Kunciran",
    time: "5 jam lalu",
    type: "Info Warung",
    title: "Pulang kelas malam? Pangkalan sayur di Jl. Kyai Maja buka sampai hampir tengah malam",
    text: "Masih bisa beli sayur dan telur buat masak besok. Datang sebelum jam 9 malam biar pilihannya masih lengkap.",
    loc: "Jl. Kyai Maja, Panunggangan",
    likes: 89,
    comments: 16,
  },
  {
    key: "p3",
    name: "Dimas",
    campus: "Kos Pakualam",
    time: "Kemarin",
    type: "Trik Masak",
    recipeId: 1,
    cost: 5200,
    title: "Tumis Toge Tahu Saus Tiram: modal Rp5.200 buat sarapan",
    text: "Tahu 2 biji, toge seplastik kecil, saus tiram sachet. Masak 5 menit, di rice cooker mode cook pun jadi!",
    cookTime: "5 - 7 Menit",
    perPortion: "Rp5.200 / org",
    likes: 204,
    comments: 45,
  },
];

export const POST_FILTERS = ["Semua", "Di bawah Rp10k", "Info Warung Murah", "Trik Kos", "Disimpan"];

export function postMatches(p: Post, filter: string) {
  if (filter === "Di bawah Rp10k") return !!p.cost && p.cost < 10000;
  if (filter === "Info Warung Murah") return p.type === "Info Warung";
  if (filter === "Trik Kos") return p.type === "Trik Masak";
  if (filter === "Disimpan") return !!p.saved;
  return true;
}

export type Spot = {
  id?: number;
  openNow?: boolean;
  name: string;
  distance: string;
  hours: string;
  price: number;
  rating: string | null;
  tags: string[];
  kind?: string;
  address?: string;
  priceVerified?: boolean;
  mapsQuery?: string;
};

export const SPOTS: Spot[] = [
  { name: "Pangkalan Sayuran Bang Jamal", distance: "240 m", hours: "06.30 sampai 23.45", price: 10000, rating: null, kind: "Sayur", address: "Jl. Kyai Maja, Panunggangan", tags: ["Sayur", "Protein", "Buka sekarang"] },
  { name: "Soto Tangkar Pak Warso", distance: "310 m", hours: "07.00 sampai 21.00", price: 15000, rating: null, kind: "Warung", address: "Jl. Kyai Maja, Panunggangan", tags: ["Nasi", "Protein", "Buka sekarang"] },
  { name: "Warteg Bumi Bahari Alam Sutera", distance: "1,1 km", hours: "24 jam", price: 13000, rating: null, kind: "Warteg", address: "Jl. Ki Male, Panunggangan Timur", tags: ["Nasi", "Sayur", "Protein", "Buka sekarang"] },
  { name: "Pasar Segar 88", distance: "1,8 km", hours: "07.00 sampai 16.00", price: 15000, rating: null, kind: "Pasar", address: "Jl. Jalur Sutera, Pakulonan", tags: ["Sayur", "Protein"] },
];

export const SPOT_FILTERS = ["Nasi", "Sayur", "Protein", "Buka sekarang"];

export type CartItem = {
  id?: number;
  name: string;
  qty: number;
  unit: string;
  price: number;
  cat: Category;
  done: boolean;
};

export const START_CART: CartItem[] = [
  { name: "Kangkung", qty: 1, unit: "ikat", price: 3000, cat: "Sayuran", done: true },
  { name: "Telur", qty: 6, unit: "btr", price: 12000, cat: "Protein", done: false },
  { name: "Tempe", qty: 1, unit: "papan", price: 5000, cat: "Protein", done: false },
  { name: "Bawang merah", qty: 1, unit: "ons", price: 1700, cat: "Bumbu", done: true },
  { name: "Cabai rawit", qty: 50, unit: "g", price: 1000, cat: "Bumbu", done: false },
  { name: "Indomie", qty: 5, unit: "bks", price: 5000, cat: "Karbo", done: false },
];

export const CART_GROUPS: Category[] = ["Sayuran", "Protein", "Bumbu", "Karbo"];
