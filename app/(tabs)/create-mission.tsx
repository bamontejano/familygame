import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

const frequencies = ["Diaria", "Semanal", "Única"];
const children = [
  { id: 1, name: "Mateo", avatar: "👦" },
  { id: 2, name: "Sofía", avatar: "👧" },
];

export default function CreateMissionScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("Diaria");
  const [selectedChild, setSelectedChild] = useState(children[0].id);
  const [rewardCoins, setRewardCoins] = useState(50);

  const { mutate: createMission, isPending } = trpc.missions.create.useMutation({
    onSuccess: () => {
      router.back();
    },
  });

  const handleCreate = () => {
    if (title.trim()) {
      createMission({
        title,
        description: description || undefined,
        category: "general",
        rewardCoins,
        childId: selectedChild,
      });
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
        <Text className="text-2xl font-bold text-foreground mb-4">Sign In Required</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => router.back()}>
              <Text className="text-2xl">←</Text>
            </Pressable>
            <Text className="text-xl font-bold text-foreground">Nueva Misión</Text>
            <Pressable onPress={handleCreate} disabled={isPending}>
              <Text className={`font-bold ${isPending ? "text-muted" : "text-primary"}`}>
                Guardar
              </Text>
            </Pressable>
          </View>

          {/* Mission Title */}
          <View className="gap-2">
            <Text className="font-bold text-foreground">¿Qué hay que hacer?</Text>
            <TextInput
              placeholder="Ej. Lavar los platos"
              placeholderTextColor="#687076"
              value={title}
              onChangeText={setTitle}
              className="bg-surface rounded-2xl px-4 py-3 text-foreground border border-border"
            />
          </View>

          {/* Details */}
          <View className="gap-2">
            <Text className="font-bold text-foreground">Detalles (Opcional)</Text>
            <TextInput
              placeholder="Agrega notas como 'Usar jabón especial' o 'Secar después'..."
              placeholderTextColor="#687076"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              className="bg-surface rounded-2xl px-4 py-3 text-foreground border border-border"
            />
          </View>

          {/* Frequency */}
          <View className="gap-2">
            <Text className="font-bold text-foreground">Frecuencia</Text>
            <View className="flex-row gap-2">
              {frequencies.map((freq) => (
                <Pressable
                  key={freq}
                  onPress={() => setFrequency(freq)}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                  className={`flex-1 py-3 rounded-full items-center ${
                    frequency === freq ? "bg-primary" : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      frequency === freq ? "text-black" : "text-foreground"
                    }`}
                  >
                    {freq}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Child Selection */}
          <View className="gap-2">
            <Text className="font-bold text-foreground">¿Quién es el héroe?</Text>
            <View className="flex-row gap-3">
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  onPress={() => setSelectedChild(child.id)}
                  style={({ pressed }) => [
                    {
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                  className={`items-center gap-2 p-3 rounded-2xl ${
                    selectedChild === child.id ? "bg-primary" : "bg-surface"
                  }`}
                >
                  <View
                    className={`w-16 h-16 rounded-full items-center justify-center border-4 ${
                      selectedChild === child.id ? "border-black" : "border-transparent"
                    }`}
                  >
                    <Text className="text-3xl">{child.avatar}</Text>
                  </View>
                  <Text
                    className={`font-bold text-sm ${
                      selectedChild === child.id ? "text-black" : "text-foreground"
                    }`}
                  >
                    {child.name}
                  </Text>
                </Pressable>
              ))}
              <Pressable className="items-center gap-2 p-3 rounded-2xl bg-surface">
                <View className="w-16 h-16 rounded-full items-center justify-center bg-border">
                  <Text className="text-2xl">+</Text>
                </View>
                <Text className="font-bold text-xs text-foreground text-center">Añadir</Text>
              </Pressable>
            </View>
          </View>

          {/* Reward */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-foreground">Recompensa</Text>
              <Text className="text-sm text-primary font-bold">Valor Sugerido</Text>
            </View>

            <View className="bg-surface rounded-2xl p-6 items-center gap-4">
              <View className="flex-row items-center gap-4">
                <Pressable className="bg-border rounded-full w-12 h-12 items-center justify-center">
                  <Text className="text-2xl font-bold text-foreground">−</Text>
                </Pressable>
                <Text className="text-5xl font-bold text-foreground">{rewardCoins}</Text>
                <Pressable
                  onPress={() => setRewardCoins(rewardCoins + 10)}
                  className="bg-primary rounded-full w-12 h-12 items-center justify-center"
                >
                  <Text className="text-2xl font-bold text-black">+</Text>
                </Pressable>
              </View>
              <Text className="text-primary font-bold">💰 MONEDAS</Text>
              <View className="w-full h-1 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${Math.min((rewardCoins / 200) * 100, 100)}%` }}
                />
              </View>
            </View>
          </View>

          {/* Create Button */}
          <Pressable
            onPress={handleCreate}
            disabled={isPending || !title.trim()}
            style={({ pressed }) => [
              {
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
            className={`${
              isPending || !title.trim() ? "bg-border" : "bg-primary"
            } rounded-full py-4 items-center mt-4`}
          >
            <Text className={`font-bold text-lg ${isPending || !title.trim() ? "text-muted" : "text-black"}`}>
              {isPending ? "Creando..." : "🚀 Lanzar Misión"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
