import { Colors } from "@/constants/Colors";
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export const BouncingDotsSpinner: React.FC<{color?: string}> = ({ color }) => {
    const theme = useColorScheme() || 'light';
    const spinnerColor = color || Colors[theme].tint;
    
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createWaveAnimation = (animValue: Animated.Value, delay: number) => {
            const bounceAnimation = Animated.sequence([
                Animated.timing(animValue, {
                    toValue: -12,
                    duration: 400,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(animValue, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
            ]);

            const delayedAnimation = Animated.sequence([
                Animated.delay(delay),
                bounceAnimation,
            ]);

            return delayedAnimation;
        };

        const startWaveAnimation = () => {
            Animated.loop(
                Animated.stagger(200, [
                    createWaveAnimation(dot1, 0),
                    createWaveAnimation(dot2, 0),
                    createWaveAnimation(dot3, 0),
                ]),
                { iterations: -1 }
            ).start();
        };

        startWaveAnimation();

        return () => {
            dot1.stopAnimation();
            dot2.stopAnimation();
            dot3.stopAnimation();
        };
    }, [dot1, dot2, dot3]);

    return (
        <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { backgroundColor: spinnerColor, transform: [{ translateY: dot1 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: spinnerColor, transform: [{ translateY: dot2 }] }]} />
            <Animated.View style={[styles.dot, { backgroundColor: spinnerColor, transform: [{ translateY: dot3 }] }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    spinner: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});