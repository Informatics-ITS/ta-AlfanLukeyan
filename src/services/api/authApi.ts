import { Platform } from 'react-native';
import { httpClient } from '../httpClient';

export const authApi = {
    login: async (email: string, password: string) => {
        return httpClient.postNoAuth('/auth/login', { email, password });
    },

    faceLogin: async (email: string, faceImage: string) => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('face_model_preference', '2');

        if (Platform.OS === 'web') {
            try {
                const response = await fetch(faceImage);
                const blob = await response.blob();
                formData.append('face_image', blob, 'face_auth.jpg');
            } catch (error) {
                throw new Error('Failed to process image for upload');
            }
        } else {
            formData.append('face_image', {
                uri: faceImage,
                type: 'image/jpeg',
                name: 'face_auth.jpg',
            } as any);
        }

        return httpClient.postFormDataNoAuth('/auth/login-face', formData);
    },

    crucialVerify: async (faceImage: string) => {
        const formData = new FormData();
        formData.append('face_model_preference', '2');

        if (Platform.OS === 'web') {
            try {
                const response = await fetch(faceImage);
                const blob = await response.blob();
                formData.append('image', blob, 'crucial_auth.jpg');
            } catch (error) {
                throw new Error('Failed to process image for upload');
            }
        } else {
            formData.append('image', {
                uri: faceImage,
                type: 'image/jpeg',
                name: 'crucial_auth.jpg',
            } as any);
        }

        return httpClient.postFormData('/auth/crucial-verify', formData);
    },

    register: async (
        name: string,
        email: string,
        password: string,
        phone: string,
        faceImages?: string[]
    ) => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone', phone);

        // Only add face images if provided
        if (faceImages && faceImages.length > 0) {
            if (Platform.OS === 'web') {
                for (let i = 0; i < faceImages.length; i++) {
                    try {
                        const response = await fetch(faceImages[i]);
                        const blob = await response.blob();
                        formData.append('face_reference', blob, `face_${i + 1}.jpg`);
                    } catch (error) {
                        throw new Error(`Failed to process image ${i + 1} for upload`);
                    }
                }
            } else {
                faceImages.forEach((image, index) => {
                    formData.append('face_reference', {
                        uri: image,
                        type: 'image/jpeg',
                        name: `face_${index + 1}.jpg`,
                    } as any);
                });
            }
        }

        return httpClient.postFormDataNoAuth('/user/register', formData);
    },

    logout: async () => {
        return httpClient.get('/auth/logout');
    },

    refreshToken: async (refreshToken: string) => {
        return httpClient.postNoAuth('/auth/refresh', { refreshToken }, {
            headers: { "Authorization": `Bearer ${refreshToken}` }
        });
    },

    requestPasswordReset: async (email: string) => {
        return httpClient.postNoAuth('/user/reset-password/request', { email });
    }
};
