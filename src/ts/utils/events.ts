export type EventHandler<T extends Event = Event> = (event: T) => void;

export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: Element | Document | Window,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  element.addEventListener(type, listener as EventListener, options);
}

export function removeEventListener<K extends keyof HTMLElementEventMap>(
  element: Element | Document | Window,
  type: K,
  listener: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | EventListenerOptions,
): void {
  element.removeEventListener(type, listener as EventListener, options);
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, delay);
    }
  };
}
