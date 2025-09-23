import { FormValidator, type ValidationConfig, ValidationRules } from './modules/form-validator.js';
import { Modal } from './modules/modal.js';
import { Header } from './modules/header.js';
import { Footer } from './modules/footer.js';
import { Carousel } from './modules/carousel.js';
import { TopSlider } from './modules/top-slider.js';
import { SmoothScroll } from './modules/smooth-scroll.js';
import { initAccordions } from './modules/accordion.js';
import { initLeadMores } from './modules/lead-more.js';
import { TableScroll } from './modules/table-scroll.js';
import { FadeInAnimation } from './modules/fade-in-animation.js';
import { CountupAnimation } from './modules/countup-animation.js';
import { initPaginations } from './modules/pagination.js';
import { addEventListener } from './utils/events.js';


document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initFooter();
  initCarousel();
  initTopSlider();
  initModals();
  initForms();
  initButtons();
  initSmoothScroll();
  initAccordions();
  initLeadMores();
  initTableScroll();
  initFadeInAnimation();
  initCountupAnimation();
  initPaginations();
});

function initHeader(): void {
  try {
    const headerElement = document.querySelector('.header');
    if (headerElement) {
      new Header();
    }
  } catch (error) {
    console.error('Failed to initialize header:', error);
  }
}

function initFooter(): void {
  try {
    const footerElement = document.querySelector('.footer');
    if (footerElement) {
      new Footer();
    }
  } catch (error) {
    console.error('Failed to initialize footer:', error);
  }
}

function initCarousel(): void {
  try {
    const carouselElement = document.querySelector('[data-carousel]');
    if (carouselElement) {
      new Carousel('[data-carousel]');
    }
  } catch (error) {
    console.error('Failed to initialize carousel:', error);
  }
}

function initTopSlider(): void {
  try {
    const sliderElement = document.querySelector('[data-slider]');
    if (sliderElement) {
      new TopSlider('[data-slider]');
    }
  } catch (error) {
    console.error('Failed to initialize top slider:', error);
  }
}

function initModals(): void {
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modals: Map<string, Modal> = new Map();

  modalTriggers.forEach((trigger) => {
    const target = trigger.getAttribute('data-modal-target');
    if (target) {
      if (!modals.has(target)) {
        try {
          modals.set(target, new Modal(target));
        } catch (error) {
          console.error('Failed to initialize modal:', error);
        }
      }

      addEventListener(trigger, 'click', () => {
        const modal = modals.get(target);
        modal?.open();
      });
    }
  });
}

function initForms(): void {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach((form) => {
    const formElement = form as HTMLFormElement;
    const validationConfig = getValidationConfig(formElement);

    if (Object.keys(validationConfig).length > 0) {
      new FormValidator(`#${formElement.id}`, validationConfig);
    }
  });
}

function getValidationConfig(form: HTMLFormElement): ValidationConfig {
  const config: ValidationConfig = {};

  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach((field) => {
    const name = field.getAttribute('name');
    if (name) {
      config[name] = [{ rule: ValidationRules.required, message: 'この項目は必須です' }];
    }
  });

  const emailFields = form.querySelectorAll('input[type="email"]');
  emailFields.forEach((field) => {
    const name = field.getAttribute('name');
    if (name) {
      if (!config[name]) config[name] = [];
      config[name].push({
        rule: ValidationRules.email,
        message: '正しいメールアドレスを入力してください',
      });
    }
  });

  return config;
}

function initButtons(): void {
  const buttons = document.querySelectorAll('[data-action]');

  buttons.forEach((button) => {
    const action = button.getAttribute('data-action');

    addEventListener(button, 'click', (event: Event) => {
      event.preventDefault();

      switch (action) {
        case 'toggle-theme':
          toggleTheme();
          break;
        default:
      }
    });
  });
}

function initSmoothScroll(): void {
  try {
    // ページ内リンク（#で始まるhref）を持つaタグに適用
    // ただし、ヘッダーのサブメニュートリガーとフッターのアコーディオントリガーは除外
    new SmoothScroll('a[href^="#"]', {}, [
      '.header__submenu-trigger',
      '.footer-desc__link[data-submenu-trigger]'
    ]);
  } catch (error) {
    console.error('Failed to initialize smooth scroll:', error);
  }
}

function initTableScroll(): void {
  try {
    const tableScrollElements = document.querySelectorAll('.js-table-scroll');
    if (tableScrollElements.length > 0) {
      new TableScroll();
    }
  } catch (error) {
    console.error('Failed to initialize table scroll:', error);
  }
}

function initFadeInAnimation(): void {
  try {
    const fadeInElements = document.querySelectorAll('.js-fade-container');
    if (fadeInElements.length > 0) {
      new FadeInAnimation();
    }
  } catch (error) {
    console.error('Failed to initialize fade in animation:', error);
  }
}

function initCountupAnimation(): void {
  try {
    const countupElements = document.querySelectorAll('.js-count');
    if (countupElements.length > 0) {
      new CountupAnimation();
    }
  } catch (error) {
    console.error('Failed to initialize countup animation:', error);
  }
}

function toggleTheme(): void {
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-theme');
}
