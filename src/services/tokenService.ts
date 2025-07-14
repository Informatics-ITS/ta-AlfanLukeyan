import { DecodedJWT } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { refreshTokenRequest } from "./tokenRefresh";

class TokenService {
    private static instance: TokenService;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private decoded: DecodedJWT | null = null;

    static getInstance() {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }

    private isExpired(token: DecodedJWT): boolean {
        return Date.now() >= (token.exp - 300) * 1000;
    }

    async storeTokens(accessToken: string, refreshToken: string, email: string): Promise<void> {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.decoded = jwtDecode(accessToken);

        const storeOperations = [
            AsyncStorage.setItem("access_token", accessToken),
            AsyncStorage.setItem("refresh_token", refreshToken),
            AsyncStorage.setItem("user_email", email),
            AsyncStorage.setItem("decoded_jwt", JSON.stringify(this.decoded)),
        ];

        const userId = this.decoded?.uuid || this.decoded?.sub;
        if (userId) {
            storeOperations.push(AsyncStorage.setItem("user_uuid", userId));
        }

        if (this.decoded?.role_id !== undefined) {
            storeOperations.push(AsyncStorage.setItem("user_role_id", this.decoded.role_id.toString()));
        }

        if (this.decoded?.role_name) {
            storeOperations.push(AsyncStorage.setItem("user_role_name", this.decoded.role_name));
        }

        await Promise.all(storeOperations);
    }

    async loadTokens(): Promise<boolean> {
        try {
            const [accessToken, refreshToken, decodedJWT, storedRoleId, storedRoleName] = await Promise.all([
                AsyncStorage.getItem("access_token"),
                AsyncStorage.getItem("refresh_token"),
                AsyncStorage.getItem("decoded_jwt"),
                AsyncStorage.getItem("user_role_id"),
                AsyncStorage.getItem("user_role_name"),
            ]);

            if (!accessToken || !refreshToken) return false;

            this.accessToken = accessToken;
            this.refreshToken = refreshToken;

            if (decodedJWT) {
                this.decoded = JSON.parse(decodedJWT);
                if (this.decoded && this.decoded.role_id === undefined && storedRoleId) {
                    this.decoded.role_id = parseInt(storedRoleId);
                }
                if (this.decoded && !this.decoded.role_name && storedRoleName) {
                    this.decoded.role_name = storedRoleName;
                }
            } else {
                this.decoded = jwtDecode(accessToken);
                if (this.decoded && this.decoded.role_id === undefined && storedRoleId) {
                    this.decoded.role_id = parseInt(storedRoleId);
                }
                if (this.decoded && !this.decoded.role_name && storedRoleName) {
                    this.decoded.role_name = storedRoleName;
                }
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    async getValidToken(): Promise<string | null> {
        try {
            if (!this.accessToken) {
                if (!(await this.loadTokens())) return null;
            }

            if (this.decoded && this.isExpired(this.decoded)) {
                if (!(await this.refreshAccessToken())) return null;
            }

            return this.accessToken;
        } catch (error) {
            return null;
        }
    }

    private async refreshAccessToken(): Promise<boolean> {
        try {
            if (!this.refreshToken) return false;

            const response = await refreshTokenRequest(this.refreshToken);

            if (response.access_token) {
                const oldUuid = this.decoded?.uuid;
                const oldRoleId = this.decoded?.role_id;
                const oldRoleName = this.decoded?.role_name;

                this.accessToken = response.access_token;
                this.decoded = jwtDecode(response.access_token);

                if (this.decoded && !this.decoded.uuid && oldUuid) {
                    this.decoded.uuid = oldUuid;
                }
                if (this.decoded && this.decoded.role_id === undefined && oldRoleId !== undefined) {
                    this.decoded.role_id = oldRoleId;
                }
                if (this.decoded && !this.decoded.role_name && oldRoleName) {
                    this.decoded.role_name = oldRoleName;
                }

                const updateOperations = [
                    AsyncStorage.setItem("access_token", response.access_token),
                    AsyncStorage.setItem("decoded_jwt", JSON.stringify(this.decoded)),
                ];

                const userId = this.decoded?.uuid || this.decoded?.sub;
                if (userId) {
                    updateOperations.push(AsyncStorage.setItem("user_uuid", userId));
                }

                if (this.decoded?.role_id !== undefined) {
                    updateOperations.push(AsyncStorage.setItem("user_role_id", this.decoded.role_id.toString()));
                }

                if (this.decoded?.role_name) {
                    updateOperations.push(AsyncStorage.setItem("user_role_name", this.decoded.role_name));
                }

                await Promise.all(updateOperations);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    async clearTokens(): Promise<void> {
        this.accessToken = null;
        this.refreshToken = null;
        this.decoded = null;

        await Promise.all([
            AsyncStorage.removeItem("access_token").catch(() => { }),
            AsyncStorage.removeItem("refresh_token").catch(() => { }),
            AsyncStorage.removeItem("user_email").catch(() => { }),
            AsyncStorage.removeItem("user_uuid").catch(() => { }),
            AsyncStorage.removeItem("user_role_id").catch(() => { }),
            AsyncStorage.removeItem("user_role_name").catch(() => { }),
            AsyncStorage.removeItem("decoded_jwt").catch(() => { }),
        ]);
    }

    getUserRole(): number {
        return this.decoded?.role_id || 4;
    }

    async getStoredRole(): Promise<number> {
        try {
            const storedRole = await AsyncStorage.getItem("user_role_id");
            return storedRole ? parseInt(storedRole) : this.getUserRole();
        } catch {
            return this.getUserRole();
        }
    }

    getRoleName(): string {
        return this.decoded?.role_name || 'Guest';
    }

    async getStoredRoleName(): Promise<string> {
        try {
            const storedRoleName = await AsyncStorage.getItem("user_role_name");
            return storedRoleName || this.getRoleName();
        } catch {
            return this.getRoleName();
        }
    }

    isAdmin(): boolean {
        return this.getUserRole() === 1;
    }

    isTeacher(): boolean {
        return this.getUserRole() === 2;
    }

    isStudent(): boolean {
        return this.getUserRole() === 3;
    }

    isGuest(): boolean {
        return this.getUserRole() === 4;
    }

    hasTeacherPermissions(): boolean {
        return this.isAdmin() || this.isTeacher();
    }

    canCreateContent(): boolean {
        return this.hasTeacherPermissions();
    }

    canManageClass(): boolean {
        return this.isAdmin() || this.isTeacher();
    }

    canManageUsers(): boolean {
        return this.isAdmin();
    }

    getUserId(): string | null {
        return this.decoded?.uuid || this.decoded?.sub || null;
    }

    getUserEmail(): string | null {
        return this.decoded?.sub || null;
    }

    getDecodedToken(): DecodedJWT | null {
        return this.decoded;
    }

    getUser(): DecodedJWT | null {
        return this.decoded;
    }

    isTokenExpired(): boolean {
        return this.decoded ? this.isExpired(this.decoded) : true;
    }

    isAuthenticated(): boolean {
        return !!(this.accessToken && this.decoded && !this.isExpired(this.decoded));
    }

    async getStoredUuid(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem("user_uuid");
        } catch {
            return null;
        }
    }

    async getStoredEmail(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem("user_email");
        } catch {
            return null;
        }
    }

    getRoleText(): string {
        return this.getRoleName() || this.getDefaultRoleText();
    }

    private getDefaultRoleText(): string {
        const role = this.getUserRole();
        switch (role) {
            case 1: return 'Admin';
            case 2: return 'Teacher';
            case 3: return 'Student';
            case 4: return 'Guest';
            default: return 'Guest';
        }
    }

    async debugTokenInfo(): Promise<void> { }
}

export const tokenService = TokenService.getInstance();