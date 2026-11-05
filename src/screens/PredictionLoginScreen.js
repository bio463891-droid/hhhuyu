// src/screens/PredictionLoginScreen.js
// شاشة دخول + إنشاء حساب — مع اختيار الأفاتار عند التسجيل

import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing } from "../theme/colors";
import { loginPredictionUser, registerPredictionUser } from "../api/predictionsApi";
import { savePredictionSession } from "../services/predictionAuth";
import AvatarPicker from "../components/AvatarPicker";

export default function PredictionLoginScreen({ onLoginSuccess }) {
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState("login"); // "login" | "register"

  const [username,    setUsername]    = useState("");
  const [password,    setPassword]    = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [avatarId,    setAvatarId]    = useState(1);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const reset = () => {
    setUsername(""); setPassword("");
    setDisplayName(""); setConfirmPass("");
    setAvatarId(1); setError("");
  };
  const switchMode = (m) => { reset(); setMode(m); };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور"); return;
    }
    setLoading(true); setError("");
    try {
      const user = await loginPredictionUser(username.trim(), password);
      await savePredictionSession(user);
      onLoginSuccess(user);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور"); return;
    }
    if (password !== confirmPass) { setError("كلمتا المرور غير متطابقتين"); return; }
    if (username.trim().length < 3) { setError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل"); return; }
    if (password.length < 4) { setError("كلمة المرور يجب أن تكون 4 أحرف على الأقل"); return; }

    setLoading(true); setError("");
    try {
      const user = await registerPredictionUser(
        username.trim(), password,
        displayName.trim() || username.trim(),
        avatarId
      );
      await savePredictionSession(user);
      onLoginSuccess(user);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.icon}>🏆</Text>
            <Text style={styles.title}>توقعاتي</Text>
            <Text style={styles.subtitle}>توقع · تنافس · تصدّر</Text>
          </View>

          <View style={styles.guide}>
            <GuideRow pts="25 نقطة" color={colors.gold}            label="نتيجة دقيقة 100%" />
            <GuideRow pts="5 نقاط"  color={colors.mutedForeground} label="الفائز صح فقط"    />
            <GuideRow pts="1 نقطة"  color={colors.border}          label="توقع خاطئ"         />
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === "register" && styles.tabActive]}
              onPress={() => switchMode("register")}
            >
              <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>إنشاء حساب</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === "login" && styles.tabActive]}
              onPress={() => switchMode("login")}
            >
              <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {mode === "register" && (
              <>
                <AvatarPicker selectedId={avatarId} onSelect={setAvatarId} />
                <Field label="الاسم المعروض (اختياري)" value={displayName} onChange={setDisplayName} placeholder="مثال: علي ⚽" />
              </>
            )}

            <Field label="اسم المستخدم" value={username} onChange={setUsername} placeholder="أدخل اسم المستخدم" autoCapitalize="none" />
            <Field label="كلمة المرور" value={password} onChange={setPassword} placeholder="أدخل كلمة المرور" secure />

            {mode === "register" && (
              <Field label="تأكيد كلمة المرور" value={confirmPass} onChange={setConfirmPass} placeholder="أعد إدخال كلمة المرور" secure />
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={mode === "login" ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.btnText}>{mode === "login" ? "دخول" : "إنشاء الحساب والدخول"}</Text>
              }
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder, secure, autoCapitalize }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={fieldStyles.input}
        value={value} onChangeText={onChange}
        placeholder={placeholder} placeholderTextColor={colors.mutedForeground}
        secureTextEntry={!!secure} autoCapitalize={autoCapitalize || "none"}
        autoCorrect={false} textAlign="right"
      />
    </View>
  );
}

function GuideRow({ pts, color, label }) {
  return (
    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: spacing.md }}>
      <Text style={[guideStyles.pts, { color }]}>{pts}</Text>
      <Text style={guideStyles.arrow}>←</Text>
      <Text style={guideStyles.label}>{label}</Text>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { color: colors.mutedForeground, fontFamily: fonts.medium, fontSize: 13, textAlign: "right", marginBottom: 6 },
  input: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    color: colors.foreground, fontFamily: fonts.regular, fontSize: 15, padding: spacing.md,
  },
});
const guideStyles = StyleSheet.create({
  pts:   { fontFamily: fonts.black, fontSize: 14, minWidth: 68, textAlign: "right" },
  arrow: { color: colors.mutedForeground, fontSize: 14 },
  label: { color: colors.foreground, fontFamily: fonts.medium, fontSize: 14 },
});
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: spacing.xl },
  icon:   { fontSize: 56, marginBottom: spacing.md },
  title:  { color: colors.foreground, fontFamily: fonts.black, fontSize: 28, textAlign: "center" },
  subtitle: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 14, marginTop: spacing.xs },
  guide: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  tabs: {
    flexDirection: "row-reverse", backgroundColor: colors.secondary,
    borderRadius: radius.lg, padding: 4, marginBottom: spacing.xl,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, alignItems: "center" },
  tabActive: { backgroundColor: colors.card },
  tabText:   { color: colors.mutedForeground, fontFamily: fonts.medium, fontSize: 14 },
  tabTextActive: { color: colors.foreground, fontFamily: fonts.bold },
  form: { gap: 0 },
  error: { color: colors.live, fontFamily: fonts.regular, fontSize: 13, textAlign: "right", marginBottom: spacing.md },
  btn: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center", marginTop: spacing.sm },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontFamily: fonts.bold, fontSize: 16 },
});
