import { AddMemberRequest, AddMemberResponse, AssessmentResponse, ClassInfoResponse, ClassMemberResponse, CreateClassRequest, CreateClassResponse, DeleteClassResponse, DeleteMemberResponse, StudentAssessmentResponse, UpdateClassRequest, UpdateClassResponse, WeeklySectionResponse } from '@/types/api';
import { WeeklySectionFormData } from '@/types/common';
import { Platform } from 'react-native';
import { httpClient } from '../httpClient';

export const classApi = {

    createAdminClass: async (data: CreateClassRequest): Promise<CreateClassResponse> => {
        return httpClient.post('/kelas/admin', data);
    },

    updateAdminClass: async (classId: string, data: UpdateClassRequest): Promise<UpdateClassResponse> => {
        return httpClient.put(`/kelas/admin/?id=${classId}`, data);
    },

    deleteAdminClass: async (classId: string): Promise<DeleteClassResponse> => {
        return httpClient.delete(`/kelas/admin/?id=${classId}`);
    },

    getAdminClasses: async (params?: {
        search?: string;
        page?: number;
        max_page?: number;
        per_page?: number;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.max_page) queryParams.append('max_page', params.max_page.toString());
        if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

        const queryString = queryParams.toString();
        return httpClient.get(`/kelas/admin${queryString ? `?${queryString}` : ''}`);
    },

    getAllClasses: async () => {
        return httpClient.get('/public/user/class/');
    },

    getClassInfo: async (classId: string): Promise<ClassInfoResponse> => {
        return httpClient.get(`/kelas?id=${classId}`);
    },

    getTeacherWeeklySections: async (classId: string): Promise<WeeklySectionResponse> => {
        return httpClient.get(`/kelas/weekly-section/class/?class_id=${classId}`);
    },

    getStudentWeeklySections: async (classId: string): Promise<WeeklySectionResponse> => {
        return httpClient.get(`/student/kelas/weekly-section/class/?class_id=${classId}`);
    },

    getTeacherClassAssessments: async (classId: string): Promise<AssessmentResponse> => {
        return httpClient.get(`/teacher/assessment/class/?classID=${classId}`);
    },

    getStudentClassAssessments: async (classId: string): Promise<StudentAssessmentResponse> => {
        return httpClient.get(`/student/assessment/class/?classID=${classId}`);
    },

    getClassMembers: async (classId: string): Promise<ClassMemberResponse> => {
        return httpClient.get(`/public/class/members/?classID=${classId}`);
    },

    createWeeklySection: async (classId: string, data: WeeklySectionFormData): Promise<{ status: string; message: string; data: any }> => {
        const formData = new FormData();

        formData.append('kelas_id', classId);
        formData.append('week_number', data.weekNumber.toString());
        formData.append('headingPertemuan', data.title);
        formData.append('bodyPertemuan', data.description);

        if (data.videoUrl) {
            formData.append('urlVideo', data.videoUrl);
        }

        if (data.file) {
            if (Platform.OS === 'web') {
                const response = await fetch(data.file.uri);
                const blob = await response.blob();
                const file = new File([blob], data.file.name, {
                    type: data.file.type || 'application/octet-stream'
                });
                formData.append('file', file);
            } else {
                formData.append('file', data.file as any);
            }
        }

        return httpClient.postFormData('/teacher/kelas/weekly-section', formData);
    },

    updateWeeklySection: async (weekId: string, data: WeeklySectionFormData): Promise<{ status: string; message: string; data: any }> => {
        const formData = new FormData();

        formData.append('week_id', weekId);
        formData.append('week_number', data.weekNumber.toString());
        formData.append('headingPertemuan', data.title);
        formData.append('bodyPertemuan', data.description);

        if (data.videoUrl) {
            formData.append('urlVideo', data.videoUrl);
        }

        if (data.file) {
            if (Platform.OS === 'web') {
                const response = await fetch(data.file.uri);
                const blob = await response.blob();
                const file = new File([blob], data.file.name, {
                    type: data.file.type || 'application/octet-stream'
                });
                formData.append('file', file);
            } else {
                formData.append('file', data.file as any);
            }
        }

        return httpClient.putFormData('/teacher/kelas/weekly-section', formData);
    },

    deleteWeeklySection: async (weekId: string): Promise<{ status: string; message: string; data: string }> => {
        return httpClient.delete(`/teacher/kelas/weekly-section?id=${weekId}`);
    },

    addClassMembers: async (data: AddMemberRequest): Promise<AddMemberResponse> => {
        return httpClient.post('/member/admin', data);
    },

    deleteClassMember: async (userId: string, classId: string): Promise<DeleteMemberResponse> => {
        return httpClient.delete(`/member/admin?user_id=${userId}&class_id=${classId}`);
    },
};