export function querySelector<T extends Element = Element>(selector: string): T | null {
  return document.querySelector(selector) as T | null;
}

export function querySelectorAll<T extends Element = Element>(selector: string): NodeListOf<T> {
  return document.querySelectorAll(selector) as NodeListOf<T>;
}

export function getElementById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attributes?: Record<string, string>,
  textContent?: string,
): HTMLElementTagNameMap[K] {
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

export function addClass(element: Element, ...classNames: string[]): void {
  element.classList.add(...classNames);
}

export function removeClass(element: Element, ...classNames: string[]): void {
  element.classList.remove(...classNames);
}

export function toggleClass(element: Element, className: string, force?: boolean): boolean {
  return element.classList.toggle(className, force);
}

export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}
