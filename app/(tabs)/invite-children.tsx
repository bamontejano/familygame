import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert, Share } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function InviteChildrenScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [invitationCode, setInvitationCode] = useState<string | null>(null);

  const { data: existingCode } = trpc.auth.getInvitationCode.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { mutate: generateCode, isPending: isGenerating } = trpc.family.generateInvitationCode.useMutation({
    onSuccess: (code: string) => {
      setInvitationCode(code);
      Alert.alert("Código Generado", `Tu código de invitación: ${code}`);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "No se pudo generar el código");
    },
  });

  useEffect(() => {
    if (existingCode) {
      setInvitationCode(existingCode.code);
    }
  }, [existingCode]);

  const handleGenerateCode = () => {
    generateCode();
  };

  const handleShareCode = async () => {
    if (!invitationCode) return;

    try {
      await Share.share({
        message: `Únete a mi familia en FamilyCoin con este código: ${invitationCode}`,
        title: "Código de Invitación FamilyCoin",
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo compartir el código");
    }
  };

  const handleCopyCode = () => {
    if (invitationCode) {
      Alert.alert("Copiado", `Código copiado: ${invitationCode}`);
    }
  };

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
        <Text className="text-2xl font-bold text-foreground mb-4">Inicia Sesión</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => router.back()}>
              <Text className="text-2xl">←</Text>
            </Pressable>
            <Text className="text-xl font-bold text-foreground">Invitar Hijos</Text>
            <View className="w-6" />
          </View>

          {/* Illustration */}
          <View className="bg-surface rounded-3xl p-8 items-center gap-4">
            <Text className="text-6xl">👨‍👩‍👧</Text>
            <Text className="text-center text-sm text-muted">
              Comparte este código con tus hijos para que se unan a la familia
            </Text>
          </View>

          {/* Code Display */}
          {invitationCode ? (
            <View className="gap-4">
              <View className="bg-primary rounded-2xl p-6 items-center gap-3">
                <Text className="text-sm text-black font-semibold">Tu Código de Invitación</Text>
                <Text className="text-5xl font-bold text-black tracking-widest">
                  {invitationCode}
                </Text>
                <Text className="text-xs text-black/70">Válido por 30 días</Text>
              </View>

              {/* Action Buttons */}
              <View className="gap-3">
                <Pressable
                  onPress={handleShareCode}
                  style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                  className="bg-primary rounded-xl py-3 items-center flex-row justify-center gap-2"
                >
                  <Text className="text-2xl">📤</Text>
                  <Text className="text-black font-bold">Compartir Código</Text>
                </Pressable>

                <Pressable
                  onPress={handleCopyCode}
                  style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                  className="bg-surface border border-border rounded-xl py-3 items-center flex-row justify-center gap-2"
                >
                  <Text className="text-2xl">📋</Text>
                  <Text className="text-foreground font-bold">Copiar Código</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="gap-4">
              <Text className="text-center text-muted">
                No tienes un código de invitación aún. Genera uno para invitar a tus hijos.
              </Text>

              <Pressable
                onPress={handleGenerateCode}
                disabled={isGenerating}
                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                className={`${
                  isGenerating ? "bg-border" : "bg-primary"
                } rounded-xl py-4 items-center`}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-bold text-lg">🔑 Generar Código</Text>
                )}
              </Pressable>
            </View>
          )}

          {/* Info Section */}
          <View className="bg-surface rounded-2xl p-4 gap-3">
            <Text className="font-bold text-foreground">¿Cómo funciona?</Text>
            <View className="gap-2">
              <View className="flex-row gap-3">
                <Text className="text-lg">1️⃣</Text>
                <Text className="flex-1 text-sm text-muted">Genera un código de invitación</Text>
              </View>
              <View className="flex-row gap-3">
                <Text className="text-lg">2️⃣</Text>
                <Text className="flex-1 text-sm text-muted">Comparte el código con tus hijos</Text>
              </View>
              <View className="flex-row gap-3">
                <Text className="text-lg">3️⃣</Text>
                <Text className="flex-1 text-sm text-muted">Ellos ingresan el código al registrarse</Text>
              </View>
              <View className="flex-row gap-3">
                <Text className="text-lg">4️⃣</Text>
                <Text className="flex-1 text-sm text-muted">¡Se vinculan automáticamente!</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
