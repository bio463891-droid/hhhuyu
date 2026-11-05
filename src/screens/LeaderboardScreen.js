// src/screens/LeaderboardScreen.js — نسخة أصلية + Skeleton Loader

import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing } from "../theme/colors";
import { fetchLeaderboard } from "../api/predictionsApi";
import PlayerAvatar from "../components/PlayerAvatar";
import { LeaderboardSkeleton } from "../components/SkeletonLoader";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const currentUser = route?.params?.currentUser;
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(setLeaders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item, index }) => {
    const isMe  = currentUser && item.id === currentUser.id;
    const medal = MEDALS[index] || null;
    const rankText = medal || `#${index + 1}`;

    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <Text style={[styles.rank, medal && styles.rankMedal]}>{rankText}</Text>
        <PlayerAvatar avatarId={item.avatar_id} size={40} ringColor={index === 0 ? colors.gold : undefined} />
        <View style={styles.nameWrap}>
          <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
            {item.display_name}{isMe ? "  (أنت)" : ""}
          </Text>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        <View style={[styles.ptsBadge, index === 0 && styles.ptsBadgeGold]}>
          <Text style={[styles.pts, index === 0 && styles.ptsGold]}>{item.total_points}</Text>
          <Text style={styles.ptsLabel}>نقطة</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>لوحة المتصدرين 🏆</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading
        ? <LeaderboardSkeleton />
        : (
          <FlatList
            data={leaders}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View>
                {/* بنر الجائزة */}
                <View style={styles.prizeBanner}>
                  <View style={styles.prizeGlow}/>
                  <View style={styles.prizeTopRow}>
                    <Text style={styles.prizeCrown}>👑</Text>
                    <Text style={styles.prizeTopLabel}>جائزة المتصدر</Text>
                    <Text style={styles.prizeCrown}>👑</Text>
                  </View>
                  <View style={styles.prizeMiddle}>
                    <Text style={styles.prizeTrophy}>🏆</Text>
                    <View style={styles.prizeTextWrap}>
                      <Text style={styles.prizeMain}>المركز الأول يحصل على</Text>
                      <Text style={styles.prizeAmount}>8,000 كوينز</Text>
                      <Text style={styles.prizeGame}>في لعبة بيس 🎮</Text>
                    </View>
                    <Text style={styles.prizeTrophy}>🏆</Text>
                  </View>
                  <View style={styles.prizeBottomRow}>
                    <View style={styles.prizeDivider}/>
                    <Text style={styles.prizeBottomText}>تنافس وتصدّر القائمة</Text>
                    <View style={styles.prizeDivider}/>
                  </View>
                </View>
                <Text style={styles.sectionLabel}>{leaders.length} لاعب مسجّل</Text>
              </View>
            }
            ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>لا يوجد لاعبون بعد</Text></View>}
            ListFooterComponent={<View style={{ height: insets.bottom + 24 }} />}
            contentContainerStyle={{ paddingHorizontal: spacing.lg }}
          />
        )
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, justifyContent: "center", alignItems: "center" },
  backIcon: { color: colors.foreground, fontSize: 14, fontFamily: fonts.bold },
  title: { color: colors.foreground, fontFamily: fonts.black, fontSize: 20 },
  sectionLabel: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 13, textAlign: "right", paddingVertical: spacing.md },
  row: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  rowMe: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  rank: { color: colors.mutedForeground, fontFamily: fonts.bold, fontSize: 14, minWidth: 28, textAlign: "center" },
  rankMedal: { fontSize: 22 },
  nameWrap: { flex: 1, alignItems: "flex-end" },
  name: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 15, textAlign: "right" },
  nameMe: { color: colors.primary },
  username: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 12, textAlign: "right" },
  ptsBadge: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minWidth: 56 },
  ptsBadgeGold: { backgroundColor: "#F59E0B22" },
  pts: { color: colors.foreground, fontFamily: fonts.black, fontSize: 20 },
  ptsGold: { color: "#F59E0B" },
  ptsLabel: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 10 },
  prizeBanner: {
    marginBottom: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#F59E0B",
    backgroundColor: "#0D1117",
    overflow: "hidden",
    padding: 18,
    position: "relative",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  prizeGlow: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#F59E0B08",
  },
  prizeTopRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  prizeCrown: { fontSize: 18 },
  prizeTopLabel: {
    color: "#F59E0B",
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    letterSpacing: 1,
  },
  prizeMiddle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 14,
  },
  prizeTrophy: { fontSize: 32 },
  prizeTextWrap: { alignItems: "center", gap: 2 },
  prizeMain: {
    color: "#F0F4FF",
    fontFamily: "Tajawal_500Medium",
    fontSize: 13,
    textAlign: "center",
  },
  prizeAmount: {
    color: "#F59E0B",
    fontFamily: "Tajawal_900Black",
    fontSize: 28,
    textAlign: "center",
    textShadowColor: "#F59E0B",
    textShadowRadius: 8,
  },
  prizeGame: {
    color: "#6B7A99",
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
  prizeBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  prizeDivider: {
    flex: 1, height: 1,
    backgroundColor: "#F59E0B40",
  },
  prizeBottomText: {
    color: "#F59E0B",
    fontFamily: "Tajawal_500Medium",
    fontSize: 12,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 60 },
  emptyText: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 16 },
});
