import { addClass, querySelector, removeClass } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';

export class Modal {
  private element: HTMLElement;
  private backdrop: HTMLElement | null = null;
  private isOpen: boolean = false;

  constructor(selector: string) {
    const element = querySelector(selector);
    if (!element) {
      throw new Error(`Modal element not found: ${selector}`);
    }
    this.element = element as HTMLElement;
    this.init();
  }

  private init(): void {
    this.createBackdrop();
    this.bindEvents();
  }

  private createBackdrop(): void {
    this.backdrop = document.createElement('div');
    addClass(this.backdrop, 'modal-backdrop');
    this.backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1050;
      display: none;
    `;
    document.body.appendChild(this.backdrop);
  }

  private bindEvents(): void {
    const closeButtons = this.element.querySelectorAll('[data-modal-close]');
    closeButtons.forEach((button) => {
      addEventListener(button, 'click', () => this.close());
    });

    if (this.backdrop) {
      addEventListener(this.backdrop, 'click', () => this.close());
    }

    addEventListener(document, 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  public open(): void {
    if (this.isOpen) return;

    this.isOpen = true;
    addClass(this.element, 'modal--active');
    if (this.backdrop) {
      this.backdrop.style.display = 'block';
    }
    addClass(document.body, 'modal-open');
  }

  public close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    removeClass(this.element, 'modal--active');
    if (this.backdrop) {
      this.backdrop.style.display = 'none';
    }
    removeClass(document.body, 'modal-open');
  }

  public toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  public isActive(): boolean {
    return this.isOpen;
  }
}
