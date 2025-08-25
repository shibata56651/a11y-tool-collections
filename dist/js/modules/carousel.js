export class Carousel {
    constructor(selector) {
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000;
        this.isPlaying = true;
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Carousel element not found: ${selector}`);
        }
        this.carousel = element;
        this.slides = this.carousel.querySelectorAll('[data-slide]');
        const playPauseButton = document.querySelector('[data-play-pause]');
        if (!playPauseButton) {
            throw new Error('Play/pause button not found');
        }
        this.playPauseButton = playPauseButton;
        if (this.slides.length === 0) {
            throw new Error('No slides found in carousel');
        }
        this.init();
    }
    init() {
        this.bindEvents();
        this.startAutoPlay();
    }
    bindEvents() {
        this.playPauseButton.addEventListener('click', () => {
            this.togglePlayPause();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            }
            else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
            else if (e.key === ' ') {
                e.preventDefault();
                this.togglePlayPause();
            }
        });
    }
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length)
            return;
        this.slides[this.currentSlide].classList.remove('mv__slide--active');
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('mv__slide--active');
        this.slides.forEach((slide, i) => {
            slide.setAttribute('aria-hidden', i === this.currentSlide ? 'false' : 'true');
        });
    }
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    togglePlayPause() {
        if (this.isPlaying) {
            this.stopAutoPlay();
            this.playPauseButton.classList.add('mv__play-pause--paused');
            this.isPlaying = false;
        }
        else {
            this.startAutoPlay();
            this.playPauseButton.classList.remove('mv__play-pause--paused');
            this.isPlaying = true;
        }
    }
    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = window.setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    destroy() {
        this.stopAutoPlay();
    }
    pause() {
        this.stopAutoPlay();
        this.playPauseButton.classList.add('mv__play-pause--paused');
        this.isPlaying = false;
    }
    resume() {
        this.startAutoPlay();
        this.playPauseButton.classList.remove('mv__play-pause--paused');
        this.isPlaying = true;
    }
}
