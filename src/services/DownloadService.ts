import { httpClient } from "@/services/httpClient";
import { ModalEmitter } from "@/services/modalEmitter";
import { tokenService } from "@/services/tokenService";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

class DownloadService {
    private static instance: DownloadService;

    static getInstance(): DownloadService {
        if (!DownloadService.instance) {
            DownloadService.instance = new DownloadService();
        }
        return DownloadService.instance;
    }

    async downloadFile(url: string, filename?: string): Promise<void> {
        if (!url) {
            throw new Error("No download URL available");
        }

        if (Platform.OS === 'web') {
            return this.downloadFileWeb(url, filename);
        }

        return this.downloadFileMobile(url, filename);
    }

    private async downloadFileWeb(url: string, filename?: string): Promise<void> {
        try {
            const { blob } = await httpClient.downloadBlob(url);
            const finalFilename = filename || this.extractFilenameFromUrl(url);
            this.triggerWebDownload(blob, finalFilename);
        } catch (error) {
            ModalEmitter.showError("Download failed. Opening in new tab...");
            this.fallbackToNewTab(url);
            throw error;
        }
    }

    private async downloadFileMobile(url: string, filename?: string): Promise<void> {
        try {
            const token = await tokenService.getValidToken();
            if (!token) {
                throw new Error("No valid token available");
            }

            const finalFilename = filename || this.extractFilenameFromUrl(url);
            const sanitizedFileName = this.sanitizeFileName(finalFilename);
            const downloadUri = FileSystem.documentDirectory + sanitizedFileName;

            const downloadResult = await FileSystem.downloadAsync(url, downloadUri, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (downloadResult.status === 200) {
                await this.verifyAndShareFile(downloadResult.uri, sanitizedFileName);
            } else {
                throw new Error(`Download failed with status ${downloadResult.status}`);
            }
        } catch (error) {
            this.handleMobileDownloadError(url);
            throw error;
        }
    }

    async openFile(url: string): Promise<void> {
        if (Platform.OS === 'web') {
            this.fallbackToNewTab(url);
            return;
        }

        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                throw new Error("Cannot open this URL");
            }
        } catch (error) {
            throw new Error("Failed to open attachment");
        }
    }

    private extractFilenameFromUrl(url: string): string {
        try {
            const urlPath = new URL(url).pathname;
            const filename = urlPath.split('/').pop();
            return filename && filename.includes('.') ? filename : `download_${Date.now()}.pdf`;
        } catch (error) {
            return `download_${Date.now()}.pdf`;
        }
    }

    private triggerWebDownload(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    private fallbackToNewTab(url: string): void {
        if (Platform.OS === 'web') {
            window.open(url, '_blank');
        } else {
            setTimeout(() => Linking.openURL(url), 1000);
        }
    }

    private async verifyAndShareFile(fileUri: string, fileName: string): Promise<void> {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
            throw new Error("Downloaded file not found");
        }
        await this.shareFile(fileUri, fileName);
    }

    private async shareFile(fileUri: string, fileName: string): Promise<void> {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                throw new Error("Sharing not available");
            }

            await Sharing.shareAsync(fileUri, {
                dialogTitle: Platform.OS === 'ios' ? `Save ${fileName}` : `Share ${fileName}`,
                mimeType: this.getMimeType(fileName),
                UTI: Platform.OS === 'ios' ? this.getUTI(fileName) : undefined,
            });
        } catch (error) {
            const message = Platform.OS === 'ios'
                ? "File downloaded. Check Files app in Downloads folder."
                : "File downloaded to device storage.";

            ModalEmitter.showError(message);
        }
    }

    private handleMobileDownloadError(url: string): void {
        const message = Platform.OS === 'ios'
            ? "Download failed. Opening in Safari..."
            : "Download failed. Opening in browser...";

        ModalEmitter.showError(message);
        this.fallbackToNewTab(url);
    }

    private sanitizeFileName(fileName: string): string {
        let sanitized = fileName
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\s+/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_+|_+$/g, '')
            .trim();

        if (sanitized.length > 100) {
            const extension = sanitized.split('.').pop();
            const name = sanitized.substring(0, 90);
            sanitized = extension ? `${name}.${extension}` : name;
        }

        if (!sanitized || sanitized === '.') {
            sanitized = `download_${Date.now()}.pdf`;
        }

        return sanitized;
    }

    private getMimeType(filename: string): string {
        const extension = filename.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'zip': 'application/zip',
        };
        return mimeTypes[extension || ''] || 'application/octet-stream';
    }

    private getUTI(filename: string): string {
        const extension = filename.split('.').pop()?.toLowerCase();
        const utiTypes: Record<string, string> = {
            'pdf': 'com.adobe.pdf',
            'doc': 'com.microsoft.word.doc',
            'docx': 'org.openxmlformats.wordprocessingml.document',
            'xls': 'com.microsoft.excel.xls',
            'xlsx': 'org.openxmlformats.spreadsheetml.sheet',
            'txt': 'public.plain-text',
            'jpg': 'public.jpeg',
            'jpeg': 'public.jpeg',
            'png': 'public.png',
            'zip': 'public.zip-archive',
        };
        return utiTypes[extension || ''] || 'public.data';
    }
}

export const downloadService = DownloadService.getInstance();