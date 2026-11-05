// src/screens/RivalsScreen.js
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing } from "../theme/colors";
import { fetchFriendChallenges, addFriendChallenge } from "../api/predictionsApi";
import PlayerAvatar from "../components/PlayerAvatar";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RivalsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const currentUser = route?.params?.currentUser;

  const [rivals, setRivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [username, setUsername] = useState("");
  const [showInput, setShowInput] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchFriendChallenges(currentUser.id);
      setRivals([...data].sort((a, b) => b.total_points - a.total_points));
    } catch (e) { Alert.alert("خطأ", e.message); }
    finally { setLoading(false); }
  }, [currentUser.id]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!username.trim()) return;
    setAdding(true);
    try {
      const friend = await addFriendChallenge(currentUser.id, username.trim());
      setRivals(prev => [...prev, friend].sort((a, b) => b.total_points - a.total_points));
      setUsername(""); setShowInput(false);
      Alert.alert("✅ تمت الإضافة", `${friend.display_name} الآن في قائمة منافسيك!`);
    } catch (e) { Alert.alert("خطأ", e.message); }
    finally { setAdding(false); }
  };

  const renderRival = ({ item, index }) => {
    const isMe = item.id === currentUser.id;
    const medal = MEDALS[index] || null;
    const rank = medal || `#${index + 1}`;
    const isAhead = item.total_points > currentUser.total_points;
    const diff = Math.abs(item.total_points - currentUser.total_points);

    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <Text style={[styles.rank, medal && styles.rankMedal]}>{rank}</Text>
        <PlayerAvatar avatarId={item.avatar_id} size={40} />
        <View style={styles.nameWrap}>
          <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>{item.display_name}</Text>
          <Text style={styles.diff}>
            {isAhead ? `متقدم عليك بـ ${diff} نقطة 📈` : diff === 0 ? "متعادلان ⚖️" : `متأخر عنك بـ ${diff} نقطة 📉`}
          </Text>
        </View>
        <View style={[styles.ptsBadge, isAhead && styles.ptsBadgeRed]}>
          <Text style={[styles.pts, isAhead && styles.ptsRed]}>{item.total_points}</Text>
          <Text style={styles.ptsLabel}>نقطة</Text>
        </View>
      </View>
    );
  };

  const myRow = (
    <View style={[styles.row, styles.rowMe, { marginBottom: spacing.sm }]}>
      <Text style={styles.rank}>أنت</Text>
      <PlayerAvatar avatarId={currentUser.avatar_id} size={40} ringColor={colors.primary} />
      <View style={styles.nameWrap}>
        <Text style={[styles.name, styles.nameMe]}>{currentUser.display_name}</Text>
        <Text style={styles.diff}>نقاطك الحالية</Text>
      </View>
      <View style={[styles.ptsBadge, styles.ptsBadgeBlue]}>
        <Text style={[styles.pts, styles.ptsBlue]}>{currentUser.total_points}</Text>
        <Text style={styles.ptsLabel}>نقطة</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backIcon}>✕</Text></TouchableOpacity>
        <Text style={styles.title}>لوحة المنافسين ⚔️</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowInput(!showInput)}><Text style={styles.addBtnText}>+ تحدي</Text></TouchableOpacity>
      </View>

      {showInput && (
        <View style={styles.inputRow}>
          <TouchableOpacity style={[styles.sendBtn, adding && styles.sendBtnDisabled]} onPress={handleAdd} disabled={adding}>
            {adding ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.sendBtnText}>إضافة</Text>}
          </TouchableOpacity>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="اسم المستخدم" placeholderTextColor={colors.mutedForeground} autoCapitalize="none" autoCorrect={false} textAlign="right" />
        </View>
      )}

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={rivals} keyExtractor={(item) => String(item.id)} renderItem={renderRival}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
              {myRow}
              <Text style={styles.sectionLabel}>{rivals.length === 0 ? "لا يوجد منافسون — أضف صديقك!" : `${rivals.length} منافس`}</Text>
            </View>
          }
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>⚔️</Text><Text style={styles.emptyText}>اضغط "+ تحدي" وأدخل اسم صديقك</Text></View>}
          ListFooterComponent={<View style={{ height: insets.bottom + 24 }} />}
          contentContainerStyle={{ paddingHorizontal: spacing.lg }}
          showsVerticalScrollIndicator={false}
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
  title: { color: colors.foreground, fontFamily: fonts.black, fontSize: 20 },
  addBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.primary, borderRadius: radius.md },
  addBtnText: { color: colors.white, fontFamily: fonts.bold, fontSize: 13 },
  inputRow: { flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  input: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, color: colors.foreground, fontFamily: fonts.regular, fontSize: 15, padding: spacing.md },
  sendBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: colors.white, fontFamily: fonts.bold, fontSize: 14 },
  sectionLabel: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 13, textAlign: "right", paddingVertical: spacing.md },
  row: { flexDirection: "row-reverse", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.md },
  rowMe: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  rank: { color: colors.mutedForeground, fontFamily: fonts.bold, fontSize: 14, minWidth: 28, textAlign: "center" },
  rankMedal: { fontSize: 20 },
  nameWrap: { flex: 1, alignItems: "flex-end" },
  name: { color: colors.foreground, fontFamily: fonts.bold, fontSize: 15, textAlign: "right" },
  nameMe: { color: colors.primary },
  diff: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 11, textAlign: "right", marginTop: 2 },
  ptsBadge: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minWidth: 56 },
  ptsBadgeRed: { backgroundColor: "#EF444422" },
  ptsBadgeBlue: { backgroundColor: colors.primaryLight },
  pts: { color: colors.foreground, fontFamily: fonts.black, fontSize: 20 },
  ptsRed: { color: colors.live },
  ptsBlue: { color: colors.primary },
  ptsLabel: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", paddingVertical: 40, gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.mutedForeground, fontFamily: fonts.regular, fontSize: 15, textAlign: "center" },
});
