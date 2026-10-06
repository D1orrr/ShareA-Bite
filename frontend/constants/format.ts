import type { TextStyle } from "react-native";

export const formatRp = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;

// Prices line up in a column, like a warung receipt.
export const tabularNums: TextStyle = { fontVariant: ["tabular-nums"] };
