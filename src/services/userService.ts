import { FaceReferenceCheck, PasswordResetLog, Role, UserByRole } from "@/types/api";
import { UserProfile } from "@/types/user";
import { Platform } from "react-native";
import { userApi } from "./api/userApi";

interface UpdateProfileRequest {
    name: string;
    phone: string;
}

class UserService {
    private static instance: UserService;

    static getInstance() {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    async getProfile(): Promise<UserProfile> {
        try {
            const profile = await userApi.getProfile();
            return profile;
        } catch (error) {
            throw error;
        }
    }

    async updateProfile(data: UpdateProfileRequest): Promise<any> {
        try {
            return await userApi.updateProfile(data);
        } catch (error) {
            throw error;
        }
    }

    async updateEmail(email: string): Promise<any> {
        try {
            return await userApi.updateEmail(email);
        } catch (error) {
            throw error;
        }
    }

    async updateProfilePicture(formData: FormData): Promise<any> {
        try {
            return await userApi.updateProfilePicture(formData);
        } catch (error) {
            throw error;
        }
    }

    async updateFaceReference(faceImages: string[]): Promise<any> {
        try {
            const formData = new FormData();

            if (Platform.OS === 'web') {
                for (let i = 0; i < faceImages.length; i++) {
                    try {
                        const response = await fetch(faceImages[i]);
                        const blob = await response.blob();
                        formData.append('images', blob, `face_reference_${i + 1}.jpg`);
                    } catch (error) {
                        throw new Error(`Failed to process image ${i + 1} for upload`);
                    }
                }
            } else {
                faceImages.forEach((image, index) => {
                    formData.append('images', {
                        uri: image,
                        type: 'image/jpeg',
                        name: `face_reference_${index + 1}.jpg`,
                    } as any);
                });
            }

            return await userApi.updateFaceReference(formData);
        } catch (error) {
            throw error;
        }
    }

    async getAllRoles(): Promise<Role[]> {
        try {
            const response = await userApi.getAllRoles();
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async modifyUserRole(uuid: string, roleId: string): Promise<any> {
        try {
            return await userApi.modifyUserRole({ uuid, role_id: roleId });
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(uuid: string): Promise<any> {
        try {
            return await userApi.deleteUser(uuid);
        } catch (error) {
            throw error;
        }
    }

    async injectCrucialToken(userIndex: number): Promise<any> {
        try {
            return await userApi.injectCrucialToken({ user_id: userIndex.toString() });
        } catch (error) {
            throw error;
        }
    }

    async deleteCrucialToken(userIndex: number): Promise<any> {
        try {
            return await userApi.deleteCrucialToken({ user_id: userIndex.toString() });
        } catch (error) {
            throw error;
        }
    }

    async verifyEmailUser(uuid: string): Promise<any> {
        try {
            return await userApi.verifyEmailUser({ uuid });
        } catch (error) {
            throw error;
        }
    }

    async getUsersByRole(roleId: number): Promise<UserByRole[]> {
        try {
            const response = await userApi.getUsersByRole(roleId);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async searchUsers(params?: { name?: string; role_id?: number }): Promise<UserByRole[]> {
        try {
            const response = await userApi.searchUsers(params);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getAllUsers(searchQuery?: string): Promise<UserByRole[]> {
        try {
            if (searchQuery) {
                return await this.searchUsers({ name: searchQuery });
            } else {
                const response = await userApi.getAllUsers();
                return response.data;
            }
        } catch (error) {
            throw error;
        }
    }

    getRoleText(roleId?: number): string {
        switch (roleId) {
            case 1: return 'Admin';
            case 2: return 'Teacher';
            case 3: return 'Student';
            case 4: return 'Guest';
            default: return 'Guest';
        }
    }

    formatJoinDate(createdAt: string): string {
        return new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    isProfileComplete(profile: UserProfile): boolean {
        return !!(profile.name && profile.email && profile.phone);
    }

    async getTeachers(): Promise<UserByRole[]> {
        return this.getUsersByRole(2);
    }

    async getStudents(): Promise<UserByRole[]> {
        return this.getUsersByRole(3);
    }

    async getAdmins(): Promise<UserByRole[]> {
        return this.getUsersByRole(1);
    }

    isUserVerified(user: UserByRole): boolean {
        return user.is_verified;
    }

    async registerFaceReference(faceImages: string[], userUuid: string): Promise<any> {
        try {
            const formData = new FormData();

            formData.append('uuid', userUuid);

            if (Platform.OS === 'web') {
                for (let i = 0; i < faceImages.length; i++) {
                    try {
                        const response = await fetch(faceImages[i]);
                        const blob = await response.blob();
                        formData.append('images', blob, `face_reference_${i + 1}.jpg`);
                    } catch (error) {
                        throw new Error(`Failed to process image ${i + 1} for upload`);
                    }
                }
            } else {
                faceImages.forEach((image, index) => {
                    formData.append('images', {
                        uri: image,
                        type: 'image/jpeg',
                        name: `face_reference_${index + 1}.jpg`,
                    } as any);
                });
            }

            return await userApi.registerFaceReference(formData);
        } catch (error) {
            throw error;
        }
    }

    async checkFaceReference(uuid: string): Promise<FaceReferenceCheck> {
        try {
            const response = await userApi.checkFaceReference(uuid);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getPasswordResetLogs(uuid: string): Promise<PasswordResetLog[]> {
        try {
            const response = await userApi.getPasswordResetLogs(uuid);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export const userService = UserService.getInstance();