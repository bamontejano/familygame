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
  const isParent = user?.role === "parent";

  const { data: coinBalance = 0, isLoading: balanceLoading } = trpc.coins.getBalance.useQuery(
    undefined,
    { enabled: isAuthenticated && !isParent }
  );

  const { data: childMissions = [], isLoading: missionsLoading } =
    trpc.missions.listByChild.useQuery(undefined, { enabled: isAuthenticated && !isParent });

  const { data: parentMissions = [], isLoading: parentMissionsLoading } =
    trpc.missions.listByParent.useQuery(undefined, { enabled: isAuthenticated && isParent });

  const { data: activeParents = [], isLoading: parentsLoading } =
    trpc.family.getParents.useQuery(undefined, { enabled: isAuthenticated && !isParent });

  const { data: pendingRedemptions = [] } =
    trpc.redeemedRewards.listPendingByParent.useQuery(undefined, { enabled: isAuthenticated && isParent });

  const activeMissions = childMissions.filter((m) => m.status === "pending" || m.status === "completed");
  const pendingApprovals = parentMissions.filter((m) => m.status === "completed").length;

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#00FF00" />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center p-8">
        <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center mb-6">
          <Text className="text-5xl">🎮</Text>
        </View>
        <Text className="text-3xl font-black text-foreground mb-2 text-center">FamilyGame</Text>
        <Text className="text-center text-muted mb-8 text-lg font-medium">
          Transforma las tareas en una aventura épica.
        </Text>
        <Pressable
          onPress={() => router.push("/auth/signin")}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.97 : 1 }],
            backgroundColor: '#00FF00'
          })}
          className="px-12 py-4 rounded-2xl shadow-lg"
        >
          <Text className="text-black font-black text-center text-lg uppercase tracking-tight">Empezar Ahora</Text>
        </Pressable>
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
          {/* Hero Section */}
          <View className="bg-surface rounded-3xl p-6 border border-border overflow-hidden relative">
            <View className="flex-row justify-between items-start z-10">
              <View className="gap-1">
                <Text className="text-muted font-bold tracking-tight uppercase text-[10px]">Bienvenido de nuevo</Text>
                <Text className="text-3xl font-black text-foreground">
                  {user?.name?.split(' ')[0] || "Hola"}!
                </Text>
              </View>
              <View className="bg-primary/20 px-3 py-1 rounded-full flex-row items-center gap-1 border border-primary/30">
                <Text className="text-lg">🔥</Text>
                <Text className="font-black text-primary text-sm">{user?.currentStreak || 0}</Text>
              </View>
            </View>

            {!isParent && (
              <View className="mt-6 bg-background/50 p-4 rounded-2xl border border-border/50 items-center">
                <Text className="text-muted text-xs font-bold mb-1 uppercase tracking-widest">Saldo Actual</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-4xl font-black text-foreground">{coinBalance}</Text>
                  <Text className="text-2xl">💰</Text>
                </View>
              </View>
            )}

            {isParent && (
              <View className="mt-6 flex-row gap-3">
                <View className="flex-1 bg-background/50 p-4 rounded-2xl border border-border/50">
                  <Text className="text-primary font-black text-xl">{pendingApprovals + pendingRedemptions.length}</Text>
                  <Text className="text-muted text-[10px] font-bold uppercase">Pendientes</Text>
                </View>
                <View className="flex-1 bg-background/50 p-4 rounded-2xl border border-border/50">
                  <Text className="text-foreground font-black text-xl">{parentMissions.length}</Text>
                  <Text className="text-muted text-[10px] font-bold uppercase">Misiones</Text>
                </View>
              </View>
            )}
          </View>

          {/* Role specific content */}
          {isParent ? (
            <View className="gap-6">
              <View className="flex-row justify-between items-center px-1">
                <Text className="text-xl font-black text-foreground tracking-tight">Estado de la Familia</Text>
                <Pressable onPress={() => router.push("/parent-dashboard")}>
                  <Text className="text-primary font-bold text-sm">Gestionar</Text>
                </Pressable>
              </View>

              <View className="bg-surface rounded-3xl p-8 items-center border border-border shadow-sm">
                <Text className="text-4xl mb-3">📈</Text>
                <Text className="text-foreground font-black text-lg mb-1">Todo bajo control</Text>
                <Text className="text-muted text-center font-medium">
                  {pendingApprovals > 0
                    ? `Tienes ${pendingApprovals} misiones esperando tu revisión.`
                    : "Tus hijos están progresando en sus misiones actuales."}
                </Text>
              </View>

              <Pressable
                onPress={() => router.push("/create-mission")}
                style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
                className="bg-primary p-5 rounded-2xl items-center justify-center flex-row gap-3 shadow-lg"
              >
                <Text className="text-2xl font-bold text-black">+</Text>
                <Text className="text-black font-black text-lg uppercase tracking-tight">Nueva Misión</Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-6">
              {/* Unlinked Child Prompt */}
              {!parentsLoading && activeParents.length === 0 && (
                <View className="bg-primary/10 rounded-3xl p-6 border border-primary/30 gap-4">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-primary/20 rounded-2xl items-center justify-center">
                      <Text className="text-2xl">🔗</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-black text-lg">Únete a tu familia</Text>
                      <Text className="text-muted text-xs font-medium">
                        Pide el código a tus padres para empezar a ganar monedas.
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => router.push("/auth/join-family")}
                    style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
                    className="bg-primary p-4 rounded-xl items-center"
                  >
                    <Text className="text-black font-black uppercase tracking-tight">Ingresar Código</Text>
                  </Pressable>
                </View>
              )}

              <View className="flex-row justify-between items-center px-1">
                <Text className="text-xl font-black text-foreground tracking-tight">Próximas Misiones</Text>
                <Pressable onPress={() => router.push("/child-dashboard")}>
                  <Text className="text-primary font-bold text-sm">Ver Todas</Text>
                </Pressable>
              </View>

              {missionsLoading ? (
                <ActivityIndicator color="#00FF00" />
              ) : activeMissions.length > 0 ? (
                <View className="gap-4">
                  {activeMissions.slice(0, 2).map((item) => (
                    <MissionCard
                      key={item.id}
                      title={item.title}
                      description={item.description || undefined}
                      category={item.category}
                      rewardCoins={item.rewardCoins}
                      status={item.status as any}
                      onPress={() => router.push(`/mission/${item.id}`)}
                    />
                  ))}
                </View>
              ) : (
                <View className="bg-surface rounded-3xl p-10 items-center border border-dashed border-border">
                  <Text className="text-4xl mb-4">✨</Text>
                  <Text className="text-foreground font-black text-lg mb-1 text-center">¡Libre de tareas!</Text>
                  <Text className="text-muted text-center font-medium">
                    Parece que no tienes misiones por ahora. ¡Descansa o pide una a tus padres!
                  </Text>
                </View>
              )}

              <View className="bg-surface p-6 rounded-3xl border border-border flex-row items-center gap-4">
                <View className="w-14 h-14 bg-yellow-400/20 rounded-2xl items-center justify-center">
                  <Text className="text-2xl">🛍️</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-black">Visita la Tienda</Text>
                  <Text className="text-muted text-xs font-medium">¡Canjea tus monedas por premios!</Text>
                </View>
                <Pressable
                  onPress={() => router.push("/shop")}
                  className="bg-primary/20 px-4 py-2 rounded-xl border border-primary/30"
                >
                  <Text className="text-primary font-bold text-xs uppercase">Ir</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
