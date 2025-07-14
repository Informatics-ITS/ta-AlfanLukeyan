
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
    {
        image: require("../../../assets/images/onboarding_content_1.png"),
        title: "Tailored to Your Goals",
        description: "Get lessons matched to your level and interests—whether for exams, conversations, or business English."
    },
    {
        image: require("../../../assets/images/onboarding_content_2.png"),
        title: "Learn at Your Pace",
        description: "Study whenever you want with flexible scheduling and personalized learning paths."
    },
    {
        image: require("../../../assets/images/onboarding_content_3.png"),
        title: "Track Your Progress",
        description: "Monitor your improvement with detailed analytics and achievements to keep you motivated."
    }
];

export default function OnboardingScreen() {
    const insets = useSafeAreaInsets();
    const theme = useColorScheme() || "light";
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);

    const renderSlide = (slide: typeof ONBOARDING_SLIDES[0], index: number) => (
        <View key={index} style={[styles.slide, { width: width - 71 }]}>
            <Image source={slide.image} style={styles.image} contentFit="contain" />
            <View style={styles.textContainer}>
                <ThemedText type="title" style={styles.title}>
                    {slide.title}
                </ThemedText>
                <ThemedText type="default" style={styles.description}>
                    {slide.description}
                </ThemedText>
            </View>
        </View>
    );

    const renderDot = (index: number) => (
        <TouchableOpacity
            key={index}
            style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? Colors[theme].tint : Colors[theme].tabIconDefault }
            ]}
            onPress={() => scrollToSlide(index)}
        />
    );

    const scrollToSlide = (index: number) => {
        const slideWidth = width - 71;
        scrollViewRef.current?.scrollTo({
            x: index * slideWidth,
            animated: true,
        });
        setCurrentIndex(index);
    };

    const handleNavigateToLogin = () => {
        router.push("/(auth)/login");
    };

    const handleScroll = (event: any) => {
        const slideWidth = width - 71;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
        setCurrentIndex(index);
    };

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
            <ThemedView isCard style={styles.card}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    {ONBOARDING_SLIDES.map((slide, i) => renderSlide(slide, i))}
                </ScrollView>

                <View style={styles.pagination}>
                    {ONBOARDING_SLIDES.map((_, i) => renderDot(i))}
                </View>
            </ThemedView>

            <View style={styles.footer}>
                <ThemedText type="defaultSemiBold" style={styles.footerText}>
                    Ready to Start Learning?
                </ThemedText>
                <TouchableOpacity
                    accessible
                    accessibilityLabel="Navigate to login"
                    testID="navigate-to-login-button"
                    style={[styles.button, { backgroundColor: Colors[theme].button }]}
                    onPress={handleNavigateToLogin}
                >
                    <IconSymbol
                        name="arrow.right"
                        size={24}
                        color={theme === "dark" ? Colors.light.text : Colors.dark.text}
                    />
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
    },
    slide: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    image: {
        width: 250,
        height: 250,
        marginBottom: 24,
    },
    textContainer: {
        alignItems: "center",
        gap: 12,
        justifyContent: "center",
    },
    title: {
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    description: {
        textAlign: "center",
        paddingHorizontal: 30,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        gap: 8,
        backgroundColor: '#E5E5E5',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    footer: {
        flexDirection: "row",
        paddingTop: 20,
        alignItems: "center",
        justifyContent: "space-between",
    },
    footerText: {
        flex: 1,
        textAlign: "center",
    },
    button: {
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
});