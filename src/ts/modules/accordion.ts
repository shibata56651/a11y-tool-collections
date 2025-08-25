import { addClass, querySelector, removeClass } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';

export class Accordion {
  private element: HTMLElement;
  private toggleButton!: HTMLElement;
  private content!: HTMLElement;
  private toggleText!: HTMLElement;
  private isExpanded: boolean = false;

  constructor(selector: string) {
    const element = querySelector(selector);
    if (!element) {
      throw new Error(`Accordion element not found: ${selector}`);
    }
    this.element = element as HTMLElement;
    this.init();
  }

  private init(): void {
    this.findElements();
    this.setInitialState();
    this.bindEvents();
  }

  private findElements(): void {
    const toggle = this.element.querySelector('.accordion__toggle');
    const content = this.element.querySelector('.accordion__content');
    const toggleText = this.element.querySelector('.accordion__toggle-text');

    if (!toggle || !content || !toggleText) {
      throw new Error('Required accordion elements not found');
    }

    this.toggleButton = toggle as HTMLElement;
    this.content = content as HTMLElement;
    this.toggleText = toggleText as HTMLElement;
  }

  private setInitialState(): void {
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.content.setAttribute('aria-hidden', 'true');
    this.isExpanded = false;
  }

  private bindEvents(): void {
    addEventListener(this.toggleButton, 'click', this.handleToggleClick.bind(this));
    addEventListener(this.toggleButton, 'keydown', this.handleKeydown.bind(this));
  }

  private handleToggleClick(event: Event): void {
    event.preventDefault();
    this.toggleAccordion();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleAccordion();
    }
  }

  private toggleAccordion(): void {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  private expand(): void {
    this.isExpanded = true;
    this.toggleButton.setAttribute('aria-expanded', 'true');
    this.content.setAttribute('aria-hidden', 'false');
    addClass(this.element, 'accordion--expanded');
    this.toggleText.textContent = this.toggleText.getAttribute('data-text-expanded') || '閉じる';
    
    this.announceChange('展開しました');
  }

  private collapse(): void {
    this.isExpanded = false;
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.content.setAttribute('aria-hidden', 'true');
    removeClass(this.element, 'accordion--expanded');
    this.toggleText.textContent = this.toggleText.getAttribute('data-text-collapsed') || '詳しくみる';
    
    this.announceChange('閉じました');
  }

  private announceChange(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    announcement.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;

    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  public isOpen(): boolean {
    return this.isExpanded;
  }

  public open(): void {
    if (!this.isExpanded) {
      this.expand();
    }
  }

  public close(): void {
    if (this.isExpanded) {
      this.collapse();
    }
  }
}

export function initAccordions(): void {
  const accordions = document.querySelectorAll('.accordion');
  accordions.forEach((accordion, index) => {
    try {
      if (!accordion.id) {
        accordion.id = `accordion-${index + 1}`;
      }
      new Accordion(`#${accordion.id}`);
    } catch (error) {
      console.warn(`Failed to initialize accordion ${index + 1}:`, error);
    }
  });
}