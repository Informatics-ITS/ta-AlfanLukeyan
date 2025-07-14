import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface CheckboxProps {
    checked: boolean;
    onPress: () => void;
    size?: number;
    disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onPress,
    size = 24,
    disabled = false
}) => {
    const theme = useColorScheme() || "light";
    
    const checkboxStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: checked ? Colors[theme].tint : Colors[theme].border,
        backgroundColor: checked ? Colors[theme].tint : 'transparent',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[
                checkboxStyle,
                disabled && { opacity: 0.5 }
            ]}
            activeOpacity={0.7}
        >
            {checked && (
                <Ionicons 
                    name="checkmark-sharp" 
                    size={size * 0.67} 
                    color={theme === 'light' ? 'white' : Colors[theme].background} 
                />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
});