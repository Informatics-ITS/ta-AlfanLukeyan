import { crucialAuthManager } from "@/services/crucialAuthManager";
import { ModalEmitter } from "@/services/modalEmitter";
import { tokenService } from "@/services/tokenService";
import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface RequestConfig {
    headers?: Record<string, string>;
    timeout?: number;
}

class HttpClient {
    private static instance: HttpClient;
    public axiosInstance: AxiosInstance;
    private readonly defaultTimeout = 30000;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: this.getApiUrl(),
            timeout: this.defaultTimeout,
        });
        this.setupInterceptors();
    }

    static getInstance(): HttpClient {
        if (!HttpClient.instance) {
            HttpClient.instance = new HttpClient();
        }
        return HttpClient.instance;
    }

    private getApiUrl(): string {
        return process.env.EXPO_PUBLIC_API_URL || '';
    }

    private setupInterceptors(): void {
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                const token = await tokenService.getValidToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error) => {
                const { response, config } = error;

                if (response?.status === 401) {
                    await tokenService.clearTokens();
                    ModalEmitter.unauthorized();
                    throw new Error("Unauthorized");
                }

                if (response?.status === 403) {
                    const errorData = response.data || {};

                    if (errorData.error === "CRUCIAL_FEATURE_AUTH_REQUIRED") {
                        if (config?.headers?.['X-Crucial-Verified']) {
                            throw new Error("Crucial verification failed");
                        }

                        try {
                            return await crucialAuthManager.requireCrucialAuth(config);
                        } catch {
                            throw new Error("Crucial verification required but cancelled");
                        }
                    } else {
                        await tokenService.clearTokens();
                        ModalEmitter.anotherDeviceLogin(errorData.msg);
                        throw new Error("Another device login detected");
                    }
                }

                if (response) {
                    const message = response.data?.error || response.data?.message || response.data?.msg || `Request failed with status ${response.status}`;
                    ModalEmitter.showError(message);

                    const customError = new Error(message);
                    (customError as any).response = { status: response.status, data: response.data };
                    throw customError;
                }

                if (error.code === 'ECONNABORTED') {
                    ModalEmitter.showError("Request timeout");
                    throw new Error('Request timeout');
                }

                const message = error.message || error.error || error.msg || error.message || "Network error";
                ModalEmitter.showError(message);
                throw error;
            }
        );
    }

    async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
        const response = await this.axiosInstance.get<T>(url, config);
        return response.data;
    }

    async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return response.data;
    }

    async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        const response = await this.axiosInstance.put<T>(url, data, config);
        return response.data;
    }

    async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
        const response = await this.axiosInstance.delete<T>(url, config);
        return response.data;
    }

    async deleteWithData<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        const response = await this.axiosInstance.delete<T>(url, { ...config, data });
        return response.data;
    }

    async postFormData<T = any>(url: string, formData: FormData, config?: RequestConfig): Promise<T> {
        const response = await this.axiosInstance.post<T>(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers,
            },
        });
        return response.data;
    }

    async putFormData<T = any>(url: string, formData: FormData, config?: RequestConfig): Promise<T> {
        const response = await this.axiosInstance.put<T>(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers,
            },
        });
        return response.data;
    }

    async postNoAuth<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
        const configWithoutAuth = {
            ...config,
            headers: { ...config?.headers },
        };
        delete configWithoutAuth.headers?.Authorization;

        const response = await this.axiosInstance.post<T>(url, data, configWithoutAuth);
        return response.data;
    }

    async postFormDataNoAuth<T = any>(url: string, formData: FormData, config?: RequestConfig): Promise<T> {
        const configWithoutAuth = {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers,
            },
        };
        delete (configWithoutAuth.headers as any)?.Authorization;

        const response = await this.axiosInstance.post<T>(url, formData, configWithoutAuth);
        return response.data;
    }

    async downloadBlob(url: string, config?: RequestConfig): Promise<{ blob: Blob; headers: any }> {
        const response = await this.axiosInstance.get(url, {
            ...config,
            responseType: 'blob',
        });

        return {
            blob: response.data,
            headers: response.headers
        };
    }
}

export const httpClient = HttpClient.getInstance();