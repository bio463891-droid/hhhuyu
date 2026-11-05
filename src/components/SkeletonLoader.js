// src/components/SkeletonLoader.js
// Skeleton loading placeholders — يظهر بدل المحتوى أثناء التحميل
// يستخدم Animated API الأصلي — بدون أي مكتبة إضافية

import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme/colors";

// المكوّن الأساسي — شريط واحد يومض
function SkeletonBar({ width = "100%", height = 16, borderRadius: br, style }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: br ?? radius.sm,
          backgroundColor: colors.secondary,
          opacity: anim,
        },
        style,
      ]}
    />
  );
}

// ── Skeleton كارد مباراة ──────────────────────────────────
export function MatchRowSkeleton() {
  return (
    <View style={styles.matchRow}>
      {/* فريق يمين */}
      <View style={styles.teamSide}>
        <SkeletonBar width={44} height={32} borderRadius={6} />
        <SkeletonBar width={50} height={10} />
      </View>
      {/* وسط */}
      <View style={styles.center}>
        <SkeletonBar width={40} height={22} borderRadius={6} />
        <SkeletonBar width={48} height={14} borderRadius={radius.full} />
      </View>
      {/* فريق يسار */}
      <View style={styles.teamSide}>
        <SkeletonBar width={44} height={32} borderRadius={6} />
        <SkeletonBar width={50} height={10} />
      </View>
    </View>
  );
}

// ── Skeleton كارد المستخدم ────────────────────────────────
export function UserCardSkeleton() {
  return (
    <View style={styles.userCard}>
      <View style={styles.userRight}>
        <SkeletonBar width={120} height={20} borderRadius={radius.md} />
        <SkeletonBar width={80}  height={14} borderRadius={radius.md} style={{ marginTop: 6 }} />
      </View>
      <SkeletonBar width={48} height={48} borderRadius={radius.full} />
      <View style={styles.pointsBox}>
        <SkeletonBar width={48} height={28} borderRadius={radius.md} />
        <SkeletonBar width={32} height={12} borderRadius={radius.sm} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

// ── Skeleton صف في لوحة المتصدرين ────────────────────────
export function LeaderRowSkeleton() {
  return (
    <View style={styles.leaderRow}>
      <SkeletonBar width={28} height={28} borderRadius={radius.sm} />
      <SkeletonBar width={44} height={44} borderRadius={radius.lg} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBar width="70%" height={16} borderRadius={radius.sm} />
        <SkeletonBar width="40%" height={12} borderRadius={radius.sm} />
      </View>
      <SkeletonBar width={56} height={44} borderRadius={radius.md} />
    </View>
  );
}

// ── Skeleton شاشة الرئيسية كاملة ─────────────────────────
export function HomeScreenSkeleton() {
  return (
    <View style={styles.homeWrap}>
      <UserCardSkeleton />
      {/* أزرار الأدوات */}
      <View style={styles.toolsRow}>
        {[1,2,3].map(i => <SkeletonBar key={i} width="30%" height={56} borderRadius={radius.lg} />)}
      </View>
      <SkeletonBar width="50%" height={14} borderRadius={radius.sm} style={{ alignSelf: "flex-end", marginBottom: spacing.md }} />
      {/* كاردات المباريات */}
      {[1,2,3].map(i => <MatchRowSkeleton key={i} />)}
    </View>
  );
}

// ── Skeleton لوحة المتصدرين كاملة ───────────────────────
export function LeaderboardSkeleton() {
  return (
    <View style={{ padding: spacing.lg }}>
      <SkeletonBar width="40%" height={14} borderRadius={radius.sm} style={{ alignSelf: "flex-end", marginBottom: spacing.md }} />
      {[1,2,3,4,5].map(i => <LeaderRowSkeleton key={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  teamSide: { flex: 1, alignItems: "center", gap: spacing.xs },
  center:   { alignItems: "center", minWidth: 70, gap: 6 },

  userCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  userRight: { flex: 1, alignItems: "flex-end", gap: 6 },
  pointsBox: { alignItems: "center", gap: 4 },

  toolsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },

  homeWrap: { paddingTop: spacing.xl },

  leaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
});
