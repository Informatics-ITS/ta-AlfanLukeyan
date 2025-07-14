export interface UserProfile {
    created_at: string;
    email: string;
    face_model_preference: number;
    id: number;
    is_verified: boolean;
    name: string;
    phone: string;
    profile_picture: string | null;
    role_id: number;
    updated_at: string;
    uuid: string;
}

export interface UserProfileResponse {
    status?: string;
    message?: string;
    data?: UserProfile;
}