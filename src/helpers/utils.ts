const debounce = (func: (args_0: any) => void, ms = 100) => {
    let timer: NodeJS.Timeout | undefined;
    return function (event: Event) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, ms, event);
    };
};

export const Utils = {
    debounce,
};
