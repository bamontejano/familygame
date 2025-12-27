import { ScrollView, Text, View, Pressable, Dimensions } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "Convierte los deberes en diversión",
    subtitle: "Asigna misiones, gana monedas y celebra logros en familia.",
    icon: "🎮",
    color: "#FFF3CD",
  },
  {
    title: "Completa Misiones",
    subtitle: "Realiza tus hábitos diarios y gana recompensas",
    icon: "✅",
    color: "#D4EDDA",
  },
  {
    title: "Gana Monedas",
    subtitle: "Acumula monedas y canjéalas por premios",
    icon: "💰",
    color: "#D1ECF1",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push("/auth/signup");
    }
  };

  const slide = slides[currentSlide];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-between">
          {/* Header */}
          <View className="items-center gap-2 mt-4">
            <Text className="text-4xl">🟢</Text>
            <Text className="text-2xl font-bold text-foreground">FamilyCoin</Text>
          </View>

          {/* Carousel */}
          <View className="items-center gap-6">
            <View
              className="w-full rounded-3xl items-center justify-center p-8"
              style={{ backgroundColor: slide.color, height: 300 }}
            >
              <Text className="text-6xl mb-4">{slide.icon}</Text>
              <Text className="text-center text-sm text-muted">
                Slide {currentSlide + 1} of {slides.length}
              </Text>
            </View>

            <View className="gap-3">
              <Text className="text-2xl font-bold text-foreground text-center">
                {slide.title}
              </Text>
              <Text className="text-center text-muted text-base">
                {slide.subtitle}
              </Text>
            </View>
          </View>

          {/* Indicators */}
          <View className="flex-row items-center justify-center gap-2">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === currentSlide ? "bg-primary w-6" : "bg-border w-2"
                }`}
              />
            ))}
          </View>

          {/* Buttons */}
          <View className="gap-4">
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              className="bg-primary px-8 py-4 rounded-full items-center"
            >
              <Text className="text-black font-bold text-lg">
                {currentSlide === slides.length - 1 ? "Empezar Aventura 🚀" : "Siguiente"}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push("/auth/signin")}>
              <Text className="text-center text-muted">
                ¿Ya tienes familia? Inicia sesión
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
