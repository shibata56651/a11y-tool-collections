import { addClass, querySelector, removeClass } from '../utils/dom.js';
import { addEventListener } from '../utils/events.js';

export interface ValidationRule {
  rule: (value: string) => boolean;
  message: string;
}

export interface ValidationConfig {
  [fieldName: string]: ValidationRule[];
}

export class FormValidator {
  private form: HTMLFormElement;
  private config: ValidationConfig;
  private errors: Map<string, string[]> = new Map();

  constructor(formSelector: string, config: ValidationConfig) {
    const form = querySelector(formSelector);
    if (!form) {
      throw new Error(`Form not found: ${formSelector}`);
    }
    this.form = form as HTMLFormElement;
    this.config = config;
    this.init();
  }

  private init(): void {
    addEventListener(this.form, 'submit', (event) => {
      if (!this.validate()) {
        event.preventDefault();
      }
    });

    Object.keys(this.config).forEach((fieldName) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
      if (field) {
        addEventListener(field, 'blur', () => {
          this.validateField(fieldName, field.value);
        });
      }
    });
  }

  private validateField(fieldName: string, value: string): boolean {
    const rules = this.config[fieldName];
    if (!rules) return true;

    const fieldErrors: string[] = [];

    rules.forEach((rule) => {
      if (!rule.rule(value)) {
        fieldErrors.push(rule.message);
      }
    });

    if (fieldErrors.length > 0) {
      this.errors.set(fieldName, fieldErrors);
      this.showFieldError(fieldName, fieldErrors[0]);
      return false;
    } else {
      this.errors.delete(fieldName);
      this.hideFieldError(fieldName);
      return true;
    }
  }

  private showFieldError(fieldName: string, message: string): void {
    const field = this.form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    if (!field) return;

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

  private hideFieldError(fieldName: string): void {
    const field = this.form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    if (!field) return;

    removeClass(field, 'form__input--error');

    const errorElement = this.form.querySelector(`.form__error[data-field="${fieldName}"]`);
    if (errorElement) {
      errorElement.remove();
    }
  }

  public validate(): boolean {
    const formData = new FormData(this.form);
    let isValid = true;

    Object.keys(this.config).forEach((fieldName) => {
      const value = (formData.get(fieldName) as string) || '';
      if (!this.validateField(fieldName, value)) {
        isValid = false;
      }
    });

    return isValid;
  }

  public getErrors(): Map<string, string[]> {
    return this.errors;
  }

  public clearErrors(): void {
    this.errors.clear();
    Object.keys(this.config).forEach((fieldName) => {
      this.hideFieldError(fieldName);
    });
  }
}

export const ValidationRules = {
  required: (value: string) => value.trim().length > 0,
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  minLength: (min: number) => (value: string) => value.length >= min,
  maxLength: (max: number) => (value: string) => value.length <= max,
  pattern: (pattern: RegExp) => (value: string) => pattern.test(value),
};
