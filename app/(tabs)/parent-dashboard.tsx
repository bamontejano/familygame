import { ScrollView, Text, View, Pressable, ActivityIndicator, FlatList } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

export default function ParentDashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { data: missions = [], isLoading: missionsLoading } = trpc.missions.listByParent.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const { data: pendingRedemptions = [], isLoading: redemptionsLoading } = 
    trpc.redeemedRewards.listPendingByParent.useQuery(undefined, { enabled: isAuthenticated });

  const pendingApproval = missions.filter((m) => m.status === "pending");
  
  const utils = trpc.useUtils();

  const approveRedemption = trpc.coins.approveRedemption.useMutation({
    onSuccess: () => {
      utils.redeemedRewards.listPendingByParent.invalidate();
      utils.coins.getBalance.invalidate();
    }
  });

  const rejectRedemption = trpc.coins.rejectRedemption.useMutation({
    onSuccess: () => {
      utils.redeemedRewards.listPendingByParent.invalidate();
    }
  });

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

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
                <Text className="text-xl">👨‍👩‍👧</Text>
              </View>
              <View>
                <Text className="text-sm text-muted">Familia</Text>
                <Text className="text-xl font-bold text-foreground">{user?.name || "Familia"}</Text>
              </View>
            </View>
            <Pressable>
              <Text className="text-2xl">🔔</Text>
            </Pressable>
          </View>

          {/* Greeting */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Hola, Papá 👋</Text>
            <Text className="text-muted">Aquí está el resumen de hoy</Text>
          </View>

          {/* Children Cards */}
          <View className="gap-3">
            <View className="bg-surface rounded-2xl p-6 gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
                    <Text className="text-xl">👧</Text>
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-foreground">Ana</Text>
                    <Text className="text-sm text-muted">Nivel 4</Text>
                  </View>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-foreground">150</Text>
                  <Text className="text-xs text-muted">monedas</Text>
                </View>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View className="h-full bg-primary" style={{ width: "75%" }} />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted">75%</Text>
                <Pressable className="bg-primary rounded-full w-8 h-8 items-center justify-center">
                  <Text className="text-black font-bold">→</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Acciones Rápidas</Text>
            <View className="flex-row gap-3">
              <Pressable className="flex-1 bg-primary rounded-2xl p-6 items-center justify-center">
                <Text className="text-3xl mb-2">+</Text>
                <Text className="text-black font-bold text-center">Crear Misión</Text>
              </Pressable>
              <Pressable 
                onPress={() => router.push("/rewards-editor")}
                className="flex-1 bg-surface rounded-2xl p-6 items-center justify-center"
              >
                <Text className="text-3xl mb-2">🎁</Text>
                <Text className="text-foreground font-bold text-center">Gestionar Tienda</Text>
              </Pressable>
            </View>
          </View>

          {/* Redemptions to Approve */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Canjes por Aprobar</Text>
              <Text className="text-sm text-primary font-bold">{pendingRedemptions.length} pendientes</Text>
            </View>

            {pendingRedemptions.length === 0 ? (
              <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                <Text className="text-muted">No hay solicitudes de canje pendientes</Text>
              </View>
            ) : (
              <FlatList
                data={pendingRedemptions}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-2xl p-4 mb-3 flex-row items-center gap-4 border border-border">
                    <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center flex-shrink-0">
                      <Text className="text-xl">{item.rewardIcon || "🎁"}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-foreground">{item.rewardTitle}</Text>
                      <Text className="text-xs text-muted">{item.childName} • {item.costCoins} monedas</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable 
                        onPress={() => rejectRedemption.mutate({ redemptionId: item.id })}
                        className="bg-error/10 rounded-full w-10 h-10 items-center justify-center"
                      >
                        <Text className="text-error font-bold">✕</Text>
                      </Pressable>
                      <Pressable 
                        onPress={() => approveRedemption.mutate({ redemptionId: item.id })}
                        className="bg-primary rounded-full w-10 h-10 items-center justify-center"
                      >
                        <Text className="text-black font-bold">✓</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          {/* Missions to Approve */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Misiones por Aprobar</Text>
              <Text className="text-sm text-error font-bold">{pendingApproval.length} nuevas</Text>
            </View>

            {pendingApproval.length === 0 ? (
              <View className="bg-surface rounded-2xl p-6 items-center">
                <Text className="text-muted">No hay misiones pendientes de aprobación</Text>
              </View>
            ) : (
              <FlatList
                data={pendingApproval}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-2xl p-4 mb-3 flex-row items-center gap-4">
                    <View className="w-12 h-12 bg-primary rounded-full items-center justify-center flex-shrink-0">
                      <Text className="text-xl">👧</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-foreground">{item.title}</Text>
                      <Text className="text-xs text-muted">Ana • Hace 10 min</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable className="bg-error rounded-full w-10 h-10 items-center justify-center">
                        <Text className="text-white font-bold">✕</Text>
                      </Pressable>
                      <Pressable className="bg-primary rounded-full w-10 h-10 items-center justify-center">
                        <Text className="text-black font-bold">✓</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
