import { querySelectorAll } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';

export class Footer {
  private submenuTriggers: NodeListOf<HTMLAnchorElement>;
  private isDesktop: boolean;

  constructor() {
    this.submenuTriggers = querySelectorAll('.footer-desc__link[data-submenu-trigger]');
    this.isDesktop = window.innerWidth > 768;

    this.init();
  }

  private init(): void {
    this.setupEventListeners();
    this.handleResize();
  }

  private setupEventListeners(): void {
    // フッターのアコーディオン
    this.submenuTriggers.forEach(trigger => {
      addEventListener(trigger, 'click', this.toggleSubmenu.bind(this));
    });

    // リサイズ対応
    addEventListener(window, 'resize', this.handleResize.bind(this));
  }

  private toggleSubmenu(event: Event): void {
    const trigger = event.currentTarget as HTMLAnchorElement;
    
    // SP時のみアコーディオン動作
    if (!this.isDesktop) {
      event.preventDefault();
      event.stopPropagation();
      
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const dtElement = trigger.parentElement as HTMLElement;
      const submenu = dtElement?.nextElementSibling as HTMLElement;

      if (submenu) {
        const newState = !isExpanded;
        trigger.setAttribute('aria-expanded', String(newState));
        submenu.setAttribute('aria-hidden', String(!newState));
      }
    }
  }

  private handleResize(): void {
    this.isDesktop = window.innerWidth > 768;
    
    // デスクトップに切り替わった時は全て開いた状態にリセット
    if (this.isDesktop) {
      this.submenuTriggers.forEach(trigger => {
        const dtElement = trigger.parentElement as HTMLElement;
        const submenu = dtElement?.nextElementSibling as HTMLElement;
        if (submenu) {
          trigger.setAttribute('aria-expanded', 'false');
          submenu.setAttribute('aria-hidden', 'false');
        }
      });
    } else {
      // SP時は全て閉じた状態にリセット
      this.submenuTriggers.forEach(trigger => {
        const dtElement = trigger.parentElement as HTMLElement;
        const submenu = dtElement?.nextElementSibling as HTMLElement;
        if (submenu) {
          trigger.setAttribute('aria-expanded', 'false');
          submenu.setAttribute('aria-hidden', 'true');
        }
      });
    }
  }
}