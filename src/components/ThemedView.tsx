import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedViewProps = ViewProps & {
    lightColor?: string;
    darkColor?: string;
    isCard?: boolean;
};

export function ThemedView({
    style,
    lightColor,
    darkColor,
    isCard = false,
    ...otherProps
}: ThemedViewProps) {
    const colorType = isCard ? "cardBackground" : "background";
    const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        colorType
    );

    return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
