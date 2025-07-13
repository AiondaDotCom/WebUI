import { Component } from '../core/Component.js';

export class Radio extends Component {
  constructor(config = {}) {
    super(config);
    
    config = config || {};
    
    this.name = config.name || this.id;
    this.fieldLabel = config.fieldLabel || config.label || '';
    this.boxLabel = config.boxLabel || config.text || '';
    this.checked = config.checked !== undefined ? config.checked : false;
    this.inputValue = config.inputValue || 'on';
    this.uncheckedValue = config.uncheckedValue || '';
    
    this.readOnly = config.readOnly || false;
    this.allowBlank = config.allowBlank !== false;
    this.submitValue = config.submitValue !== false;
    this.validators = config.validators || [];
    
    this.labelAlign = config.labelAlign || 'top';
    this.labelWidth = config.labelWidth || 120;
    this.boxLabelAlign = config.boxLabelAlign || 'after';
    this.radioCls = config.radioCls || '';
    this.focusCls = config.focusCls || 'ring-2 ring-blue-500';
    this.ariaLabel = config.ariaLabel || '';
    this.radioGroup = config.radioGroup || null;
    
    this.size = config.size || 'md';
    
    this.originalValue = this.checked;
    this.lastValue = this.checked;
    this.valid = true;
    this.errorMessage = '';
    this.hasFocus = false;
    
    this.inputEl = null;
    this.labelEl = null;
    this.boxLabelEl = null;
    this.errorEl = null;
    this.form = null;
  }

  createTemplate() {
    const labelTemplate = this.createLabelTemplate();
    const radioTemplate = this.createRadioTemplate();
    const errorTemplate = this.createErrorTemplate();
    
    return `
      <div class="${this.getFieldClasses().join(' ')}">
        ${labelTemplate}
        <div class="aionda-radio-input-wrap">
          ${radioTemplate}
          ${errorTemplate}
        </div>
      </div>
    `;
  }

  createLabelTemplate() {
    if (!this.fieldLabel) return '';
    
    const labelClasses = [
      'aionda-field-label',
      'block',
      'text-sm',
      'font-medium',
      'text-gray-700'
    ];
    
    if (this.labelAlign === 'top') {
      labelClasses.push('mb-2');
    }
    
    const labelStyle = this.labelWidth ? `style="width: ${this.labelWidth}px"` : '';
    
    return `
      <label class="${labelClasses.join(' ')}" ${labelStyle}>
        ${this.fieldLabel}
      </label>
    `;
  }

  createRadioTemplate() {
    const wrapperClasses = [
      'aionda-radio-wrap',
      'flex',
      'items-center'
    ];
    
    if (this.boxLabelAlign === 'before') {
      wrapperClasses.push('flex-row-reverse', 'justify-end');
    }
    
    const radioHtml = this.createDefaultRadioTemplate();
    const boxLabelHtml = this.boxLabel ? this.createBoxLabelTemplate() : '';
    
    return `
      <div class="${wrapperClasses.join(' ')}">
        ${radioHtml}
        ${boxLabelHtml}
      </div>
    `;
  }

  createDefaultRadioTemplate() {
    const sizeClasses = this.getSizeClasses();
    const radioClasses = [
      'aionda-radio-input',
      'border-gray-300',
      'text-blue-600',
      'focus:ring-blue-500',
      'focus:ring-2',
      'focus:ring-offset-0',
      'transition-colors',
      'duration-200',
      ...sizeClasses
    ];
    
    if (this.radioCls) {
      radioClasses.push(...this.radioCls.split(' '));
    }
    
    if (this.readOnly) {
      radioClasses.push('bg-gray-50', 'cursor-default');
    }
    
    const attributes = [
      `id="${this.id}-input"`,
      `name="${this.name}"`,
      `type="radio"`,
      `role="radio"`,
      `aria-checked="${this.checked}"`,
      `value="${this.inputValue}"`,
      this.ariaLabel ? `aria-label="${this.ariaLabel}"` : '',
      this.checked ? 'checked' : '',
      this.readOnly ? 'readonly' : '',
      this.disabled ? 'disabled' : ''
    ].filter(Boolean);
    
    return `
      <input class="${radioClasses.join(' ')}" ${attributes.join(' ')}>
    `;
  }

  createBoxLabelTemplate() {
    const labelClasses = [
      'aionda-radio-label',
      'text-sm',
      'text-gray-700',
      'select-none'
    ];
    
    if (this.boxLabelAlign === 'after') {
      labelClasses.push('ml-2');
    } else {
      labelClasses.push('mr-2');
    }
    
    if (this.readOnly) {
      labelClasses.push('cursor-default');
    } else {
      labelClasses.push('cursor-pointer');
    }
    
    return `
      <label class="${labelClasses.join(' ')}" for="${this.id}-input">
        ${this.boxLabel}
      </label>
    `;
  }

  createErrorTemplate() {
    return `
      <div class="aionda-radio-error text-sm text-red-600 mt-1 hidden">
        <!-- Error message will be inserted here -->
      </div>
    `;
  }

  getSizeClasses() {
    switch (this.size) {
      case 'sm':
        return ['h-4', 'w-4'];
      case 'lg':
        return ['h-6', 'w-6'];
      default:
        return ['h-5', 'w-5'];
    }
  }

  getFieldClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-radio',
      'aionda-field'
    ];
    
    if (this.size) {
      classes.push(`aionda-radio-${this.size}`);
    }
    
    if (!this.valid) {
      classes.push('aionda-field-invalid');
    }
    
    if (this.disabled) {
      classes.push('aionda-field-disabled');
    }
    
    if (this.readOnly) {
      classes.push('aionda-field-readonly');
    }
    
    return classes;
  }

  setupEventListeners() {
    super.setupEventListeners();
    
    this.inputEl = this.el.querySelector('.aionda-radio-input');
    this.labelEl = this.el.querySelector('.aionda-field-label');
    this.boxLabelEl = this.el.querySelector('.aionda-radio-label');
    this.errorEl = this.el.querySelector('.aionda-radio-error');
    
    this.inputEl.addEventListener('change', (e) => this.onChange(e));
    this.inputEl.addEventListener('click', (e) => this.onClick(e));
    this.inputEl.addEventListener('focus', (e) => this.onFocus(e));
    this.inputEl.addEventListener('blur', (e) => this.onBlur(e));
    this.inputEl.addEventListener('keydown', (e) => this.onKeyDown(e));
    
    if (this.boxLabelEl) {
      this.boxLabelEl.addEventListener('click', (e) => this.onLabelClick(e));
    }
  }

  onClick(event) {
    if (this.readOnly || this.disabled) {
      event.preventDefault();
      return;
    }
    
    if (!event.isTrusted) {
      this.inputEl.checked = true;
      const changeEvent = new Event('change', { bubbles: true });
      this.inputEl.dispatchEvent(changeEvent);
    }
  }

  onChange(event) {
    const oldValue = this.checked;
    this.checked = event.target.checked;
    this.updateValue();
    
    if (this.radioGroup) {
      this.radioGroup.onRadioChange(this);
    }
    
    this.emit('change', {
      field: this.name,
      checked: this.checked,
      value: this.getValue()
    });
  }

  onFocus(event) {
    this.hasFocus = true;
    if (this.focusCls && this.inputEl) {
      this.inputEl.classList.add(...this.focusCls.split(' '));
    }
    this.emit('focus', { event, field: this });
  }

  onBlur(event) {
    this.hasFocus = false;
    if (this.focusCls && this.inputEl) {
      this.inputEl.classList.remove(...this.focusCls.split(' '));
    }
    this.emit('blur', { event, field: this });
  }

  onKeyDown(event) {
    if (event.key === ' ' || event.key === 'Enter') {
      if (!this.readOnly && !this.disabled) {
        event.preventDefault();
        this.setChecked(true);
      }
    }
    
    if (this.radioGroup) {
      this.radioGroup.onRadioKeyDown(this, event);
    }
    
    this.emit('keydown', { key: event.key, event, field: this });
  }

  onLabelClick(event) {
    if (this.readOnly || this.disabled) return;
    
    event.preventDefault();
    this.setChecked(true);
  }

  getValue() {
    return this.checked ? this.inputValue : this.uncheckedValue;
  }

  setValue(value) {
    this.checked = this.valueToChecked(value);
    this.updateValue();
    this.updateDisplay();
    return this;
  }

  valueToChecked(value) {
    if (typeof value === 'boolean') {
      return value;
    }
    return value === this.inputValue;
  }

  updateValue() {
    this.value = this.getValue();
  }

  updateDisplay() {
    if (this.inputEl) {
      this.inputEl.checked = this.checked;
      this.inputEl.setAttribute('aria-checked', this.checked.toString());
    }
  }

  setChecked(checked) {
    const oldValue = this.checked;
    this.checked = !!checked;
    this.lastValue = this.checked;
    
    this.updateValue();
    this.updateDisplay();
    
    if (oldValue !== this.checked) {
      if (this.radioGroup && typeof this.radioGroup.emit === 'function') {
        this.radioGroup.emit('change', {
          field: this.name,
          value: this.getValue(),
          oldValue: oldValue ? this.inputValue : this.uncheckedValue
        });
      }
      
      this.emit('change', {
        field: this.name,
        checked: this.checked,
        value: this.getValue()
      });
    }
    
    return this;
  }

  isChecked() {
    return this.checked;
  }

  reset() {
    this.setChecked(this.originalValue);
    this.clearInvalid();
    return this;
  }

  isDirty() {
    return this.checked !== this.originalValue;
  }

  validate() {
    let isValid = true;
    
    if (this.validators && Array.isArray(this.validators)) {
      for (const validator of this.validators) {
        if (validator.type === 'required' && !this.checked) {
          this.markInvalid(validator.message || 'This field is required');
          isValid = false;
          break;
        }
      }
    }
    
    if (isValid && !this.allowBlank && !this.checked) {
      this.markInvalid('This field is required');
      isValid = false;
    }
    
    if (isValid) {
      this.clearInvalid();
    }
    
    this._lastValidationResult = isValid;
    return isValid;
  }
  
  checkValidation() {
    return this._lastValidationResult !== undefined ? this._lastValidationResult : this.valid;
  }

  isValid() {
    return this.valid;
  }

  markInvalid(message) {
    this.valid = false;
    this.errorMessage = message;
    
    if (this.el) {
      this.el.classList.add('aionda-field-invalid');
    }
    
    if (this.errorEl) {
      this.errorEl.textContent = message;
      this.errorEl.classList.remove('hidden');
    }
    
    this.emit('invalid', { message, field: this });
    return this;
  }

  clearInvalid() {
    this.valid = true;
    this.errorMessage = '';
    
    if (this.el) {
      this.el.classList.remove('aionda-field-invalid');
    }
    
    if (this.errorEl) {
      this.errorEl.textContent = '';
      this.errorEl.classList.add('hidden');
    }
    
    this.emit('valid', { field: this });
    return this;
  }

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

  setReadOnly(readOnly) {
    this.readOnly = readOnly;
    
    if (this.inputEl) {
      if (readOnly) {
        this.inputEl.setAttribute('readonly', '');
      } else {
        this.inputEl.removeAttribute('readonly');
      }
    }
    
    return this;
  }

  disable() {
    return this.setDisabled(true);
  }

  enable() {
    return this.setDisabled(false);
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

  destroy() {
    if (this.inputEl) {
      this.inputEl.removeEventListener('change', (e) => this.onChange(e));
      this.inputEl.removeEventListener('click', (e) => this.onClick(e));
      this.inputEl.removeEventListener('focus', (e) => this.onFocus(e));
      this.inputEl.removeEventListener('blur', (e) => this.onBlur(e));
      this.inputEl.removeEventListener('keydown', (e) => this.onKeyDown(e));
    }
    
    if (this.boxLabelEl) {
      this.boxLabelEl.removeEventListener('click', (e) => this.onLabelClick(e));
    }
    
    this.inputEl = null;
    this.labelEl = null;
    this.boxLabelEl = null;
    this.errorEl = null;
    
    super.destroy();
  }
}