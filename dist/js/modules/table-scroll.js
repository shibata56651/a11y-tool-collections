export class TableScroll {
    constructor() {
        this.elements = document.querySelectorAll('.js-table-scroll');
        this.containers = document.querySelectorAll('.js-table-scroll-container');
        this.init();
    }
    init() {
        this.elements.forEach((element, index) => {
            const container = this.containers[index];
            if (!container)
                return;
            this.updateScrollIndicators(element, container);
            element.addEventListener('scroll', () => {
                this.updateScrollIndicators(element, container);
            });
            window.addEventListener('resize', () => {
                setTimeout(() => {
                    this.updateScrollIndicators(element, container);
                }, 100);
            });
        });
    }
    updateScrollIndicators(element, container) {
        const { scrollLeft, scrollWidth, clientWidth } = element;
        const isScrollable = scrollWidth > clientWidth;
        if (!isScrollable) {
            container.classList.remove('js-scroll-left', 'js-scroll-right');
            return;
        }
        if (scrollLeft > 5) {
            container.classList.add('js-scroll-left');
        }
        else {
            container.classList.remove('js-scroll-left');
        }
        if (scrollLeft < scrollWidth - clientWidth - 5) {
            container.classList.add('js-scroll-right');
        }
        else {
            container.classList.remove('js-scroll-right');
        }
    }
}
