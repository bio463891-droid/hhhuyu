// src/screens/PredictionsScreen.js — نسخة أصلية + Skeleton Loader

import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, ActivityIndicator, Alert, StyleSheet,
  TouchableOpacity, RefreshControl, SafeAreaView, Modal, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, spacing, radius } from "../theme/colors";
import {
  fetchTodayMatches, fetchUserPredictions, fetchUserRank,
  fetchUnseenAnnouncement, markAnnouncementSeen,
} from "../api/predictionsApi";
import { loadPredictionSession, clearPredictionSession, savePredictionSession } from "../services/predictionAuth";
import PredictionLoginScreen from "./PredictionLoginScreen";
import PlayerAvatar from "../components/PlayerAvatar";
import { HomeScreenSkeleton } from "../components/SkeletonLoader";

function MatchRow({ match, prediction, onPress }) {
  const isLocked = match.status === "finished" ||
    (match.lock_time && new Date() >= new Date(match.lock_time));
  const hasPred = !!prediction;
  const pts = prediction?.points_earned;

  return (
    <TouchableOpacity style={styles.matchRow} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.teamSide}>
        {match.home_logo
          ? <Image source={{ uri: match.home_logo }} style={styles.flag} resizeMode="contain" />
          : <View style={[styles.flag, styles.flagFallback]}><Text style={styles.flagLetter}>{match.home_team?.[0]}</Text></View>}
        <Text style={styles.teamName} numberOfLines={1}>{match.home_team}</Text>
      </View>

      <View style={styles.matchCenter}>
        {match.status === "finished" && match.home_score != null
          ? <Text style={styles.finalScore}>{match.home_score}-{match.away_score}</Text>
          : <Text style={styles.matchTime}>{match.match_time}</Text>}
        <View style={[
          styles.statusPill,
          match.status === "live"     && styles.pillLive,
          match.status === "finished" && styles.pillDone,
          isLocked && match.status === "upcoming" && styles.pillLocked,
        ]}>
          <Text style={styles.statusText}>
            {match.status === "live" ? "🔴 مباشر"
           : match.status === "finished" ? "انتهت"
           : isLocked ? "⏰ مقفول" : "قادمة"}
          </Text>
        </View>
      </View>

      <View style={styles.teamSide}>
        {match.away_logo
          ? <Image source={{ uri: match.away_logo }} style={styles.flag} resizeMode="contain" />
          : <View style={[styles.flag, styles.flagFallback]}><Text style={styles.flagLetter}>{match.away_team?.[0]}</Text></View>}
        <Text style={styles.teamName} numberOfLines={1}>{match.away_team}</Text>
      </View>

      <View style={styles.predBadge}>
        {hasPred
          ? pts != null
            ? <View style={[styles.ptsPill, pts===25&&styles.ptsGold, pts===5&&styles.ptsSilver, pts===1&&styles.ptsBronze]}>
                <Text style={styles.ptsPillText}>+{pts}</Text>
              </View>
            : <View style={styles.savedPill}><Text style={styles.savedPillText}>{prediction.predicted_home}-{prediction.predicted_away} ✓</Text></View>
          : !isLocked && <Text style={styles.tapHint}>اضغط للتوقع</Text>}
      </View>
    </TouchableOpacity>
  );
}

function ToolButton({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.toolBtn, { borderColor: color }]} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.toolIcon}>{icon}</Text>
      <Text style={[styles.toolLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function PredictionsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentUser,  setCurrentUser]  = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);
  const [announcement, setAnnouncement] = useState(null);
  const [showAnn,      setShowAnn]      = useState(false);
  const [matches,      setMatches]      = useState([]);
  const [predictions,  setPredictions]  = useState({});
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  useEffect(() => {
    loadPredictionSession().then((user) => { setCurrentUser(user); setAuthLoading(false); });
  }, []);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!currentUser) return;
    try {
      if (isRefresh) setRefreshing(true);
      const [todayMatches, userPreds, ranked, ann] = await Promise.all([
        fetchTodayMatches(),
        fetchUserPredictions(currentUser.id),
        fetchUserRank(currentUser.id),
        fetchUnseenAnnouncement(currentUser.id),
      ]);
      setMatches(todayMatches);
      setPredictions(userPreds);
      if (ranked) {
        const updated = { ...currentUser, rank: ranked.rank, total_points: ranked.total_points };
        setCurrentUser(updated);
        await savePredictionSession(updated);
      }
      if (ann) { setAnnouncement(ann); setShowAnn(true); }
    } catch (e) { Alert.alert("خطأ", "تعذّر تحميل المباريات."); }
    finally { setLoading(false); setRefreshing(false); }
  }, [currentUser?.id]);

  useEffect(() => { if (currentUser) { setLoading(true); loadData(); } }, [currentUser?.id]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => { if (currentUser) loadData(); });
    return unsub;
  }, [navigation, currentUser?.id]);

  const dismissAnnouncement = async () => {
    setShowAnn(false);
    if (announcement && currentUser) await markAnnouncementSeen(currentUser.id, announcement.id);
  };

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل تريد الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "خروج", style: "destructive", onPress: async () => {
        await clearPredictionSession();
        setCurrentUser(null); setMatches([]); setPredictions({});
      }},
    ]);
  };

  if (authLoading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!currentUser) return <PredictionLoginScreen onLoginSuccess={setCurrentUser} />;

  const buildItems = () => {
    const items = [{ key: "header", type: "header" }];
    if (loading) {
      items.push({ key: "skeleton", type: "skeleton" });
    } else if (matches.length === 0) {
      items.push({ key: "empty", type: "empty" });
    } else {
      matches.forEach(m => items.push({ key: `m-${m.id}`, type: "match", match: m }));
    }
    return items;
  };

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>خروج</Text>
              </TouchableOpacity>
              <Text style={styles.screenTitle}>توقعاتي 🏆</Text>
            </View>

            <View style={styles.userCard}>
              <View style={styles.userRight}>
                <Text style={styles.userName}>{currentUser.display_name}</Text>
                <Text style={styles.userSub}>
                  {currentUser.rank ? `#${currentUser.rank} في الصدارة` : `@${currentUser.username}`}
                </Text>
              </View>
              <PlayerAvatar avatarId={currentUser.avatar_id} size={52} ringColor={colors.primary} />
              <View style={styles.pointsBox}>
                <Text style={styles.pointsNum}>{currentUser.total_points}</Text>
                <Text style={styles.pointsLabel}>نقطة</Text>
              </View>
            </View>

            <View style={styles.toolsRow}>
              <ToolButton icon="📋" label="السابقة"  color={colors.mutedForeground} onPress={() => navigation.navigate("PastMatches", { currentUser })} />
              <ToolButton icon="🏅" label="الصدارة"  color={colors.primary}         onPress={() => navigation.navigate("Leaderboard", { currentUser })} />
              <ToolButton icon="⚔️" label="المنافسة" color={colors.live}            onPress={() => navigation.navigate("Rivals", { currentUser })} />
            </View>

            <Text style={styles.dateLabel}>
              مباريات اليوم — {new Date().toLocaleDateString("ar-IQ", { weekday: "long", day: "numeric", month: "long" })}
            </Text>
          </View>
        );

      case "skeleton":
        return <HomeScreenSkeleton />;

      case "match":
        return (
          <MatchRow
            match={item.match}
            prediction={predictions[item.match.id] || null}
            onPress={() => navigation.navigate("MatchPredict", {
              match: item.match, currentUser,
              existingPrediction: predictions[item.match.id] || null,
            })}
          />
        );

      case "empty":
        return (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>لا توجد مباريات مجدولة اليوم</Text>
          </View>
        );

      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Modal visible={showAnn} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}><Text style={styles.modalIcon}>📢</Text></View>
            <Text style={styles.modalTitle}>تنويه</Text>
            <Text style={styles.modalText}>{announcement?.message}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={dismissAnnouncement}>
              <Text style={styles.modalBtnText}>فهمت، إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data={buildItems()} keyExtractor={item => item.key} renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={colors.primary} />}
        ListFooterComponent={<View style={{ height: insets.bottom + 24 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  topBar: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  screenTitle: { color: colors.foreground, fontFamily: fonts.black, fontSize: 20 },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  logoutText: { color: colors.mutedForeground, fontFamily: fonts.medium, fontSize: 12 },
  userCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.lg, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, gap: spacing.sm },
  userRight: { alignItems: "flex-end", flex: 1 },
  userName: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 18 },
  userSub: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  pointsBox: { backgroundColor: colors.primaryLight, borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, alignItems: "center" },
  pointsNum: { color: colors.primary, fontFamily: fonts.black, fontSize: 24 },
  pointsLabel: { color: colors.primary, fontFamily: fonts.medium, fontSize: 11 },
  toolsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  toolBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: spacing.md, borderRadius: radius.lg, borderWidth: 1.5, backgroundColor: colors.card, gap: 4 },
  toolIcon: { fontSize: 20 },
  toolLabel: { fontFamily: fonts.bold, fontSize: 12 },
  dateLabel: { color: colors.mutedForeground, fontFamily: fonts.medium, fontSize: 13, textAlign: "right", marginBottom: spacing.sm },
  matchRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.lg, marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  teamSide: { flex: 1, alignItems: "center", gap: spacing.xs },
  flag: { width: 44, height: 32 },
  flagFallback: { backgroundColor: colors.secondary, borderRadius: radius.sm, justifyContent: "center", alignItems: "center" },
  flagLetter: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 16 },
  teamName: { color: colors.foreground, fontFamily: fonts.medium, fontSize: 11, textAlign: "center" },
  matchCenter: { alignItems: "center", minWidth: 70, gap: 4 },
  finalScore: { color: colors.foreground, fontFamily: fonts.black, fontSize: 20 },
  matchTime: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 14 },
  statusPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.secondary },
  pillLive: { backgroundColor: "#EF444420" },
  pillDone: { backgroundColor: colors.secondary },
  pillLocked: { backgroundColor: "#F59E0B20" },
  statusText: { color: colors.mutedForeground, fontFamily: fonts.medium, fontSize: 10 },
  predBadge: { position: "absolute", bottom: 6, right: spacing.md },
  savedPill: { backgroundColor: colors.accentLight, borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  savedPillText: { color: colors.accent, fontFamily: fonts.bold, fontSize: 10 },
  tapHint: { color: colors.primary, fontFamily: fonts.regular, fontSize: 10 },
  ptsPill: { borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: colors.secondary },
  ptsGold: { backgroundColor: "#F59E0B33" }, ptsSilver: { backgroundColor: "#6B728033" }, ptsBronze: { backgroundColor: "#92400E33" },
  ptsPillText: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 10 },
  empty: { alignItems: "center", paddingVertical: 60, gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: spacing.xl },
  modalCard: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, alignItems: "center", borderWidth: 1, borderColor: colors.border, width: "100%", gap: spacing.md },
  modalIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryLight, justifyContent: "center", alignItems: "center" },
  modalIcon: { fontSize: 26 },
  modalTitle: { color: colors.foreground, fontFamily: fonts.extraBold, fontSize: 17 },
  modalText: { color: colors.mutedForeground, fontFamily: fonts.medium, fontSize: 14, textAlign: "center", lineHeight: 22 },
  modalBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, marginTop: spacing.sm, width: "100%", alignItems: "center" },
  modalBtnText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
});
