import { useUserRole } from "@/hooks/useUserRole";
import { classService } from "@/services/classService";
import { ModalEmitter } from "@/services/modalEmitter";
import { AdminClass, Class, CreateClassRequest, PaginationInfo, UpdateClassRequest } from "@/types/api";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

export const useClassControl = () => {
    const router = useRouter();
    const { isAdmin } = useUserRole();

    const [classes, setClasses] = useState<(Class | AdminClass)[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const classBottomSheetRef = useRef<any>(null);

    const fetchClasses = useCallback(async (page: number = 1, append: boolean = false, search?: string) => {
        try {
            setError(null);
            if (!append) {
                setLoading(true);
            }

            if (isAdmin()) {
                const { classes: classesData, pagination: paginationData } = await classService.getAdminClasses({
                    page,
                    per_page: 10,
                    search: search || undefined
                });

                if (append) {
                    setClasses(prev => [...prev, ...classesData]);
                } else {
                    setClasses(classesData);
                }
                setPagination(paginationData);
                setCurrentPage(page);
            } else {
                const classesData = await classService.getClasses();
                setClasses(classesData);
                setPagination(null);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setIsSearching(false);
        }
    }, [isAdmin]);

    const refetchClasses = useCallback(async () => {
        try {
            setRefreshing(true);
            setCurrentPage(1);
            await fetchClasses(1, false, searchQuery);
        } catch (err: any) {
            setError(err.message || 'Failed to refresh classes');
        } finally {
            setRefreshing(false);
        }
    }, [fetchClasses, searchQuery]);

    const loadMoreClasses = useCallback(async () => {
        if (!isAdmin() || !pagination || loadingMore || currentPage >= pagination.max_page) {
            return;
        }

        setLoadingMore(true);
        const nextPage = currentPage + 1;
        await fetchClasses(nextPage, true, searchQuery);
    }, [isAdmin, pagination, loadingMore, currentPage, searchQuery, fetchClasses]);

    const handleInputChange = useCallback((text: string) => {
        setSearchInput(text);
    }, []);

    const handleSearch = useCallback(async (query: string) => {
        if (!isAdmin()) return;

        setSearchQuery(query);
        setIsSearching(true);
        setCurrentPage(1);
        await fetchClasses(1, false, query);
    }, [isAdmin, fetchClasses]);

    const toggleSearch = useCallback(() => {
        const newShowSearch = !showSearch;
        setShowSearch(newShowSearch);

        if (!newShowSearch && (searchQuery || searchInput)) {
            setSearchQuery('');
            setSearchInput('');
            fetchClasses(1, false, '');
        }
    }, [showSearch, searchQuery, searchInput, fetchClasses]);

    const clearSearch = useCallback(() => {
        setSearchInput('');
        setSearchQuery('');
        fetchClasses(1, false, '');
    }, [fetchClasses]);

    const handleClassSubmit = useCallback(async (
        data: CreateClassRequest | UpdateClassRequest,
        isEdit: boolean,
        classId?: string
    ) => {
        try {
            if (isEdit && classId) {
                const updatedClass = await classService.updateClass(classId, data as UpdateClassRequest);
                setClasses(prev => prev.map(cls =>
                    cls.id === classId ? { ...cls, ...updatedClass } : cls
                ));
                ModalEmitter.showSuccess("Class updated successfully!");
            } else {
                const newClass = await classService.createClass(data as CreateClassRequest);
                setClasses(prev => [newClass, ...prev]);
                if (pagination) {
                    setPagination(prev => prev ? { ...prev, count: prev.count + 1 } : null);
                }
                ModalEmitter.showSuccess("Class created successfully!");
            }
        } catch (error: any) {
            const operation = isEdit ? 'update' : 'create';
            ModalEmitter.showError(error.message || `Failed to ${operation} class. Please try again.`);
        }
    }, [pagination]);

    const handleOpenCreateSheet = useCallback(() => {
        classBottomSheetRef.current?.open();
    }, []);

    const handleEditClass = useCallback((classId: string) => {
        const classToEdit = classes.find(cls => cls.id === classId);
        if (classToEdit) {
            classBottomSheetRef.current?.open(classToEdit);
        }
    }, [classes]);

    const handleDeleteClass = useCallback((classId: string) => {
        const classToDelete = classes.find(cls => cls.id === classId);
        const className = classToDelete ? classToDelete.name : 'this class';

        ModalEmitter.showAlert({
            title: "Delete Class",
            message: `Are you sure you want to delete "${className}"? This action cannot be undone.`,
            type: "danger",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: () => {
                ModalEmitter.hideAlert();
                confirmDeleteClass(classId);
            },
            onCancel: () => {
                ModalEmitter.hideAlert();
            }
        });
    }, [classes]);

    const confirmDeleteClass = useCallback(async (classId: string) => {
        try {
            setDeletingClassId(classId);
            const response = await classService.deleteClass(classId);

            if (response.status === 'success') {
                setClasses(prev => prev.filter(cls => cls.id !== classId));
                if (pagination) {
                    setPagination(prev => prev ? { ...prev, count: Math.max(0, prev.count - 1) } : null);
                }
                ModalEmitter.showSuccess(response.message || "Class deleted successfully.");
            } else {
                throw new Error(response.message || 'Failed to delete class');
            }
        } catch (error: any) {
            ModalEmitter.showError(error.message || "Failed to delete class. Please try again.");
        } finally {
            setDeletingClassId(null);
        }
    }, [pagination]);

    const handleClassPress = useCallback((classId: string) => {
        router.push(`/(class)/${classId}/(tabs)`);
    }, [router]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    return {
        classes,
        loading,
        refreshing,
        loadingMore,
        error,
        pagination,
        showSearch,
        searchInput,
        searchQuery,
        isSearching,
        classBottomSheetRef,
        refetchClasses,
        loadMoreClasses,
        handleInputChange,
        handleSearch,
        toggleSearch,
        clearSearch,
        handleClassSubmit,
        handleOpenCreateSheet,
        handleEditClass,
        handleDeleteClass,
        handleClassPress,
    };
};