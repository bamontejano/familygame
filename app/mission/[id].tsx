
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { View, Text, ScrollView, Alert, ActivityIndicator, Pressable } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { CoinCelebration } from "@/components/animations/CoinCelebration";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  pending: "text-muted",
  completed: "text-primary",
  approved: "text-primary",
  rejected: "text-error",
};

const categoryIcons: Record<string, string> = {
  cleaning: "🧹",
  study: "📚",
  sports: "🏃‍♂️",
  homework: "🏠",
  reading: "📖",
  other: "✨",
};

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const utils = trpc.useUtils();

  const missionId = parseInt(id, 10);

  const { data: mission, isLoading } = trpc.missions.getById.useQuery(
    { id: missionId },
    { enabled: !!missionId }
  );

  const { data: user } = trpc.auth.me.useQuery();

  const [showCelebration, setShowCelebration] = useState(false);

  const markCompletedMutation = trpc.missions.markCompleted.useMutation({
    onSuccess: () => {
      utils.missions.invalidate();
      Alert.alert("¡Genial!", "Misión marcada como completada. Espera a que tus padres la aprueben.");
    },
  });

  const approveMutation = trpc.missions.approve.useMutation({
    onSuccess: () => {
      utils.missions.invalidate();
      utils.coins.invalidate();
      setShowCelebration(true);
      // Removed Alert to let animation play
    },
  });

  const rejectMutation = trpc.missions.reject.useMutation({
    onSuccess: () => {
      utils.missions.invalidate();
      Alert.alert("Rechazado", "La misión ha sido rechazada.");
    },
  });

  if (isLoading || !mission) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ title: "Detalles", headerBackTitle: "Atrás" }} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </ScreenContainer>
    );
  }

  const isChild = user?.role === "child";
  const isParent = user?.role === "parent";
  const icon = categoryIcons[mission.category] || "📋";

  return (
    <ScreenContainer>
      <Stack.Screen
        options={{
          title: "Detalles de Misión",
          headerShown: true,
          headerBackTitle: "Volver"
        }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-8">
          {/* Header Card */}
          <View className="bg-surface rounded-3xl p-8 border border-border shadow-sm items-center">
            <View className="w-24 h-24 bg-background rounded-3xl items-center justify-center border border-border mb-6">
              <Text className="text-6xl">{icon}</Text>
            </View>

            <Text className="text-3xl font-black text-center text-foreground mb-2">
              {mission.title}
            </Text>

            <View className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              <Text className={`text-sm font-black uppercase tracking-widest ${statusColors[mission.status]}`}>
                {mission.status === 'pending' ? 'Pendiente' :
                  mission.status === 'completed' ? 'Revisión' :
                    mission.status === 'approved' ? '¡Éxito!' : 'Rechazada'}
              </Text>
            </View>
          </View>

          {/* Details Card */}
          <View className="bg-surface rounded-3xl p-8 border border-border shadow-sm gap-8">
            <View>
              <Text className="text-xs font-black text-muted uppercase tracking-widest mb-3">
                Descripción
              </Text>
              <Text className="text-lg text-foreground/80 leading-relaxed font-medium">
                {mission.description || "Sin descripción adicional."}
              </Text>
            </View>

            <View className="h-[1px] bg-border" />

            <View className="flex-row justify-between items-center">
              <View className="gap-1">
                <Text className="text-xs font-black text-muted uppercase tracking-widest">
                  Recompensa
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-3xl font-black text-primary">
                    {mission.rewardCoins}
                  </Text>
                  <Text className="text-xs font-bold text-muted uppercase">Coins</Text>
                </View>
              </View>

              {mission.dueDate && (
                <View className="gap-1 items-end">
                  <Text className="text-xs font-black text-muted uppercase tracking-widest">
                    Fecha Límite
                  </Text>
                  <View className="bg-background px-3 py-1 rounded-xl border border-border">
                    <Text className="text-foreground font-bold">
                      {format(new Date(mission.dueDate), "d MMM", { locale: es })}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Action Area */}
          <View className="mt-2">
            {/* Child Actions */}
            {isChild && mission.status === "pending" && (
              <Pressable
                onPress={() => markCompletedMutation.mutate({ id: missionId })}
                disabled={markCompletedMutation.isPending}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  backgroundColor: '#00FF00'
                })}
                className="w-full rounded-2xl py-5 items-center justify-center shadow-lg"
              >
                {markCompletedMutation.isPending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-black text-lg uppercase tracking-tight">
                    ¡Misión Terminada!
                  </Text>
                )}
              </Pressable>
            )}

            {/* Parent Actions */}
            {isParent && mission.status === "completed" && (
              <View className="gap-4">
                <View className="bg-primary/5 p-4 rounded-2xl border border-dashed border-primary/20 items-center">
                  <Text className="text-primary font-bold text-center">
                    Tu hijo ha completado esta misión.{"\n"}¿Deseas recompensarle?
                  </Text>
                </View>

                <Pressable
                  onPress={() => approveMutation.mutate({ id: missionId })}
                  disabled={approveMutation.isPending}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    backgroundColor: '#00FF00'
                  })}
                  className="w-full rounded-2xl py-5 items-center justify-center shadow-lg"
                >
                  {approveMutation.isPending ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text className="text-black font-black text-lg uppercase tracking-tight">
                      Aprobar y Enviar Monedas
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => rejectMutation.mutate({ id: missionId })}
                  disabled={rejectMutation.isPending}
                  style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
                  className="w-full rounded-2xl py-5 items-center justify-center border border-error/50"
                >
                  <Text className="text-error font-black text-lg uppercase tracking-tight">
                    Rechazar
                  </Text>
                </Pressable>
              </View>
            )}

            {mission.status === "approved" && (
              <View className="bg-primary/10 p-6 rounded-3xl items-center border border-primary/20">
                <Text className="text-4xl mb-2">🎉</Text>
                <Text className="text-primary font-black text-xl mb-1">¡Misión Aprobada!</Text>
                <Text className="text-primary/60 text-center font-medium">
                  Las monedas han sido entregadas con éxito.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {
        showCelebration && (
          <CoinCelebration
            amount={mission.rewardCoins}
            onComplete={() => {
              setShowCelebration(false);
              Alert.alert("¡Aprobado!", "Las monedas se han enviado a tu hijo.");
            }}
          />
        )
      }
    </ScreenContainer >
  );
}
