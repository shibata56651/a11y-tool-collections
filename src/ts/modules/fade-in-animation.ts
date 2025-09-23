/**
 * フェードインアニメーション
 * Intersection Observerを使用して要素が表示領域に入った時に順番にアニメーションを実行
 */
export class FadeInAnimation {
  private observer!: IntersectionObserver;

  constructor() {
    this.init();
  }

  private init(): void {
    // Intersection Observerのオプション
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-10% 0px -10% 0px', // 10%マージンを設けて早めに検知
      threshold: 0.1
    };

    // Observer作成
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateItems(entry.target as HTMLElement);
        }
      });
    }, options);

    // 対象の要素を監視開始
    this.observeTargets();
  }

  private observeTargets(): void {
    // js-fade-container要素を取得
    const containers = document.querySelectorAll('.js-fade-container');
    
    containers.forEach((container) => {
      this.observer.observe(container);
    });
  }

  private animateItems(container: HTMLElement): void {
    // コンテナ内のjs-fade-item要素を取得
    const items = container.querySelectorAll('.js-fade-item');
    
    if (items.length === 0) return;

    // カウントアップ要素を持つコンテナかどうかを判定
    const hasCountElements = container.querySelector('.js-count');
    
    if (hasCountElements) {
      // カウントアップ要素がある場合は、フェードインアニメーションをスキップ
      items.forEach((item) => {
        item.classList.add('js-fade-in');
      });
    } else {
      // 通常のフェードインアニメーション
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('js-fade-in');
        }, index * 150); // 150ms間隔で順番に実行
      });
    }

    // アニメーション開始後は監視を停止
    this.observer.unobserve(container);
  }
}