import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isParent = user?.role === "parent";
  const isChild = user?.role === "child";

  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      {/* Pantalla principal según rol */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* PESTAÑAS EXCLUSIVAS PARA PADRES */}
      {isParent && (
        <>
          <Tabs.Screen
            name="create-mission"
            options={{
              title: "Crear Misión",
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="rewards"
            options={{
              title: "Recompensas",
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="gift.fill" color={color} />,
            }}
          />
        </>
      )}

      {/* PESTAÑAS EXCLUSIVAS PARA HIJOS */}
      {isChild && (
        <>
          <Tabs.Screen
            name="missions"
            options={{
              title: "Mis Misiones",
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="checklist" color={color} />,
            }}
          />
          <Tabs.Screen
            name="shop"
            options={{
              title: "Tienda",
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
            }}
          />
        </>
      )}

      {/* Perfil para ambos roles */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />

      {/* OCULTAR PANTALLAS DEL PADRE cuando es HIJO */}
      <Tabs.Screen name="parent-dashboard" options={{ href: null }} />
      <Tabs.Screen name="invite-children" options={{ href: null }} />
      {isChild && (
        <>
          <Tabs.Screen name="create-mission" options={{ href: null }} />
          <Tabs.Screen name="rewards" options={{ href: null }} />
        </>
      )}

      {/* OCULTAR PANTALLAS DEL HIJO cuando es PADRE */}
      <Tabs.Screen name="child-dashboard" options={{ href: null }} />
      {isParent && (
        <>
          <Tabs.Screen name="missions" options={{ href: null }} />
          <Tabs.Screen name="shop" options={{ href: null }} />
        </>
      )}
    </Tabs>
  );
}