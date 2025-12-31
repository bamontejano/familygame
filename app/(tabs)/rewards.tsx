import { ScrollView, Text, View, ActivityIndicator, FlatList, Pressable, TextInput, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function RewardsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [costCoins, setCostCoins] = useState(100);
  const [icon, setIcon] = useState("🎁");

  const utils = trpc.useUtils();

  const { data: rewards = [], isLoading: rewardsLoading } =
    trpc.rewards.listByParent.useQuery(undefined, { enabled: isAuthenticated });

  const { data: pendingRedemptions = [], isLoading: redemptionsLoading } =
    trpc.redeemedRewards.listPendingByParent.useQuery(undefined, { enabled: isAuthenticated });

  const createMutation = trpc.rewards.create.useMutation({
    onSuccess: () => {
      Alert.alert("¡Éxito!", "Recompensa creada correctamente");
      setShowCreateForm(false);
      setTitle("");
      setDescription("");
      setCostCoins(100);
      setIcon("🎁");
      utils.rewards.listByParent.invalidate();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const approveMutation = trpc.coins.approveRedemption.useMutation({
    onSuccess: () => {
      Alert.alert("¡Aprobado!", "Canje aprobado correctamente");
      utils.redeemedRewards.listPendingByParent.invalidate();
      utils.coins.getBalance.invalidate();
    },
  });

  const rejectMutation = trpc.coins.rejectRedemption.useMutation({
    onSuccess: () => {
      Alert.alert("Rechazado", "Canje rechazado");
      utils.redeemedRewards.listPendingByParent.invalidate();
    },
  });

  const deleteMutation = trpc.rewards.delete.useMutation({
    onSuccess: () => {
      Alert.alert("Eliminada", "Recompensa eliminada");
      utils.rewards.listByParent.invalidate();
    },
  });

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert("Error", "El título es requerido");
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      costCoins,
      icon,
    });
  };

  const handleApprove = (redemptionId: number) => {
    Alert.alert(
      "Aprobar Canje",
      "¿Confirmar que el niño recibió su recompensa?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Aprobar", onPress: () => approveMutation.mutate({ redemptionId }) },
      ]
    );
  };

  const handleReject = (redemptionId: number) => {
    Alert.alert(
      "Rechazar Canje",
      "Las monedas NO serán descontadas",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Rechazar", style: "destructive", onPress: () => rejectMutation.mutate({ redemptionId }) },
      ]
    );
  };

  const handleDelete = (rewardId: number) => {
    Alert.alert(
      "Eliminar Recompensa",
      "¿Estás seguro? Esta acción no se puede deshacer",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate({ id: rewardId }) },
      ]
    );
  };

  if (!isAuthenticated || user?.role !== "parent") {
    return (
      <ScreenContainer className="items-center justify-center p-6">
        <Text className="text-2xl font-bold text-foreground">Acceso denegado</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-foreground">Recompensas</Text>
            <Pressable
              onPress={() => setShowCreateForm(!showCreateForm)}
              className="bg-primary rounded-full px-6 py-2"
            >
              <Text className="text-black font-bold">{showCreateForm ? "✕" : "+ Nueva"}</Text>
            </Pressable>
          </View>

          {/* Solicitudes Pendientes */}
          {pendingRedemptions.length > 0 && (
            <View className="gap-3">
              <Text className="text-xl font-bold text-foreground">📬 Solicitudes Pendientes</Text>
              {pendingRedemptions.map((redemption) => (
                <View key={redemption.id} className="bg-amber-500/10 rounded-xl p-4 border border-amber-500">
                  <View className="flex-row items-center gap-3 mb-3">
                    <Text className="text-3xl">{redemption.rewardIcon || "🎁"}</Text>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground">{redemption.rewardTitle}</Text>
                      <Text className="text-sm text-muted">
                        {redemption.childName} • {redemption.costCoins} monedas
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => handleApprove(redemption.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 bg-green-500 rounded-lg py-2"
                    >
                      <Text className="text-white font-bold text-center">✓ Aprobar</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleReject(redemption.id)}
                      disabled={rejectMutation.isPending}
                      className="flex-1 bg-red-500 rounded-lg py-2"
                    >
                      <Text className="text-white font-bold text-center">✕ Rechazar</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Formulario de Creación */}
          {showCreateForm && (
            <View className="bg-surface rounded-xl p-4 gap-4 border border-border">
              <Text className="text-lg font-bold text-foreground">Nueva Recompensa</Text>
              
              <View className="gap-2">
                <Text className="font-semibold text-foreground">Título</Text>
                <TextInput
                  placeholder="Ej. Ir al cine"
                  placeholderTextColor="#687076"
                  value={title}
                  onChangeText={setTitle}
                  className="bg-background rounded-lg px-4 py-3 text-foreground border border-border"
                />
              </View>

              <View className="gap-2">
                <Text className="font-semibold text-foreground">Descripción (opcional)</Text>
                <TextInput
                  placeholder="Detalles..."
                  placeholderTextColor="#687076"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={2}
                  className="bg-background rounded-lg px-4 py-3 text-foreground border border-border"
                />
              </View>

              <View className="gap-2">
                <Text className="font-semibold text-foreground">Costo en monedas</Text>
                <View className="flex-row items-center gap-4 justify-center">
                  <Pressable
                    onPress={() => setCostCoins(Math.max(10, costCoins - 10))}
                    className="bg-border rounded-full w-10 h-10 items-center justify-center"
                  >
                    <Text className="text-xl font-bold text-foreground">−</Text>
                  </Pressable>
                  <Text className="text-3xl font-bold text-foreground">{costCoins}</Text>
                  <Pressable
                    onPress={() => setCostCoins(costCoins + 10)}
                    className="bg-primary rounded-full w-10 h-10 items-center justify-center"
                  >
                    <Text className="text-xl font-bold text-black">+</Text>
                  </Pressable>
                </View>
              </View>

              <View className="gap-2">
                <Text className="font-semibold text-foreground">Icono</Text>
                <View className="flex-row gap-2 flex-wrap">
                  {["🎁", "🎮", "🎬", "🍕", "🎨", "⚽", "📚", "🎵"].map((emoji) => (
                    <Pressable
                      key={emoji}
                      onPress={() => setIcon(emoji)}
                      className={`w-14 h-14 rounded-lg items-center justify-center ${
                        icon === emoji ? "bg-primary" : "bg-background border border-border"
                      }`}
                    >
                      <Text className="text-2xl">{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                onPress={handleCreate}
                disabled={createMutation.isPending || !title.trim()}
                className={`${
                  createMutation.isPending || !title.trim() ? "bg-border" : "bg-primary"
                } rounded-lg py-3`}
              >
                <Text className={`text-center font-bold ${createMutation.isPending || !title.trim() ? "text-muted" : "text-black"}`}>
                  {createMutation.isPending ? "Creando..." : "Crear Recompensa"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Lista de Recompensas */}
          <View className="gap-3">
            <Text className="text-xl font-bold text-foreground">🏆 Tienda de Recompensas</Text>
            {rewardsLoading ? (
              <ActivityIndicator size="large" color="#00FF00" />
            ) : rewards.length === 0 ? (
              <View className="bg-surface rounded-xl p-8 items-center">
                <Text className="text-4xl mb-3">🎁</Text>
                <Text className="text-lg font-semibold text-foreground mb-1">
                  No hay recompensas aún
                </Text>
                <Text className="text-sm text-muted text-center">
                  Crea recompensas para que tus hijos las canjeen
                </Text>
              </View>
            ) : (
              <FlatList
                data={rewards}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
                    <View className="flex-row items-center gap-3">
                      <Text className="text-3xl">{item.icon || "🎁"}</Text>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground">{item.title}</Text>
                        {item.description && (
                          <Text className="text-sm text-muted">{item.description}</Text>
                        )}
                      </View>
                      <View className="items-end gap-1">
                        <View className="flex-row items-center gap-1">
                          <Text className="text-lg">💰</Text>
                          <Text className="text-lg font-bold text-primary">{item.costCoins}</Text>
                        </View>
                        <Pressable
                          onPress={() => handleDelete(item.id)}
                          disabled={deleteMutation.isPending}
                          className="mt-1"
                        >
                          <Text className="text-red-500 text-xs font-semibold">Eliminar</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}