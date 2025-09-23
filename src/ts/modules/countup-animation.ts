/**
 * カウントアップアニメーション
 * 数字要素が表示領域に入った時に0から目標値まで数値をアニメーション
 */
export class CountupAnimation {
  private observer!: IntersectionObserver;

  constructor() {
    this.init();
  }

  private init(): void {
    // Intersection Observerのオプション
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px 0px -50px 0px', // より早く検知するように調整
      threshold: 0.1
    };

    // Observer作成
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateNumber(entry.target as HTMLElement);
        }
      });
    }, options);

    // 対象の要素を監視開始
    this.observeTargets();
  }

  private observeTargets(): void {
    // js-count要素を取得
    const numbers = document.querySelectorAll('.js-count');
    
    numbers.forEach((number) => {
      this.observer.observe(number);
    });
  }

  private animateNumber(element: HTMLElement): void {
    // 数字部分のみを取得（最初のテキストノード）
    const firstTextNode = element.childNodes[0];
    const targetText = firstTextNode?.textContent || '0';
    const targetNumber = this.extractNumber(targetText);
    
    if (targetNumber === 0) {
      return;
    }

    // 初期表示を0に設定
    this.setInitialValue(element, 0);

    // 少し遅延してからアニメーション開始（0が見えるようにするため）
    setTimeout(() => {
      this.countUp(element, 0, targetNumber, 2000); // 2秒でカウントアップ
    }, 200); // 200ms後にカウントアップ開始
    
    // アニメーション開始後は監視を停止
    this.observer.unobserve(element);
  }

  private extractNumber(text: string): number {
    // テキストから数字を抽出（カンマを除去）
    const match = text.replace(/,/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  private setInitialValue(element: HTMLElement, value: number): void {
    // 単位要素を保存
    const unitElement = element.querySelector('.lyt-box-col3__number--percent, .lyt-box-col3__number--unit');
    
    // 要素を初期値で設定
    element.innerHTML = '';
    element.appendChild(document.createTextNode(value.toString()));
    
    // 単位要素を再追加
    if (unitElement) {
      element.appendChild(unitElement.cloneNode(true));
    }
  }

  private countUp(element: HTMLElement, start: number, end: number, duration: number): void {
    const startTime = Date.now();
    
    // 単位部分を保存（最初に一度だけ取得）
    const unitElement = element.querySelector('.lyt-box-col3__number--percent, .lyt-box-col3__number--unit');

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // イージング関数（ease-out）
      const easeOut = 1 - (1 - progress) ** 3;
      const current = Math.floor(start + (end - start) * easeOut);
      
      // 要素のテキストコンテンツをクリア
      element.innerHTML = '';
      
      // カウントアップした数字を追加
      const formattedNumber = current.toLocaleString();
      element.appendChild(document.createTextNode(formattedNumber));
      
      // 単位要素を再追加
      if (unitElement) {
        element.appendChild(unitElement.cloneNode(true));
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 最終値を確実に設定
        element.innerHTML = '';
        element.appendChild(document.createTextNode(end.toLocaleString()));
        if (unitElement) {
          element.appendChild(unitElement.cloneNode(true));
        }
        element.classList.add('js-countup');
      }
    };

    animate();
  }
}