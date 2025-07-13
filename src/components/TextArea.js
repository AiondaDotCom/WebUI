import { TextField } from './TextField.js';
import { Component } from '../core/Component.js';

/**
 * @component TextArea
 * @extends Component
 * @description A multi-line text input component with auto-resize and validation capabilities
 * @category Form Components
 * @since 1.0.0
 * @example
 * // Auto-resizing text area
 * const textArea = new AiondaWebUI.TextArea({
 *   fieldLabel: 'Comments',
 *   placeholder: 'Enter your comments...',
 *   autoResize: true,
 *   maxLength: 500
 * });
 * textArea.renderTo('#container');
 */
export class TextArea extends TextField {
    /**
   * @config
   * @property {string} [name] - Input name attribute
   * @property {string} [fieldLabel=''] - Label text displayed above field
   * @property {string} [value=''] - Initial text value
   * @property {string} [placeholder] - Placeholder text
   * @property {number} [rows=3] - Number of visible rows
   * @property {number} [cols] - Number of visible columns
   * @property {number} [maxLength] - Maximum number of characters
   * @property {boolean} [autoResize=false] - Whether to auto-resize height
   * @property {boolean} [readOnly=false] - Whether field is read-only
   * @property {boolean} [required=false] - Whether field is required
   * @property {string} [resize='vertical'] - Resize behavior ('none', 'both', 'horizontal', 'vertical')
   */
  constructor(config = {}) {
    super(config);
    
    // Handle null/undefined config
    config = config || {};
    
    // TextArea specific properties
    this.rows = config.rows || 3;
    this.cols = config.cols;
    this.wrap = config.wrap || 'soft'; // soft, hard, off
    this.autoResize = config.autoResize || false;
    this.maxRows = config.maxRows || 10;
    this.minRows = config.minRows || this.rows;
    this.showCharCount = config.showCharCount || false;
    this.charCountText = config.charCountText || '{0} characters';
    this.maxLengthText = config.maxLengthText || '{0} / {1} characters';
    
    // Override labelAlign default for TextArea
    this.labelAlign = config.labelAlign || 'top';
    
    // DOM elements specific to TextArea
    this.textareaEl = null;
    this.charCountEl = null;
  }

  createTemplate() {
    const labelTemplate = this.createLabelTemplate();
    const textareaTemplate = this.createTextAreaTemplate();
    const errorTemplate = this.createErrorTemplate();
    const charCountTemplate = this.createCharCountTemplate();
    
    return `
      <div class="${this.getFieldClasses().join(' ')}">
        ${labelTemplate}
        <div class="aionda-textarea-input-wrap relative">
          ${textareaTemplate}
          ${charCountTemplate}
          ${errorTemplate}
        </div>
      </div>
    `;
  }

  createLabelTemplate() {
    if (!this.fieldLabel) return '';
    
    const labelClasses = [
      'aionda-textarea-label',
      'block',
      'text-sm',
      'font-medium',
      'text-gray-700'
    ];
    
    if (this.labelAlign === 'top') {
      labelClasses.push('mb-1');
    }
    
    const requiredMark = !this.allowBlank ? '<span class="text-red-500 ml-1">*</span>' : '';
    
    return `
      <label class="${labelClasses.join(' ')}" for="${this.id}-textarea">
        ${this.fieldLabel}${requiredMark}
      </label>
    `;
  }

  createTextAreaTemplate() {
    const textareaClasses = [
      'aionda-textarea-input',
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
      'resize-none'
    ];
    
    if (this.fieldCls) {
      textareaClasses.push(...this.fieldCls.split(' '));
    }
    
    if (this.readOnly) {
      textareaClasses.push('bg-gray-50', 'cursor-default');
    }
    
    if (!this.autoResize) {
      textareaClasses.push('resize-y');
    }
    
    const attributes = [
      `id="${this.id}-textarea"`,
      `name="${this.name}"`,
      `rows="${this.rows}"`,
      this.cols ? `cols="${this.cols}"` : '',
      `wrap="${this.wrap}"`,
      `placeholder="${this.escapeHtml(this.placeholder || this.emptyText)}"`,
      this.readOnly ? 'readonly' : '',
      this.maxLength ? `maxlength="${this.maxLength}"` : '',
      this.disabled ? 'disabled' : ''
    ].filter(Boolean);
    
    return `
      <textarea class="${textareaClasses.join(' ')}" ${attributes.join(' ')}>${this.escapeHtml(this.value)}</textarea>
    `;
  }

  createCharCountTemplate() {
    if (!this.showCharCount) return '';
    
    return `
      <div class="aionda-textarea-charcount text-xs text-gray-500 mt-1 text-right">
        <!-- Character count will be inserted here -->
      </div>
    `;
  }

  createErrorTemplate() {
    return `
      <div class="aionda-textarea-error text-sm text-red-600 mt-1 hidden">
        <!-- Error message will be inserted here -->
      </div>
    `;
  }

  getBaseClasses() {
    const classes = [
      ...super.getBaseClasses(),
      'aionda-textarea',
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
    // Call Component.setupEventListeners instead of TextField to avoid conflicts
    Component.prototype.setupEventListeners.call(this);
    
    // Set up textarea element references first
    this.textareaEl = this.el.querySelector('.aionda-textarea-input');
    this.inputEl = this.textareaEl; // Alias for compatibility with TextField methods
    this.labelEl = this.el.querySelector('.aionda-textarea-label');
    this.errorEl = this.el.querySelector('.aionda-textarea-error');
    this.charCountEl = this.el.querySelector('.aionda-textarea-charcount');
    
    // Input events (override TextField's event handling)
    if (this.textareaEl) {
      this.textareaEl.addEventListener('input', (e) => this.onInput(e));
      this.textareaEl.addEventListener('change', (e) => this.onChange(e));
      this.textareaEl.addEventListener('focus', (e) => this.onFocus(e));
      this.textareaEl.addEventListener('blur', (e) => this.onBlur(e));
    }
    
    // Key events if enabled
    if (this.enableKeyEvents && this.textareaEl) {
      this.textareaEl.addEventListener('keydown', (e) => this.onKeyDown(e));
      this.textareaEl.addEventListener('keyup', (e) => this.onKeyUp(e));
      this.textareaEl.addEventListener('keypress', (e) => this.onKeyPress(e));
    }
    
    // Select on focus
    if (this.selectOnFocus && this.textareaEl) {
      this.textareaEl.addEventListener('focus', () => {
        setTimeout(() => this.textareaEl.select(), 10);
      });
    }
    
    // Auto-resize functionality
    if (this.autoResize && this.textareaEl) {
      this.textareaEl.addEventListener('input', () => this.adjustHeight());
      // Initial height adjustment
      setTimeout(() => this.adjustHeight(), 0);
    }
    
    // Update character count
    this.updateCharCount();
  }

  // Auto-resize functionality
  adjustHeight() {
    if (!this.autoResize || !this.textareaEl) return;
    
    // Reset height to get proper scrollHeight
    this.textareaEl.style.height = 'auto';
    
    // Calculate new height based on content
    const lineHeight = parseInt(getComputedStyle(this.textareaEl).lineHeight) || 20;
    const padding = parseInt(getComputedStyle(this.textareaEl).paddingTop) + 
                   parseInt(getComputedStyle(this.textareaEl).paddingBottom);
    
    const minHeight = (this.minRows * lineHeight) + padding;
    const maxHeight = (this.maxRows * lineHeight) + padding;
    const scrollHeight = this.textareaEl.scrollHeight;
    
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    
    this.textareaEl.style.height = newHeight + 'px';
    
    // Show scrollbar if content exceeds max height
    if (scrollHeight > maxHeight) {
      this.textareaEl.style.overflowY = 'auto';
    } else {
      this.textareaEl.style.overflowY = 'hidden';
    }
  }

  // Character count functionality
  updateCharCount() {
    if (!this.charCountEl || !this.showCharCount) return;
    
    const currentLength = this.value.length;
    let text = '';
    
    // Reset all classes first
    this.charCountEl.classList.remove('text-gray-500', 'text-orange-500', 'text-red-500');
    
    if (this.maxLength) {
      text = this.maxLengthText.replace('{0}', currentLength).replace('{1}', this.maxLength);
      
      // Add warning color if approaching limit
      if (currentLength >= this.maxLength) {
        this.charCountEl.classList.add('text-red-500');
      } else if (currentLength >= this.maxLength * 0.9) {
        this.charCountEl.classList.add('text-orange-500');
      } else {
        this.charCountEl.classList.add('text-gray-500');
      }
    } else {
      text = this.charCountText.replace('{0}', currentLength);
      this.charCountEl.classList.add('text-gray-500');
    }
    
    this.charCountEl.textContent = text;
  }

  // Event handlers
  onInput(event) {
    let value = event.target.value;
    
    // Enforce character limit
    if (this.maxLength && value.length > this.maxLength) {
      value = value.substring(0, this.maxLength);
      event.target.value = value;
    }
    
    this.setValue(value, false);
    
    if (this.validateOnChange) {
      this.validate();
    }
    
    this.updateCharCount();
    
    if (this.autoResize) {
      this.adjustHeight();
    }
    
    this.emit('input', { value, event });
  }

  onChange(event) {
    const value = event.target.value;
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
    this.textareaEl.classList.add(...this.focusCls.split(' '));
    
    this.emit('focus', { value: this.value, event, field: this });
  }

  onBlur(event) {
    this.hasFocus = false;
    this.textareaEl.classList.remove(...this.focusCls.split(' '));
    
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
    this.emit('keypress', { key: event.key, event, field: this });
  }

  // Value management
  getValue() {
    return this.value;
  }

  setValue(value, updateDisplay = true) {
    const oldValue = this.value;
    this.value = value != null ? String(value) : '';
    
    if (updateDisplay && this.textareaEl) {
      this.textareaEl.value = this.value;
    }
    
    // Always update character count when value changes
    this.updateCharCount();
    
    if (updateDisplay && this.autoResize) {
      setTimeout(() => this.adjustHeight(), 0);
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
    return this.textareaEl ? this.textareaEl.value : this.value;
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
    
    // Required validation
    if (!this.allowBlank && (!value || value.trim().length === 0)) {
      this.markInvalid('Field is required');
      return false;
    }
    
    // Length validations
    if (value && this.minLength && value.length < this.minLength) {
      this.markInvalid(`Minimum length is ${this.minLength} characters`);
      return false;
    }
    
    if (value && this.maxLength && value.length > this.maxLength) {
      this.markInvalid(`Maximum length is ${this.maxLength} characters`);
      return false;
    }
    
    // Regex validation
    if (value && this.regex && !this.regex.test(value)) {
      this.markInvalid('Invalid format');
      return false;
    }
    
    // Custom validator
    if (this.validator && typeof this.validator === 'function') {
      const result = this.validator(value, this);
      if (result !== true) {
        this.markInvalid(result || 'Invalid value');
        return false;
      }
    }
    
    // Additional validators
    for (const validator of this.validators) {
      const result = this.runValidator(validator, value);
      if (result !== true) {
        this.markInvalid(result);
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
            (message || 'Field is required');
            
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return !value || emailRegex.test(value) ? true : 
            (message || 'Please enter a valid email address');
            
        case 'url':
          try {
            if (value) new URL(value);
            return true;
          } catch {
            return message || 'Please enter a valid URL';
          }
          
        case 'minLength':
          return !value || value.length >= options.min ? true :
            (message || `Minimum length is ${options.min} characters`);
            
        case 'pattern':
          return !value || options.regex.test(value) ? true :
            (message || 'Invalid format');
            
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
    
    if (this.textareaEl) {
      this.textareaEl.classList.add(...this.invalidCls.split(' '));
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
    
    if (this.textareaEl) {
      this.textareaEl.classList.remove(...this.invalidCls.split(' '));
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
    if (this.textareaEl) {
      this.textareaEl.focus();
    }
    return this;
  }

  blur() {
    if (this.textareaEl) {
      this.textareaEl.blur();
    }
    return this;
  }

  selectText(start, end) {
    if (this.textareaEl) {
      if (start === undefined) {
        this.textareaEl.select();
      } else {
        this.textareaEl.setSelectionRange(start, end || start);
      }
    }
    return this;
  }

  // Text manipulation methods
  insertTextAtCursor(text) {
    if (!this.textareaEl) return this;
    
    const start = this.textareaEl.selectionStart;
    const end = this.textareaEl.selectionEnd;
    const value = this.textareaEl.value;
    
    const newValue = value.substring(0, start) + text + value.substring(end);
    this.setValue(newValue);
    
    // Update textarea element immediately
    if (this.textareaEl) {
      this.textareaEl.value = newValue;
    }
    
    // Set cursor position after inserted text
    setTimeout(() => {
      const newPosition = start + text.length;
      this.textareaEl.setSelectionRange(newPosition, newPosition);
    }, 0);
    
    return this;
  }

  getSelectedText() {
    if (!this.textareaEl) return '';
    
    const start = this.textareaEl.selectionStart;
    const end = this.textareaEl.selectionEnd;
    
    return this.textareaEl.value.substring(start, end);
  }

  replaceSelectedText(text) {
    if (!this.textareaEl) return this;
    
    const start = this.textareaEl.selectionStart;
    const end = this.textareaEl.selectionEnd;
    const value = this.textareaEl.value;
    
    const newValue = value.substring(0, start) + text + value.substring(end);
    this.setValue(newValue);
    
    // Update textarea element immediately
    if (this.textareaEl) {
      this.textareaEl.value = newValue;
    }
    
    // Set cursor position after replacement
    setTimeout(() => {
      const newPosition = start + text.length;
      this.textareaEl.setSelectionRange(newPosition, newPosition);
    }, 0);
    
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
    if (this.textareaEl) {
      if (readOnly) {
        this.textareaEl.setAttribute('readonly', '');
        this.textareaEl.classList.add('bg-gray-50', 'cursor-default');
      } else {
        this.textareaEl.removeAttribute('readonly');
        this.textareaEl.classList.remove('bg-gray-50', 'cursor-default');
      }
    }
    return this;
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.textareaEl) {
      if (disabled) {
        this.textareaEl.setAttribute('disabled', '');
      } else {
        this.textareaEl.removeAttribute('disabled');
      }
    }
    return this;
  }

  // TextArea specific methods
  setRows(rows) {
    this.rows = rows;
    if (this.textareaEl) {
      this.textareaEl.setAttribute('rows', rows);
    }
    return this;
  }

  setAutoResize(autoResize) {
    this.autoResize = autoResize;
    
    if (this.textareaEl) {
      if (autoResize) {
        this.textareaEl.classList.remove('resize-y');
        this.textareaEl.classList.add('resize-none');
        this.textareaEl.addEventListener('input', () => this.adjustHeight());
        setTimeout(() => this.adjustHeight(), 0);
      } else {
        this.textareaEl.classList.add('resize-y');
        this.textareaEl.classList.remove('resize-none');
        this.textareaEl.style.height = 'auto';
        this.textareaEl.style.overflowY = 'auto';
      }
    }
    
    return this;
  }

  setMaxRows(maxRows) {
    this.maxRows = maxRows;
    if (this.autoResize) {
      this.adjustHeight();
    }
    return this;
  }

  setMinRows(minRows) {
    this.minRows = minRows;
    if (this.autoResize) {
      this.adjustHeight();
    }
    return this;
  }
}