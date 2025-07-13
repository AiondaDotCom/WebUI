import { Component } from '../core/Component.js';

/**
 * @component TextField
 * @extends Component
 * @description A single-line text input field with validation, formatting, and various input types
 * @category Form Components
 * @since 1.0.0
 * @example
 * // Text field with validation
 * const textField = new AiondaWebUI.TextField({
 *   fieldLabel: 'Email',
 *   inputType: 'email',
 *   required: true,
 *   vtype: 'email'
 * });
 * textField.renderTo('#container');
 */
export class TextField extends Component {
    /**
   * @config
   * @property {string} [name] - Input name attribute
   * @property {string} [fieldLabel=''] - Label text displayed above field
   * @property {string} [value=''] - Initial text value
   * @property {string} [inputType='text'] - HTML input type
   * @property {string} [placeholder] - Placeholder text
   * @property {number} [maxLength] - Maximum number of characters
   * @property {number} [minLength] - Minimum number of characters
   * @property {boolean} [readOnly=false] - Whether field is read-only
   * @property {boolean} [required=false] - Whether field is required
   * @property {string} [vtype] - Validation type ('email', 'url', 'alpha', 'alphanum')
   * @property {RegExp} [maskRe] - Regular expression for input masking
   * @property {boolean} [selectOnFocus=false] - Whether to select text on focus
   */
  constructor(config = {}) {
    super(config);
    
    // Handle special cases for config merging
    this.name = this.name || this.id;
    this.fieldLabel = this.fieldLabel || this.label || '';
    this.emptyText = this.emptyText || this.placeholder;
    
    // Set initial state based on config
    this.originalValue = this.value;
    this.lastValue = this.value;
    this.valid = true;
    this.errorMessage = '';
    this.hasFocus = false;
    
    // DOM elements
    this.inputEl = null;
    this.labelEl = null;
    this.errorEl = null;
    this.form = null; // Will be set by parent form
    
    // Add validateFn to validators array if provided
    if (config && config.validateFn && typeof config.validateFn === 'function') {
      this.validators = [...(this.validators || []), config.validateFn];
    }
    
    // Convert required: true to allowBlank: false for backward compatibility
    if (config && config.required === true) {
      this.allowBlank = false;
    }
  }

  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      name: undefined, // Will be set to id if not provided
      fieldLabel: '',
      label: '',
      value: '',
      placeholder: '',
      emptyText: '',
      maxLength: undefined,
      minLength: undefined,
      regex: undefined,
      maskRe: undefined,
      stripCharsRe: undefined,
      inputType: 'text',
      allowBlank: true,
      readOnly: false,
      selectOnFocus: false,
      enableKeyEvents: false,
      labelAlign: 'top',
      labelWidth: 120,
      fieldCls: '',
      invalidCls: 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20',
      focusCls: 'ring-2 ring-blue-500 border-blue-500 dark:ring-blue-400 dark:border-blue-400',
      validators: [],
      validator: undefined,
      validateOnChange: true,
      validateOnBlur: true
    };
  }

  createTemplate() {
    const labelTemplate = this.createLabelTemplate();
    const inputTemplate = this.createInputTemplate();
    const errorTemplate = this.createErrorTemplate();
    
    return `
      <div class="${this.getFieldClasses().join(' ')}">
        ${labelTemplate}
        <div class="aionda-textfield-input-wrap relative">
          ${inputTemplate}
          ${errorTemplate}
        </div>
      </div>
    `;
  }

  createLabelTemplate() {
    if (!this.fieldLabel) return '';
    
    const labelClasses = [
      'aionda-textfield-label',
      'block',
      'text-sm',
      'font-medium',
      'text-gray-700',
      'dark:text-gray-300'
    ];
    
    if (this.labelAlign === 'top') {
      labelClasses.push('mb-1');
    }
    
    const requiredMark = !this.allowBlank ? '<span class="text-red-500 ml-1" aria-label="required">*</span>' : '';
    
    return `
      <label class="${labelClasses.join(' ')}" for="${this.id}-input" id="${this.id}-label">
        ${this.fieldLabel}${requiredMark}
      </label>
    `;
  }

  createInputTemplate() {
    const inputClasses = [
      'aionda-textfield-input',
      'block',
      'w-full',
      'px-3',
      'py-2',
      'border',
      'border-gray-300',
      'rounded-md',
      'shadow-sm',
      'placeholder-gray-400',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:border-blue-500',
      'transition-colors',
      'duration-200',
      'bg-white',
      'dark:bg-gray-700',
      'dark:border-gray-600',
      'dark:placeholder-gray-400',
      'dark:text-white',
      'dark:focus:ring-blue-500',
      'dark:focus:border-blue-500'
    ];
    
    if (this.fieldCls) {
      inputClasses.push(...this.fieldCls.split(' '));
    }
    
    if (this.readOnly) {
      inputClasses.push('bg-gray-50', 'cursor-default', 'dark:bg-gray-600');
    }
    
    const attributes = [
      `id="${this.id}-input"`,
      `name="${this.name}"`,
      `type="${this.inputType}"`,
      `value="${this.escapeHtml(this.value)}"`,
      `placeholder="${this.escapeHtml(this.emptyText)}"`,
      this.readOnly ? 'readonly' : '',
      this.readOnly ? 'aria-readonly="true"' : '',
      this.disabled ? 'disabled' : '',
      this.disabled ? 'aria-disabled="true"' : '',
      this.maxLength ? `maxlength="${this.maxLength}"` : '',
      !this.allowBlank ? 'required' : '',
      !this.allowBlank ? 'aria-required="true"' : '',
      `aria-describedby="${this.id}-error"`,
      this.fieldLabel ? `aria-labelledby="${this.id}-label"` : '',
      this.valid ? 'aria-invalid="false"' : 'aria-invalid="true"'
    ].filter(Boolean);
    
    return `
      <input class="${inputClasses.join(' ')}" ${attributes.join(' ')}>
    `;
  }

  createErrorTemplate() {
    return `
      <div class="aionda-textfield-error text-sm text-red-600 dark:text-red-400 mt-1 hidden" 
           id="${this.id}-error" 
           role="alert" 
           aria-live="polite">
        <!-- Error message will be inserted here -->
      </div>
    `;
  }

  getBaseClasses() {
    const classes = [
      ...super.getBaseClasses(),
      'aionda-textfield',
      'aionda-field'
    ];
    
    if (this.labelAlign === 'left' || this.labelAlign === 'right') {
      classes.push('flex', 'items-start', 'gap-3');
    }
    
    if (!this.valid) {
      classes.push('aionda-field-invalid');
    }
    
    return classes;
  }

  getFieldClasses() {
    return this.getBaseClasses();
  }

  setupEventListeners() {
    super.setupEventListeners();
    
    // Try to find input with various possible class names (for inheritance)
    this.inputEl = this.el.querySelector('.aionda-textfield-input') || 
                   this.el.querySelector('.aionda-numberfield-input') ||
                   this.el.querySelector('input');
    this.labelEl = this.el.querySelector('.aionda-textfield-label');
    this.errorEl = this.el.querySelector('.aionda-textfield-error');
    
    // Ensure we have an input element before proceeding
    if (!this.inputEl) {
      console.error('TextField: Could not find input element in:', this.constructor.name);
      return;
    }
    
    // Input events
    this.inputEl.addEventListener('input', (e) => this.onInput(e));
    this.inputEl.addEventListener('change', (e) => this.onChange(e));
    this.inputEl.addEventListener('focus', (e) => this.onFocus(e));
    this.inputEl.addEventListener('blur', (e) => this.onBlur(e));
    
    // Key events if enabled
    if (this.enableKeyEvents) {
      this.inputEl.addEventListener('keydown', (e) => this.onKeyDown(e));
      this.inputEl.addEventListener('keyup', (e) => this.onKeyUp(e));
      this.inputEl.addEventListener('keypress', (e) => this.onKeyPress(e));
    }
    
    // Select on focus
    if (this.selectOnFocus) {
      this.inputEl.addEventListener('focus', () => {
        setTimeout(() => this.inputEl.select(), 10);
      });
    }
  }

  // Event handlers
  onInput(event) {
    const value = this.processRawValue(event.target.value);
    this.setValue(value, false);
    
    if (this.validateOnChange) {
      this.validate();
    }
    
    this.emit('input', { value, event });
  }

  onChange(event) {
    const value = this.processRawValue(event.target.value);
    const oldValue = this.lastValue;
    
    this.setValue(value, false);
    this.lastValue = value;
    
    this.emit('change', { 
      value, 
      oldValue, 
      field: this.name 
    });
  }

  onFocus(event) {
    this.hasFocus = true;
    this.inputEl.classList.add(...this.focusCls.split(' '));
    
    this.emit('focus', { value: this.value, event, field: this });
  }

  onBlur(event) {
    this.hasFocus = false;
    this.inputEl.classList.remove(...this.focusCls.split(' '));
    
    if (this.validateOnBlur) {
      this.validate();
    }
    
    this.emit('blur', { value: this.value, event, field: this });
  }

  onKeyDown(event) {
    this.emit('keydown', { key: event.key, event, field: this });
  }

  onKeyUp(event) {
    this.emit('keyup', { key: event.key, event, field: this });
  }

  onKeyPress(event) {
    // Apply character masking
    if (this.maskRe && !this.maskRe.test(event.key) && !this.isSpecialKey(event)) {
      event.preventDefault();
      return;
    }
    
    this.emit('keypress', { key: event.key, event, field: this });
  }

  isSpecialKey(event) {
    // Allow special keys like backspace, delete, arrows, etc.
    return event.key.length > 1 || event.ctrlKey || event.metaKey || event.altKey;
  }

  // Value processing
  processRawValue(value) {
    if (this.stripCharsRe) {
      value = value.replace(this.stripCharsRe, '');
    }
    
    return value;
  }

  // Value management
  getValue() {
    return this.value;
  }

  setValue(value, updateDisplay = true) {
    const oldValue = this.value;
    this.value = value != null ? String(value) : '';
    
    if (updateDisplay && this.inputEl) {
      this.inputEl.value = this.value;
    }
    
    if (updateDisplay && oldValue !== this.value) {
      this.emit('change', { 
        value: this.value, 
        oldValue, 
        field: this.name 
      });
    }
    
    return this;
  }

  getRawValue() {
    return this.inputEl ? this.inputEl.value : this.value;
  }

  reset() {
    this.setValue(this.originalValue);
    this.clearInvalid();
    return this;
  }

  isDirty() {
    return this.value !== this.originalValue;
  }

  // Validation
  validate() {
    const value = this.getValue();
    
    // Additional validators (check these first to respect custom messages)
    for (const validator of this.validators) {
      const result = this.runValidator(validator, value);
      if (result !== true && result !== null && result !== undefined) {
        this.markInvalid(result);
        return false;
      }
    }
    
    // Required validation (only if no custom required validator was provided)
    const isEmptyValue = !value || (typeof value === 'string' && value.trim().length === 0);
    if (!this.allowBlank && isEmptyValue) {
      // Check if there's already a 'required' validator in the validators array
      const hasRequiredValidator = this.validators.some(v => v.type === 'required');
      if (!hasRequiredValidator) {
        this.markInvalid(this.t('validation.required'));
        return false;
      }
    }
    
    // Length validations
    if (value && this.minLength && value.length < this.minLength) {
      this.markInvalid(this.t('validation.minLength', { min: this.minLength }));
      return false;
    }
    
    if (value && this.maxLength && value.length > this.maxLength) {
      this.markInvalid(this.t('validation.maxLength', { max: this.maxLength }));
      return false;
    }
    
    // Regex validation
    if (value && this.regex && !this.regex.test(value)) {
      this.markInvalid(this.t('validation.format'));
      return false;
    }
    
    // Custom validator
    if (this.validator && typeof this.validator === 'function') {
      const result = this.validator(value, this);
      if (result !== true) {
        this.markInvalid(result || this.t('validation.format'));
        return false;
      }
    }
    
    this.clearInvalid();
    return true;
  }

  runValidator(validator, value) {
    if (typeof validator === 'function') {
      return validator(value, this);
    }
    
    if (typeof validator === 'object') {
      const { type, message, ...options } = validator;
      
      switch (type) {
        case 'required':
          return (value && value.trim().length > 0) ? true : 
            (message || this.t('validation.required'));
            
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return !value || emailRegex.test(value) ? true : 
            (message || this.t('validation.email'));
            
        case 'url':
          try {
            if (value) new URL(value);
            return true;
          } catch {
            return message || this.t('validation.url');
          }
          
        case 'minLength':
          return !value || value.length >= options.min ? true :
            (message || this.t('validation.minLength', { min: options.min }));
            
        case 'pattern':
          return !value || options.regex.test(value) ? true :
            (message || this.t('validation.format'));
            
        default:
          return true;
      }
    }
    
    return true;
  }

  isValid() {
    return this.valid;
  }

  markInvalid(message) {
    this.valid = false;
    this.errorMessage = message;
    
    if (this.inputEl) {
      this.inputEl.classList.add(...this.invalidCls.split(' '));
      this.inputEl.setAttribute('aria-invalid', 'true');
    }
    
    if (this.errorEl) {
      this.errorEl.textContent = message;
      this.errorEl.classList.remove('hidden');
      
      // Use assertive for form submission errors, polite for live validation
      const ariaLive = (this.form && this.form.validatingForSubmission) ? 'assertive' : 'polite';
      this.errorEl.setAttribute('aria-live', ariaLive);
    }
    
    this.emit('invalid', { message, field: this });
    return this;
  }

  clearInvalid() {
    this.valid = true;
    this.errorMessage = '';
    
    if (this.inputEl) {
      this.inputEl.classList.remove(...this.invalidCls.split(' '));
      this.inputEl.removeAttribute('aria-invalid');
    }
    
    if (this.errorEl) {
      this.errorEl.textContent = '';
      this.errorEl.classList.add('hidden');
    }
    
    this.emit('valid', { field: this });
    return this;
  }

  // Focus management
  focus() {
    if (this.inputEl) {
      this.inputEl.focus();
    }
    return this;
  }

  blur() {
    if (this.inputEl) {
      this.inputEl.blur();
    }
    return this;
  }

  selectText(start, end) {
    if (this.inputEl) {
      if (start === undefined) {
        this.inputEl.select();
      } else {
        this.inputEl.setSelectionRange(start, end || start);
      }
    }
    return this;
  }

  // Utility methods
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setReadOnly(readOnly) {
    this.readOnly = readOnly;
    if (this.inputEl) {
      if (readOnly) {
        this.inputEl.setAttribute('readonly', '');
        this.inputEl.classList.add('bg-gray-50', 'cursor-default', 'dark:bg-gray-600');
      } else {
        this.inputEl.removeAttribute('readonly');
        this.inputEl.classList.remove('bg-gray-50', 'cursor-default', 'dark:bg-gray-600');
      }
    }
    return this;
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.inputEl) {
      if (disabled) {
        this.inputEl.setAttribute('disabled', '');
      } else {
        this.inputEl.removeAttribute('disabled');
      }
    }
    return this;
  }
}