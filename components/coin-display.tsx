import { Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface CoinDisplayProps {
  amount: number;
  size?: "small" | "medium" | "large";
}

export function CoinDisplay({ amount, size = "medium" }: CoinDisplayProps) {
  const colors = useColors();

  const sizeStyles = {
    small: "text-lg font-semibold",
    medium: "text-3xl font-bold",
    large: "text-5xl font-bold",
  };

  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-2xl">💰</Text>
      <Text className={`${sizeStyles[size]} text-foreground`}>{amount}</Text>
    </View>
  );
}
