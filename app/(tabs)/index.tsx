import { ScrollView, Text, View, ActivityIndicator, FlatList, Pressable } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { CoinDisplay } from "@/components/coin-display";
import { MissionCard } from "@/components/mission-card";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const { data: coinBalance = 0, isLoading: balanceLoading } = trpc.coins.getBalance.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: missions = [], isLoading: missionsLoading } =
    trpc.missions.listByChild.useQuery(undefined, { enabled: isAuthenticated });

  const activeMissions = missions.filter((m) => m.status === "pending" || m.status === "completed");

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
        <Text className="text-3xl font-bold text-foreground mb-4">Welcome to FamilyGame</Text>
        <Text className="text-center text-muted mb-8">
          Sign in to start earning coins and completing missions!
        </Text>
      <Pressable
        onPress={() => router.push("/auth/signin")}
        style={({ pressed }) => [
          {
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
        className="bg-primary px-8 py-3 rounded-full"
      >
        <Text className="text-white font-semibold text-center">Sign In</Text>
      </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-sm text-muted mb-1">Welcome back,</Text>
            <Text className="text-3xl font-bold text-foreground">{user?.name || "Friend"}</Text>
          </View>

          {/* Coin Balance */}
          <View className="bg-gradient-to-r from-primary to-pink-500 rounded-2xl p-6 items-center justify-center">
            {balanceLoading ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <View className="items-center">
                <Text className="text-white text-sm mb-2">Your Balance</Text>
                <CoinDisplay amount={coinBalance} size="large" />
              </View>
            )}
          </View>

          {/* Active Missions Section */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-foreground">Active Missions</Text>
              <Pressable>
                <Text className="text-primary font-semibold">View All</Text>
              </Pressable>
            </View>

            {missionsLoading ? (
              <ActivityIndicator size="large" color="#6366F1" />
            ) : activeMissions.length > 0 ? (
              <FlatList
                data={activeMissions.slice(0, 3)}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <MissionCard
                    title={item.title}
                    description={item.description || undefined}
                    category={item.category}
                    rewardCoins={item.rewardCoins}
                    status={item.status as any}
                  />
                )}
                scrollEnabled={false}
              />
            ) : (
              <View className="bg-surface rounded-xl p-6 items-center">
                <Text className="text-2xl mb-2">🎯</Text>
                <Text className="text-foreground font-semibold mb-1">No Active Missions</Text>
                <Text className="text-sm text-muted text-center">
                  Check back later for new missions from your parents!
                </Text>
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 items-center">
              <Text className="text-2xl mb-2">✅</Text>
              <Text className="text-2xl font-bold text-foreground">
                {missions.filter((m) => m.status === "approved").length}
              </Text>
              <Text className="text-xs text-muted mt-1">Completed</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 items-center">
              <Text className="text-2xl mb-2">⏳</Text>
              <Text className="text-2xl font-bold text-foreground">
                {missions.filter((m) => m.status === "pending").length}
              </Text>
              <Text className="text-xs text-muted mt-1">Pending</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
