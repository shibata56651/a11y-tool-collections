export class Carousel {
  private carousel: HTMLElement;
  private slides: NodeListOf<HTMLElement>;
  private playPauseButton: HTMLButtonElement;
  private currentSlide: number = 0;
  private autoPlayInterval: number | null = null;
  private autoPlayDelay: number = 5000; // 5秒間隔
  private isPlaying: boolean = true;

  constructor(selector: string) {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Carousel element not found: ${selector}`);
    }
    
    this.carousel = element as HTMLElement;
    this.slides = this.carousel.querySelectorAll('[data-slide]');
    
    const playPauseButton = document.querySelector('[data-play-pause]');
    if (!playPauseButton) {
      throw new Error('Play/pause button not found');
    }
    this.playPauseButton = playPauseButton as HTMLButtonElement;
    
    if (this.slides.length === 0) {
      throw new Error('No slides found in carousel');
    }
    
    this.init();
  }

  private init(): void {
    this.bindEvents();
    this.startAutoPlay();
  }

  private bindEvents(): void {
    // 再生・停止ボタン
    this.playPauseButton.addEventListener('click', () => {
      this.togglePlayPause();
    });

    // キーボードナビゲーション
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.togglePlayPause();
      }
    });
  }

  private goToSlide(index: number): void {
    if (index < 0 || index >= this.slides.length) return;

    // 現在のスライドを非アクティブに
    this.slides[this.currentSlide].classList.remove('mv__slide--active');

    // 新しいスライドをアクティブに
    this.currentSlide = index;
    this.slides[this.currentSlide].classList.add('mv__slide--active');

    // ARIA属性の更新
    this.slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i === this.currentSlide ? 'false' : 'true');
    });
  }

  private nextSlide(): void {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  private previousSlide(): void {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  private togglePlayPause(): void {
    if (this.isPlaying) {
      this.stopAutoPlay();
      this.playPauseButton.classList.add('mv__play-pause--paused');
      this.isPlaying = false;
    } else {
      this.startAutoPlay();
      this.playPauseButton.classList.remove('mv__play-pause--paused');
      this.isPlaying = true;
    }
  }

  private startAutoPlay(): void {
    this.stopAutoPlay(); // 既存のインターバルをクリア
    this.autoPlayInterval = window.setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  // 公開メソッド
  public destroy(): void {
    this.stopAutoPlay();
    // イベントリスナーの削除は実際の使用ケースに応じて実装
  }

  public pause(): void {
    this.stopAutoPlay();
    this.playPauseButton.classList.add('mv__play-pause--paused');
    this.isPlaying = false;
  }

  public resume(): void {
    this.startAutoPlay();
    this.playPauseButton.classList.remove('mv__play-pause--paused');
    this.isPlaying = true;
  }
}