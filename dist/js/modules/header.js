import { querySelector, querySelectorAll } from '../utils/dom.js';
import { addEventListener, debounce } from '../utils/events.js';
export class Header {
    constructor() {
        this.showTimeouts = new Map();
        this.hideTimeouts = new Map();
        this.burger = querySelector('.header__burger');
        this.nav = querySelector('.header__nav');
        this.submenuTriggers = querySelectorAll('.header__submenu-trigger');
        this.overlay = querySelector('.header__overlay');
        this.isDesktop = window.innerWidth > 768;
        this.init();
    }
    init() {
        this.setupEventListeners();
        this.handleResize();
    }
    setupEventListeners() {
        if (this.burger && this.nav) {
            addEventListener(this.burger, 'click', this.toggleMobileMenu.bind(this));
        }
        this.submenuTriggers.forEach(trigger => {
            addEventListener(trigger, 'click', this.toggleSubmenu.bind(this));
            addEventListener(trigger, 'keydown', this.handleSubmenuKeydown.bind(this));
            const parentItem = trigger.closest('.header__main-item--has-submenu');
            if (parentItem) {
                addEventListener(parentItem, 'mouseenter', this.handleMouseEnter.bind(this, trigger));
                addEventListener(parentItem, 'mouseleave', this.handleMouseLeave.bind(this, trigger));
                const submenuId = trigger.getAttribute('aria-controls');
                const submenu = submenuId ? querySelector(`#${submenuId}`) : null;
                if (submenu) {
                    addEventListener(submenu, 'mouseenter', this.handleSubmenuMouseEnter.bind(this, trigger));
                    addEventListener(submenu, 'mouseleave', this.handleSubmenuMouseLeave.bind(this, trigger));
                }
            }
        });
        if (this.overlay) {
            addEventListener(this.overlay, 'click', this.closeAllMenus.bind(this));
        }
        addEventListener(document, 'keydown', this.handleEscapeKey.bind(this));
        addEventListener(window, 'resize', debounce(this.handleResize.bind(this), 250));
        addEventListener(document, 'click', this.handleOutsideClick.bind(this));
    }
    toggleMobileMenu() {
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
            const firstLink = this.nav.querySelector('.header__main-link');
            if (firstLink) {
                firstLink.focus();
            }
        }
        else {
            this.burger.setAttribute('aria-label', 'メニューを開く');
            document.body.classList.remove('mobile-menu-open');
            this.burger.focus();
        }
    }
    toggleSubmenu(event) {
        const trigger = event.target;
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        if (this.isDesktop) {
            return;
        }
        else {
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
    showSubmenu(trigger) {
        if (!this.isDesktop)
            return;
        const submenuId = trigger.getAttribute('aria-controls');
        const submenu = submenuId ? querySelector(`#${submenuId}`) : null;
        if (submenu) {
            trigger.setAttribute('aria-expanded', 'true');
            submenu.setAttribute('aria-hidden', 'false');
            if (this.overlay) {
                this.overlay.classList.add('is-active');
            }
        }
    }
    hideSubmenu(trigger) {
        if (!this.isDesktop)
            return;
        const submenuId = trigger.getAttribute('aria-controls');
        const submenu = submenuId ? querySelector(`#${submenuId}`) : null;
        if (submenu) {
            trigger.setAttribute('aria-expanded', 'false');
            submenu.setAttribute('aria-hidden', 'true');
            if (this.overlay) {
                this.overlay.classList.remove('is-active');
            }
        }
    }
    handleMouseEnter(trigger) {
        if (!this.isDesktop)
            return;
        const parentItem = trigger.closest('.header__main-item--has-submenu');
        if (!parentItem)
            return;
        const hideTimeout = this.hideTimeouts.get(parentItem);
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            this.hideTimeouts.delete(parentItem);
        }
        if (this.showTimeouts.has(parentItem)) {
            return;
        }
        const showTimeout = window.setTimeout(() => {
            this.showSubmenu(trigger);
            this.showTimeouts.delete(parentItem);
        }, 500);
        this.showTimeouts.set(parentItem, showTimeout);
    }
    handleMouseLeave(trigger) {
        if (!this.isDesktop)
            return;
        const parentItem = trigger.closest('.header__main-item--has-submenu');
        if (!parentItem)
            return;
        const showTimeout = this.showTimeouts.get(parentItem);
        if (showTimeout) {
            clearTimeout(showTimeout);
            this.showTimeouts.delete(parentItem);
            return;
        }
        this.hideSubmenu(trigger);
    }
    handleSubmenuMouseEnter(trigger) {
        if (!this.isDesktop)
            return;
        const parentItem = trigger.closest('.header__main-item--has-submenu');
        if (!parentItem)
            return;
        const hideTimeout = this.hideTimeouts.get(parentItem);
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            this.hideTimeouts.delete(parentItem);
        }
    }
    handleSubmenuMouseLeave(trigger) {
        if (!this.isDesktop)
            return;
        const parentItem = trigger.closest('.header__main-item--has-submenu');
        if (!parentItem)
            return;
        this.hideSubmenu(trigger);
    }
    handleSubmenuKeydown(event) {
        const trigger = event.target;
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
                }
                else {
                    this.closeAllMenus();
                }
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (this.isDesktop) {
                    this.showSubmenu(trigger);
                    this.focusFirstSubmenuLink(trigger);
                }
                else {
                    this.focusNextMenuItem(event.target);
                }
                break;
            case 'ArrowUp':
                if (!this.isDesktop) {
                    event.preventDefault();
                    this.focusPreviousMenuItem(event.target);
                }
                break;
        }
    }
    focusFirstSubmenuLink(trigger) {
        const submenuId = trigger.getAttribute('aria-controls');
        const submenu = submenuId ? querySelector(`#${submenuId}`) : null;
        if (submenu) {
            const firstLink = submenu.querySelector('.header__submenu-link');
            if (firstLink) {
                firstLink.focus();
            }
        }
    }
    focusNextMenuItem(currentElement) {
        const menuItems = Array.from(querySelectorAll('.header__main-link, .header__submenu-link'));
        const currentIndex = menuItems.indexOf(currentElement);
        const nextIndex = (currentIndex + 1) % menuItems.length;
        menuItems[nextIndex].focus();
    }
    focusPreviousMenuItem(currentElement) {
        const menuItems = Array.from(querySelectorAll('.header__main-link, .header__submenu-link'));
        const currentIndex = menuItems.indexOf(currentElement);
        const previousIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
        menuItems[previousIndex].focus();
    }
    closeAllSubmenus() {
        this.showTimeouts.forEach((timeout) => {
            clearTimeout(timeout);
        });
        this.showTimeouts.clear();
        this.hideTimeouts.forEach((timeout) => {
            clearTimeout(timeout);
        });
        this.hideTimeouts.clear();
        this.submenuTriggers.forEach(trigger => {
            this.hideSubmenu(trigger);
        });
    }
    closeAllMenus() {
        this.closeAllSubmenus();
        if (this.burger && this.nav) {
            this.burger.setAttribute('aria-expanded', 'false');
            this.nav.setAttribute('aria-hidden', 'true');
            this.burger.setAttribute('aria-label', 'メニューを開く');
            document.body.classList.remove('mobile-menu-open');
        }
    }
    handleEscapeKey(event) {
        if (event.key === 'Escape') {
            this.closeAllMenus();
        }
    }
    handleOutsideClick(event) {
        const target = event.target;
        if (target.closest('.header')) {
            return;
        }
        this.closeAllSubmenus();
    }
    handleResize() {
        const wasDesktop = this.isDesktop;
        this.isDesktop = window.innerWidth > 768;
        if (wasDesktop && !this.isDesktop) {
            this.closeAllSubmenus();
        }
        if (!wasDesktop && this.isDesktop) {
            this.closeAllMenus();
        }
    }
    destroy() {
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
