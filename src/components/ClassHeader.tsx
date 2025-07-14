import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface ClassHeaderProps {
    title?: string;
    classCode?: string;
    description?: string;
    style?: ViewStyle;
}

export const ClassHeader: React.FC<ClassHeaderProps> = ({
    title,
    classCode,
    description,
    style,
}) => {
    return (
        <ThemedView style={[styles.container, style]}>
            {title && <ThemedText type="title">{title}</ThemedText>}
            {classCode && <ThemedText type="default">{classCode}</ThemedText>}
            {description && <ThemedText type="default">{description}</ThemedText>}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        paddingBottom: 16,
    },
});