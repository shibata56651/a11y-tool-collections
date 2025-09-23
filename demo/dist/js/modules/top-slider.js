import { querySelector } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';
export class TopSlider {
    constructor(selector) {
        this.track = null;
        this.playPauseButton = null;
        this.isPlaying = true;
        this.container = querySelector(selector);
        if (!this.container) {
            return;
        }
        this.track = this.container.querySelector('.top-slider__track');
        this.playPauseButton = this.container.querySelector('.top-slider__play-pause');
        this.init();
    }
    init() {
        this.duplicateImages();
        this.setupEventListeners();
        this.updateButtonState();
    }
    duplicateImages() {
        if (!this.track)
            return;
        const originalImage = this.track.querySelector('.top-slider__image');
        if (!originalImage)
            return;
        const duplicatedImage = originalImage.cloneNode(true);
        duplicatedImage.setAttribute('aria-hidden', 'true');
        duplicatedImage.setAttribute('alt', '');
        duplicatedImage.removeAttribute('loading');
        this.track.appendChild(duplicatedImage);
    }
    setupEventListeners() {
        if (this.playPauseButton) {
            addEventListener(this.playPauseButton, 'click', this.togglePlayPause.bind(this));
        }
    }
    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        if (this.track) {
            if (this.isPlaying) {
                this.track.classList.remove('paused');
            }
            else {
                this.track.classList.add('paused');
            }
        }
        this.updateButtonState();
    }
    updateButtonState() {
        if (this.playPauseButton) {
            if (this.isPlaying) {
                this.playPauseButton.classList.remove('paused');
                this.playPauseButton.setAttribute('aria-label', 'スライダーを停止');
                this.playPauseButton.setAttribute('aria-pressed', 'false');
            }
            else {
                this.playPauseButton.classList.add('paused');
                this.playPauseButton.setAttribute('aria-label', 'スライダーを再生');
                this.playPauseButton.setAttribute('aria-pressed', 'true');
            }
        }
    }
    play() {
        if (!this.isPlaying) {
            this.togglePlayPause();
        }
    }
    pause() {
        if (this.isPlaying) {
            this.togglePlayPause();
        }
    }
    destroy() {
    }
}
