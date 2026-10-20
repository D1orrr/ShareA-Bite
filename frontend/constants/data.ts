// Mock data from the ShareA'Bite design. Nothing here talks to the backend yet.

export type Category = "Karbo" | "Protein" | "Bumbu" | "Sayuran";

export type Ingredient = {
  name: string;
  qty: number;
  unit: string;
  price: number;
  cat: Category;
  swap?: string;
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
      { name: "Telur ayam", qty: 2, unit: "btr", price: 4000, cat: "Protein", swap: "Tahu 2 pcs, hemat Rp2.000" },
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
      { name: "Tempe", qty: 1, unit: "papan", price: 4000, cat: "Protein", swap: "Tahu putih, hemat Rp1.500" },
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

export const recipeCost = (r: Recipe) => r.ing.reduce((sum, x) => sum + x.price, 0);

export const formatTimer = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

export type PostType = "Resep" | "Info Warung" | "Trik Masak";

export type Post = {
  key: string;
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
    campus: "UI Depok",
    time: "2 jam lalu",
    type: "Resep",
    recipeId: 2,
    cost: 7000,
    title: "Mendoan Renyah Sambal Kecap Cuma Rp7.000!",
    text: "Beli tempe papan di Pasar Kober cuma Rp4.000, tepung bumbu sachet Rp2.500, daun bawang minta bonus pedagang. Goreng dadakan langsung gurih mantap!",
    likes: 142,
    comments: 38,
  },
  {
    key: "p2",
    name: "Budi",
    campus: "Kukusan",
    time: "5 jam lalu",
    type: "Info Warung",
    title: "Tips belanja telur eceran di Warung Madura Jl. Kober hemat Rp3rb/kg",
    text: "Kalau beli setelah jam 4 sore sering ada harga pas Rp27.000/kg dan boleh pilih telur yang fresh. Cocok buat stok lauk seminggu anak kosan.",
    loc: "Warung Madura Berkah, Jl. Kober No. 14",
    likes: 89,
    comments: 16,
  },
  {
    key: "p3",
    name: "Dimas",
    campus: "Pocin",
    time: "Kemarin",
    type: "Trik Masak",
    recipeId: 1,
    cost: 5500,
    title: "Tumis Toge Tahu Saus Tiram: Modal Rp5.500 Buat Sarapan",
    text: "Tahu kuning 2 biji (Rp2.000) goreng sebentar, toge seplastik kecil (Rp2.000), sachet saus tiram mini (Rp1.500). Masak 5 menit di rice cooker pun jadi!",
    cookTime: "5 - 7 Menit",
    perPortion: "Rp2.750 / org",
    likes: 204,
    comments: 45,
  },
];

export const POST_FILTERS = ["Semua", "Di bawah Rp10k", "Info Warung Murah", "Trik Kos"];

export function postMatches(p: Post, filter: string) {
  if (filter === "Di bawah Rp10k") return !!p.cost && p.cost < 10000;
  if (filter === "Info Warung Murah") return p.type === "Info Warung";
  if (filter === "Trik Kos") return p.type === "Trik Masak";
  return true;
}

export type Spot = {
  name: string;
  distance: string;
  hours: string;
  price: number;
  rating: string;
  tags: string[];
};

export const SPOTS: Spot[] = [
  { name: "Warung Bu Tini", distance: "250 m", hours: "06.00 sampai 21.00", price: 9000, rating: "4,7", tags: ["Nasi", "Protein", "Buka sekarang"] },
  { name: "Pasar Pagi Margonda", distance: "600 m", hours: "05.00 sampai 11.00", price: 7500, rating: "4,5", tags: ["Sayur", "Protein"] },
  { name: "Tahu Tempe Pak Yanto", distance: "900 m", hours: "07.00 sampai 17.00", price: 5000, rating: "4,8", tags: ["Protein", "Buka sekarang"] },
  { name: "Lapak Sayur Mbak Wati", distance: "1,1 km", hours: "06.00 sampai 15.00", price: 4000, rating: "4,6", tags: ["Sayur", "Buka sekarang"] },
];

export const SPOT_FILTERS = ["Nasi", "Sayur", "Protein", "Buka sekarang"];

export type CartItem = {
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
