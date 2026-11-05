// src/components/AvatarPicker.js — نسخة أصلية بسيطة + Squircle

import React from "react";
import { View, Image, TouchableOpacity, StyleSheet, Text } from "react-native";
import { colors, radius, spacing, fonts } from "../theme/colors";
import { AVATAR_IDS, getAvatarSource } from "../theme/avatars";

const AVATAR_SIZE = 58;
const SQUIRCLE_RATIO = 0.28;
const BR = Math.round(AVATAR_SIZE * SQUIRCLE_RATIO);

export default function AvatarPicker({ selectedId, onSelect }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>اختر صورة شخصية</Text>
      <View style={styles.grid}>
        {AVATAR_IDS.map((id) => {
          const active = id === selectedId;
          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.8}
              onPress={() => onSelect(id)}
              style={[styles.item, active && styles.itemActive]}
            >
              <Image
                source={getAvatarSource(id)}
                style={styles.avatarImg}
                resizeMode="cover"
              />
              {active && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: {
    color: colors.mutedForeground, fontFamily: fonts.medium,
    fontSize: 13, textAlign: "right", marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: spacing.sm, justifyContent: "flex-end",
  },
  item: {
    width: AVATAR_SIZE + 8, height: AVATAR_SIZE + 8,
    borderRadius: BR + 3,
    borderWidth: 2, borderColor: "transparent",
    justifyContent: "center", alignItems: "center",
    position: "relative",
  },
  itemActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: BR },
  checkBadge: {
    position: "absolute", bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: colors.background,
  },
  checkText: { color: colors.white, fontSize: 11, fontFamily: fonts.bold },
});
