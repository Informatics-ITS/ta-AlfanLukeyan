import { tokenService } from '@/services/tokenService';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const simplePost = async (url: string, data: any, headers: Record<string, string> = {}) => {
    const response = await fetch(`${API_URL}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || errorData.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return response.json();
};

export const simplePostFormData = async (url: string, formData: FormData, method: string = 'POST', includeAuth: boolean = true) => {
    const headers: Record<string, string> = {};

    if (includeAuth) {
        const token = await tokenService.getValidToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_URL}${url}`, {
        method: method.toUpperCase(),
        headers,
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error || errorData.message || `Request failed with status ${response.status}`;
        
        if (response.status === 403 && errorData.error === "Crucial verification required") {
            const error = new Error(message);
            (error as any).isCrucialRequired = true;
            (error as any).response = { status: response.status, data: errorData };
            throw error;
        }
        
        throw new Error(message);
    }

    return response.json();
};