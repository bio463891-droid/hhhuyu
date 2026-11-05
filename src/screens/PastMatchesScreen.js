// src/screens/PastMatchesScreen.js
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image, RefreshControl, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing } from "../theme/colors";
import { fetchPastMatchesWithPredictions } from "../api/predictionsApi";

function TeamFlag({ url, name, size = 28 }) {
  const [err, setErr] = useState(false);
  if (!url || err) return <View style={[styles.flagFallback, { width: size, height: size * 0.7 }]}><Text style={styles.flagLetter}>{name?.[0] || "?"}</Text></View>;
  return <Image source={{ uri: url }} style={{ width: size, height: size * 0.7 }} resizeMode="contain" onError={() => setErr(true)} />;
}

function PastMatchCard({ match }) {
  const pred = match.myPrediction;
  const ptsMeta = pred?.points_earned === 25 ? { color: colors.gold, icon: "🎯", label: "نتيجة دقيقة" }
    : pred?.points_earned === 5 ? { color: colors.accent, icon: "✅", label: "الفائز صحيح" }
    : pred?.points_earned === 1 ? { color: colors.mutedForeground, icon: "❌", label: "توقع خاطئ" } : null;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.league}>{match.league}</Text>
        <Text style={styles.date}>{new Date(match.match_date).toLocaleDateString("ar-IQ", { day: "numeric", month: "short" })}</Text>
      </View>
      <View style={styles.teamsRow}>
        <View style={styles.teamCol}><TeamFlag url={match.home_logo} name={match.home_team} size={36} /><Text style={styles.teamName} numberOfLines={1}>{match.home_team}</Text></View>
        <View style={styles.scoreBox}><Text style={styles.finalScore}>{match.home_score} - {match.away_score}</Text><Text style={styles.finalLabel}>النتيجة النهائية</Text></View>
        <View style={styles.teamCol}><TeamFlag url={match.away_logo} name={match.away_team} size={36} /><Text style={styles.teamName} numberOfLines={1}>{match.away_team}</Text></View>
      </View>
      <View style={styles.divider} />
      {pred ? (
        <View style={styles.predRow}>
          <Text style={styles.predLabel}>توقعك:</Text>
          <Text style={styles.predValue}>{pred.predicted_home} - {pred.predicted_away}</Text>
          {ptsMeta && (
            <View style={[styles.ptsBadge, { backgroundColor: ptsMeta.color + "22", borderColor: ptsMeta.color }]}>
              <Text style={[styles.ptsText, { color: ptsMeta.color }]}>{ptsMeta.icon} {ptsMeta.label} +{pred.points_earned}</Text>
            </View>
          )}
        </View>
      ) : <Text style={styles.noPred}>لم تشارك بتوقع في هذه المباراة</Text>}
    </View>
  );
}

export default function PastMatchesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const currentUser = route?.params?.currentUser;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setMatches(await fetchPastMatchesWithPredictions(currentUser.id));
    } catch (e) {} finally { setLoading(false); setRefreshing(false); }
  }, [currentUser?.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backIcon}>✕</Text></TouchableOpacity>
        <Text style={styles.title}>المباريات السابقة 📋</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={matches} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <PastMatchCard match={item} />}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.primary} />}
          ListHeaderComponent={matches.length > 0 ? <Text style={styles.sectionLabel}>{matches.length} مباراة منتهية</Text> : null}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>📅</Text><Text style={styles.emptyText}>لا توجد مباريات سابقة بعد</Text></View>}
          ListFooterComponent={<View style={{ height: insets.bottom + 24 }} />}
          contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: "center", alignItems: "center" },
  backIcon: { color: colors.foreground, fontSize: 14 },
  title: { color: colors.foreground, fontFamily: fonts.black, fontSize: 19 },
  sectionLabel: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 13, textAlign: "right", paddingVertical: spacing.md },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  topRow: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: spacing.md },
  league: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 12 },
  date: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 12 },
  teamsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  teamCol: { flex: 1, alignItems: "center", gap: spacing.xs },
  teamName: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 13, textAlign: "center" },
  flagFallback: { backgroundColor: colors.secondary, borderRadius: radius.sm, justifyContent: "center", alignItems: "center" },
  flagLetter: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 14 },
  scoreBox: { alignItems: "center", paddingHorizontal: spacing.md },
  finalScore: { color: colors.foreground, fontFamily: fonts.black, fontSize: 24 },
  finalLabel: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 10, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  predRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  predLabel: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 13 },
  predValue: { color: colors.foreground, fontFamily: fonts.black, fontSize: 18 },
  ptsBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1 },
  ptsText: { fontFamily: fonts.bold, fontSize: 12 },
  noPred: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 13, textAlign: "right" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", paddingVertical: 60, gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 16 },
});
