import { querySelectorAll } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';

export class SmoothScroll {
  private scrollLinks: HTMLAnchorElement[];
  private options: ScrollIntoViewOptions;
  private excludeSelectors: string[];

  constructor(
    selector: string = 'a[href^="#"]', 
    options: ScrollIntoViewOptions = {},
    excludeSelectors: string[] = ['.header__submenu-trigger', '.footer-desc__link[data-submenu-trigger]']
  ) {
    this.excludeSelectors = excludeSelectors;
    this.scrollLinks = this.filterLinks(querySelectorAll(selector));
    this.options = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    };

    this.init();
  }

  private filterLinks(links: NodeListOf<HTMLAnchorElement>): HTMLAnchorElement[] {
    return Array.from(links).filter(link => {
      return !this.excludeSelectors.some(excludeSelector => 
        link.matches(excludeSelector)
      );
    });
  }

  private init(): void {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.scrollLinks.forEach(link => {
      addEventListener(link, 'click', this.handleClick.bind(this));
    });
  }

  private handleClick(event: Event): void {
    event.preventDefault();
    
    const link = event.currentTarget as HTMLAnchorElement;
    const href = link.getAttribute('href');
    
    if (!href) return;

    // トップへ戻る場合（#のみ、または#topなど）
    if (href === '#' || href === '#top') {
      this.scrollToTop();
      return;
    }

    // ページ内リンクの場合
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      this.scrollToElement(targetElement);
    }
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: this.options.behavior as ScrollBehavior
    });
  }

  private scrollToElement(element: HTMLElement): void {
    element.scrollIntoView(this.options);
  }

  // 公開メソッド：外部から特定の要素にスクロール
  public scrollTo(target: string | HTMLElement): void {
    if (typeof target === 'string') {
      if (target === '#' || target === '#top') {
        this.scrollToTop();
        return;
      }
      
      const targetId = target.replace('#', '');
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        this.scrollToElement(targetElement);
      }
    } else {
      this.scrollToElement(target);
    }
  }

  // 公開メソッド：オプションを更新
  public updateOptions(newOptions: Partial<ScrollIntoViewOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
}