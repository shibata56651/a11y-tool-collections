export function querySelector(selector) {
    return document.querySelector(selector);
}
export function querySelectorAll(selector) {
    return document.querySelectorAll(selector);
}
export function getElementById(id) {
    return document.getElementById(id);
}
export function createElement(tagName, attributes, textContent) {
    const element = document.createElement(tagName);
    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    if (textContent) {
        element.textContent = textContent;
    }
    return element;
}
export function addClass(element, ...classNames) {
    element.classList.add(...classNames);
}
export function removeClass(element, ...classNames) {
    element.classList.remove(...classNames);
}
export function toggleClass(element, className, force) {
    return element.classList.toggle(className, force);
}
export function hasClass(element, className) {
    return element.classList.contains(className);
}
