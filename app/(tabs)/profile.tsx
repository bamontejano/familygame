import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert, Clipboard, Share } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const isParent = user?.role === "parent";
  const isChild = user?.role === "child";

  const utils = trpc.useUtils();

  // Queries for Child
  const { data: coinBalance = 0 } = trpc.coins.getBalance.useQuery(undefined, {
    enabled: isAuthenticated && isChild,
  });

  const { data: childMissions = [] } = trpc.missions.listByChild.useQuery(undefined, {
    enabled: isAuthenticated && isChild,
  });

  // Queries for Parent
  const { data: children = [], isLoading: childrenLoading } = trpc.family.getChildren.useQuery(undefined, {
    enabled: isAuthenticated && isParent,
  });

  const { data: inviteCode, isLoading: inviteLoading } = trpc.auth.getInvitationCode.useQuery(undefined, {
    enabled: isAuthenticated && isParent,
  });

  const generateInviteMutation = trpc.family.generateInvitationCode.useMutation({
    onSuccess: () => {
      utils.auth.getInvitationCode.invalidate();
      Alert.alert("Éxito", "Nuevo código generado correctamente");
    },
  });

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#00FF00" />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <View className="bg-surface rounded-3xl p-8 items-center border border-border">
          <Text className="text-4xl mb-4">🔐</Text>
          <Text className="text-2xl font-bold text-foreground mb-2">Inicia Sesión</Text>
          <Text className="text-center text-muted mb-8">Por favor, inicia sesión para ver tu perfil y estadísticas.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const handleCopyCode = () => {
    if (inviteCode?.code) {
      Clipboard.setString(inviteCode.code);
      Alert.alert("Copiado", "Código de invitación copiado al portapapeles");
    }
  };

  const handleShareCode = async () => {
    if (inviteCode?.code) {
      try {
        await Share.share({
          message: `¡Únete a nuestra familia en FamilyGame! Usa este código para conectarte: ${inviteCode.code}`,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-8">
          {/* Header */}
          <View className="flex-row items-center gap-4">
            <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center border-2 border-primary/30">
              <Text className="text-4xl">{isParent ? "👨‍👩‍👧" : "🧒"}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-primary tracking-widest uppercase">{isParent ? "Padre / Madre" : "Héroe en Entrenamiento"}</Text>
              <Text className="text-2xl font-bold text-foreground" numberOfLines={1}>{user?.name}</Text>
              <Text className="text-sm text-muted">{user?.email}</Text>
            </View>
          </View>

          {isParent && (
            <View className="gap-8">
              {/* Invitation Center */}
              <View className="bg-surface rounded-3xl p-6 gap-4 border border-border shadow-sm">
                <View>
                  <Text className="text-lg font-bold text-foreground">Centro de Invitaciones</Text>
                  <Text className="text-xs text-muted">Comparte este código para vincular a tus hijos</Text>
                </View>

                {inviteLoading ? (
                  <ActivityIndicator color="#00FF00" />
                ) : inviteCode ? (
                  <View className="gap-4">
                    <View className="bg-background rounded-2xl p-4 border border-dashed border-primary/50 items-center justify-center">
                      <Text className="text-3xl font-black tracking-[8px] text-primary">{inviteCode.code}</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={handleCopyCode}
                        className="flex-1 bg-primary/10 py-3 rounded-xl items-center border border-primary/20"
                      >
                        <Text className="text-primary font-bold">Copiar</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleShareCode}
                        className="flex-1 bg-primary py-3 rounded-xl items-center shadow-sm"
                      >
                        <Text className="text-black font-bold">Compartir</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => generateInviteMutation.mutate()}
                    className="bg-primary py-4 rounded-2xl items-center"
                  >
                    <Text className="text-black font-bold">Generar Código de Invitación</Text>
                  </Pressable>
                )}

                {inviteCode && (
                  <Pressable
                    onPress={() => {
                      Alert.alert("Regenerar Código", "¿Estás seguro? El código anterior dejará de funcionar.", [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Regenerar", onPress: () => generateInviteMutation.mutate() }
                      ]);
                    }}
                    className="items-center"
                  >
                    <Text className="text-xs text-muted underline">Regenerar código de seguridad</Text>
                  </Pressable>
                )}
              </View>

              {/* Children Overview */}
              <View className="gap-4">
                <Text className="text-lg font-bold text-foreground px-1">Tus Héroes</Text>
                {childrenLoading ? (
                  <ActivityIndicator color="#00FF00" />
                ) : children.length === 0 ? (
                  <View className="bg-surface/50 rounded-3xl p-8 items-center border border-dashed border-border">
                    <Text className="text-muted text-center font-medium">Aún no hay hijos vinculados.{"\n"}Usa el código de arriba para empezar.</Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {children.map(child => (
                      <View key={child.id} className="bg-surface rounded-2xl p-4 flex-row items-center gap-4 border border-border">
                        <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                          <Text className="text-xl">👤</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-bold text-foreground">{child.childName}</Text>
                          <Text className="text-xs text-muted">{child.childEmail}</Text>
                        </View>
                        <View className="items-end">
                          <Text className="font-black text-primary">{child.coinBalance}</Text>
                          <Text className="text-[10px] text-muted font-bold uppercase">Coins</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {isChild && (
            <View className="gap-6">
              {/* Balance Card for Child */}
              <View className="bg-primary rounded-3xl p-8 items-center shadow-lg">
                <Text className="text-black/60 font-bold uppercase tracking-tight mb-2">Saldo de Tesoro</Text>
                <View className="flex-row items-center gap-3">
                  <Text className="text-6xl font-black text-black">{coinBalance}</Text>
                  <Text className="text-4xl">💰</Text>
                </View>
              </View>

              {/* Child Stats */}
              <View className="gap-4">
                <Text className="text-lg font-bold text-foreground px-1">Tus Logros</Text>
                <View className="flex-row gap-4">
                  <View className="flex-1 bg-surface rounded-3xl p-5 items-center border border-border shadow-sm">
                    <Text className="text-3xl mb-1">✅</Text>
                    <Text className="text-2xl font-black text-foreground">{childMissions.filter(m => m.status === 'approved').length}</Text>
                    <Text className="text-[10px] text-muted font-bold uppercase text-center">Misiones Cumplidas</Text>
                  </View>
                  <View className="flex-1 bg-surface rounded-3xl p-5 items-center border border-border shadow-sm">
                    <Text className="text-3xl mb-1">🔥</Text>
                    <Text className="text-2xl font-black text-foreground">{childMissions.length}</Text>
                    <Text className="text-[10px] text-muted font-bold uppercase text-center">Total Asignadas</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Settings / Actions */}
          <View className="gap-3 mt-4 mb-8">
            <Pressable
              onPress={logout}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.98 : 1 }],
                backgroundColor: '#FF3B3015'
              })}
              className="py-4 rounded-2xl items-center border border-error/20"
            >
              <Text className="text-error font-bold">Cerrar Sesión</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

