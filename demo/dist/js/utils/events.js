export function addEventListener(element, type, listener, options) {
    element.addEventListener(type, listener, options);
}
export function removeEventListener(element, type, listener, options) {
    element.removeEventListener(type, listener, options);
}
export function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => func(...args), delay);
    };
}
export function throttle(func, delay) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, delay);
        }
    };
}
