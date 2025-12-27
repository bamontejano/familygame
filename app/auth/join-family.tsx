import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function JoinFamilyScreen() {
  const router = useRouter();
  const [invitationCode, setInvitationCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const { mutate: useCode, isPending } = trpc.auth.useInvitationCode.useMutation({
    onSuccess: () => {
      Alert.alert("Éxito", "Te has unido a la familia");
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      setCodeError(error.message || "Código inválido");
      Alert.alert("Error", error.message || "No se pudo usar el código");
    },
  });

  const handleJoinFamily = () => {
    const code = invitationCode.trim().toUpperCase();
    
    if (!code) {
      setCodeError("Por favor ingresa un código");
      return;
    }

    if (code.length !== 8) {
      setCodeError("El código debe tener 8 caracteres");
      return;
    }

    setCodeError("");
    useCode({ code });
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-between">
          {/* Header */}
          <View className="gap-6 mt-8">
            <View className="items-center gap-2">
              <Text className="text-5xl">👨‍👩‍👧‍👦</Text>
              <Text className="text-2xl font-bold text-foreground">Únete a tu Familia</Text>
            </View>

            <View className="gap-2">
              <Text className="text-base text-muted text-center">
                Pídele a tu padre o madre que te comparta el código de invitación
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="gap-6">
            {/* Illustration */}
            <View className="bg-surface rounded-3xl p-8 items-center gap-4">
              <Text className="text-6xl">🔐</Text>
              <Text className="text-center text-sm text-muted">
                Ingresa el código que tu familia te compartió
              </Text>
            </View>

            {/* Code Input */}
            <View className="gap-2">
              <Text className="font-bold text-foreground text-sm">Código de Invitación</Text>
              <TextInput
                placeholder="ABC12345"
                placeholderTextColor="#687076"
                value={invitationCode}
                onChangeText={(text) => {
                  setInvitationCode(text.toUpperCase());
                  setCodeError("");
                }}
                maxLength={8}
                autoCapitalize="characters"
                editable={!isPending}
                className={`bg-surface rounded-xl px-4 py-3 text-foreground border ${
                  codeError ? "border-error" : "border-border"
                } text-center text-lg font-bold`}
              />
              {codeError && (
                <Text className="text-error text-sm">{codeError}</Text>
              )}
            </View>

            {/* Join Button */}
            <Pressable
              onPress={handleJoinFamily}
              disabled={isPending}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              className={`${
                isPending ? "bg-border" : "bg-primary"
              } rounded-xl py-4 items-center`}
            >
              {isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-black font-bold text-lg">Unirme a la Familia</Text>
              )}
            </Pressable>

            {/* Skip Button */}
            <Pressable
              onPress={handleSkip}
              disabled={isPending}
              className="py-3 items-center"
            >
              <Text className="text-muted font-semibold">Saltar por ahora</Text>
            </Pressable>
          </View>

          {/* Footer Info */}
          <View className="gap-2 items-center">
            <Text className="text-xs text-muted text-center">
              El código expira en 30 días
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
