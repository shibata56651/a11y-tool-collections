import { addClass, querySelector, removeClass } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';

export class LeadMore {
  private element: HTMLElement;
  private toggleButton!: HTMLElement;
  private content!: HTMLElement;
  private toggleText!: HTMLElement;
  private isExpanded: boolean = false;
  private animationDuration: number = 300;

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
    const toggle = this.element.querySelector('.js-lead-more__toggle');
    const content = this.element.querySelector('.js-lead-more__content');
    const toggleText = this.element.querySelector('.js-lead-more__toggle-text');

    if (!toggle || !content || !toggleText) {
      throw new Error('Required lead-more elements not found');
    }

    this.toggleButton = toggle as HTMLElement;
    this.content = content as HTMLElement;
    this.toggleText = toggleText as HTMLElement;
  }

  private setInitialState(): void {
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.toggleButton.setAttribute('tabindex', '0');
    this.toggleButton.setAttribute('role', 'button');
    
    this.content.setAttribute('aria-hidden', 'true');
    this.content.setAttribute('role', 'region');
    
    if (!this.content.id) {
      this.content.id = `lead-more-content-${Date.now()}`;
    }
    if (!this.toggleButton.getAttribute('aria-controls')) {
      this.toggleButton.setAttribute('aria-controls', this.content.id);
    }
    
    this.isExpanded = false;
  }

  private bindEvents(): void {
    addEventListener(this.toggleButton, 'click', this.handleToggleClick.bind(this));
    addEventListener(this.toggleButton, 'keydown', this.handleKeydown.bind(this));
    addEventListener(window, 'resize', this.handleResize.bind(this));
  }

  private handleToggleClick(event: Event): void {
    event.preventDefault();
    this.toggleAccordion();
  }

  private handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleAccordion();
        break;
      case 'Escape':
        if (this.isExpanded) {
          event.preventDefault();
          this.collapse();
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.handleArrowNavigation(event.key === 'ArrowDown' ? 'next' : 'prev');
        break;
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
    addClass(this.element, 'js-lead-more--expanded');
    this.toggleText.textContent = this.toggleText.getAttribute('data-text-expanded') || '閉じる';
    
    this.animateExpansion();
    
    setTimeout(() => {
      const firstFocusableElement = this.content.querySelector('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      if (firstFocusableElement && window.getComputedStyle(firstFocusableElement).display !== 'none') {
        this.announceChange(`詳細コンテンツが展開されました。${firstFocusableElement.textContent?.slice(0, 50) || ''}にフォーカスが移動します。`);
      } else {
        this.announceChange('詳細コンテンツが展開されました');
      }
    }, this.animationDuration + 50);
  }

  private collapse(): void {
    this.isExpanded = false;
    this.toggleButton.setAttribute('aria-expanded', 'false');
    removeClass(this.element, 'js-lead-more--expanded');
    this.toggleText.textContent = this.toggleText.getAttribute('data-text-collapsed') || '詳しくみる';
    
    this.animateCollapse();
    this.announceChange('コンテンツが閉じられました');
  }


  private animateExpansion(): void {
    const initialHeight = this.content.offsetHeight;
    this.content.style.maxHeight = 'none';
    const targetHeight = this.content.scrollHeight;
    this.content.style.maxHeight = `${initialHeight}px`;
    
    requestAnimationFrame(() => {
      this.content.style.transition = `max-height ${this.animationDuration}ms ease-out, opacity ${this.animationDuration}ms ease-out`;
      this.content.style.maxHeight = `${targetHeight}px`;
      this.content.style.opacity = '1';
    });
  }

  private animateCollapse(): void {
    const currentHeight = this.content.scrollHeight;
    const limitedHeight = window.innerWidth <= 768 ? 250 : 300;
    
    this.content.style.transition = `max-height ${this.animationDuration}ms ease-out, opacity ${this.animationDuration}ms ease-out`;
    this.content.style.maxHeight = `${currentHeight}px`;
    
    requestAnimationFrame(() => {
      this.content.style.maxHeight = `${limitedHeight}px`;
      this.content.style.opacity = '1';
      
      setTimeout(() => {
        this.content.setAttribute('aria-hidden', 'true');
        this.adjustScrollPosition();
      }, this.animationDuration);
    });
  }

  private adjustScrollPosition(): void {
    const elementRect = this.element.getBoundingClientRect();
    const elementTop = elementRect.top + window.scrollY;
    const viewportHeight = window.innerHeight;
    const elementHeight = elementRect.height;
    
    if (elementTop < window.scrollY || elementTop + elementHeight > window.scrollY + viewportHeight) {
      const targetScrollPosition = Math.max(0, elementTop - 20);
      
      window.scrollTo({
        top: targetScrollPosition,
        behavior: 'smooth'
      });
    }
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

  private handleResize(): void {
    if (this.isExpanded) {
      this.content.style.maxHeight = 'none';
      const newHeight = this.content.scrollHeight;
      this.content.style.maxHeight = `${newHeight}px`;
    }
  }

  private handleArrowNavigation(direction: 'next' | 'prev'): void {
    const allAccordions = Array.from(document.querySelectorAll('.js-lead-more__toggle'));
    const currentIndex = allAccordions.indexOf(this.toggleButton);
    
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'next' 
      ? (currentIndex + 1) % allAccordions.length
      : (currentIndex - 1 + allAccordions.length) % allAccordions.length;
    
    const targetElement = allAccordions[targetIndex] as HTMLElement;
    if (targetElement) {
      targetElement.focus();
    }
  }

  public destroy(): void {
    // イベントリスナーの削除は使用しているユーティリティ次第で実装
    // 必要に応じてremoveEventListenerを実装
  }
}

export function initLeadMores(): void {
  const leadMores = document.querySelectorAll('.js-lead-more');
  leadMores.forEach((leadMore, index) => {
    try {
      if (!leadMore.id) {
        leadMore.id = `lead-more-${index + 1}`;
      }
      new LeadMore(`#${leadMore.id}`);
    } catch (error) {
      console.warn(`Failed to initialize lead-more ${index + 1}:`, error);
    }
  });
}