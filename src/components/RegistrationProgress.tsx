import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from "./ThemedView";

type StepState = 'completed' | 'active' | 'inactive';

interface RegistrationProgressProps {
    steps: readonly {
        readonly image: any;
        readonly desc: string;
    }[];
    currentStep: number;
    completedSteps: number;
}

export const RegistrationProgress: React.FC<RegistrationProgressProps> = ({
    steps,
    currentStep,
    completedSteps,
}) => {
    const theme = useColorScheme() || "light";

    const getStepState = (step: number): StepState => {
        if (completedSteps >= step) return 'completed';
        if (step === currentStep) return 'active';
        return 'inactive';
    };

    const currentStepData = steps[currentStep - 1] || steps[0];

    return (
        <View style={styles.container}>
            <View style={styles.progressContainer}>
                {steps.map((stepData, index) => {
                    const step = index + 1;
                    const state = getStepState(step);

                    return (
                        <View key={step} style={styles.progressStep}>
                            <ThemedView
                                isCard={true}
                                style={[
                                    styles.progressCard,
                                    {
                                        opacity: state === 'inactive' ? 0.4 : 1,
                                        borderWidth: state === 'active' ? 2 : 0,
                                        borderColor: state === 'active' ? Colors[theme].tint : 'transparent',
                                    }
                                ]}
                            >
                                <Image
                                    source={stepData.image}
                                    style={styles.progressImage}
                                    contentFit="contain"
                                />
                                {state === 'completed' && (
                                    <View style={styles.completedOverlay}>
                                        <View style={styles.checkmark}>
                                            <IconSymbol
                                                name="checkmark.circle.fill"
                                                size={24}
                                                color={Colors[theme].text}
                                            />
                                        </View>
                                    </View>
                                )}
                            </ThemedView>
                            <ThemedText
                                style={[
                                    styles.stepLabel,
                                    {
                                        opacity: state === 'inactive' ? 0.4 : 1,
                                        fontWeight: state === 'active' ? '600' : '400',
                                        color: state === 'active' ? Colors[theme].tint : Colors[theme].text
                                    }
                                ]}
                            >
                                Step {step}
                            </ThemedText>
                        </View>
                    );
                })}
            </View>

            <View style={styles.instructionContainer}>
                <ThemedText style={styles.instructionText}>
                    {currentStepData.desc}
                </ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    progressContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 8,
        gap: 16,
    },
    progressStep: {
        alignItems: 'center',
        gap: 8,
    },
    progressCard: {
        borderRadius: 15,
        paddingHorizontal: 8,
        paddingTop: 13,
        paddingBottom: 1,
        position: 'relative',
    },
    progressImage: {
        width: 50,
        height: 50,
    },
    completedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        borderRadius: 15,
    },
    checkmark: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepLabel: {
        textAlign: 'center',
    },
    instructionContainer: {
        alignItems: "center",
        paddingHorizontal: 20,
    },
    instructionText: {
        textAlign: "center",
    },
});