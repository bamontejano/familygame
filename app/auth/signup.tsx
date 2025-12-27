import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import * as Auth from "@/lib/_core/auth";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"parent" | "child">("parent");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: signUp, isPending } = trpc.auth.signUp.useMutation({
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
      Alert.alert("Error", error.message || "No se pudo crear la cuenta");
    },
  });

  const handleSignUp = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    signUp({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    });
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
              <Text className="text-2xl font-bold text-foreground">Crear Cuenta</Text>
              <Text className="text-muted">Únete a la familia gamificada</Text>
            </View>
          </View>

          {/* Form */}
          <View className="gap-4">
            {/* Name Input */}
            <View className="gap-2">
              <Text className="font-bold text-foreground text-sm">Nombre</Text>
              <TextInput
                placeholder="Tu nombre"
                placeholderTextColor="#687076"
                value={name}
                onChangeText={setName}
                editable={!isPending}
                className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
              />
            </View>

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

            {/* Role Selection */}
            <View className="gap-2">
              <Text className="font-bold text-foreground text-sm">¿Eres padre o hijo?</Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setRole("parent")}
                  disabled={isPending}
                  style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    role === "parent" ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text className={`font-bold ${role === "parent" ? "text-black" : "text-foreground"}`}>
                    👨‍👩‍👧 Padre
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setRole("child")}
                  disabled={isPending}
                  style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    role === "child" ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text className={`font-bold ${role === "child" ? "text-black" : "text-foreground"}`}>
                    👧 Hijo
                  </Text>
                </Pressable>
              </View>
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

            {/* Confirm Password Input */}
            <View className="gap-2">
              <Text className="font-bold text-foreground text-sm">Confirmar Contraseña</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#687076"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                editable={!isPending}
                className="bg-surface rounded-xl px-4 py-3 text-foreground border border-border"
              />
            </View>

            {/* Sign Up Button */}
            <Pressable
              onPress={handleSignUp}
              disabled={isPending}
              style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
              className={`${
                isPending ? "bg-border" : "bg-primary"
              } rounded-xl py-4 items-center mt-4`}
            >
              {isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-black font-bold text-lg">Crear Cuenta</Text>
              )}
            </Pressable>

            {/* Join Family Link */}
            {role === "child" && (
              <Pressable
                onPress={() => router.push("/auth/join-family")}
                disabled={isPending}
                className="py-3 items-center"
              >
                <Text className="text-muted text-sm">¿Tienes un código de invitación?</Text>
                <Text className="text-primary font-bold">Únete a tu familia</Text>
              </Pressable>
            )}
          </View>

          {/* Sign In Link */}
          <View className="flex-row items-center justify-center gap-2 mb-8">
            <Text className="text-muted">¿Ya tienes cuenta?</Text>
            <Pressable onPress={() => router.push("/auth/signin")} disabled={isPending}>
              <Text className="text-primary font-bold">Inicia sesión</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
