export interface DecodedJWT {
    uuid: string;
    sub: string;
    role_name: string;
    exp: number;
    iat: number;
    jti: string;
    csrf: string;
    role_id: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone: string;
    faceImages?: string[];
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: any;
}

export interface User {
    uuid: string;
    email: string;
    name: string;
    role_name: string;
}

export const USER_ROLES = {
    ADMIN: 1,
    TEACHER: 2,
    STUDENT: 3,
    GUEST: 4,
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];