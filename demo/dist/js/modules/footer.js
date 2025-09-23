import { querySelectorAll } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';
export class Footer {
    constructor() {
        this.submenuTriggers = querySelectorAll('.footer-desc__link[data-submenu-trigger]');
        this.isDesktop = window.innerWidth > 768;
        this.init();
    }
    init() {
        this.setupEventListeners();
        this.handleResize();
    }
    setupEventListeners() {
        this.submenuTriggers.forEach(trigger => {
            addEventListener(trigger, 'click', this.toggleSubmenu.bind(this));
        });
        addEventListener(window, 'resize', this.handleResize.bind(this));
    }
    toggleSubmenu(event) {
        const trigger = event.currentTarget;
        if (!this.isDesktop) {
            event.preventDefault();
            event.stopPropagation();
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            const dtElement = trigger.parentElement;
            const submenu = dtElement?.nextElementSibling;
            if (submenu) {
                const newState = !isExpanded;
                trigger.setAttribute('aria-expanded', String(newState));
                submenu.setAttribute('aria-hidden', String(!newState));
            }
        }
    }
    handleResize() {
        this.isDesktop = window.innerWidth > 768;
        if (this.isDesktop) {
            this.submenuTriggers.forEach(trigger => {
                const dtElement = trigger.parentElement;
                const submenu = dtElement?.nextElementSibling;
                if (submenu) {
                    trigger.setAttribute('aria-expanded', 'false');
                    submenu.setAttribute('aria-hidden', 'false');
                }
            });
        }
        else {
            this.submenuTriggers.forEach(trigger => {
                const dtElement = trigger.parentElement;
                const submenu = dtElement?.nextElementSibling;
                if (submenu) {
                    trigger.setAttribute('aria-expanded', 'false');
                    submenu.setAttribute('aria-hidden', 'true');
                }
            });
        }
    }
}
