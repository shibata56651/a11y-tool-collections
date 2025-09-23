export class CountupAnimation {
    constructor() {
        this.init();
    }
    init() {
        const options = {
            root: null,
            rootMargin: '50px 0px -50px 0px',
            threshold: 0.1
        };
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.animateNumber(entry.target);
                }
            });
        }, options);
        this.observeTargets();
    }
    observeTargets() {
        const numbers = document.querySelectorAll('.js-count');
        numbers.forEach((number) => {
            this.observer.observe(number);
        });
    }
    animateNumber(element) {
        const firstTextNode = element.childNodes[0];
        const targetText = firstTextNode?.textContent || '0';
        const targetNumber = this.extractNumber(targetText);
        if (targetNumber === 0) {
            return;
        }
        this.setInitialValue(element, 0);
        setTimeout(() => {
            this.countUp(element, 0, targetNumber, 2000);
        }, 200);
        this.observer.unobserve(element);
    }
    extractNumber(text) {
        const match = text.replace(/,/g, '').match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }
    setInitialValue(element, value) {
        const unitElement = element.querySelector('.lyt-box-col3__number--percent, .lyt-box-col3__number--unit');
        element.innerHTML = '';
        element.appendChild(document.createTextNode(value.toString()));
        if (unitElement) {
            element.appendChild(unitElement.cloneNode(true));
        }
    }
    countUp(element, start, end, duration) {
        const startTime = Date.now();
        const unitElement = element.querySelector('.lyt-box-col3__number--percent, .lyt-box-col3__number--unit');
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - (1 - progress) ** 3;
            const current = Math.floor(start + (end - start) * easeOut);
            element.innerHTML = '';
            const formattedNumber = current.toLocaleString();
            element.appendChild(document.createTextNode(formattedNumber));
            if (unitElement) {
                element.appendChild(unitElement.cloneNode(true));
            }
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
            else {
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
