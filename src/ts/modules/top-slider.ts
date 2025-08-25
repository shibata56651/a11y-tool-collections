import { querySelector } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';

export class TopSlider {
  private container: HTMLElement | null;
  private track: HTMLElement | null = null;
  private playPauseButton: HTMLButtonElement | null = null;
  private isPlaying: boolean = true;

  constructor(selector: string) {
    this.container = querySelector(selector);
    
    if (!this.container) {
      return;
    }

    this.track = this.container.querySelector('.top-slider__track');
    this.playPauseButton = this.container.querySelector('.top-slider__play-pause');

    this.init();
  }

  private init(): void {
    this.duplicateImages();
    this.setupEventListeners();
    this.updateButtonState();
  }

  private duplicateImages(): void {
    if (!this.track) return;

    const originalImage = this.track.querySelector('.top-slider__image') as HTMLImageElement;
    if (!originalImage) return;

    // 2つ目の画像を複製（スクリーンリーダーから隠す）
    const duplicatedImage = originalImage.cloneNode(true) as HTMLImageElement;
    duplicatedImage.setAttribute('aria-hidden', 'true');
    duplicatedImage.setAttribute('alt', '');
    duplicatedImage.removeAttribute('loading'); // lazy loadingを削除

    // trackに追加
    this.track.appendChild(duplicatedImage);
  }

  private setupEventListeners(): void {
    if (this.playPauseButton) {
      addEventListener(this.playPauseButton, 'click', this.togglePlayPause.bind(this));
    }
  }

  private togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
    
    if (this.track) {
      if (this.isPlaying) {
        this.track.classList.remove('paused');
      } else {
        this.track.classList.add('paused');
      }
    }

    this.updateButtonState();
  }

  private updateButtonState(): void {
    if (this.playPauseButton) {
      if (this.isPlaying) {
        this.playPauseButton.classList.remove('paused');
        this.playPauseButton.setAttribute('aria-label', 'スライダーを停止');
        this.playPauseButton.setAttribute('aria-pressed', 'false');
      } else {
        this.playPauseButton.classList.add('paused');
        this.playPauseButton.setAttribute('aria-label', 'スライダーを再生');
        this.playPauseButton.setAttribute('aria-pressed', 'true');
      }
    }
  }

  // 公開メソッド
  public play(): void {
    if (!this.isPlaying) {
      this.togglePlayPause();
    }
  }

  public pause(): void {
    if (this.isPlaying) {
      this.togglePlayPause();
    }
  }

  public destroy(): void {
    // 必要に応じてクリーンアップ処理を追加
  }
}