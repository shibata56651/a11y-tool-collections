export class FadeInAnimation {
    constructor() {
        this.init();
    }
    init() {
        const options = {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.1
        };
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateItems(entry.target);
                }
            });
        }, options);
        this.observeTargets();
    }
    observeTargets() {
        const containers = document.querySelectorAll('.js-fade-container');
        containers.forEach((container) => {
            this.observer.observe(container);
        });
    }
    animateItems(container) {
        const items = container.querySelectorAll('.js-fade-item');
        if (items.length === 0)
            return;
        const hasCountElements = container.querySelector('.js-count');
        if (hasCountElements) {
            items.forEach((item) => {
                item.classList.add('js-fade-in');
            });
        }
        else {
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('js-fade-in');
                }, index * 150);
            });
        }
        this.observer.unobserve(container);
    }
}
