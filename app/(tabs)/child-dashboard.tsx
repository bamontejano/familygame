import { ScrollView, Text, View, Pressable, ActivityIndicator, FlatList } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { CoinDisplay } from "@/components/coin-display";
import { trpc } from "@/lib/trpc";

export default function ChildDashboardScreen() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: coinBalance = 0 } = trpc.coins.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: missions = [], isLoading: missionsLoading } = trpc.missions.listByChild.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const activeMissions = missions.filter((m) => m.status === "pending");
  const completedMissions = missions.filter((m) => m.status === "approved");

  if (loading || missionsLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#00FF00" />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">Sign In Required</Text>
      </ScreenContainer>
    );
  }

  const progressPercent = Math.min(100, (completedMissions.length / (activeMissions.length + completedMissions.length || 1)) * 100);

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
                <Text className="text-xl">👤</Text>
              </View>
              <View>
                <Text className="text-sm text-muted">Buenos días,</Text>
                <Text className="text-xl font-bold text-foreground">{user?.name || "User"}</Text>
              </View>
            </View>
            <Pressable>
              <Text className="text-2xl">🔔</Text>
            </Pressable>
          </View>

          {/* Latest Alerts */}
          <RecentApprovalsAlert />

          {/* Coin Balance Card */}
          <View className="bg-surface rounded-2xl p-6">
            <Text className="text-sm text-muted mb-2">Mis Monedas</Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-5xl font-bold text-foreground">{coinBalance}</Text>
              <Text className="text-4xl">💰</Text>
            </View>
          </View>

          {/* Level Progress */}
          <View className="bg-surface rounded-2xl p-6 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-foreground">Nivel: Explorador Novato</Text>
              <Text className="text-primary font-bold">70%</Text>
            </View>
            <View className="h-3 bg-border rounded-full overflow-hidden">
              <View className="h-full bg-primary" style={{ width: "70%" }} />
            </View>
            <Text className="text-xs text-muted">Solo faltan 50 monedas para subir de nivel!</Text>
          </View>

          {/* Today's Missions */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Misiones de Hoy</Text>
              <Text className="text-sm text-primary font-bold">{activeMissions.length} PENDIENTES</Text>
            </View>

            {activeMissions.length === 0 ? (
              <View className="bg-surface rounded-2xl p-6 items-center">
                <Text className="text-muted">No hay misiones pendientes</Text>
              </View>
            ) : (
              <FlatList
                data={activeMissions}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-2xl p-4 mb-3 flex-row items-center gap-4">
                    <View className="w-16 h-16 bg-primary rounded-xl items-center justify-center flex-shrink-0">
                      <Text className="text-3xl">🛏️</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-foreground">{item.title}</Text>
                      <Text className="text-xs text-muted">{item.description}</Text>
                      <Text className="text-primary font-bold mt-1">+ {item.rewardCoins} Monedas</Text>
                    </View>
                    <Pressable className="bg-primary rounded-full w-12 h-12 items-center justify-center">
                      <Text className="text-black font-bold">✓</Text>
                    </Pressable>
                  </View>
                )}
              />
            )}
          </View>

          {/* Nearby Rewards */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Premios Cercanos</Text>
              <Pressable>
                <Text className="text-primary font-bold">Ver Tienda</Text>
              </Pressable>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
                <Text className="text-3xl mb-2">🍦</Text>
                <Text className="text-sm font-bold text-center text-foreground">Helado Simple</Text>
                <Text className="text-lg font-bold text-primary mt-2">300</Text>
              </View>
              <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
                <Text className="text-3xl mb-2">📱</Text>
                <Text className="text-sm font-bold text-center text-foreground">1 Hora Tablet</Text>
                <Text className="text-lg font-bold text-primary mt-2">500</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function RecentApprovalsAlert() {
  const { data: recentApprovals = [] } = trpc.redeemedRewards.getRecentApprovals.useQuery(undefined, {
    refetchInterval: 30000, // Check ogni 30s
  });

  if (recentApprovals.length === 0) return null;

  return (
    <View className="gap-3">
      {recentApprovals.map((approval: any) => (
        <View
          key={approval.id}
          className="bg-primary/20 border border-primary/40 rounded-3xl p-5 flex-row items-center gap-4 shadow-sm mb-2"
        >
          <View className="w-14 h-14 bg-primary rounded-2xl items-center justify-center shadow-lg">
            <Text className="text-3xl">{approval.rewardIcon || "🎁"}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-primary font-black uppercase text-[10px] tracking-wider mb-0.5">¡Excelentes Noticias!</Text>
            <Text className="text-foreground font-bold text-base leading-tight">
              Tus padres aprobaron: <Text className="text-primary">{approval.rewardTitle}</Text>
            </Text>
            <Text className="text-muted text-[10px] font-medium mt-1">¡Ya puedes disfrutar de tu premio!</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
