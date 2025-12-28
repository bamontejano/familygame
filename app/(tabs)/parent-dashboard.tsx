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

  const { data: children = [], isLoading: childrenLoading } =
    trpc.family.getChildren.useQuery(undefined, { enabled: isAuthenticated });

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
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-8">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="w-14 h-14 bg-primary/20 rounded-2xl items-center justify-center border border-primary/30">
                <Text className="text-2xl">👨‍👩‍👧</Text>
              </View>
              <View>
                <Text className="text-xs font-bold text-primary tracking-widest uppercase">Tu Familia</Text>
                <Text className="text-2xl font-bold text-foreground">{user?.name || "Familia"}</Text>
              </View>
            </View>
            <Pressable className="bg-surface w-12 h-12 rounded-2xl items-center justify-center border border-border">
              <Text className="text-xl">🔔</Text>
            </Pressable>
          </View>

          {/* Quick Actions */}
          <View className="gap-4">
            <Text className="text-lg font-bold text-foreground px-1">Acciones Rápidas</Text>
            <View className="flex-row gap-4">
              <Pressable
                onPress={() => router.push("/create-mission")}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  backgroundColor: '#00FF00'
                })}
                className="flex-1 rounded-3xl p-6 items-center justify-center shadow-lg"
              >
                <View className="w-12 h-12 bg-black/10 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl font-bold text-black">+</Text>
                </View>
                <Text className="text-black font-extrabold text-center">Nueva Misión</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/rewards-editor")}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.96 : 1 }]
                })}
                className="flex-1 bg-surface rounded-3xl p-6 items-center justify-center border border-border shadow-sm"
              >
                <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl">🎁</Text>
                </View>
                <Text className="text-foreground font-bold text-center">Tienda</Text>
              </Pressable>
            </View>
          </View>

          {/* Children Section */}
          <View className="gap-4">
            <Text className="text-lg font-bold text-foreground px-1">Tus Héroes</Text>
            {childrenLoading ? (
              <ActivityIndicator color="#00FF00" />
            ) : children.length === 0 ? (
              <Pressable
                onPress={() => router.push("/invite-children")}
                className="bg-surface border border-dashed border-primary/50 rounded-3xl p-8 items-center"
              >
                <Text className="text-4xl mb-2">👋</Text>
                <Text className="text-muted text-center font-medium">No hay hijos asociados.{"\n"}¡Pulsa aquí para invitar!</Text>
              </Pressable>
            ) : (
              <View className="gap-4">
                {children.map((relation) => (
                  <View key={relation.id} className="bg-surface rounded-3xl p-5 border border-border shadow-sm">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-4">
                        <View className="w-14 h-14 bg-primary/10 rounded-full items-center justify-center border-2 border-primary/20">
                          <Text className="text-2xl">👧</Text>
                        </View>
                        <View>
                          <Text className="text-lg font-bold text-foreground">{relation.childName || "Hijo"}</Text>
                          <Text className="text-xs text-muted tracking-tight">{relation.childEmail}</Text>
                        </View>
                      </View>
                      <View className="bg-background px-4 py-2 rounded-2xl items-center border border-border">
                        <Text className="text-xl font-black text-primary">{relation.coinBalance ?? 0}</Text>
                        <Text className="text-[10px] text-muted font-bold uppercase">Coins</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Redemptions Section */}
          <View className="gap-4">
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-lg font-bold text-foreground">Por Aprobar (Tienda)</Text>
              {pendingRedemptions.length > 0 && (
                <View className="bg-error px-2 py-0.5 rounded-full">
                  <Text className="text-white text-[10px] font-black">{pendingRedemptions.length}</Text>
                </View>
              )}
            </View>

            {pendingRedemptions.length === 0 ? (
              <View className="bg-surface/50 rounded-3xl p-8 items-center border border-border/50">
                <Text className="text-muted font-medium italic">Todo al día</Text>
              </View>
            ) : (
              <View className="gap-3">
                {pendingRedemptions.map((item) => (
                  <View key={item.id} className="bg-surface rounded-2xl p-4 flex-row items-center gap-4 border border-border">
                    <View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center">
                      <Text className="text-2xl">{item.rewardIcon || "🎁"}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-foreground" numberOfLines={1}>{item.rewardTitle}</Text>
                      <Text className="text-xs text-muted font-medium">{item.childName} • {item.costCoins} 💰</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => rejectRedemption.mutate({ redemptionId: item.id })}
                        className="bg-error/10 w-10 h-10 rounded-full items-center justify-center border border-error/20"
                      >
                        <Text className="text-error font-black">✕</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => approveRedemption.mutate({ redemptionId: item.id })}
                        className="bg-primary w-10 h-10 rounded-full items-center justify-center shadow-sm"
                      >
                        <Text className="text-black font-black">✓</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Missions Section */}
          <View className="gap-4 mb-8">
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-lg font-bold text-foreground">Misiones Pendientes</Text>
              {pendingApproval.length > 0 && (
                <View className="bg-primary px-2 py-0.5 rounded-full">
                  <Text className="text-black text-[10px] font-black">{pendingApproval.length}</Text>
                </View>
              )}
            </View>

            {pendingApproval.length === 0 ? (
              <View className="bg-surface/50 rounded-3xl p-8 items-center border border-border/50">
                <Text className="text-muted font-medium italic">Sin misiones pendientes</Text>
              </View>
            ) : (
              <View className="gap-3">
                {pendingApproval.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push(`/mission/${item.id}`)}
                    className="bg-surface rounded-2xl p-4 flex-row items-center gap-4 border border-border"
                  >
                    <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                      <Text className="text-xl">🎯</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-foreground" numberOfLines={1}>{item.title}</Text>
                      <Text className="text-xs text-muted font-medium">Recompensa: {item.rewardCoins} 💰</Text>
                    </View>
                    <Pressable
                      onPress={() => router.push(`/mission/${item.id}`)}
                      className="bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/30"
                    >
                      <Text className="text-primary font-bold text-xs uppercase">Ver</Text>
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
