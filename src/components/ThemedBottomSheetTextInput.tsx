import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React from "react";
import { StyleSheet, TextInputProps, View } from "react-native";

interface ThemedBottomSheetTextInputProps extends TextInputProps {
    label?: string;
    multiline?: boolean;
}

const ThemedBottomSheetTextInput: React.FC<ThemedBottomSheetTextInputProps> = ({
    label,
    multiline = false,
    ...props
}) => {
    const theme = useColorScheme();

    const inputStyle = StyleSheet.create({
        input: {
            borderWidth: 1,
            borderColor: theme === "light" ? Colors.light.border : Colors.dark.border,
            color: theme === "light" ? Colors.light.text : Colors.dark.text,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 15,
            fontFamily: "Poppins-Regular",
            fontSize: 14,
            height: 44,
        }
    }).input;

    const multilineInputStyle = StyleSheet.create({
        input: {
            ...inputStyle,
            height: 100,
            paddingTop: 12,
            textAlignVertical: "top" as const,
        }
    }).input;

    return (
        <View style={styles.container}>
            {label && (
                <ThemedText style={styles.label}>{label}</ThemedText>
            )}
            <BottomSheetTextInput
                style={multiline ? multilineInputStyle : inputStyle}
                multiline={multiline}
                placeholderTextColor={theme === "light" ? Colors.light.border : Colors.dark.border}
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
        marginBottom: 4,
    },
});

export default ThemedBottomSheetTextInput;