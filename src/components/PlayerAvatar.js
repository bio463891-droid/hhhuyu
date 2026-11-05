// src/components/PlayerAvatar.js — نسخة أصلية بسيطة + Squircle

import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors, radius } from "../theme/colors";
import { getAvatarSource } from "../theme/avatars";

const SQUIRCLE_RATIO = 0.28;

export default function PlayerAvatar({ avatarId, size = 40, ringColor }) {
  const br = Math.round(size * SQUIRCLE_RATIO);
  return (
    <View style={[
      styles.ring,
      { width: size + 4, height: size + 4, borderRadius: br + 2 },
      ringColor && { borderColor: ringColor, borderWidth: 2 },
    ]}>
      <Image
        source={getAvatarSource(avatarId)}
        style={{ width: size, height: size, borderRadius: br }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
});
