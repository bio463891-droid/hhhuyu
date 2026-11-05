// src/theme/avatars.js — النسخة البسيطة الأصلية

export const AVATARS = {
  1:  require("../assets/player-avatar/avatar-1.png"),
  2:  require("../assets/player-avatar/avatar-2.png"),
  3:  require("../assets/player-avatar/avatar-3.png"),
  4:  require("../assets/player-avatar/avatar-4.png"),
  5:  require("../assets/player-avatar/avatar-5.png"),
  6:  require("../assets/player-avatar/avatar-6.png"),
  7:  require("../assets/player-avatar/avatar-7.png"),
  8:  require("../assets/player-avatar/avatar-8.png"),
  9:  require("../assets/player-avatar/avatar-9.png"),
  10: require("../assets/player-avatar/avatar-10.png"),
  11: require("../assets/player-avatar/avatar-11.png"),
  12: require("../assets/player-avatar/avatar-12.png"),
};

export const AVATAR_IDS = Object.keys(AVATARS).map(Number);

export function getAvatarSource(avatarId) {
  return AVATARS[avatarId] || AVATARS[1];
}
