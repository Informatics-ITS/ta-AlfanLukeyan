import { authApi } from "@/services/api/authApi";
import { ModalEmitter } from "@/services/modalEmitter";
import { tokenService } from "@/services/tokenService";
import { User } from '@/types/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    loginUser: (email: string, password: string) => Promise<User>;
    faceLoginUser: (email: string, faceImage: string) => Promise<User>;
    registerUser: (name: string, email: string, password: string, phone: string, faceImages?: string[]) => Promise<any>;
    logout: () => Promise<any>;
    getUserId: () => string | null;
    isGuest: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        initializeAuth();
        ModalEmitter.on("UNAUTHORIZED", handleUnauthorized);
        ModalEmitter.on("ANOTHER_DEVICE_LOGIN", handleAnotherDeviceLogin);
        return () => {
            ModalEmitter.off("UNAUTHORIZED", handleUnauthorized);
            ModalEmitter.off("ANOTHER_DEVICE_LOGIN", handleAnotherDeviceLogin);
        };
    }, []);

    const handleUnauthorized = async () => {
        setUser(null);
        await tokenService.clearTokens();
    };

    const handleAnotherDeviceLogin = async (message: string) => {
        setUser(null);
        await tokenService.clearTokens();
        ModalEmitter.showError(message);
    };

    const createUserFromToken = (email: string): User | null => {
        const decoded = tokenService.getDecodedToken();
        if (!decoded) return null;

        return {
            uuid: decoded.uuid,
            email,
            name: '',
            role_name: decoded.role_name || tokenService.getRoleText(),
        };
    };

    const initializeAuth = async () => {
        try {
            if (await tokenService.loadTokens()) {
                const validToken = await tokenService.getValidToken();
                if (validToken) {
                    const decoded = tokenService.getDecodedToken();
                    if (decoded) {
                        const userData = createUserFromToken(decoded.sub);
                        if (userData) {
                            setUser(userData);
                            return;
                        }
                    }
                }
            }
            await tokenService.clearTokens();
        } catch (error) {
            await tokenService.clearTokens();
        } finally {
            setIsLoading(false);
        }
    };

    const loginUser = async (email: string, password: string): Promise<User> => {
        const response = await authApi.login(email, password);

        if (!response.access_token || !response.refresh_token) {
            throw new Error("Login failed - missing tokens");
        }

        await tokenService.storeTokens(response.access_token, response.refresh_token, email);
        const userData = createUserFromToken(email);
        if (!userData) throw new Error("Failed to create user data");

        setUser(userData);
        return userData;
    };

    const faceLoginUser = async (email: string, faceImage: string): Promise<User> => {
        const response = await authApi.faceLogin(email, faceImage);

        if (!response.access_token || !response.refresh_token) {
            throw new Error("Face login failed - missing tokens");
        }

        await tokenService.storeTokens(response.access_token, response.refresh_token, email);
        const userData = createUserFromToken(email);
        if (!userData) throw new Error("Failed to create user data");

        setUser(userData);
        return userData;
    };

    const registerUser = async (
        name: string,
        email: string,
        password: string,
        phone: string,
        faceImages?: string[]
    ) => {
        return authApi.register(name, email, password, phone, faceImages);
    };

    const logout = async () => {
        try {
            return await authApi.logout();
        } catch (error) {
            throw error;
        } finally {
            await tokenService.clearTokens();
            setUser(null);
        }
    };

    const getUserId = (): string | null => {
        return tokenService.getUserId();
    };

    const isGuest = (): boolean => {
        return tokenService.isGuest();
    };

    const isAuthenticated = !!user && !tokenService.isTokenExpired();

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                loginUser,
                faceLoginUser,
                registerUser,
                logout,
                getUserId,
                isGuest,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}