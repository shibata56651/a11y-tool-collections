import { addClass, querySelector } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';

export class Pagination {
  private container: HTMLElement;
  private listContainer!: HTMLElement;
  private items: HTMLElement[] = [];
  private currentPage: number = 1;
  private itemsPerPage: number = 10;
  private totalPages: number = 0;
  private paginationContainer: HTMLElement | null = null;
  private prevButton: HTMLElement | null = null;
  private nextButton: HTMLElement | null = null;
  private pageList: HTMLElement | null = null;

  constructor(selector: string, itemsPerPage: number = 10) {
    const container = querySelector(selector);
    if (!container) {
      throw new Error(`Pagination container not found: ${selector}`);
    }
    this.container = container as HTMLElement;
    this.itemsPerPage = itemsPerPage;
    this.init();
  }

  private init(): void {
    this.findListContainer();
    this.collectItems();
    this.calculateTotalPages();
    
    if (this.totalPages > 1) {
      this.findPaginationElements();
      this.bindPaginationEvents();
      this.renderPagination();
      this.showPage(1);
    } else {
      this.hidePagination();
    }
  }

  private findListContainer(): void {
    const listElement = this.container.querySelector('ul');
    if (!listElement) {
      throw new Error('List container (ul) not found in pagination container');
    }
    this.listContainer = listElement;
  }

  private collectItems(): void {
    const items = this.listContainer.querySelectorAll('li');
    this.items = Array.from(items) as HTMLElement[];
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
  }

  private findPaginationElements(): void {
    this.paginationContainer = this.container.querySelector('.js-pagination');
    this.prevButton = this.container.querySelector('.js-pagination-prev');
    this.nextButton = this.container.querySelector('.js-pagination-next');
    this.pageList = this.container.querySelector('.js-pagination-list');
  }

  private hidePagination(): void {
    const pagination = this.container.querySelector('.js-pagination');
    if (pagination) {
      (pagination as HTMLElement).style.display = 'none';
    }
  }

  private bindPaginationEvents(): void {
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

  private renderPagination(): void {
    this.updatePrevButton();
    this.updatePageList();
    this.updateNextButton();
  }

  private updatePrevButton(): void {
    if (!this.prevButton) return;

    if (this.currentPage === 1) {
      this.prevButton.style.display = 'none';
    } else {
      this.prevButton.style.display = '';
    }
  }

  private updateNextButton(): void {
    if (!this.nextButton) return;

    if (this.currentPage === this.totalPages) {
      this.nextButton.style.display = 'none';
    } else {
      this.nextButton.style.display = '';
    }
  }

  private updatePageList(): void {
    if (!this.pageList) return;

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
      } else {
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


  private getPageNumbers(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    
    // 3ページ以下の場合は全て表示
    if (total <= 3) {
      const pages: number[] = [];
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    const pages: (number | string)[] = [];
    
    // 1,2ページが選択されている場合
    if (current <= 2) {
      pages.push(1, 2, 3);
      if (total > 3) {
        pages.push('...');
        pages.push(total);
      }
    }
    // 3ページが選択されている場合
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
    // 最後から2番目のページが選択されている場合
    else if (current === total - 1) {
      pages.push(1, '...', total - 2, total - 1, total);
    }
    // 最後のページが選択されている場合  
    else if (current === total) {
      pages.push(1, '...', total - 2, total - 1, total);
    }
    // 中間のページが選択されている場合
    else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    
    return pages;
  }

  private goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.showPage(page);
    this.renderPagination();
    this.announcePageChange(page);
    this.scrollToTop();
  }

  private showPage(page: number): void {
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.items.forEach((item, index) => {
      if (index >= startIndex && index < endIndex) {
        item.style.display = '';
        item.setAttribute('aria-hidden', 'false');
      } else {
        item.style.display = 'none';
        item.setAttribute('aria-hidden', 'true');
      }
    });
  }

  private announcePageChange(page: number): void {
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

  private scrollToTop(): void {
    const containerRect = this.container.getBoundingClientRect();
    const containerTop = containerRect.top + window.scrollY;
    
    // ヘッダーの高さを取得
    const header = document.querySelector('.header') as HTMLElement;
    const headerHeight = header ? header.offsetHeight : 0;
    
    // ヘッダー高さ + 余白を考慮してスクロール位置を調整
    const offset = headerHeight + 20;
    
    window.scrollTo({
      top: Math.max(0, containerTop - offset),
      behavior: 'smooth'
    });
  }

  public getCurrentPage(): number {
    return this.currentPage;
  }

  public getTotalPages(): number {
    return this.totalPages;
  }

  public destroy(): void {
    if (this.paginationContainer) {
      this.paginationContainer.style.display = 'none';
    }
    
    this.items.forEach((item) => {
      item.style.display = '';
      item.removeAttribute('aria-hidden');
    });
  }
}

export function initPaginations(): void {
  const paginationContainers = document.querySelectorAll('.js-pagination-container');
  
  paginationContainers.forEach((container, index) => {
    try {
      if (!container.id) {
        container.id = `pagination-${index + 1}`;
      }
      new Pagination(`#${container.id}`, 10);
    } catch (error) {
      console.warn(`Failed to initialize pagination ${index + 1}:`, error);
    }
  });
}