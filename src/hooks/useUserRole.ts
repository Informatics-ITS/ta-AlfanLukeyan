import { tokenService } from "@/services/tokenService";
import { USER_ROLES, UserRole } from "@/types/auth";
import { useMemo } from "react";
import { useAuth } from "./useAuth";

export function useUserRole() {
    const { isAuthenticated } = useAuth();

    const roleData = useMemo(() => {
        const getUserRole = (): UserRole => {
            if (!isAuthenticated) return USER_ROLES.GUEST;
            return tokenService.getUserRole() as UserRole;
        };

        const role = getUserRole();

        const isAdmin = (): boolean => {
            return isAuthenticated && tokenService.isAdmin();
        };

        const isTeacher = (): boolean => {
            return isAuthenticated && tokenService.isTeacher();
        };

        const isStudent = (): boolean => {
            return isAuthenticated && tokenService.isStudent();
        };

        const isGuest = (): boolean => {
            return !isAuthenticated || tokenService.isGuest();
        };

        const hasTeacherPermissions = (): boolean => {
            return isAuthenticated && tokenService.hasTeacherPermissions();
        };

        const canCreateContent = (): boolean => {
            return hasTeacherPermissions();
        };

        const canManageClass = (): boolean => {
            return isAdmin() || isTeacher();
        };

        const getRoleText = (): string => {
            switch (role) {
                case USER_ROLES.ADMIN: return 'Admin';
                case USER_ROLES.TEACHER: return 'Teacher';
                case USER_ROLES.STUDENT: return 'Student';
                case USER_ROLES.GUEST: return 'Guest';
                default: return 'Guest';
            }
        };

        return {
            role,
            isAdmin,
            isTeacher,
            isStudent,
            isGuest,
            hasTeacherPermissions,
            canCreateContent,
            canManageClass,
            getRoleText,
        };
    }, [isAuthenticated]); // ✅ Only depend on isAuthenticated

    return roleData;
}