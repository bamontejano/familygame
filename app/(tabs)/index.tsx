import { useEffect } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/hooks/use-auth";

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Si no hay usuario, redirigir a login
      router.replace("/auth/signin");
      return;
    }

    // Redirigir según el rol
    if (user.role === "parent") {
      router.replace("/(tabs)/parent-dashboard");
    } else if (user.role === "child") {
      router.replace("/(tabs)/child-dashboard");
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se determina el rol
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}