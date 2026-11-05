// src/api/predictionsApi.js — نسخة أصلية تعمل مع avatar_id

import { supabase } from "./supabaseClient";

export async function loginPredictionUser(username, password) {
  const { data, error } = await supabase
    .from("prediction_users")
    .select("*")
    .eq("username", username.trim())
    .eq("password_hash", password)
    .single();

  if (error || !data) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");

  const { data: ranked } = await supabase
    .from("prediction_leaderboard")
    .select("rank")
    .eq("id", data.id)
    .single();

  return { ...data, rank: ranked?.rank ?? null };
}

export async function registerPredictionUser(username, password, displayName, avatarId) {
  const { data: existing } = await supabase
    .from("prediction_users")
    .select("id")
    .eq("username", username.trim())
    .maybeSingle();

  if (existing) throw new Error("اسم المستخدم مأخوذ، جرب اسماً آخر");

  const { data, error } = await supabase
    .from("prediction_users")
    .insert({
      username:      username.trim(),
      password_hash: password,
      display_name:  displayName.trim() || username.trim(),
      avatar_id:     avatarId || 1,
      total_points:  0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchTodayMatches() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("match_date", today)
    .order("match_time", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchUserPredictions(userId) {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("predictions")
    .select("*, matches!inner(match_date)")
    .eq("user_id", userId)
    .eq("matches.match_date", today);

  if (error) throw new Error(error.message);
  const map = {};
  (data || []).forEach((p) => { map[p.match_id] = p; });
  return map;
}

export async function savePrediction(userId, matchId, homeGoals, awayGoals) {
  const { data: match } = await supabase
    .from("matches").select("lock_time, status").eq("id", matchId).single();

  if (match?.status === "finished") throw new Error("انتهت المباراة، لا يمكن التوقع");
  if (match?.lock_time && new Date() >= new Date(match.lock_time))
    throw new Error("انتهى وقت التوقع لهذه المباراة ⏰");

  const { data: existing } = await supabase
    .from("predictions").select("id")
    .eq("user_id", userId).eq("match_id", matchId).maybeSingle();

  if (existing) throw new Error("لقد سجّلت توقعك مسبقاً ولا يمكن التعديل ✋");

  const { data, error } = await supabase
    .from("predictions")
    .insert({ user_id: userId, match_id: matchId, predicted_home: homeGoals, predicted_away: awayGoals })
    .select().single();

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchUserRank(userId) {
  const { data } = await supabase
    .from("prediction_leaderboard")
    .select("rank, total_points")
    .eq("id", userId).single();
  return data;
}

export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from("prediction_leaderboard")
    .select("id, display_name, username, total_points, rank, avatar_id")
    .order("rank", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function addFriendChallenge(userId, friendUsername) {
  const { data: friend, error: fErr } = await supabase
    .from("prediction_users")
    .select("id, display_name, username, total_points, rank, avatar_id")
    .eq("username", friendUsername.trim()).single();

  if (fErr || !friend) throw new Error("المستخدم غير موجود");
  if (friend.id === userId) throw new Error("لا تستطيع تحدي نفسك");

  const { error } = await supabase.from("friend_challenges")
    .upsert({ user_id: userId, friend_id: friend.id }, { onConflict: "user_id,friend_id" });

  if (error) throw new Error(error.message);
  return friend;
}

export async function fetchFriendChallenges(userId) {
  const { data, error } = await supabase
    .from("friend_challenges")
    .select("friend_id, prediction_users!friend_id(id, display_name, username, total_points, rank, avatar_id)")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (data || []).map((r) => r.prediction_users);
}

export async function fetchPastMatchesWithPredictions(userId) {
  const { data, error } = await supabase
    .from("matches")
    .select("*, predictions!left(predicted_home, predicted_away, points_earned, user_id)")
    .eq("status", "finished")
    .order("match_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map((m) => {
    const myPred = (m.predictions || []).find((p) => p.user_id === userId) || null;
    const { predictions, ...match } = m;
    return { ...match, myPrediction: myPred };
  });
}

export async function fetchUnseenAnnouncement(userId) {
  const { data: announcement } = await supabase
    .from("announcements").select("id, message")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1).maybeSingle();

  if (!announcement) return null;

  const { data: user } = await supabase
    .from("prediction_users").select("last_seen_announcement_id").eq("id", userId).single();

  if (user?.last_seen_announcement_id === announcement.id) return null;
  return announcement;
}

export async function markAnnouncementSeen(userId, announcementId) {
  await supabase.from("prediction_users")
    .update({ last_seen_announcement_id: announcementId }).eq("id", userId);
}
