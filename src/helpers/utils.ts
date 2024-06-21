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

function deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

function hasDuplicateObjects(arr: any[]): boolean {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (deepEqual(arr[i], arr[j])) {
                return true;
            }
        }
    }
    return false;
}

export const Utils = {
    debounce,
    deepEqual,
    hasDuplicateObjects,
};
