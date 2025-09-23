import { addClass, querySelector, removeClass } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';
export class FormValidator {
    constructor(formSelector, config) {
        this.errors = new Map();
        const form = querySelector(formSelector);
        if (!form) {
            throw new Error(`Form not found: ${formSelector}`);
        }
        this.form = form;
        this.config = config;
        this.init();
    }
    init() {
        addEventListener(this.form, 'submit', (event) => {
            if (!this.validate()) {
                event.preventDefault();
            }
        });
        Object.keys(this.config).forEach((fieldName) => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                addEventListener(field, 'blur', () => {
                    this.validateField(fieldName, field.value);
                });
            }
        });
    }
    validateField(fieldName, value) {
        const rules = this.config[fieldName];
        if (!rules)
            return true;
        const fieldErrors = [];
        rules.forEach((rule) => {
            if (!rule.rule(value)) {
                fieldErrors.push(rule.message);
            }
        });
        if (fieldErrors.length > 0) {
            this.errors.set(fieldName, fieldErrors);
            this.showFieldError(fieldName, fieldErrors[0]);
            return false;
        }
        else {
            this.errors.delete(fieldName);
            this.hideFieldError(fieldName);
            return true;
        }
    }
    showFieldError(fieldName, message) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field)
            return;
        addClass(field, 'form__input--error');
        let errorElement = this.form.querySelector(`.form__error[data-field="${fieldName}"]`);
        if (!errorElement) {
            errorElement = document.createElement('div');
            addClass(errorElement, 'form__error');
            errorElement.setAttribute('data-field', fieldName);
            field.parentNode?.insertBefore(errorElement, field.nextSibling);
        }
        errorElement.textContent = message;
    }
    hideFieldError(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field)
            return;
        removeClass(field, 'form__input--error');
        const errorElement = this.form.querySelector(`.form__error[data-field="${fieldName}"]`);
        if (errorElement) {
            errorElement.remove();
        }
    }
    validate() {
        const formData = new FormData(this.form);
        let isValid = true;
        Object.keys(this.config).forEach((fieldName) => {
            const value = formData.get(fieldName) || '';
            if (!this.validateField(fieldName, value)) {
                isValid = false;
            }
        });
        return isValid;
    }
    getErrors() {
        return this.errors;
    }
    clearErrors() {
        this.errors.clear();
        Object.keys(this.config).forEach((fieldName) => {
            this.hideFieldError(fieldName);
        });
    }
}
export const ValidationRules = {
    required: (value) => value.trim().length > 0,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: (min) => (value) => value.length >= min,
    maxLength: (max) => (value) => value.length <= max,
    pattern: (pattern) => (value) => pattern.test(value),
};
