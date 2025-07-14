import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'bold' | 'placeholder';
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    type = 'default',
    ...rest
}: ThemedTextProps) {

    const getColorType = (textType: string) => {
        switch (textType) {
            case 'title':
                return 'title';
            case 'subtitle':
                return 'subtitle';
            case 'placeholder':
                return 'placeholder';
            default:
                return 'text';
        }
    };

    const color = useThemeColor(
        { light: lightColor, dark: darkColor },
        getColorType(type)
    );

    return (
        <Text
            style={[
                { color },
                type === 'default' ? styles.default : undefined,
                type === 'title' ? styles.title : undefined,
                type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
                type === 'subtitle' ? styles.subtitle : undefined,
                type === 'link' ? styles.link : undefined,
                type === 'bold' ? styles.bold : undefined,
                type === 'placeholder' ? styles.placeholder : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        lineHeight: 24,
    },
    bold: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
    },
    defaultSemiBold: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        lineHeight: 20,
    },
    link: {
        fontSize: 14,
        color: '#0a7ea4',
        fontFamily: 'Poppins-Regular',
    },
    placeholder: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
});
