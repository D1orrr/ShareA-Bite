import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Mascot } from "../components/art";
import { goBack } from "../components/nav";
import { useTheme } from "../components/theme";
import { Txt } from "../components/Txt";
import { Btn, Card, Inp, Pill, RoundBtn, row, Screen } from "../components/ui";
import { useStore } from "../context/AppStore";

type Mode = "Daftar" | "Masuk";

/** Register / login with email. The backend seeds a demo account. */
export default function Auth() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { register, login, mode: conn } = useStore();
  const [mode, setMode] = useState<Mode>(params.mode === "masuk" ? "Masuk" : "Daftar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr("");
    if (mode === "Daftar" && !name.trim()) return setErr("Nama jangan kosong ya.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Format email belum benar.");
    if (password.length < 6) return setErr("Password minimal 6 karakter.");
    setBusy(true);
    const ok = mode === "Daftar" ? await register(name.trim(), email.trim(), password) : await login(email.trim(), password);
    setBusy(false);
    if (ok) router.replace(mode === "Daftar" ? "/onboard" : "/home");
  };

  return (
    <Screen focus>
      <View style={{ maxWidth: 460, width: "100%", alignSelf: "center", gap: 16 }}>
        <View style={row}>
          <RoundBtn icon="arrow_back" label="Kembali" onPress={goBack} />
        </View>
        <View style={{ alignItems: "center", gap: 8 }}>
          <Mascot size={90} />
          <Txt v="h1" style={{ textAlign: "center" }}>
            {mode === "Daftar" ? "Bikin akun dulu" : "Selamat datang lagi"}
          </Txt>
          <Txt v="cap" style={{ textAlign: "center" }}>
            {mode === "Daftar"
              ? "Biar budget, resep tersimpan dan catatan pengeluaranmu aman."
              : "Masuk untuk lanjut hemat bareng Si Mangkok."}
          </Txt>
        </View>
        <Pill<Mode>
          options={[
            { value: "Daftar", label: "Daftar" },
            { value: "Masuk", label: "Masuk" },
          ]}
          value={mode}
          onChange={m => {
            setMode(m);
            setErr("");
          }}
          style={{ alignSelf: "center" }}
        />
        <Card style={{ gap: 12 }}>
          {mode === "Daftar" ? <Inp value={name} onChangeText={setName} placeholder="Nama panggilan" aria-label="Nama" autoComplete="name" /> : null}
          <Inp
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            aria-label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Inp
            value={password}
            onChangeText={setPassword}
            placeholder="Password (min. 6 karakter)"
            aria-label="Password"
            secureTextEntry
            onSubmitEditing={submit}
          />
          {err ? (
            <Txt b color={c.danger} role="alert">
              {err}
            </Txt>
          ) : null}
          <Btn full title={busy ? "Sebentar..." : mode === "Daftar" ? "Daftar" : "Masuk"} onPress={submit} />
        </Card>
        {mode === "Masuk" ? (
          <Pressable
            role="button"
            onPress={() => {
              setEmail("dinda@sharebite.id");
              setPassword("hemat123");
            }}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Txt v="cap" style={{ textAlign: "center", textDecorationLine: "underline" }}>
              Pakai akun demo (dinda@sharebite.id / hemat123)
            </Txt>
          </Pressable>
        ) : null}
        {conn === "offline" ? (
          <Txt v="cap" color={c.danger} style={{ textAlign: "center" }}>
            Server sedang offline. Jalankan backend dulu, atau masuk sebagai tamu dari halaman awal.
          </Txt>
        ) : null}
      </View>
    </Screen>
  );
}
