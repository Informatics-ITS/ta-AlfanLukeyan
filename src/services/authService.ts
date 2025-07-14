import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';
import { authApi } from './api/authApi';
import { tokenService } from './tokenService';

export interface CrucialVerifyResponse {
    message: string;
}

class AuthService {
    private static instance: AuthService;

    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await authApi.login(credentials.email, credentials.password);

            if (response.access_token && response.refresh_token) {
                await tokenService.storeTokens(
                    response.access_token,
                    response.refresh_token,
                    credentials.email
                );
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    async faceLogin(email: string, faceImage: string): Promise<AuthResponse> {
        try {
            const response = await authApi.faceLogin(email, faceImage);

            if (response.access_token && response.refresh_token) {
                await tokenService.storeTokens(
                    response.access_token,
                    response.refresh_token,
                    email
                );
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    async crucialVerify(faceImage: string): Promise<CrucialVerifyResponse> {
        try {
            const response = await authApi.crucialVerify(faceImage);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await authApi.register(
                data.name,
                data.email,
                data.password,
                data.phone,
                data.faceImages
            );

            if (response.access_token && response.refresh_token) {
                await tokenService.storeTokens(
                    response.access_token,
                    response.refresh_token,
                    data.email
                );
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    async logout(): Promise<AuthResponse> {
        try {
            const response = await authApi.logout();
            return response;
        } catch (error) {
            throw error;
        } finally {
            await tokenService.clearTokens();
        }
    }

    async getCurrentUser(): Promise<User | null> {
        const decoded = tokenService.getDecodedToken();
        if (!decoded) return null;

        return {
            uuid: decoded.uuid,
            email: decoded.sub,
            name: '',
            role_name: decoded.role_name || tokenService.getRoleText()
        };
    }

    async isAuthenticated(): Promise<boolean> {
        const token = await tokenService.getValidToken();
        return !!token;
    }

    async initializeAuth(): Promise<boolean> {
        return await tokenService.loadTokens();
    }

    getUserId(): string | null {
        return tokenService.getUserId();
    }
}

export const authService = AuthService.getInstance();
