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
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row items-center gap-4">
            <Pressable onPress={() => router.back()}>
              <Text className="text-2xl">←</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">Editor de Recompensas</Text>
          </View>

          {/* Form */}
          <View className="bg-surface rounded-2xl p-6 gap-4 border border-border">
            <Text className="text-lg font-bold text-foreground">
              {editingId ? "Editar Recompensa" : "Nueva Recompensa"}
            </Text>
            
            <View className="gap-2">
              <Text className="text-sm font-bold text-muted">Título</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ej: 30 min de videojuegos"
                className="bg-background rounded-xl px-4 py-3 text-foreground border border-border"
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-bold text-muted">Descripción</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Opcional"
                className="bg-background rounded-xl px-4 py-3 text-foreground border border-border"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 gap-2">
                <Text className="text-sm font-bold text-muted">Coste (Monedas)</Text>
                <TextInput
                  value={costCoins}
                  onChangeText={setCostCoins}
                  placeholder="50"
                  keyboardType="numeric"
                  className="bg-background rounded-xl px-4 py-3 text-foreground border border-border"
                />
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-sm font-bold text-muted">Icono (Emoji)</Text>
                <TextInput
                  value={icon}
                  onChangeText={setIcon}
                  placeholder="🎁"
                  className="bg-background rounded-xl px-4 py-3 text-foreground border border-border text-center"
                />
              </View>
            </View>

            <View className="flex-row gap-3 mt-2">
              {editingId && (
                <Pressable
                  onPress={resetForm}
                  className="flex-1 bg-border rounded-xl py-4 items-center"
                >
                  <Text className="text-foreground font-bold">Cancelar</Text>
                </Pressable>
              )}
              <Pressable
                onPress={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-2 bg-primary rounded-xl py-4 items-center"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-bold">
                    {editingId ? "Guardar Cambios" : "Crear Recompensa"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* List */}
          <View className="gap-4">
            <Text className="text-lg font-bold text-foreground">Recompensas Existentes</Text>
            {rewardsLoading ? (
              <ActivityIndicator size="large" color="#00FF00" />
            ) : rewards.length === 0 ? (
              <View className="bg-surface rounded-2xl p-8 items-center border border-dashed border-border">
                <Text className="text-muted">No has creado ninguna recompensa todavía</Text>
              </View>
            ) : (
              <FlatList
                data={rewards}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-2xl p-4 mb-3 flex-row items-center gap-4 border border-border">
                    <Text className="text-3xl">{item.icon || "🎁"}</Text>
                    <View className="flex-1">
                      <Text className="font-bold text-foreground">{item.title}</Text>
                      <Text className="text-xs text-muted">{item.costCoins} monedas</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleEdit(item)}
                        className="bg-border rounded-full w-10 h-10 items-center justify-center"
                      >
                        <Text>✏️</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(item.id)}
                        className="bg-error/10 rounded-full w-10 h-10 items-center justify-center"
                      >
                        <Text>🗑️</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
