import { querySelectorAll } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';
export class SmoothScroll {
    constructor(selector = 'a[href^="#"]', options = {}, excludeSelectors = ['.header__submenu-trigger', '.footer-desc__link[data-submenu-trigger]']) {
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
    filterLinks(links) {
        return Array.from(links).filter(link => {
            return !this.excludeSelectors.some(excludeSelector => link.matches(excludeSelector));
        });
    }
    init() {
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.scrollLinks.forEach(link => {
            addEventListener(link, 'click', this.handleClick.bind(this));
        });
    }
    handleClick(event) {
        event.preventDefault();
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        if (!href)
            return;
        if (href === '#' || href === '#top') {
            this.scrollToTop();
            return;
        }
        const targetId = href.replace('#', '');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            this.scrollToElement(targetElement);
        }
    }
    scrollToTop() {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: this.options.behavior
        });
    }
    scrollToElement(element) {
        element.scrollIntoView(this.options);
    }
    scrollTo(target) {
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
        }
        else {
            this.scrollToElement(target);
        }
    }
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}
