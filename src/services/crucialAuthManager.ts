import { ModalEmitter } from '@/services/modalEmitter';

interface PendingRequest {
    config: any;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}
interface CrucialAuthContext {
    title?: string;
    description?: string;
}

class CrucialAuthManager {
    private static instance: CrucialAuthManager;
    private pendingRequest: PendingRequest | null = null;

    static getInstance(): CrucialAuthManager {
        if (!CrucialAuthManager.instance) {
            CrucialAuthManager.instance = new CrucialAuthManager();
        }
        return CrucialAuthManager.instance;
    }

    requireCrucialAuth(config: any, context?: CrucialAuthContext): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pendingRequest = { config, resolve, reject };

            ModalEmitter.showCrucialAuth({
                title: context?.title || "Crucial Feature Authentication",
                description: context?.description || "Look straight at the camera",
                onSuccess: () => this.retryRequest(),
                onCancel: () => this.cancelRequest()
            });
        });
    }

    private async retryRequest(): Promise<void> {
        if (!this.pendingRequest) return;

        try {
            const { httpClient } = await import('./httpClient');
            const response = await httpClient.axiosInstance.request({
                ...this.pendingRequest.config,
                headers: {
                    ...this.pendingRequest.config.headers,
                    'X-Crucial-Verified': 'true'
                }
            });
            this.pendingRequest.resolve(response);
        } catch (error) {
            this.pendingRequest.reject(error);
        } finally {
            this.cleanup();
        }
    }

    private cancelRequest(): void {
        if (this.pendingRequest) {
            this.pendingRequest.reject(new Error('Crucial verification cancelled'));
        }
        this.cleanup();
    }

    private cleanup(): void {
        this.pendingRequest = null;
        ModalEmitter.hideCrucialAuth();
    }
}

export const crucialAuthManager = CrucialAuthManager.getInstance();