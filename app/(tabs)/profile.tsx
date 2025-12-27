import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { CoinDisplay } from "@/components/coin-display";
import { trpc } from "@/lib/trpc";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { data: coinBalance = 0 } = trpc.coins.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: missions = [] } = trpc.missions.listByChild.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const completedMissions = missions.filter((m) => m.status === "approved").length;
  const totalCoinsEarned = missions
    .filter((m) => m.status === "approved")
    .reduce((sum, m) => sum + m.rewardCoins, 0);

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">Sign In Required</Text>
        <Text className="text-center text-muted mb-8">Please sign in to view your profile.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          <View className="items-center gap-3">
            <View className="w-20 h-20 bg-primary rounded-full items-center justify-center">
              <Text className="text-4xl">👤</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">{user?.name || "User"}</Text>
            <Text className="text-sm text-muted">{user?.email || "No email"}</Text>
          </View>

          <View className="bg-gradient-to-r from-primary to-pink-500 rounded-2xl p-6 items-center">
            <Text className="text-white text-sm mb-2">Current Balance</Text>
            <CoinDisplay amount={coinBalance} size="large" />
          </View>

          <View>
            <Text className="text-lg font-bold text-foreground mb-3">Statistics</Text>
            <View className="gap-3">
              <View className="bg-surface rounded-xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">✅</Text>
                  <View>
                    <Text className="text-sm text-muted">Completed Missions</Text>
                    <Text className="text-lg font-bold text-foreground">{completedMissions}</Text>
                  </View>
                </View>
              </View>

              <View className="bg-surface rounded-xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">💰</Text>
                  <View>
                    <Text className="text-sm text-muted">Total Earned</Text>
                    <Text className="text-lg font-bold text-foreground">{totalCoinsEarned}</Text>
                  </View>
                </View>
              </View>

              <View className="bg-surface rounded-xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">📋</Text>
                  <View>
                    <Text className="text-sm text-muted">Total Missions</Text>
                    <Text className="text-lg font-bold text-foreground">{missions.length}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <Pressable
            onPress={logout}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            className="bg-error px-6 py-3 rounded-full items-center mt-4"
          >
            <Text className="text-white font-semibold">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
