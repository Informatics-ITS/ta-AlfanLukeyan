import { EventEmitter } from 'events';

interface AlertOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface CrucialAuthOptions {
    title?: string;
    description?: string;
    onSuccess: () => void;
    onCancel: () => void;
}

interface FaceRegistrationOptions {
    onSuccess: () => void;
    onCancel?: () => void;
}

interface ErrorOptions {
    message: string;
    autoDismiss?: boolean;
    autoDismissDelay?: number;
}

interface SuccessOptions {
    message: string;
    autoDismiss?: boolean;
    autoDismissDelay?: number;
}

class ModalEmitterClass extends EventEmitter {
    showError(messageOrOptions: string | ErrorOptions) {
        if (typeof messageOrOptions === 'string') {
            this.emit('SHOW_ERROR', {
                message: messageOrOptions,
                autoDismiss: true,
                autoDismissDelay: 3000
            });
        } else {
            this.emit('SHOW_ERROR', {
                autoDismiss: true,
                autoDismissDelay: 3000,
                ...messageOrOptions
            });
        }
    }

    showSuccess(messageOrOptions: string | SuccessOptions) {
        if (typeof messageOrOptions === 'string') {
            this.emit('SHOW_SUCCESS', {
                message: messageOrOptions,
                autoDismiss: true,
                autoDismissDelay: 2000
            });
        } else {
            this.emit('SHOW_SUCCESS', {
                autoDismiss: true,
                autoDismissDelay: 2000,
                ...messageOrOptions
            });
        }
    }

    // Loading Modal
    showLoading(message?: string) {
        this.emit('SHOW_LOADING', message);
    }

    hideLoading() {
        this.emit('HIDE_LOADING');
    }

    // Custom Alert Modal
    showAlert(options: AlertOptions) {
        this.emit('SHOW_ALERT', options);
    }

    hideAlert() {
        this.emit('HIDE_ALERT');
    }

    // Auth-related events
    unauthorized() {
        this.emit('UNAUTHORIZED');
    }

    anotherDeviceLogin(message: string) {
        this.emit('ANOTHER_DEVICE_LOGIN', message);
    }

    showCrucialAuth(options: CrucialAuthOptions) {
        this.emit('SHOW_CRUCIAL_AUTH', options);
    }

    hideCrucialAuth() {
        this.emit('HIDE_CRUCIAL_AUTH');
    }

    showFaceRegistration(options: FaceRegistrationOptions) {
        this.emit('SHOW_FACE_REGISTRATION', options);
    }

    hideFaceRegistration() {
        this.emit('HIDE_FACE_REGISTRATION');
    }

    showErrorPersistent(message: string) {
        this.showError({
            message,
            autoDismiss: false
        });
    }

    showSuccessPersistent(message: string) {
        this.showSuccess({
            message,
            autoDismiss: false
        });
    }

    showQuickSuccess(message: string, delay: number = 1000) {
        this.showSuccess({
            message,
            autoDismiss: true,
            autoDismissDelay: delay
        });
    }

    showQuickError(message: string, delay: number = 2000) {
        this.showError({
            message,
            autoDismiss: true,
            autoDismissDelay: delay
        });
    }
}

export const ModalEmitter = new ModalEmitterClass();

export const ErrorModalEmitter = ModalEmitter;
export const SuccessModalEmitter = ModalEmitter;
export const LoadingModalEmitter = ModalEmitter;
export const AlertModalEmitter = ModalEmitter;