import * as Brightness from 'expo-brightness';

/**
 * Sets the device brightness to maximum level
 */
export const setMaxBrightness = async (): Promise<void> => {
    try {
        await Brightness.setBrightnessAsync(1.0);
    } catch (error) {
        // Silent failure
    }
};

/**
 * Restores the device brightness to system default
 */
export const restoreBrightness = async (): Promise<void> => {
    try {
        await Brightness.restoreSystemBrightnessAsync();
    } catch (error) {
        // Silent failure
    }
};

/**
 * Calculates the number of days remaining until the given end time
 * @param endTime - The end date as a string
 * @returns The number of days remaining (minimum 0)
 */
export const getDaysRemaining = (endTime: string): number => {
    const now = new Date();
    const endDate = new Date(endTime);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

/**
 * Formats a date string into a readable format with date and time
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Formats a date string into separate date and time components
 * @param dateString - The date string to format
 * @returns Object containing formatted date and time strings
 */
export const formatDateTime = (dateString: string): { date: string; time: string } => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    };

    return {
        date: date.toLocaleDateString("en-US", dateOptions),
        time: date.toLocaleTimeString("en-US", timeOptions)
    };
};

/**
 * Checks if the given end time has passed
 * @param endTime - The end date as a string
 * @returns True if the date has passed, false otherwise
 */
export const isOverdue = (endTime: string): boolean => {
    return new Date(endTime) < new Date();
};

/**
 * Creates a human-readable short hash from a UUID
 * @param uuid - The UUID string to convert
 * @param prefix - The prefix to add (default: 'ID')
 * @returns Formatted hash string (e.g., "ID-550E84")
 */
export const readableHash = (uuid: string, prefix: string = 'ID'): string => {
    if (!uuid || typeof uuid !== 'string') {
        return 'ID-UNKNOWN';
    }

    try {
        const cleaned = uuid.replace(/-/g, '').toUpperCase();
        const short = cleaned.substring(0, 6);
        return `${prefix}-${short}`;
    } catch (error) {
        return 'ID-ERROR';
    }
};

/**
 * Decodes URL-encoded filename and cleans it up
 * @param fileName - The URL-encoded filename string
 * @returns Decoded and cleaned filename
 */
export const cleanFileName = (fileName: string): string => {
    if (!fileName || typeof fileName !== 'string') {
        return 'Unknown File';
    }

    try {
        const decoded = decodeURIComponent(fileName);
        return decoded;
    } catch (error) {
        return fileName
            .replace(/%20/g, ' ')
            .replace(/%21/g, '!')
            .replace(/%22/g, '"')
            .replace(/%23/g, '#')
            .replace(/%24/g, '$')
            .replace(/%25/g, '%')
            .replace(/%26/g, '&')
            .replace(/%27/g, "'")
            .replace(/%28/g, '(')
            .replace(/%29/g, ')')
            .replace(/%2A/g, '*')
            .replace(/%2B/g, '+')
            .replace(/%2C/g, ',')
            .replace(/%2D/g, '-')
            .replace(/%2E/g, '.')
            .replace(/%2F/g, '/')
            .replace(/%3A/g, ':')
            .replace(/%3B/g, ';')
            .replace(/%3C/g, '<')
            .replace(/%3D/g, '=')
            .replace(/%3E/g, '>')
            .replace(/%3F/g, '?')
            .replace(/%40/g, '@');
    }
};

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param url - The YouTube URL
 * @returns The video ID string or null if not found
 */
export const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtu\.be\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
};

/**
 * Converts YouTube URL to embed URL format
 * @param url - The YouTube URL
 * @returns The embed URL or original URL if conversion fails
 */
export const getYoutubeEmbedUrl = (url: string): string => {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
};

/**
 * Calculates the number of days remaining until end date with precise time handling
 * @param endDate - The end date as a string
 * @returns Number of days remaining (can be negative for past dates)
 */
export const calculateDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();

    end.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Generates human-readable text for days remaining until end date
 * @param endDate - The end date as a string
 * @returns Descriptive text about the remaining time
 */
export const getDaysRemainingText = (endDate: string): string => {
    const daysRemaining = calculateDaysRemaining(endDate);

    if (daysRemaining <= 0) {
        return "Expired";
    } else if (daysRemaining === 1) {
        return "Due Today";
    } else if (daysRemaining === 2) {
        return "Due Tomorrow";
    } else if (daysRemaining <= 7) {
        return `Due in ${daysRemaining} days`;
    } else if (daysRemaining <= 30) {
        return `Due in ${daysRemaining} days`;
    } else {
        const weeks = Math.floor(daysRemaining / 7);
        if (weeks < 4) {
            return `Due in ${weeks} week${weeks > 1 ? 's' : ''}`;
        } else {
            const months = Math.floor(daysRemaining / 30);
            return `Due in ${months} month${months > 1 ? 's' : ''}`;
        }
    }
};

/**
 * Interface for duration format breakdown
 */
export interface DurationFormat {
    hours: number;
    minutes: number;
    seconds: number;
    totalMinutes: number;
}

/**
 * Converts total seconds into hours, minutes, and seconds breakdown
 * @param totalSeconds - Total seconds to convert
 * @returns Object with time breakdown
 */
export const convertSecondsToTime = (totalSeconds: number): DurationFormat => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);

    return {
        hours,
        minutes,
        seconds,
        totalMinutes
    };
};

/**
 * Formats duration in seconds to human-readable string
 * @param totalSeconds - Total seconds to format
 * @param showSeconds - Whether to include seconds in output (default: false)
 * @returns Formatted duration string
 */
export const formatDuration = (totalSeconds: number, showSeconds: boolean = false): string => {
    const { hours, minutes, seconds } = convertSecondsToTime(totalSeconds);

    if (hours > 0) {
        if (showSeconds) {
            return `${hours}h ${minutes}m ${seconds}s`;
        }
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        if (showSeconds) {
            return `${minutes}m ${seconds}s`;
        }
        return `${minutes}m`;
    } else {
        return `${seconds}s`;
    }
};
