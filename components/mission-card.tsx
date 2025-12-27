import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";

interface MissionCardProps {
  title: string;
  description?: string;
  category: string;
  rewardCoins: number;
  status: "pending" | "completed" | "approved" | "rejected";
  onPress?: () => void;
}

const categoryIcons: Record<string, string> = {
  cleaning: "🧹",
  study: "📚",
  sports: "⚽",
  other: "⭐",
};

const statusColors: Record<string, string> = {
  pending: "bg-warning",
  completed: "bg-blue-500",
  approved: "bg-success",
  rejected: "bg-error",
};

export function MissionCard({
  title,
  description,
  category,
  rewardCoins,
  status,
  onPress,
}: MissionCardProps) {
  const icon = categoryIcons[category] || "📋";
  const statusColor = statusColors[status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-row items-center gap-2 flex-1">
            <Text className="text-2xl">{icon}</Text>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">{title}</Text>
              <Text className="text-sm text-muted capitalize">{category}</Text>
            </View>
          </View>
          <View className={cn("px-3 py-1 rounded-full", statusColor)}>
            <Text className="text-xs font-semibold text-white capitalize">{status}</Text>
          </View>
        </View>

        {description && (
          <Text className="text-sm text-muted mb-3 leading-relaxed">{description}</Text>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Text className="text-lg">💰</Text>
            <Text className="text-lg font-bold text-foreground">{rewardCoins}</Text>
          </View>
          <Text className="text-xs text-muted">Tap for details</Text>
        </View>
      </View>
    </Pressable>
  );
}
