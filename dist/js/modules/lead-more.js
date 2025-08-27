import { addClass, querySelector, removeClass } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';
export class LeadMore {
    constructor(selector) {
        this.isExpanded = false;
        const element = querySelector(selector);
        if (!element) {
            throw new Error(`Accordion element not found: ${selector}`);
        }
        this.element = element;
        this.init();
    }
    init() {
        this.findElements();
        this.setInitialState();
        this.bindEvents();
    }
    findElements() {
        const toggle = this.element.querySelector('.js-lead-more__toggle');
        const content = this.element.querySelector('.js-lead-more__content');
        const toggleText = this.element.querySelector('.js-lead-more__toggle-text');
        if (!toggle || !content || !toggleText) {
            throw new Error('Required lead-more elements not found');
        }
        this.toggleButton = toggle;
        this.content = content;
        this.toggleText = toggleText;
    }
    setInitialState() {
        this.toggleButton.setAttribute('aria-expanded', 'false');
        this.content.setAttribute('aria-hidden', 'true');
        this.isExpanded = false;
    }
    bindEvents() {
        addEventListener(this.toggleButton, 'click', this.handleToggleClick.bind(this));
        addEventListener(this.toggleButton, 'keydown', this.handleKeydown.bind(this));
    }
    handleToggleClick(event) {
        event.preventDefault();
        this.toggleAccordion();
    }
    handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.toggleAccordion();
        }
    }
    toggleAccordion() {
        if (this.isExpanded) {
            this.collapse();
        }
        else {
            this.expand();
        }
    }
    expand() {
        this.isExpanded = true;
        this.toggleButton.setAttribute('aria-expanded', 'true');
        this.content.setAttribute('aria-hidden', 'false');
        addClass(this.element, 'js-lead-more--expanded');
        this.toggleText.textContent = this.toggleText.getAttribute('data-text-expanded') || '閉じる';
        this.announceChange('展開しました');
    }
    collapse() {
        this.isExpanded = false;
        this.toggleButton.setAttribute('aria-expanded', 'false');
        this.content.setAttribute('aria-hidden', 'true');
        removeClass(this.element, 'js-lead-more--expanded');
        this.toggleText.textContent = this.toggleText.getAttribute('data-text-collapsed') || '詳しくみる';
        this.announceChange('閉じました');
    }
    announceChange(message) {
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
    isOpen() {
        return this.isExpanded;
    }
    open() {
        if (!this.isExpanded) {
            this.expand();
        }
    }
    close() {
        if (this.isExpanded) {
            this.collapse();
        }
    }
}
export function initLeadMores() {
    const leadMores = document.querySelectorAll('.js-lead-more');
    leadMores.forEach((leadMore, index) => {
        try {
            if (!leadMore.id) {
                leadMore.id = `lead-more-${index + 1}`;
            }
            new LeadMore(`#${leadMore.id}`);
        }
        catch (error) {
            console.warn(`Failed to initialize lead-more ${index + 1}:`, error);
        }
    });
}
