import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TextInput as RNTextInput, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface TextInputProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    error?: string;
    multiline?: boolean;
    numberOfLines?: number;
    style?: ViewStyle;
}

export function TextInput({
    label,
    error,
    multiline = false,
    numberOfLines = 4,
    style,
    ...rest
}: TextInputProps) {
    const theme = useColorScheme();

    return (
        <ThemedView style={style}>
            {label && (
                <ThemedText
                    style={{
                        marginBottom: 4,
                        color: theme === "light" ? Colors.light.text : Colors.dark.text,
                    }}
                >
                    {label}
                </ThemedText>
            )}
            <RNTextInput
                style={[
                    styles.input,
                    {
                        borderColor: error ? "red" : theme === "light" ? Colors.light.border : Colors.dark.border,
                        color: theme === "light" ? Colors.light.text : Colors.dark.text,
                    },
                    multiline && styles.multiline
                ]}
                placeholderTextColor={theme === "light" ? Colors.light.border : Colors.dark.border}
                cursorColor={theme === "light" ? Colors.light.tint : Colors.dark.tint}
                multiline={multiline}
                numberOfLines={multiline ? numberOfLines : undefined}
                textAlignVertical={multiline ? "top" : "center"}
                {...rest}
            />
            {error && <ThemedText style={{ color: "red", marginTop: 4 }}>{error}</ThemedText>}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 15,
        fontFamily: "Poppins-Regular",
    },
    multiline: {
        minHeight: 100,
        paddingTop: 12,
        textAlignVertical: "top",
    }
});