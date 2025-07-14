import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface FilePickerProps {
    onFileSelected: (file: DocumentPicker.DocumentPickerAsset | null) => void;
    selectedFile: DocumentPicker.DocumentPickerAsset | null;
    placeholder?: string;
    disabled?: boolean;
}

export function FilePicker({ onFileSelected, selectedFile, placeholder = "Select a file", disabled = false }: FilePickerProps) {
    const theme = useColorScheme() ?? "light";
    const [picking, setPicking] = useState(false);

    const pickDocument = async () => {
        if (disabled || picking) return;

        setPicking(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                onFileSelected(result.assets[0]);
            }
        } catch (error) {
        } finally {
            setPicking(false);
        }
    };

    const removeFile = () => {
        if (disabled) return;
        onFileSelected(null);
    };

    return (
        <View style={styles.container}>
            {selectedFile ? (
                <View style={[
                    styles.selectedFileContainer,
                    { 
                        borderColor: Colors[theme].border,
                        backgroundColor: Colors[theme].background,
                        opacity: disabled ? 0.6 : 1
                    }
                ]}>
                    <View style={styles.fileInfo}>
                        <Ionicons
                            name="document-attach"
                            size={24}
                            color={Colors[theme].text}
                            style={styles.fileIcon}
                        />
                        <View style={styles.fileDetails}>
                            <ThemedText 
                                type="default" 
                                style={styles.fileName}
                                numberOfLines={2}
                                ellipsizeMode="middle"
                            >
                                {selectedFile.name}
                            </ThemedText>
                            <ThemedText style={styles.fileSize}>
                                {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                            </ThemedText>
                        </View>
                    </View>
                    
                    {!disabled && (
                        <Pressable onPress={removeFile} style={styles.removeButton}>
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color={Colors[theme].text}
                            />
                        </Pressable>
                    )}
                </View>
            ) : (
                <Pressable 
                    onPress={pickDocument} 
                    style={[
                        styles.pickerButton,
                        { 
                            borderColor: Colors[theme].border,
                            backgroundColor: Colors[theme].background,
                            opacity: disabled || picking ? 0.6 : 1
                        }
                    ]}
                    disabled={disabled || picking}
                >
                    <Ionicons
                        name={picking ? "hourglass" : "cloud-upload-outline"}
                        size={24}
                        color={Colors[theme].tint}
                        style={styles.uploadIcon}
                    />
                    <ThemedText style={[styles.pickerText, { color: Colors[theme].tint }]}>
                        {picking ? "Selecting..." : placeholder}
                    </ThemedText>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    pickerButton: {
        padding: 8,
        borderRadius: 10,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
    },
    uploadIcon: {
        marginBottom: 8,
    },
    pickerText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    selectedFileContainer: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    fileIcon: {
        marginRight: 12,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    fileSize: {
        fontSize: 12,
        opacity: 0.7,
    },
    removeButton: {
        padding: 4,
        marginLeft: 8,
    },
});