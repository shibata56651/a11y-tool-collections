import { addClass, querySelector } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';
export class Pagination {
    constructor(selector, itemsPerPage = 10) {
        this.items = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 0;
        this.paginationContainer = null;
        this.prevButton = null;
        this.nextButton = null;
        this.pageList = null;
        const container = querySelector(selector);
        if (!container) {
            throw new Error(`Pagination container not found: ${selector}`);
        }
        this.container = container;
        this.itemsPerPage = itemsPerPage;
        this.init();
    }
    init() {
        this.findListContainer();
        this.collectItems();
        this.calculateTotalPages();
        if (this.totalPages > 1) {
            this.findPaginationElements();
            this.bindPaginationEvents();
            this.renderPagination();
            this.showPage(1);
        }
        else {
            this.hidePagination();
        }
    }
    findListContainer() {
        const listElement = this.container.querySelector('ul');
        if (!listElement) {
            throw new Error('List container (ul) not found in pagination container');
        }
        this.listContainer = listElement;
    }
    collectItems() {
        const items = this.listContainer.querySelectorAll('li');
        this.items = Array.from(items);
    }
    calculateTotalPages() {
        this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
    }
    findPaginationElements() {
        this.paginationContainer = this.container.querySelector('.js-pagination');
        this.prevButton = this.container.querySelector('.js-pagination-prev');
        this.nextButton = this.container.querySelector('.js-pagination-next');
        this.pageList = this.container.querySelector('.js-pagination-list');
    }
    hidePagination() {
        const pagination = this.container.querySelector('.js-pagination');
        if (pagination) {
            pagination.style.display = 'none';
        }
    }
    bindPaginationEvents() {
        if (this.prevButton) {
            addEventListener(this.prevButton, 'click', () => {
                if (this.currentPage > 1) {
                    this.goToPage(this.currentPage - 1);
                }
            });
        }
        if (this.nextButton) {
            addEventListener(this.nextButton, 'click', () => {
                if (this.currentPage < this.totalPages) {
                    this.goToPage(this.currentPage + 1);
                }
            });
        }
    }
    renderPagination() {
        this.updatePrevButton();
        this.updatePageList();
        this.updateNextButton();
    }
    updatePrevButton() {
        if (!this.prevButton)
            return;
        if (this.currentPage === 1) {
            this.prevButton.style.display = 'none';
        }
        else {
            this.prevButton.style.display = '';
        }
    }
    updateNextButton() {
        if (!this.nextButton)
            return;
        if (this.currentPage === this.totalPages) {
            this.nextButton.style.display = 'none';
        }
        else {
            this.nextButton.style.display = '';
        }
    }
    updatePageList() {
        if (!this.pageList)
            return;
        this.pageList.innerHTML = '';
        const pageNumbers = this.getPageNumbers();
        pageNumbers.forEach((pageNum) => {
            const listItem = document.createElement('li');
            listItem.className = 'pagination__item';
            if (pageNum === '...') {
                const span = document.createElement('span');
                span.className = 'pagination__ellipsis';
                span.textContent = '...';
                span.setAttribute('aria-hidden', 'true');
                listItem.appendChild(span);
            }
            else {
                const button = document.createElement('button');
                button.className = 'pagination__button js-pagination-page';
                button.type = 'button';
                button.textContent = pageNum.toString();
                button.setAttribute('aria-label', `${pageNum}ページ目へ移動`);
                button.dataset.page = pageNum.toString();
                if (pageNum === this.currentPage) {
                    addClass(button, 'pagination__button--active');
                    button.setAttribute('aria-current', 'page');
                    button.setAttribute('aria-label', `${pageNum}ページ目（現在のページ）`);
                }
                addEventListener(button, 'click', () => {
                    this.goToPage(Number(pageNum));
                });
                listItem.appendChild(button);
            }
            if (this.pageList) {
                this.pageList.appendChild(listItem);
            }
        });
    }
    getPageNumbers() {
        const total = this.totalPages;
        const current = this.currentPage;
        if (total <= 3) {
            const pages = [];
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
            return pages;
        }
        const pages = [];
        if (current <= 2) {
            pages.push(1, 2, 3);
            if (total > 3) {
                pages.push('...');
                pages.push(total);
            }
        }
        else if (current === 3) {
            pages.push(1);
            if (total > 5) {
                pages.push('...');
            }
            pages.push(2, 3, 4);
            if (total > 4) {
                if (total > 5) {
                    pages.push('...');
                }
                pages.push(total);
            }
        }
        else if (current === total - 1) {
            pages.push(1, '...', total - 2, total - 1, total);
        }
        else if (current === total) {
            pages.push(1, '...', total - 2, total - 1, total);
        }
        else {
            pages.push(1, '...', current - 1, current, current + 1, '...', total);
        }
        return pages;
    }
    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) {
            return;
        }
        this.currentPage = page;
        this.showPage(page);
        this.renderPagination();
        this.announcePageChange(page);
        this.scrollToTop();
    }
    showPage(page) {
        const startIndex = (page - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.items.forEach((item, index) => {
            if (index >= startIndex && index < endIndex) {
                item.style.display = '';
                item.setAttribute('aria-hidden', 'false');
            }
            else {
                item.style.display = 'none';
                item.setAttribute('aria-hidden', 'true');
            }
        });
    }
    announcePageChange(page) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `${page}ページ目に移動しました`;
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
    scrollToTop() {
        const containerRect = this.container.getBoundingClientRect();
        const containerTop = containerRect.top + window.scrollY;
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        const offset = headerHeight + 20;
        window.scrollTo({
            top: Math.max(0, containerTop - offset),
            behavior: 'smooth'
        });
    }
    getCurrentPage() {
        return this.currentPage;
    }
    getTotalPages() {
        return this.totalPages;
    }
    destroy() {
        if (this.paginationContainer) {
            this.paginationContainer.style.display = 'none';
        }
        this.items.forEach((item) => {
            item.style.display = '';
            item.removeAttribute('aria-hidden');
        });
    }
}
export function initPaginations() {
    const paginationContainers = document.querySelectorAll('.js-pagination-container');
    paginationContainers.forEach((container, index) => {
        try {
            if (!container.id) {
                container.id = `pagination-${index + 1}`;
            }
            new Pagination(`#${container.id}`, 10);
        }
        catch (error) {
            console.warn(`Failed to initialize pagination ${index + 1}:`, error);
        }
    });
}
