import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, ButtonProps } from "./Button";

type ButtonWithDescriptionProps = Omit<ButtonProps, 'type'> & {
    description: string;
};

export function ButtonWithDescription({
    description,
    style,
    children,
    ...rest
}: ButtonWithDescriptionProps) {
    return (
        <ThemedView isCard={true} style={[styles.descriptionCard, style]}>
            <View style={styles.container}>
                <ThemedText style={styles.description}>{description}</ThemedText>
                <View>
                    <Button
                        type="default"
                        {...rest}
                        style={{ 
                            paddingHorizontal: 16,
                            flex: 1,
                        }}
                    >
                        {children}
                    </Button>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    descriptionCard: {
        borderRadius: 15,
        padding: 16,
    },
    container: {
        flexDirection: 'row',
    },
    description: {
        flex: 1,
        paddingRight: 8,
    },
});