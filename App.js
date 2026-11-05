// App.js — تطبيق "توقعاتي" المستقل
// نفس بنية ملعبنا (fonts gate + navigation stack) لكن كتطبيق قائم بذاته

import React from "react";
import { View, ActivityIndicator } from "react-native";
import {
  useFonts,
  Tajawal_300Light, Tajawal_400Regular, Tajawal_500Medium,
  Tajawal_700Bold, Tajawal_800ExtraBold, Tajawal_900Black,
} from "@expo-google-fonts/tajawal";
import { NavigationContainer }        from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider }           from "react-native-safe-area-context";
import { StatusBar }                  from "expo-status-bar";

import PredictionsScreen  from "./src/screens/PredictionsScreen";
import MatchPredictScreen from "./src/screens/MatchPredictScreen";
import LeaderboardScreen  from "./src/screens/LeaderboardScreen";
import RivalsScreen       from "./src/screens/RivalsScreen";
import PastMatchesScreen  from "./src/screens/PastMatchesScreen";
import { colors }         from "./src/theme/colors";

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Tajawal_300Light, Tajawal_400Regular, Tajawal_500Medium,
    Tajawal_700Bold, Tajawal_800ExtraBold, Tajawal_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.background} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: "slide_from_bottom",
          }}
        >
          <Stack.Screen name="Predictions"  component={PredictionsScreen} />
          <Stack.Screen name="MatchPredict" component={MatchPredictScreen} />
          <Stack.Screen name="Leaderboard"  component={LeaderboardScreen} />
          <Stack.Screen name="Rivals"       component={RivalsScreen} />
          <Stack.Screen name="PastMatches"  component={PastMatchesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
