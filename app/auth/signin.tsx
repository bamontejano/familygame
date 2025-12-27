import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import * as Auth from "@/lib/_core/auth";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: signIn, isPending } = trpc.auth.signIn.useMutation({
    onSuccess: async (data) => {
      if (data.sessionToken) {
        await Auth.setSessionToken(data.sessionToken);
      }
      if (data.user) {
        await Auth.setUserInfo({
          ...data.user,
          lastSignedIn: new Date(data.user.lastSignedIn),
        });
      }
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "No se pudo iniciar sesión");
    },
  });

  const handleSignIn = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    signIn({ email: email.trim(), password });
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-between">
          {/* Header */}
          <View className="gap-6 mt-8">
            <View className="items-center gap-2">
              <Text className="text-5xl">🟢</Text>
              <Text className="text-3xl font-bold text-foreground">FamilyCoin</Text>
            </View>

            <View className="gap-2">
              <Text className="text-2xl font-bold text-foreground">Bienvenido</Text>
              <Text className="text-muted">Inicia sesión para comenzar</Text>
            </View>
          </View>

          {/* Form */}
          <View className="gap-4">
            {/* Email Input */}
            <View className="gap-2">
              <Text className="font-bold text-foreground text-sm">Email</Text>
              <TextInput
                placeholder="tu@email.com"
                placeholderTextColor="#687076"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isPending}
                className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
              />
            </View>

            {/* Password Input */}
            <View className="gap-2">
              <Text className="font-bold text-foreground text-sm">Contraseña</Text>
              <View className="flex-row items-center bg-surface rounded-xl border border-border px-4">
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#687076"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isPending}
                  className="flex-1 py-3 text-foreground"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} disabled={isPending}>
                  <Text className="text-xl">{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </Pressable>
              </View>
            </View>

            {/* Forgot Password Link */}
            <Pressable>
              <Text className="text-primary font-semibold text-sm">¿Olvidaste tu contraseña?</Text>
            </Pressable>

            {/* Sign In Button */}
            <Pressable
              onPress={handleSignIn}
              disabled={isPending}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              className={`${
                isPending ? "bg-border" : "bg-primary"
              } rounded-xl py-4 items-center mt-4`}
            >
              {isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-black font-bold text-lg">Iniciar Sesión</Text>
              )}
            </Pressable>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center gap-2 mb-8">
            <Text className="text-muted">¿No tienes cuenta?</Text>
            <Pressable onPress={() => router.push("/auth/signup")} disabled={isPending}>
              <Text className="text-primary font-bold">Regístrate aquí</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
