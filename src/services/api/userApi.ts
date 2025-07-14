import { DeleteCrucialTokenResponse, FaceReferenceCheckResponse, GetUsersByRoleResponse, InjectCrucialTokenResponse, RoleListResponse, VerifyEmailUserResponse } from '@/types/api';
import { UserProfile } from '@/types/user';
import { httpClient } from '../httpClient';

interface UpdateProfileRequest {
    name: string;
    phone: string;
}

interface UpdateEmailRequest {
    email: string;
}

interface ModifyUserRoleRequest {
    uuid: string;
    role_id: string;
}

interface VerifyEmailUserRequest {
    uuid: string;
}

interface InjectCrucialTokenRequest {
    user_id: string;
}

interface DeleteCrucialTokenRequest {
    user_id: string;
}

export const userApi = {
    getProfile: async (): Promise<UserProfile> => {
        return httpClient.get('/user/profile');
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<any> => {
        return httpClient.post('/user/update', data);
    },

    updateEmail: async (email: string): Promise<any> => {
        return httpClient.post('/user/update/email', { email });
    },

    updateProfilePicture: async (formData: FormData): Promise<any> => {
        return httpClient.postFormData('/user/update/profile-picture', formData);
    },

    updateFaceReference: async (formData: FormData): Promise<any> => {
        return httpClient.postFormData('/user/update/face-reference', formData);
    },

    getAllUsers: async (): Promise<GetUsersByRoleResponse> => {
        return httpClient.get('/admin/get-user');
    },

    getUsersByRole: async (roleId: number): Promise<GetUsersByRoleResponse> => {
        return httpClient.get(`/admin/get-user?role_id=${roleId}`);
    },

    searchUsers: async (params?: { name?: string; role_id?: number }): Promise<GetUsersByRoleResponse> => {
        const queryParams = new URLSearchParams();
        if (params?.name) queryParams.append('name', params.name);
        if (params?.role_id) queryParams.append('role_id', params.role_id.toString());

        const queryString = queryParams.toString();
        return httpClient.get(`/admin/search-user${queryString ? `?${queryString}` : ''}`);
    },

    getAllRoles: async (): Promise<RoleListResponse> => {
        return httpClient.get('/role/list');
    },

    modifyUserRole: async (data: ModifyUserRoleRequest): Promise<any> => {
        return httpClient.post('/admin/modify-role', data);
    },

    deleteUser: async (uuid: string): Promise<any> => {
        return httpClient.delete(`/admin/delete-user/${uuid}`);
    },

    injectCrucialToken: async (data: InjectCrucialTokenRequest): Promise<InjectCrucialTokenResponse> => {
        return httpClient.post('/admin/inject-crucial-token', data);
    },

    deleteCrucialToken: async (data: DeleteCrucialTokenRequest): Promise<DeleteCrucialTokenResponse> => {
        return httpClient.deleteWithData('/admin/delete-crucial-token', data);
    },

    verifyEmailUser: async (data: VerifyEmailUserRequest): Promise<VerifyEmailUserResponse> => {
        return httpClient.post('/admin/verify-email-user', data);
    },

    registerFaceReference: async (formData: FormData): Promise<any> => {
        return httpClient.postFormData('/auth/upload-face', formData);
    },

    checkFaceReference: async (uuid: string): Promise<FaceReferenceCheckResponse> => {
        return httpClient.get(`/auth/check-face-reference/${uuid}`);
    },
    
    getPasswordResetLogs: async (uuid: string): Promise<any> => {
        return httpClient.get(`/admin/log-password?uuid=${uuid}`);
    },
};