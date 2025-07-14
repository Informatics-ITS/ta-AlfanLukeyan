import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    TouchableOpacity,
    type TouchableOpacityProps
} from "react-native";

export type ButtonProps = TouchableOpacityProps & {
    children?: React.ReactNode;
    type?: "default" | "secondary" | "delete" | "filter";
    disabled?: boolean;
    active?: boolean;
    icon?: {
        name: React.ComponentProps<typeof MaterialIcons>["name"];
        size?: number;
    };
};

export function Button({
    style,
    type = "default",
    children,
    disabled = false,
    active = false,
    icon,
    ...rest
}: ButtonProps) {
    const theme = useColorScheme() ?? "light";

    const getTextColor = () => {
        if (type === "filter") {
            return active ? Colors[theme].tint : Colors[theme].text;
        }

        switch (type) {
            case "default":
                return theme === "light" ? Colors.dark.text : Colors.light.text;
            case "delete":
                return Colors[theme].error;
            default:
                return Colors[theme].button;
        }
    };

    const getButtonStyle = () => {
        switch (type) {
            case "default":
                return { backgroundColor: Colors[theme].button };
            case "secondary":
                return {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: Colors[theme].button,
                };
            case "delete":
                return {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: Colors[theme].error,
                };
            case "filter":
                return {
                    backgroundColor: active ? Colors[theme].tint + '20' : "transparent",
                    borderWidth: 1,
                    borderColor: active ? Colors[theme].tint : Colors[theme].border,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                };
            default:
                return {};
        }
    };

    return (
        <TouchableOpacity
            accessible
            accessibilityLabel={`${children} Button`}
            testID={`${String(children).replace(/\s+/g, '-').toLowerCase()}-button`}
            style={[
                styles.base,
                styles.content,
                {
                    justifyContent: icon ? "space-between" : "center",
                    paddingHorizontal: type === "filter" ? 12 : (icon ? 16 : 8),
                },
                getButtonStyle(),
                disabled && { opacity: 0.5 },
                style,
            ]}
            disabled={disabled}
            {...rest}
        >
            <ThemedText
                style={{
                    color: getTextColor(),
                    marginRight: icon ? 8 : 0,
                    fontSize: type === "filter" ? 12 : undefined,
                    fontWeight: type === "filter" ? '500' : undefined,
                }}
            >
                {children}
            </ThemedText>

            {icon && (
                <MaterialIcons
                    name={icon.name}
                    size={icon.size || 18}
                    color={getTextColor()}
                />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        padding: 8,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
    },
});