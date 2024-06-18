function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout | null = null;

    return function (this: any, ...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func.apply(this, args);
        };

        if (timeout !== null) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait);
    } as T;
}

export const Utils = {
    debounce,
};
