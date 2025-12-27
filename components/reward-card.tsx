import { Pressable, Text, View } from "react-native";

interface RewardCardProps {
  title: string;
  description?: string;
  costCoins: number;
  icon?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function RewardCard({
  title,
  description,
  costCoins,
  icon = "🎁",
  onPress,
  disabled = false,
}: RewardCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          opacity: pressed && !disabled ? 0.7 : disabled ? 0.5 : 1,
        },
      ]}
    >
      <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
        <View className="items-center mb-3">
          <Text className="text-4xl mb-2">{icon}</Text>
          <Text className="text-lg font-semibold text-foreground text-center">{title}</Text>
        </View>

        {description && (
          <Text className="text-sm text-muted text-center mb-3 leading-relaxed">
            {description}
          </Text>
        )}

        <View className="bg-primary rounded-lg py-2 items-center">
          <View className="flex-row items-center gap-1">
            <Text className="text-lg">💰</Text>
            <Text className="text-lg font-bold text-white">{costCoins}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
