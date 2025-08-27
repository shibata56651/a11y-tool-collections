import { addClass, querySelector, removeClass } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';

export class Accordion {
  private element: HTMLElement;
  private toggleButton!: HTMLElement;
  private content!: HTMLElement;
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
    const toggle = this.element.querySelector('.js-accordion__toggle');
    const content = this.element.querySelector('.js-accordion__content');

    if (!toggle || !content) {
      throw new Error('Required accordion elements not found');
    }

    this.toggleButton = toggle as HTMLElement;
    this.content = content as HTMLElement;
  }

  private setInitialState(): void {
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.content.setAttribute('aria-hidden', 'true');
    
    // aria-labelで開閉状態を示す
    const buttonText = this.toggleButton.textContent?.trim() || '';
    this.toggleButton.setAttribute('aria-label', `${buttonText} 折りたたみメニュー（閉じています）`);
    
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
    addClass(this.element, 'js-accordion--expanded');
    
    // aria-labelを更新
    const buttonText = this.toggleButton.textContent?.trim() || '';
    this.toggleButton.setAttribute('aria-label', `${buttonText} 折りたたみメニュー（開いています）`);
    
    // display:noneを解除してから高さを測定
    this.content.style.display = 'block';
    
    // CSS側で定義されたpadding値を復元
    this.content.style.paddingTop = '';
    this.content.style.paddingBottom = '';
    
    // 実際の高さを測定して設定
    this.setContentHeight();
    
    this.announceChange('展開しました');
  }

  private collapse(): void {
    this.isExpanded = false;
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.content.setAttribute('aria-hidden', 'true');
    removeClass(this.element, 'js-accordion--expanded');
    
    // aria-labelを更新
    const buttonText = this.toggleButton.textContent?.trim() || '';
    this.toggleButton.setAttribute('aria-label', `${buttonText} 折りたたみメニュー（閉じています）`);
    
    // CSS側から現在のpadding値を取得
    const computedStyle = getComputedStyle(this.content);
    const currentPaddingTop = computedStyle.paddingTop;
    const currentPaddingBottom = computedStyle.paddingBottom;
    
    // 現在の高さを取得してからアニメーション
    const currentHeight = this.content.scrollHeight;
    this.content.style.maxHeight = `${currentHeight}px`;
    this.content.style.paddingTop = currentPaddingTop;
    this.content.style.paddingBottom = currentPaddingBottom;
    
    // 強制的にリフローを発生させる
    this.content.offsetHeight;
    
    // 次のフレームで0に設定（アニメーション開始）
    requestAnimationFrame(() => {
      this.content.style.maxHeight = '0px';
      this.content.style.paddingTop = '0px';
      this.content.style.paddingBottom = '0px';
      
      // アニメーション終了後にdisplay: noneを設定
      setTimeout(() => {
        if (!this.isExpanded) { // 途中で開かれていない場合のみ
          this.content.style.display = 'none';
        }
      }, 300); // transitionの時間と合わせる
    });
    
    this.announceChange('閉じました');
  }

  private setContentHeight(): void {
    // 元のスタイルを保存
    const originalDisplay = this.content.style.display;
    const originalVisibility = this.content.style.visibility;
    const originalPosition = this.content.style.position;
    const originalMaxHeight = this.content.style.maxHeight;
    
    // 一時的にdisplay:blockで測定（ちらつき防止のため非表示）
    this.content.style.display = 'block';
    this.content.style.visibility = 'hidden';
    this.content.style.position = 'absolute';
    this.content.style.maxHeight = 'auto';
    
    // 実際の高さを測定
    const height = this.content.scrollHeight;
    
    // 元のスタイルに戻す
    this.content.style.display = originalDisplay;
    this.content.style.visibility = originalVisibility;
    this.content.style.position = originalPosition;
    this.content.style.maxHeight = originalMaxHeight;
    
    // アニメーション開始：0から実際の高さへ
    this.content.style.maxHeight = '0px';
    
    // 次のフレームで実際の高さを設定（アニメーション効果）
    requestAnimationFrame(() => {
      this.content.style.maxHeight = `${height}px`;
    });
  }

  private handleResize(): void {
    // ウィンドウリサイズ時に高さを再計算（展開時のみ）
    if (this.isExpanded) {
      this.setContentHeight();
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

  public destroy(): void {
    // イベントリスナーの削除は使用しているユーティリティ次第で実装
    // 必要に応じてremoveEventListenerを実装
  }
}

export function initAccordions(): void {
  const accordions = document.querySelectorAll('.js-accordion');
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