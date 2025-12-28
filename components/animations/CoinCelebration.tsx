import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withSpring,
    withDelay,
    runOnJS
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface CoinCelebrationProps {
    amount: number;
    onComplete?: () => void;
}

export function CoinCelebration({ amount, onComplete }: CoinCelebrationProps) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        playSound();
        animate();
    }, []);

    const playSound = async () => {
        try {
            // Sound implementation would go here
            // const { sound } = await Audio.Sound.createAsync(
            //   require('@/assets/sounds/coin.mp3')
            // );
            // await sound.playAsync();
        } catch (e) {
            console.warn("Error playing sound", e);
        }
    };

    const animate = () => {
        opacity.value = 1;
        scale.value = withSequence(
            withSpring(1.2),
            withSpring(1)
        );

        translateY.value = withSequence(
            withSpring(-100),
            withDelay(1500, withSpring(-500, {}, (finished) => {
                if (finished && onComplete) {
                    runOnJS(onComplete)();
                }
            }))
        );

        opacity.value = withDelay(1500, withSpring(0));
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateY: translateY.value }
        ],
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            <Animated.View style={[styles.content, animatedStyle]}>
                <View style={styles.coin}>
                    <View style={styles.innerCoin}>
                        <View style={styles.symbol}>
                            {/* Simple Coin Symbol */}
                            <View style={styles.verticalBar} />
                            <View style={styles.verticalBar} />
                        </View>
                    </View>
                </View>
                <Animated.Text style={styles.text}>+{amount}</Animated.Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    content: {
        alignItems: 'center',
        gap: 10,
    },
    text: {
        color: '#FFD700',
        fontSize: 48,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    coin: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#DAA520',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    innerCoin: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F0E68C',
    },
    symbol: {
        width: 30,
        height: 50,
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 5,
    },
    verticalBar: {
        width: 6,
        height: 40,
        backgroundColor: '#DAA520',
        borderRadius: 3,
    },
});
