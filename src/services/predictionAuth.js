// src/services/predictionAuth.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "PREDICTION_USER";

export async function savePredictionSession(user) {
  await AsyncStorage.setItem(KEY, JSON.stringify(user));
}
export async function loadPredictionSession() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export async function clearPredictionSession() {
  await AsyncStorage.removeItem(KEY);
}
