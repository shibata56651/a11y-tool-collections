/**
 * テーブルスクロールの視覚的インジケーター
 * スクロール可能性をユーザーに示すためのa11y対応
 */
export class TableScroll {
  private elements: NodeListOf<HTMLElement>;
  private containers: NodeListOf<HTMLElement>;

  constructor() {
    this.elements = document.querySelectorAll('.js-table-scroll');
    this.containers = document.querySelectorAll('.js-table-scroll-container');
    this.init();
  }

  private init(): void {
    this.elements.forEach((element, index) => {
      const container = this.containers[index];
      if (!container) return;

      // 初期状態を設定
      this.updateScrollIndicators(element, container);
      
      element.addEventListener('scroll', () => {
        this.updateScrollIndicators(element, container);
      });

      // リサイズ時にも更新
      window.addEventListener('resize', () => {
        setTimeout(() => {
          this.updateScrollIndicators(element, container);
        }, 100);
      });
    });
  }

  private updateScrollIndicators(element: HTMLElement, container: HTMLElement): void {
    const { scrollLeft, scrollWidth, clientWidth } = element;
    
    // スクロールが必要かどうかをまず確認
    const isScrollable = scrollWidth > clientWidth;
    
    if (!isScrollable) {
      // スクロール不要な場合は両方のクラスを削除
      container.classList.remove('js-scroll-left', 'js-scroll-right');
      return;
    }
    
    // 左にスクロール可能かチェック（左側にコンテンツがある）
    if (scrollLeft > 5) {
      container.classList.add('js-scroll-left');
    } else {
      container.classList.remove('js-scroll-left');
    }

    // 右にスクロール可能かチェック（右側にコンテンツがある）
    if (scrollLeft < scrollWidth - clientWidth - 5) {
      container.classList.add('js-scroll-right');
    } else {
      container.classList.remove('js-scroll-right');
    }
  }
}