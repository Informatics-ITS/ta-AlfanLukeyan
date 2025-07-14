import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import {
    TextInput as RNTextInput,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

interface CustomTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ComponentProps<typeof IconSymbol>["name"];
    rightIcon?: React.ComponentProps<typeof IconSymbol>["name"];
    onRightIconPress?: () => void;
    isPassword?: boolean;
}

export function TextInput({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    isPassword = false,
    style,
    ...props
}: CustomTextInputProps) {
    const theme = useColorScheme() || "light";
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleRightIconPress = () => {
        if (isPassword) {
            togglePasswordVisibility();
        } else if (onRightIconPress) {
            onRightIconPress();
        }
    };

    const getRightIcon = (): React.ComponentProps<typeof IconSymbol>["name"] => {
        if (isPassword) {
            return isPasswordVisible ? "eye.slash.circle.fill" : "eye.circle.fill";
        }
        return rightIcon || "eye.circle.fill";
    };

    return (
        <View style={styles.container}>
            {label && (
                <ThemedText type="defaultSemiBold" style={styles.label}>
                    {label}
                </ThemedText>
            )}

            <View
                style={[
                    styles.inputContainer,
                    {
                        borderColor: error
                            ? Colors[theme].error
                            : isFocused
                                ? Colors[theme].tint
                                : Colors[theme].border,
                        backgroundColor: Colors[theme].background,
                    },
                ]}
            >
                {leftIcon && (
                    <IconSymbol
                        name={leftIcon}
                        size={20}
                        color={Colors[theme].icon}
                        style={styles.leftIcon}
                    />
                )}

                <RNTextInput
                    style={[
                        styles.input,
                        {
                            color: Colors[theme].text,
                            paddingLeft: leftIcon ? 0 : 16,
                            paddingRight: (rightIcon || isPassword) ? 0 : 16,
                        },
                        style,
                    ]}
                    placeholderTextColor={Colors[theme].placeholder}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                    accessible
                    testID={label?.replace(/\s+/g, "_").toLowerCase()}
                    accessibilityLabel={label}
                />

                {(rightIcon || isPassword) && (
                    <TouchableOpacity
                        onPress={handleRightIconPress}
                        style={styles.rightIcon}
                        accessible
                        accessibilityLabel={isPassword ? "Toggle password visibility" : "Right icon"}
                        testID={`right-icon-${label?.replace(/\s+/g, "_").toLowerCase()}`}
                    >
                        <IconSymbol
                            name={getRightIcon()}
                            size={20}
                            color={Colors[theme].icon}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <ThemedText style={[styles.errorText, { color: Colors[theme].error }]}
                    accessible
                    accessibilityLabel={`Error in ${label}`}
                    testID={`error-${label?.replace(/\s+/g, "_").toLowerCase()}`}
                >
                    {error}
                </ThemedText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        height: 52,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 16,
    },
    leftIcon: {
        marginLeft: 16,
        marginRight: 12,
    },
    rightIcon: {
        padding: 16,
    },
    errorText: {
        fontSize: 14,
        marginTop: 4,
    },
});