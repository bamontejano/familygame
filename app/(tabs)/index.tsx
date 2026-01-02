import { useRouter } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import ParentDashboardScreen from "./parent-dashboard";
import ChildDashboardScreen from "./child-dashboard";
import { ScreenContainer } from "@/components/screen-container";

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading while checking authentication
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00FF00" />
      </View>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    router.replace("/auth/signin");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render the appropriate dashboard based on role
  if (user.role === "parent") {
    return <ParentDashboardScreen />;
  } else if (user.role === "child") {
    return <ChildDashboardScreen />;
  }

  // Fallback for unknown roles
  return (
    <ScreenContainer className="items-center justify-center p-6">
      <Text className="text-2xl font-bold text-foreground mb-4">Unknown Role</Text>
      <Text className="text-muted text-center">Please contact support</Text>
    </ScreenContainer>
  );
}