import { querySelector, querySelectorAll } from '../utils/dom.js';
import { addEventListener, debounce } from '../utils/events.js';

export class Header {
  private burger: HTMLButtonElement | null;
  private nav: HTMLElement | null;
  private submenuTriggers: NodeListOf<HTMLAnchorElement>;
  private overlay: HTMLElement | null;
  private isDesktop: boolean;
  private showTimeouts: Map<HTMLElement, number> = new Map();
  private hideTimeouts: Map<HTMLElement, number> = new Map();

  constructor() {
    this.burger = querySelector('.header__burger') as HTMLButtonElement;
    this.nav = querySelector('.header__nav');
    this.submenuTriggers = querySelectorAll('.header__submenu-trigger');
    this.overlay = querySelector('.header__overlay');
    this.isDesktop = window.innerWidth > 768;

    this.init();
    this.initializeSubmenuFocus();
  }

  private init(): void {
    this.setupEventListeners();
    this.handleResize();
  }

  private initializeSubmenuFocus(): void {
    // 初期状態で全てのサブメニューリンクをフォーカス順序から除外
    this.submenuTriggers.forEach(trigger => {
      const submenuId = trigger.getAttribute('aria-controls');
      const submenu = submenuId ? querySelector(`#${submenuId}`) : null;
      
      if (submenu) {
        const submenuLinks = submenu.querySelectorAll('.header__submenu-link');
        submenuLinks.forEach(link => {
          (link as HTMLElement).setAttribute('tabindex', '-1');
        });
      }
    });
  }

  private setupEventListeners(): void {
    // ハンバーガーメニュー
    if (this.burger && this.nav) {
      addEventListener(this.burger, 'click', this.toggleMobileMenu.bind(this));
    }

    // サブメニュー
    this.submenuTriggers.forEach(trigger => {
      addEventListener(trigger, 'click', this.toggleSubmenu.bind(this));
      addEventListener(trigger, 'keydown', this.handleSubmenuKeydown.bind(this));
      addEventListener(trigger, 'focus', this.handleSubmenuFocus.bind(this));

      // PC用マウスイベント（チラつき防止のため遅延処理を追加）
      const parentItem = trigger.closest('.header__main-item--has-submenu');
      if (parentItem) {
        addEventListener(parentItem, 'mouseenter', this.handleMouseEnter.bind(this, trigger));
        addEventListener(parentItem, 'mouseleave', this.handleMouseLeave.bind(this, trigger));
        
        // サブメニュー自体にもマウスイベントを追加
        const submenuId = trigger.getAttribute('aria-controls');
        const submenu = submenuId ? querySelector(`#${submenuId}`) : null;
        if (submenu) {
          addEventListener(submenu, 'mouseenter', this.handleSubmenuMouseEnter.bind(this, trigger));
          addEventListener(submenu, 'mouseleave', this.handleSubmenuMouseLeave.bind(this, trigger));
          
          // サブメニュー内のリンクにキーボードイベントを追加
          const submenuLinks = submenu.querySelectorAll('.header__submenu-link');
          submenuLinks.forEach(link => {
            addEventListener(link, 'keydown', this.handleSubmenuLinkKeydown.bind(this, trigger));
          });
        }
      }
    });

    // オーバーレイクリック
    if (this.overlay) {
      addEventListener(this.overlay, 'click', this.closeAllMenus.bind(this));
    }

    // ESCキーでメニューを閉じる
    addEventListener(document, 'keydown', this.handleEscapeKey.bind(this));

    // リサイズ対応
    addEventListener(window, 'resize', debounce(this.handleResize.bind(this), 250));

    // 外側クリックでサブメニューを閉じる
    addEventListener(document, 'click', this.handleOutsideClick.bind(this));
  }

  private toggleMobileMenu(): void {
    if (!this.burger || !this.nav) {
      return;
    }

    const isExpanded = this.burger.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;

    this.burger.setAttribute('aria-expanded', String(newState));
    this.nav.setAttribute('aria-hidden', String(!newState));

    if (newState) {
      this.burger.setAttribute('aria-label', 'メニューを閉じる');
      document.body.classList.add('mobile-menu-open');
      // フォーカスを最初のメニューアイテムに移動
      const firstLink = this.nav.querySelector('.header__main-link') as HTMLElement;
      if (firstLink) {
        firstLink.focus();
      }
    } else {
      this.burger.setAttribute('aria-label', 'メニューを開く');
      document.body.classList.remove('mobile-menu-open');
      this.burger.focus();
    }
  }

  private toggleSubmenu(event: Event): void {
    const trigger = event.target as HTMLAnchorElement;
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    if (this.isDesktop) {
      // PC用：ページ遷移を許可（サブメニューは表示しない）
      return;
    } else {
      // SP用：ページ遷移を阻止してアコーディオン動作
      event.preventDefault();
      
      const submenuId = trigger.getAttribute('aria-controls');
      const submenu = submenuId ? querySelector(`#${submenuId}`) : null;

      if (submenu) {
        const newState = !isExpanded;
        trigger.setAttribute('aria-expanded', String(newState));
        submenu.setAttribute('aria-hidden', String(!newState));
      }
    }
  }

  private showSubmenu(trigger: HTMLAnchorElement): void {
    if (!this.isDesktop) return;

    // 他のサブメニューを閉じる
    this.submenuTriggers.forEach(otherTrigger => {
      if (otherTrigger !== trigger) {
        this.hideSubmenu(otherTrigger);
      }
    });

    const submenuId = trigger.getAttribute('aria-controls');
    const submenu = submenuId ? querySelector(`#${submenuId}`) : null;

    if (submenu) {
      trigger.setAttribute('aria-expanded', 'true');
      submenu.setAttribute('aria-hidden', 'false');
      
      // サブメニューのリンクはtabindex="-1"を維持（矢印キーのみでの操作）
      const submenuLinks = submenu.querySelectorAll('.header__submenu-link');
      submenuLinks.forEach(link => {
        (link as HTMLElement).setAttribute('tabindex', '-1');
      });

      if (this.overlay) {
        this.overlay.classList.add('is-active');
      }
    }
  }

  private hideSubmenu(trigger: HTMLAnchorElement): void {
    if (!this.isDesktop) return;

    const submenuId = trigger.getAttribute('aria-controls');
    const submenu = submenuId ? querySelector(`#${submenuId}`) : null;

    if (submenu) {
      trigger.setAttribute('aria-expanded', 'false');
      submenu.setAttribute('aria-hidden', 'true');
      
      // サブメニューのリンクをtabindexで無効化（フォーカス順序から除外）
      const submenuLinks = submenu.querySelectorAll('.header__submenu-link');
      submenuLinks.forEach(link => {
        (link as HTMLElement).setAttribute('tabindex', '-1');
      });

      if (this.overlay) {
        this.overlay.classList.remove('is-active');
      }
    }
  }

  // 0.7秒遅延でドロップダウンを開くマウスイベントハンドラー
  private handleMouseEnter(trigger: HTMLAnchorElement): void {
    if (!this.isDesktop) return;

    const parentItem = trigger.closest('.header__main-item--has-submenu') as HTMLElement;
    if (!parentItem) return;

    // 既存のhideタイマーをクリア
    const hideTimeout = this.hideTimeouts.get(parentItem);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      this.hideTimeouts.delete(parentItem);
    }

    // 既存のshowタイマーがある場合はそのまま継続（重複防止）
    if (this.showTimeouts.has(parentItem)) {
      return;
    }

    // 0.7秒後に表示
    const showTimeout = window.setTimeout(() => {
      this.showSubmenu(trigger);
      this.showTimeouts.delete(parentItem);
    }, 500);

    this.showTimeouts.set(parentItem, showTimeout);
  }

  private handleMouseLeave(trigger: HTMLAnchorElement): void {
    if (!this.isDesktop) return;

    const parentItem = trigger.closest('.header__main-item--has-submenu') as HTMLElement;
    if (!parentItem) return;

    // showタイマーをクリア（まだ表示されていない場合）
    const showTimeout = this.showTimeouts.get(parentItem);
    if (showTimeout) {
      clearTimeout(showTimeout);
      this.showTimeouts.delete(parentItem);
      return; // まだ表示されていないので、非表示処理は不要
    }

    // 既に表示されている場合は即座に非表示
    this.hideSubmenu(trigger);
  }

  // サブメニューのマウスイベントハンドラー
  private handleSubmenuMouseEnter(trigger: HTMLAnchorElement): void {
    if (!this.isDesktop) return;

    const parentItem = trigger.closest('.header__main-item--has-submenu') as HTMLElement;
    if (!parentItem) return;

    // hideタイマーをクリア（サブメニューにマウスが入った場合）
    const hideTimeout = this.hideTimeouts.get(parentItem);
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      this.hideTimeouts.delete(parentItem);
    }
  }

  private handleSubmenuMouseLeave(trigger: HTMLAnchorElement): void {
    if (!this.isDesktop) return;

    const parentItem = trigger.closest('.header__main-item--has-submenu') as HTMLElement;
    if (!parentItem) return;

    // サブメニューから離れた場合は即座に非表示
    this.hideSubmenu(trigger);
  }

  private handleSubmenuFocus(event: FocusEvent): void {
    if (!this.isDesktop) return;
    
    const trigger = event.target as HTMLAnchorElement;
    this.showSubmenu(trigger);
  }

  private handleSubmenuKeydown(event: KeyboardEvent): void {
    const trigger = event.target as HTMLAnchorElement;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleSubmenu(event);
        break;
      case 'Escape':
        if (this.isDesktop) {
          this.hideSubmenu(trigger);
          trigger.focus();
        } else {
          this.closeAllMenus();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (this.isDesktop) {
          this.showSubmenu(trigger);
          this.focusFirstSubmenuLink(trigger);
        } else {
          this.focusNextMenuItem(event.target as HTMLElement);
        }
        break;
      case 'ArrowUp':
        if (!this.isDesktop) {
          event.preventDefault();
          this.focusPreviousMenuItem(event.target as HTMLElement);
        }
        break;
      case 'Tab':
        if (this.isDesktop) {
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
          if (isExpanded) {
            // サブメニューが開いている場合はサブメニューを閉じて次/前のメインメニューへ
            event.preventDefault();
            this.hideSubmenu(trigger);
            if (event.shiftKey) {
              this.focusPreviousMainMenuItem(trigger);
            } else {
              this.focusNextMainMenuItem(trigger);
            }
          }
        }
        break;
    }
  }

  private focusFirstSubmenuLink(trigger: HTMLAnchorElement): void {
    const submenuId = trigger.getAttribute('aria-controls');
    const submenu = submenuId ? querySelector(`#${submenuId}`) : null;

    if (submenu) {
      const firstLink = submenu.querySelector('.header__submenu-link') as HTMLElement;
      if (firstLink) {
        firstLink.focus();
      }
    }
  }

  private focusNextMenuItem(currentElement: HTMLElement): void {
    const menuItems = Array.from(querySelectorAll('.header__main-link, .header__submenu-link'));
    const currentIndex = menuItems.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % menuItems.length;
    (menuItems[nextIndex] as HTMLElement).focus();
  }

  private focusPreviousMenuItem(currentElement: HTMLElement): void {
    const menuItems = Array.from(querySelectorAll('.header__main-link, .header__submenu-link'));
    const currentIndex = menuItems.indexOf(currentElement);
    const previousIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
    (menuItems[previousIndex] as HTMLElement).focus();
  }

  private focusNextMainMenuItem(currentTrigger: HTMLAnchorElement): void {
    const allMainLinks = Array.from(querySelectorAll('.header__main-link'));
    const currentIndex = allMainLinks.indexOf(currentTrigger);
    const nextIndex = (currentIndex + 1) % allMainLinks.length;
    (allMainLinks[nextIndex] as HTMLElement).focus();
  }

  private focusPreviousMainMenuItem(currentTrigger: HTMLAnchorElement): void {
    const allMainLinks = Array.from(querySelectorAll('.header__main-link'));
    const currentIndex = allMainLinks.indexOf(currentTrigger);
    const previousIndex = currentIndex === 0 ? allMainLinks.length - 1 : currentIndex - 1;
    (allMainLinks[previousIndex] as HTMLElement).focus();
  }

  private handleSubmenuLinkKeydown(trigger: HTMLAnchorElement, event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.hideSubmenu(trigger);
        trigger.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousSubmenuLink(trigger, target);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextSubmenuLink(trigger, target);
        break;
      case 'Tab':
        if (this.isDesktop) {
          const submenuId = trigger.getAttribute('aria-controls');
          const submenu = submenuId ? querySelector(`#${submenuId}`) : null;
          
          if (submenu) {
            const links = Array.from(submenu.querySelectorAll('.header__submenu-link'));
            const currentIndex = links.indexOf(target);
            
            if (event.shiftKey) {
              // Shift+Tab: 前の要素へ
              if (currentIndex === 0) {
                // 最初のリンクの場合、トリガーに戻る
                event.preventDefault();
                trigger.focus();
              } else {
                // 前のサブメニューリンクへ（デフォルト動作を許可）
              }
            } else {
              // 通常のTab: サブメニュー内のどこからでも次のヘッダーメニューへ
              event.preventDefault();
              this.hideSubmenu(trigger);
              this.focusNextMainMenuItem(trigger);
            }
          }
        }
        break;
    }
  }

  private focusPreviousSubmenuLink(trigger: HTMLAnchorElement, currentLink: HTMLElement): void {
    const submenuId = trigger.getAttribute('aria-controls');
    const submenu = submenuId ? querySelector(`#${submenuId}`) : null;
    
    if (submenu) {
      const links = Array.from(submenu.querySelectorAll('.header__submenu-link'));
      const currentIndex = links.indexOf(currentLink);
      
      if (currentIndex === 0) {
        // 最初のリンクの場合、トリガーに戻る
        trigger.focus();
      } else {
        // 前のリンクにフォーカス
        (links[currentIndex - 1] as HTMLElement).focus();
      }
    }
  }

  private focusNextSubmenuLink(trigger: HTMLAnchorElement, currentLink: HTMLElement): void {
    const submenuId = trigger.getAttribute('aria-controls');
    const submenu = submenuId ? querySelector(`#${submenuId}`) : null;
    
    if (submenu) {
      const links = Array.from(submenu.querySelectorAll('.header__submenu-link'));
      const currentIndex = links.indexOf(currentLink);
      
      if (currentIndex === links.length - 1) {
        // 最後のリンクの場合、次のメインメニューに移動
        this.hideSubmenu(trigger);
        this.focusNextMainMenuItem(trigger);
      } else {
        // 次のリンクにフォーカス
        (links[currentIndex + 1] as HTMLElement).focus();
      }
    }
  }

  private closeAllSubmenus(): void {
    // 全ての表示タイマーをクリア
    this.showTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.showTimeouts.clear();
    
    // 全ての非表示タイマーをクリア
    this.hideTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.hideTimeouts.clear();
    
    // 全てのサブメニューを非表示
    this.submenuTriggers.forEach(trigger => {
      this.hideSubmenu(trigger);
    });
  }

  private closeAllMenus(): void {
    this.closeAllSubmenus();

    if (this.burger && this.nav) {
      this.burger.setAttribute('aria-expanded', 'false');
      this.nav.setAttribute('aria-hidden', 'true');
      this.burger.setAttribute('aria-label', 'メニューを開く');
      document.body.classList.remove('mobile-menu-open');
    }
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeAllMenus();
    }
  }

  private handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;

    // ヘッダー内のクリックは無視
    if (target.closest('.header')) {
      return;
    }

    this.closeAllSubmenus();
  }

  private handleResize(): void {
    const wasDesktop = this.isDesktop;
    this.isDesktop = window.innerWidth > 768;

    // デスクトップ→モバイル
    if (wasDesktop && !this.isDesktop) {
      this.closeAllSubmenus();
    }

    // モバイル→デスクトップ
    if (!wasDesktop && this.isDesktop) {
      this.closeAllMenus();
    }
  }

  // 公開メソッド
  public destroy(): void {
    // 全てのタイマーをクリア
    this.showTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.showTimeouts.clear();
    
    this.hideTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.hideTimeouts.clear();
  }
}