import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator, Alert, FlatList } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export default function RewardsEditorScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [costCoins, setCostCoins] = useState("");
  const [icon, setIcon] = useState("🎁");
  const [editingId, setEditingId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: rewards = [], isLoading: rewardsLoading } = trpc.rewards.listByParent.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createMutation = trpc.rewards.create.useMutation({
    onSuccess: () => {
      utils.rewards.listByParent.invalidate();
      resetForm();
      Alert.alert("Éxito", "Recompensa creada correctamente");
    },
  });

  const updateMutation = trpc.rewards.update.useMutation({
    onSuccess: () => {
      utils.rewards.listByParent.invalidate();
      resetForm();
      Alert.alert("Éxito", "Recompensa actualizada correctamente");
    },
  });

  const deleteMutation = trpc.rewards.delete.useMutation({
    onSuccess: () => {
      utils.rewards.listByParent.invalidate();
      Alert.alert("Éxito", "Recompensa eliminada");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCostCoins("");
    setIcon("🎁");
    setEditingId(null);
  };

  const handleSave = () => {
    if (!title.trim() || !costCoins.trim()) {
      Alert.alert("Error", "Por favor completa el título y el coste");
      return;
    }

    const cost = parseInt(costCoins);
    if (isNaN(cost) || cost <= 0) {
      Alert.alert("Error", "El coste debe ser un número positivo");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        title: title.trim(),
        description: description.trim(),
        costCoins: cost,
        icon,
      });
    } else {
      createMutation.mutate({
        title: title.trim(),
        description: description.trim(),
        costCoins: cost,
        icon,
      });
    }
  };

  const handleEdit = (reward: any) => {
    setEditingId(reward.id);
    setTitle(reward.title);
    setDescription(reward.description || "");
    setCostCoins(reward.costCoins.toString());
    setIcon(reward.icon || "🎁");
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar Recompensa",
      "¿Estás seguro de que quieres eliminar esta recompensa?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate({ id }) },
      ]
    );
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
            <Pressable
              onPress={() => router.back()}
              className="bg-surface w-12 h-12 rounded-2xl items-center justify-center border border-border"
            >
              <Text className="text-xl font-bold">←</Text>
            </Pressable>
            <View>
              <Text className="text-xs font-bold text-primary tracking-widest uppercase">Tienda</Text>
              <Text className="text-2xl font-bold text-foreground">Editor de Premios</Text>
            </View>
          </View>

          {/* Form Card */}
          <View className="bg-surface rounded-3xl p-6 gap-6 border border-border shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">
                {editingId ? "Editar Recompensa" : "Crear Nueva"}
              </Text>
              {editingId && (
                <Pressable onPress={resetForm} className="bg-error/10 px-3 py-1 rounded-full border border-error/20">
                  <Text className="text-error text-xs font-bold">Limpiar</Text>
                </Pressable>
              )}
            </View>

            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-xs font-bold text-muted uppercase ml-1">Título del Premio</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ej: 30 min de videojuegos"
                  placeholderTextColor="#666"
                  className="bg-background rounded-2xl px-5 py-4 text-foreground border border-border font-medium"
                />
              </View>

              <View className="gap-2">
                <Text className="text-xs font-bold text-muted uppercase ml-1">Descripción (Opcional)</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  placeholder="Explica qué incluye este premio..."
                  placeholderTextColor="#666"
                  className="bg-background rounded-2xl px-5 py-4 text-foreground border border-border font-medium min-h-[80px]"
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                  <Text className="text-xs font-bold text-muted uppercase ml-1">Coste 💰</Text>
                  <TextInput
                    value={costCoins}
                    onChangeText={setCostCoins}
                    placeholder="50"
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                    className="bg-background rounded-2xl px-5 py-4 text-foreground border border-border font-black text-center"
                  />
                </View>
                <View className="flex-1 gap-2">
                  <Text className="text-xs font-bold text-muted uppercase ml-1">Icono ✨</Text>
                  <TextInput
                    value={icon}
                    onChangeText={setIcon}
                    placeholder="🎁"
                    className="bg-background rounded-2xl px-5 py-4 text-foreground border border-border text-center text-2xl"
                  />
                </View>
              </View>
            </View>

            <Pressable
              onPress={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.98 : 1 }],
                backgroundColor: '#00FF00'
              })}
              className="rounded-2xl py-5 items-center justify-center shadow-lg"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="text-black font-black uppercase tracking-tight">
                  {editingId ? "Actualizar Inventario" : "Publicar en Tienda"}
                </Text>
              )}
            </Pressable>
          </View>

          {/* List Section */}
          <View className="gap-4">
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-lg font-bold text-foreground">Inventario Actual</Text>
              <View className="bg-primary/20 px-2 py-0.5 rounded-full">
                <Text className="text-primary text-[10px] font-black">{rewards.length}</Text>
              </View>
            </View>

            {rewardsLoading ? (
              <ActivityIndicator color="#00FF00" size="large" className="mt-8" />
            ) : rewards.length === 0 ? (
              <View className="bg-surface/50 rounded-3xl p-12 items-center border border-dashed border-border/50">
                <Text className="text-4xl mb-4">📭</Text>
                <Text className="text-muted font-bold text-center">Aún no has creado premios.{"\n"}¡Empieza motivando a tus hijos!</Text>
              </View>
            ) : (
              <View className="gap-4">
                {rewards.map((item) => (
                  <View key={item.id} className="bg-surface rounded-3xl p-5 flex-row items-center gap-4 border border-border shadow-sm">
                    <View className="w-16 h-16 bg-background rounded-2xl items-center justify-center border border-border">
                      <Text className="text-3xl">{item.icon || "🎁"}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-foreground text-lg">{item.title}</Text>
                      <View className="flex-row items-center gap-1">
                        <Text className="text-primary font-black">{item.costCoins}</Text>
                        <Text className="text-[10px] text-muted font-bold uppercase">Coins</Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleEdit(item)}
                        className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center border border-primary/20"
                      >
                        <Text>✏️</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(item.id)}
                        className="bg-error/10 w-10 h-10 rounded-full items-center justify-center border border-error/20"
                      >
                        <Text>🗑️</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
