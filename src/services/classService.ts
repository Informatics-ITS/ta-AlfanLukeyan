import { AddMemberRequest, AddMemberResponseData, AdminClass, AssessmentData, Class, ClassInfo, ClassMember, CreateClassRequest, CreateClassResponseData, DeleteClassResponse, DeleteMemberResponse, PaginationInfo, UpdateClassRequest, UpdateClassResponseData, WeeklySection } from '@/types/api';
import { WeeklySectionFormData } from '@/types/common';
import { classApi } from "./api/classApi";
import { tokenService } from "./tokenService";

class ClassService {
    private static instance: ClassService;

    static getInstance(): ClassService {
        if (!ClassService.instance) {
            ClassService.instance = new ClassService();
        }
        return ClassService.instance;
    }

    async createClass(data: CreateClassRequest): Promise<CreateClassResponseData> {
        try {
            const response = await classApi.createAdminClass(data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateClass(classId: string, data: UpdateClassRequest): Promise<UpdateClassResponseData> {
        try {
            const response = await classApi.updateAdminClass(classId, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteClass(classId: string): Promise<DeleteClassResponse> {
        try {
            const response = await classApi.deleteAdminClass(classId);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getAdminClasses(params?: {
        search?: string;
        page?: number;
        max_page?: number;
        per_page?: number;
    }): Promise<{ classes: AdminClass[]; pagination: PaginationInfo }> {
        try {
            const response = await classApi.getAdminClasses(params);
            return {
                classes: response.data.data,
                pagination: response.data.pagination
            };
        } catch (error) {
            throw error;
        }
    }

    async getClasses(): Promise<Class[]> {
        try {
            const response = await classApi.getAllClasses();

            return response.data?.map((classItem: any) => ({
                id: classItem.id,
                name: classItem.name || classItem.title,
                tag: classItem.tag || classItem.class_code,
                description: classItem.description || classItem.desc,
                teacher: classItem.teacher,
                teacher_id: classItem.teacher_id
            })) || [];
        } catch (error) {
            throw error;
        }
    }
    async getClassInfo(classId: string): Promise<ClassInfo> {
        try {
            const response = await classApi.getClassInfo(classId);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getWeeklySections(classId: string): Promise<WeeklySection[]> {
        try {
            if (tokenService.hasTeacherPermissions()) {
                const response = await classApi.getTeacherWeeklySections(classId);
                return response.data;
            } else {
                const response = await classApi.getStudentWeeklySections(classId);
                return response.data;
            }
        } catch (error) {
            throw error;
        }
    }

    async getClassAssessments(classId: string): Promise<AssessmentData[]> {
        try {
            if (tokenService.hasTeacherPermissions()) {
                const response = await classApi.getTeacherClassAssessments(classId);
                return response.data;
            } else {
                const response = await classApi.getStudentClassAssessments(classId);
                return response.data;
            }
        } catch (error) {
            throw error;
        }
    }

    async getClassMembers(classId: string): Promise<ClassMember[]> {
        try {
            const response = await classApi.getClassMembers(classId);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createWeeklySection(classId: string, data: WeeklySectionFormData): Promise<{ status: string; message: string; data: any }> {
        try {
            const response = await classApi.createWeeklySection(classId, data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async updateWeeklySection(weekId: string, data: WeeklySectionFormData): Promise<{ status: string; message: string; data: any }> {
        try {
            const response = await classApi.updateWeeklySection(weekId, data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deleteWeeklySection(weekId: string): Promise<{ status: string; message: string; data: string }> {
        try {
            const response = await classApi.deleteWeeklySection(weekId);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async addClassMembers(data: AddMemberRequest): Promise<AddMemberResponseData> {
        try {
            const response = await classApi.addClassMembers(data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteClassMember(userId: string, classId: string): Promise<DeleteMemberResponse> {
        try {
            const response = await classApi.deleteClassMember(userId, classId);
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export const classService = ClassService.getInstance();