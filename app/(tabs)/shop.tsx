import { ScrollView, Text, View, Pressable, ActivityIndicator, FlatList, Modal, Alert } from "react-native";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { CoinDisplay } from "@/components/coin-display";
import { trpc } from "@/lib/trpc";

const categories = [
  { id: "all", label: "Todos" },
  { id: "food", label: "Comida" },
  { id: "entertainment", label: "Diversión" },
  { id: "tech", label: "Tecnología" },
];

export default function ShopScreen() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: coinBalance = 0 } = trpc.coins.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: rewards = [], isLoading: rewardsLoading } = trpc.rewards.listByParent.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const utils = trpc.useUtils();
  const { mutate: redeemReward, isPending: isRedeeming } = trpc.coins.redeem.useMutation({
    onSuccess: () => {
      utils.coins.getBalance.invalidate();
      setShowConfirm(false);
      setSelectedReward(null);
      Alert.alert(
        "Solicitud Enviada", 
        "Tu solicitud de canje ha sido enviada a tus padres. Las monedas se descontarán cuando la aprueben."
      );
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "No se pudo realizar el canje");
    },
  });

  const filteredRewards =
    selectedCategory === "all" ? rewards : rewards.filter((r: any) => r.category === selectedCategory);

  if (loading || rewardsLoading) {
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

  const handleRedeem = () => {
    if (selectedReward && coinBalance >= selectedReward.costCoins) {
      redeemReward({ rewardId: selectedReward.id });
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Pressable>
              <Text className="text-2xl">←</Text>
            </Pressable>
            <Text className="text-xl font-bold text-foreground">Tienda de Recompensas</Text>
            <Pressable>
              <Text className="text-2xl">⚙️</Text>
            </Pressable>
          </View>

          {/* Balance Card */}
          <View className="bg-primary rounded-2xl p-6 items-center">
            <Text className="text-white text-sm mb-2">Tu Saldo Actual</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-4xl font-bold text-black">{coinBalance}</Text>
              <Text className="text-3xl">💰</Text>
            </View>
          </View>

          {/* Category Filters */}
          <View className="gap-3">
            <Text className="text-sm text-muted">RECOMPENSAS ACTIVAS</Text>
            <View className="flex-row gap-2 flex-wrap">
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                  className={`px-4 py-2 rounded-full ${
                    selectedCategory === cat.id ? "bg-black" : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selectedCategory === cat.id ? "text-white" : "text-foreground"
                    }`}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Rewards Grid */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Disponibles</Text>
              <Pressable>
                <Text className="text-primary font-bold">Ordenar</Text>
              </Pressable>
            </View>

            <FlatList
              data={filteredRewards}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={{ gap: 12 }}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                  <Pressable
                  onPress={() => {
                    setSelectedReward(item as any);
                    setShowConfirm(true);
                  }}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                  className="flex-1 bg-surface rounded-2xl overflow-hidden"
                >
                  <View className="h-32 bg-border items-center justify-center">
                    <Text className="text-4xl">{item.icon || "🎁"}</Text>
                  </View>
                  <View className="p-3">
                    <Text className="font-bold text-foreground text-sm">{item.title}</Text>
                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-xs text-muted">{item.description}</Text>
                      <View className="bg-primary rounded-full px-2 py-1 flex-row items-center gap-1">
                        <Text className="text-black font-bold text-xs">{item.costCoins}</Text>
                        <Text className="text-xs">💰</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          </View>

          {/* Info Section */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-foreground font-bold mb-2">¿Cómo funciona?</Text>
            <Text className="text-sm text-muted">
              Completa las misiones que te asignan tus padres para ganar monedas. 
              Cuando tengas suficientes, ¡podrás canjearlas aquí por premios increíbles!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-end">
          <View className="bg-white w-full rounded-t-3xl p-6 gap-4">
            <Text className="text-xl font-bold text-foreground text-center">Confirmar Canje</Text>
            <Text className="text-center text-muted">
              Vas a gastar {selectedReward?.costCoins} monedas en '{selectedReward?.title}'.
            </Text>
            <Text className="text-center text-muted">¿Estás seguro?</Text>

            <View className="flex-row gap-3 mt-4">
              <Pressable
                onPress={() => setShowConfirm(false)}
                className="flex-1 bg-surface rounded-full py-3 border border-border"
              >
                <Text className="text-center font-bold text-foreground">Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleRedeem}
                disabled={coinBalance < (selectedReward?.costCoins || 0) || isRedeeming}
                className={`flex-1 rounded-full py-3 ${
                  coinBalance < (selectedReward?.costCoins || 0) ? "bg-border" : "bg-primary"
                }`}
              >
                {isRedeeming ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text className="text-center font-bold text-black">
                    {coinBalance < (selectedReward?.costCoins || 0) ? "Monedas insuficientes" : "¡Sí, lo quiero! ✓"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
