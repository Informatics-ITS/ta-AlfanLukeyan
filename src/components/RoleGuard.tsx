import { useUserRole } from "@/hooks/useUserRole";
import { USER_ROLES, UserRole } from "@/types/auth";
import React from "react";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requireTeacher?: boolean;
    requireAdmin?: boolean;
    fallback?: React.ReactNode;
}

export function RoleGuard({
    children,
    allowedRoles,
    requireTeacher,
    requireAdmin,
    fallback = null
}: RoleGuardProps) {
    const { role, isTeacher, isAdmin, hasTeacherPermissions } = useUserRole();

    let hasAccess = false;

    if (requireAdmin) {
        hasAccess = isAdmin();
    } else if (requireTeacher) {
        hasAccess = hasTeacherPermissions();
    } else if (allowedRoles) {
        hasAccess = allowedRoles.includes(role);
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}

export const TeacherOnly = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
    <RoleGuard requireTeacher fallback={fallback}>
        {children}
    </RoleGuard>
);

export const AdminOnly = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
    <RoleGuard requireAdmin fallback={fallback}>
        {children}
    </RoleGuard>
);

export const StudentOnly = ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
    <RoleGuard allowedRoles={[USER_ROLES.STUDENT]} fallback={fallback}>
        {children}
    </RoleGuard>
);