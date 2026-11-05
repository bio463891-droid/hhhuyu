// src/screens/MatchPredictScreen.js
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing } from "../theme/colors";
import { savePrediction } from "../api/predictionsApi";

function TeamFlag({ logoUrl, teamName, size = 80 }) {
  const [err, setErr] = useState(false);
  return (
    <View style={[flagStyles.wrap, { width: size, height: size }]}>
      {logoUrl && !err ? (
        <Image source={{ uri: logoUrl }} style={{ width: size, height: size }} resizeMode="contain" onError={() => setErr(true)} />
      ) : (
        <View style={[flagStyles.fallback, { width: size, height: size }]}><Text style={flagStyles.letter}>{teamName?.[0] || "?"}</Text></View>
      )}
    </View>
  );
}
const flagStyles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  fallback: { borderRadius: radius.md, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
  letter: { color: colors.foreground, fontFamily: fonts.black, fontSize: 28 },
});

function isLocked(match) {
  if (match.status === "finished") return true;
  if (match.lock_time && new Date() >= new Date(match.lock_time)) return true;
  return false;
}

export default function MatchPredictScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { match, currentUser, existingPrediction } = route.params;

  const [homeGoals, setHomeGoals] = useState(existingPrediction ? String(existingPrediction.predicted_home) : "");
  const [awayGoals, setAwayGoals] = useState(existingPrediction ? String(existingPrediction.predicted_away) : "");
  const [saving, setSaving] = useState(false);

  const locked = isLocked(match);
  const alreadySaved = !!existingPrediction;
  const canPredict = !locked && !alreadySaved;

  const handleSave = async () => {
    const h = parseInt(homeGoals, 10), a = parseInt(awayGoals, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) { Alert.alert("خطأ", "يرجى إدخال أرقام صحيحة"); return; }
    setSaving(true);
    try {
      await savePrediction(currentUser.id, match.id, h, a);
      Alert.alert("✅ تم الحفظ", `توقعك: ${match.home_team} ${h} - ${a} ${match.away_team}`, [{ text: "حسناً", onPress: () => navigation.goBack() }]);
    } catch (e) { Alert.alert("تنبيه", e.message); }
    finally { setSaving(false); }
  };

  const statusLabel = { upcoming: "قادمة", live: "🔴 مباشر", finished: "انتهت" }[match.status] || "—";

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backIcon}>✕</Text></TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.league}>{match.league}</Text>
            <Text style={styles.matchTime}>{match.match_time} — {statusLabel}</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.teamsSection}>
          <View style={styles.teamCol}>
            <TeamFlag logoUrl={match.home_logo} teamName={match.home_team} size={90} />
            <Text style={styles.teamName}>{match.home_team}</Text>
          </View>
          <View style={styles.vsCol}>
            {match.status === "finished" && match.home_score != null ? (
              <View style={styles.finalBox}>
                <Text style={styles.finalScore}>{match.home_score} - {match.away_score}</Text>
                <Text style={styles.finalLabel}>النتيجة</Text>
              </View>
            ) : <Text style={styles.vs}>VS</Text>}
          </View>
          <View style={styles.teamCol}>
            <TeamFlag logoUrl={match.away_logo} teamName={match.away_team} size={90} />
            <Text style={styles.teamName}>{match.away_team}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.predSection}>
          <Text style={styles.predTitle}>{alreadySaved ? "توقعك المسجّل" : locked ? "⏰ انتهى وقت التوقع" : "أدخل توقعك"}</Text>

          <View style={styles.inputsRow}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{match.home_team}</Text>
              <TextInput style={[styles.input, !canPredict && styles.inputLocked]} value={homeGoals} onChangeText={setHomeGoals} keyboardType="number-pad" maxLength={2} placeholder="0" placeholderTextColor={colors.mutedForeground} editable={canPredict} textAlign="center" />
            </View>
            <Text style={styles.inputDash}>-</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{match.away_team}</Text>
              <TextInput style={[styles.input, !canPredict && styles.inputLocked]} value={awayGoals} onChangeText={setAwayGoals} keyboardType="number-pad" maxLength={2} placeholder="0" placeholderTextColor={colors.mutedForeground} editable={canPredict} textAlign="center" />
            </View>
          </View>

          {existingPrediction?.points_earned != null && (
            <View style={[styles.pointsBadge, existingPrediction.points_earned === 25 && styles.badgeGold, existingPrediction.points_earned === 5 && styles.badgeSilver, existingPrediction.points_earned === 1 && styles.badgeBronze]}>
              <Text style={styles.pointsText}>
                {existingPrediction.points_earned === 25 && "🎯 نتيجة دقيقة! "}
                {existingPrediction.points_earned === 5  && "✅ الفائز صح! "}
                {existingPrediction.points_earned === 1  && "❌ توقع خاطئ — "}
                +{existingPrediction.points_earned} نقطة
              </Text>
            </View>
          )}

          {canPredict && (
            <TouchableOpacity style={[styles.saveBtn, (saving || homeGoals === "" || awayGoals === "") && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving || homeGoals === "" || awayGoals === ""}>
              {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveBtnText}>تأكيد التوقع ✓</Text>}
            </TouchableOpacity>
          )}

          {locked && !alreadySaved && (
            <View style={styles.lockedBox}><Text style={styles.lockedText}>{match.status === "finished" ? "انتهت المباراة" : "أُغلق باب التوقعات لهذه المباراة"}</Text></View>
          )}
          {alreadySaved && !locked && (
            <View style={styles.savedBox}><Text style={styles.savedText}>✋ تم تسجيل توقعك — لا يمكن التعديل</Text></View>
          )}
        </View>

        <View style={styles.guide}>
          <Text style={styles.guideTitle}>نظام النقاط</Text>
          <View style={styles.guideRow}><Text style={[styles.guidePts, { color: colors.gold }]}>25 نقطة</Text><Text style={styles.guideLabel}>نتيجة دقيقة 100%</Text></View>
          <View style={styles.guideRow}><Text style={[styles.guidePts, { color: colors.mutedForeground }]}>5 نقاط</Text><Text style={styles.guideLabel}>الفائز صح فقط</Text></View>
          <View style={styles.guideRow}><Text style={[styles.guidePts, { color: colors.border }]}>1 نقطة</Text><Text style={styles.guideLabel}>توقع خاطئ</Text></View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: "center", alignItems: "center" },
  backIcon: { color: colors.foreground, fontSize: 14 },
  headerCenter: { flex: 1, alignItems: "center" },
  league: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 12 },
  matchTime: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 14, marginTop: 2 },
  teamsSection: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  teamCol: { alignItems: "center", flex: 1, gap: spacing.md },
  teamName: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 14, textAlign: "center" },
  vsCol: { alignItems: "center", paddingHorizontal: spacing.md },
  vs: { color: colors.mutedForeground, fontFamily: fonts.black, fontSize: 22 },
  finalBox: { alignItems: "center" },
  finalScore: { color: colors.foreground, fontFamily: fonts.black, fontSize: 28 },
  finalLabel: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 11, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  predSection: { padding: spacing.xl, alignItems: "center", gap: spacing.lg },
  predTitle: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 16 },
  inputsRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.lg },
  inputWrap: { alignItems: "center", gap: spacing.sm },
  inputLabel: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 12, textAlign: "center" },
  input: { width: 80, height: 80, backgroundColor: colors.card, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.primary, color: colors.foreground, fontFamily: fonts.black, fontSize: 36 },
  inputLocked: { borderColor: colors.border, opacity: 0.6 },
  inputDash: { color: colors.mutedForeground, fontFamily: fonts.black, fontSize: 32, marginBottom: spacing.sm },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg, minWidth: 200, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: colors.white, fontFamily: fonts.bold, fontSize: 16 },
  lockedBox: { backgroundColor: colors.secondary, borderRadius: radius.md, padding: spacing.md, paddingHorizontal: spacing.xl },
  lockedText: { color: colors.mutedForeground, fontFamily: fonts.medium, fontSize: 14 },
  savedBox: { backgroundColor: colors.accentLight, borderRadius: radius.md, padding: spacing.md, paddingHorizontal: spacing.xl, borderWidth: 1, borderColor: colors.accent },
  savedText: { color: colors.accent, fontFamily: fonts.medium, fontSize: 14 },
  pointsBadge: { borderRadius: radius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, backgroundColor: colors.secondary },
  badgeGold: { backgroundColor: "#F59E0B33", borderWidth: 1, borderColor: colors.gold },
  badgeSilver: { backgroundColor: "#6B728033" },
  badgeBronze: { backgroundColor: "#92400E33" },
  pointsText: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 15 },
  guide: { margin: spacing.lg, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  guideTitle: { color: colors.mutedForeground, fontFamily: fonts.bold, fontSize: 12, textAlign: "center", marginBottom: spacing.xs },
  guideRow: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  guidePts: { fontFamily: fonts.bold, fontSize: 13 },
  guideLabel: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 13 },
});
