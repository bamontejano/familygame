import { ScrollView, Text, View, ActivityIndicator, FlatList, Pressable } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { MissionCard } from "@/components/mission-card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function MissionsScreen() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const { data: missions = [], isLoading } = trpc.missions.listByChild.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const activeMissions = missions.filter((m) => m.status === "pending" || m.status === "completed");
  const completedMissions = missions.filter((m) => m.status === "approved");

  const displayMissions = activeTab === "active" ? activeMissions : completedMissions;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="mb-2">
            <Text className="text-3xl font-bold text-foreground">Missions</Text>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() => setActiveTab("active")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className={`flex-1 py-2 px-4 rounded-lg ${
                activeTab === "active" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "active" ? "text-white" : "text-foreground"
                }`}
              >
                Active
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("completed")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className={`flex-1 py-2 px-4 rounded-lg ${
                activeTab === "completed" ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "completed" ? "text-white" : "text-foreground"
                }`}
              >
                Completed
              </Text>
            </Pressable>
          </View>

          {/* Missions List */}
          {isLoading ? (
            <ActivityIndicator size="large" color="#6366F1" />
          ) : displayMissions.length > 0 ? (
            <FlatList
              data={displayMissions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <MissionCard
                  title={item.title}
                  description={item.description || undefined}
                  category={item.category}
                  rewardCoins={item.rewardCoins}
                  status={item.status as any}
                  onPress={() => {
                    // TODO: Navigate to mission detail
                  }}
                />
              )}
              scrollEnabled={false}
            />
          ) : (
            <View className="bg-surface rounded-xl p-8 items-center mt-8">
              <Text className="text-4xl mb-3">📭</Text>
              <Text className="text-lg font-semibold text-foreground mb-1">No Missions Yet</Text>
              <Text className="text-sm text-muted text-center">
                {activeTab === "active"
                  ? "No active missions. Check back soon!"
                  : "You haven't completed any missions yet."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
