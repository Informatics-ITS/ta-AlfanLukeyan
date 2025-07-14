import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Standalone token refresh function to avoid circular dependencies
 * This bypasses the httpClient to prevent cycles
 */
export const refreshTokenRequest = async (refreshToken: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/refresh`,
            { refreshToken },
            {
                headers: {
                    "Authorization": `Bearer ${refreshToken}`,
                    "Content-Type": "application/json"
                },
                timeout: 10000
            }
        );

        return response.data;
    } catch (error: any) {
        throw error;
    }
};