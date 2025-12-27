import { ScrollView, Text, View, ActivityIndicator, FlatList, Pressable, Alert } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { RewardCard } from "@/components/reward-card";
import { CoinDisplay } from "@/components/coin-display";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function RewardsScreen() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"available" | "redeemed">("available");

  const { data: coinBalance = 0 } = trpc.coins.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: rewards = [], isLoading: rewardsLoading } =
    trpc.rewards.listByParent.useQuery(undefined, { enabled: isAuthenticated });

  const { data: redeemedRewards = [], isLoading: redeemedLoading } =
    trpc.redeemedRewards.listByChild.useQuery(undefined, { enabled: isAuthenticated });

  const redeemMutation = trpc.coins.redeem.useMutation({
    onSuccess: () => {
      Alert.alert("Success", "Reward redeemed!");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleRedeem = (rewardId: number, costCoins: number) => {
    if (coinBalance < costCoins) {
      Alert.alert("Insufficient Coins", `You need ${costCoins} coins to redeem this reward.`);
      return;
    }

    Alert.alert("Confirm Redemption", `Redeem this reward for ${costCoins} coins?`, [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Redeem",
        onPress: () => {
          redeemMutation.mutate({ rewardId });
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="mb-2">
            <Text className="text-3xl font-bold text-foreground">Rewards</Text>
          </View>

          {/* Coin Balance */}
          <View className="bg-surface rounded-xl p-4 flex-row items-center justify-between">
            <Text className="text-foreground font-semibold">Your Balance:</Text>
            <CoinDisplay amount={coinBalance} size="small" />
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() => setActiveTab("available")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className={`flex-1 py-2 px-4 rounded-lg ${
                activeTab === "available" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "available" ? "text-white" : "text-foreground"
                }`}
              >
                Available
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("redeemed")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className={`flex-1 py-2 px-4 rounded-lg ${
                activeTab === "redeemed" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "redeemed" ? "text-white" : "text-foreground"
                }`}
              >
                Redeemed
              </Text>
            </Pressable>
          </View>

          {/* Rewards List */}
          {activeTab === "available" ? (
            rewardsLoading ? (
              <ActivityIndicator size="large" color="#6366F1" />
            ) : rewards.length > 0 ? (
              <FlatList
                data={rewards}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleRedeem(item.id, item.costCoins)}
                    disabled={coinBalance < item.costCoins || redeemMutation.isPending}
                  >
                    <RewardCard
                      title={item.title}
                      description={item.description || undefined}
                      costCoins={item.costCoins}
                      icon={item.icon || "🎁"}
                      disabled={coinBalance < item.costCoins}
                    />
                  </Pressable>
                )}
                scrollEnabled={false}
              />
            ) : (
              <View className="bg-surface rounded-xl p-8 items-center mt-8">
                <Text className="text-4xl mb-3">🎁</Text>
                <Text className="text-lg font-semibold text-foreground mb-1">No Rewards Yet</Text>
                <Text className="text-sm text-muted text-center">
                  Your parents haven't created any rewards yet.
                </Text>
              </View>
            )
          ) : redeemedLoading ? (
            <ActivityIndicator size="large" color="#6366F1" />
          ) : redeemedRewards.length > 0 ? (
            <FlatList
              data={redeemedRewards}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const reward = rewards.find((r) => r.id === item.rewardId);
                return (
                  <View className="bg-success/10 rounded-xl p-4 mb-3 border border-success">
                    <View className="flex-row items-center gap-3">
                      <Text className="text-3xl">{reward?.icon || "🎁"}</Text>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {reward?.title}
                        </Text>
                        <Text className="text-sm text-muted">
                          Redeemed {new Date(item.redeemedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Text className="text-lg">💰</Text>
                        <Text className="text-lg font-bold text-foreground">{item.costCoins}</Text>
                      </View>
                    </View>
                  </View>
                );
              }}
              scrollEnabled={false}
            />
          ) : (
            <View className="bg-surface rounded-xl p-8 items-center mt-8">
              <Text className="text-4xl mb-3">📭</Text>
              <Text className="text-lg font-semibold text-foreground mb-1">
                No Redeemed Rewards
              </Text>
              <Text className="text-sm text-muted text-center">
                Start earning coins to redeem rewards!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
