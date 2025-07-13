import { TextField } from './TextField.js';

/**
 * NumberField Component - Pure ES6
 * Numeric input with spinners, validation, and formatting
 * 
 * @class NumberField
 * @extends TextField
 * @description A specialized text field for numeric input with step controls, validation, and locale-aware formatting
 * @example
 * const numberField = new NumberField({
 *   fieldLabel: 'Price',
 *   value: 99.99,
 *   minValue: 0,
 *   maxValue: 1000,
 *   decimalPrecision: 2,
 *   step: 0.01,
 *   allowDecimals: true
 * });
 */
export class NumberField extends TextField {
  constructor(config = {}) {
    config = config || {};
    // Set numeric input type
    config.inputType = 'number';
    
    super(config);
    this.config = config;
    
    // Map common aliases for min/max
    if (config.min !== undefined && config.minValue === undefined) {
      this.minValue = config.min;
    }
    if (config.max !== undefined && config.maxValue === undefined) {
      this.maxValue = config.max;
    }
    
    // Override value handling for zero values (parent sets 0 to '')
    if (config.value === 0 || config.value === '0') {
      this.value = 0;
    }
    
    // Behavior
    this.selectOnFocus = config.selectOnFocus !== false;
    this.submitLocaleSeparator = config.submitLocaleSeparator || false;
    
    // Override regex for number input
    if (!config.maskRe && !config.regex) {
      this.maskRe = this.buildNumberMask();
    }
    
    // Store raw numeric value
    this.rawValue = this.parseValue(this.value);
    
    // Handle zero value specifically in constructor
    if (this.value === 0 || this.value === '0') {
      this.rawValue = 0;
    }
    
    // Override field classes - for input specific styling
    this.fieldCls = `${this.fieldCls || ''}`.trim();
  }

  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      inputType: 'number',
      minValue: undefined,
      maxValue: undefined,
      step: 1,
      decimalPrecision: 2,
      allowDecimals: true,
      allowNegative: true,
      allowExponential: false,
      thousandSeparator: '',
      decimalSeparator: '.',
      currencySymbol: '',
      numberFormat: undefined,
      hideTrigger: false,
      keyNavEnabled: true,
      mouseWheelEnabled: true,
      selectOnFocus: true,
      submitLocaleSeparator: false
    };
  }

  createTemplate() {
    const labelTemplate = this.createLabelTemplate();
    const inputTemplate = this.createInputTemplate();
    const errorTemplate = this.createErrorTemplate();
    const currencyTemplate = this.currencySymbol ? `<span class="aionda-numberfield-currency absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">${this.currencySymbol}</span>` : '';
    
    return `
      <div class="${this.getFieldClasses().join(' ')}">
        ${labelTemplate}
        <div class="aionda-textfield-input-wrap relative">
          ${currencyTemplate}
          ${inputTemplate}
          ${errorTemplate}
        </div>
      </div>
    `;
  }

  getFieldClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-numberfield',
      'aionda-field'
    ];
    return classes;
  }

  createInputTemplate() {
    const inputClasses = [
      'aionda-numberfield-input',
      'block',
      'w-full',
      'px-3',
      'py-2.5',
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
      'text-right',
      'bg-white',
      'dark:bg-gray-700',
      'dark:border-gray-600',
      'dark:placeholder-gray-400',
      'dark:text-white',
      'dark:focus:ring-blue-500',
      'dark:focus:border-blue-500',
      // Mobile-first responsive design
      'min-h-[44px]', // iOS minimum touch target
      'text-base', // Prevents zoom on mobile
      'sm:text-sm', // Smaller text on desktop
      'touch-manipulation'
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
      `type="number"`,
      `value="${this.getFormattedValue()}"`,
      `placeholder="${this.escapeHtml(this.emptyText)}"`,
      this.minValue !== undefined ? `min="${this.minValue}"` : '',
      this.maxValue !== undefined ? `max="${this.maxValue}"` : '',
      `step="${this.step}"`,
      this.readOnly ? 'readonly' : '',
      this.disabled ? 'disabled' : ''
    ].filter(Boolean);
    
    const spinnerHtml = (this.hideTrigger || !this.config.spinners) ? '' : this.createSpinnerTemplate();
    
    return `
      <div class="relative">
        <input class="${inputClasses.join(' ')}" ${attributes.join(' ')}>
        ${spinnerHtml}
      </div>
    `;
  }

  createSpinnerTemplate() {
    return `
      <div class="aionda-numberfield-spinner absolute inset-y-0 right-0 flex flex-col">
        <button 
          type="button" 
          class="aionda-numberfield-spinner-up flex-1 px-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-l border-gray-300 rounded-tr-md transition-colors dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
          ${this.disabled || this.readOnly ? 'disabled' : ''}
          tabindex="-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
          </svg>
        </button>
        <button 
          type="button" 
          class="aionda-numberfield-spinner-down flex-1 px-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-l border-t border-gray-300 rounded-br-md transition-colors dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
          ${this.disabled || this.readOnly ? 'disabled' : ''}
          tabindex="-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
    `;
  }

  setupEventListeners() {
    super.setupEventListeners();
    
    // Override parent's inputEl assignment since we use different class name
    this.inputEl = this.el.querySelector('.aionda-numberfield-input') || this.el.querySelector('.aionda-textfield-input');
    this.labelEl = this.el.querySelector('.aionda-textfield-label');
    this.errorEl = this.el.querySelector('.aionda-textfield-error');
    
    // Ensure we have an input element before proceeding
    if (!this.inputEl) {
      console.error('NumberField: Could not find input element');
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
    
    // Spinner buttons
    if (!this.hideTrigger && this.config && this.config.spinners) {
      const spinnerUp = this.el.querySelector('.aionda-numberfield-spinner-up');
      const spinnerDown = this.el.querySelector('.aionda-numberfield-spinner-down');
      
      if (spinnerUp) {
        spinnerUp.addEventListener('click', (e) => this.onSpinUp(e));
        spinnerUp.addEventListener('mousedown', (e) => this.startSpin('up', e));
      }
      
      if (spinnerDown) {
        spinnerDown.addEventListener('click', (e) => this.onSpinDown(e));
        spinnerDown.addEventListener('mousedown', (e) => this.startSpin('down', e));
      }
      
      // Stop spinning on mouse up/leave
      document.addEventListener('mouseup', () => this.stopSpin());
      this.el.addEventListener('mouseleave', () => this.stopSpin());
    }
    
    // Mouse wheel support
    if (this.mouseWheelEnabled) {
      this.inputEl.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });
    }
    
    // Override keydown for arrow key navigation
    if (this.keyNavEnabled) {
      this.inputEl.addEventListener('keydown', (e) => this.onNumberKeyDown(e));
    }
    
  }

  // Override parent focus/blur to handle formatting
  onFocus(event) {
    super.onFocus(event);
    this.showRawValue();
  }

  onBlur(event) {
    super.onBlur(event);
    this.formatValue();
  }

  // Number-specific event handlers
  onSpinUp(event) {
    event.preventDefault();
    this.spinUp();
  }

  onSpinDown(event) {
    event.preventDefault();
    this.spinDown();
  }

  onMouseWheel(event) {
    if (this.hasFocus && !this.readOnly && !this.disabled) {
      event.preventDefault();
      
      if (event.deltaY < 0) {
        this.spinUp();
      } else {
        this.spinDown();
      }
    }
  }

  onNumberKeyDown(event) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.spinUp();
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        this.spinDown();
        break;
        
      default:
        super.onKeyDown(event);
        break;
    }
  }

  // Spinning functionality
  startSpin(direction, event) {
    event.preventDefault();
    this.stopSpin(); // Clear any existing spin
    
    this.spinDirection = direction;
    this.spinTimer = setTimeout(() => {
      this.continuousSpin();
    }, 500); // Initial delay
  }

  continuousSpin() {
    if (this.spinDirection === 'up') {
      this.spinUp();
    } else {
      this.spinDown();
    }
    
    this.spinTimer = setTimeout(() => {
      this.continuousSpin();
    }, 100); // Repeat interval
  }

  stopSpin() {
    if (this.spinTimer) {
      clearTimeout(this.spinTimer);
      this.spinTimer = null;
    }
    this.spinDirection = null;
  }

  spinUp() {
    if (this.readOnly || this.disabled) return;
    
    const current = this.rawValue || 0;
    let newValue = current + this.step;
    
    if (this.maxValue !== undefined && newValue > this.maxValue) {
      newValue = this.maxValue;
    }
    
    this.setValue(newValue);
    this.emit('spin', { direction: 'up', value: newValue, oldValue: current });
    this.emit('change', { value: newValue, oldValue: current, field: this });
  }

  spinDown() {
    if (this.readOnly || this.disabled) return;
    
    const current = this.rawValue || 0;
    let newValue = current - this.step;
    
    if (this.minValue !== undefined && newValue < this.minValue) {
      newValue = this.minValue;
    }
    
    this.setValue(newValue);
    this.emit('spin', { direction: 'down', value: newValue, oldValue: current });
    this.emit('change', { value: newValue, oldValue: current, field: this });
  }

  // Value processing
  parseValue(value) {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    
    // Handle zero specifically
    if (value === 0 || value === '0') {
      return 0;
    }
    
    // Convert to string and clean
    let cleanValue = String(value);
    
    // Remove currency symbol
    if (this.currencySymbol) {
      cleanValue = cleanValue.replace(this.currencySymbol, '');
    }
    
    // Remove thousand separators
    if (this.thousandSeparator) {
      cleanValue = cleanValue.replace(new RegExp('\\' + this.thousandSeparator, 'g'), '');
    }
    
    // Convert decimal separator to standard dot
    if (this.decimalSeparator !== '.') {
      cleanValue = cleanValue.replace(this.decimalSeparator, '.');
    }
    
    // Parse as number
    const parsed = parseFloat(cleanValue);
    
    if (isNaN(parsed)) {
      return NaN;
    }
    
    return parsed;
  }

  formatValue() {
    const value = this.rawValue;
    
    if (value === null || value === undefined) {
      this.inputEl.value = '';
      return;
    }
    
    let formatted = String(value);
    
    // Apply custom formatting function
    if (this.numberFormat && typeof this.numberFormat === 'function') {
      formatted = this.numberFormat(value);
    } else {
      // Apply decimal precision
      if (this.decimalPrecision !== undefined) {
        formatted = value.toFixed(this.decimalPrecision);
      }
      
      // Add thousand separators
      if (this.thousandSeparator) {
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandSeparator);
        formatted = parts.join(this.decimalSeparator || '.');
      } else if (this.decimalSeparator !== '.') {
        formatted = formatted.replace('.', this.decimalSeparator);
      }
      
      // Add currency symbol
      if (this.currencySymbol) {
        formatted = this.currencySymbol + formatted;
      }
    }
    
    this.inputEl.value = formatted;
  }

  showRawValue() {
    if (this.rawValue !== null && this.rawValue !== undefined) {
      this.inputEl.value = String(this.rawValue);
    } else {
      this.inputEl.value = '';
    }
  }

  getFormattedValue() {
    // Handle zero specifically
    if (this.rawValue === 0) {
      return '0';
    }
    if (this.rawValue === null || this.rawValue === undefined) {
      return '';
    }
    
    let formatted = String(this.rawValue);
    
    if (this.thousandSeparator) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandSeparator);
      formatted = parts.join('.');
    }
    
    return formatted;
  }

  // Value management
  getValue() {
    // Handle zero value specifically
    if (this.rawValue === 0) {
      return 0;
    }
    if (this.rawValue === null || this.rawValue === undefined) {
      return 0; // Return 0 instead of NaN for reset fields
    }
    return this.rawValue;
  }

  setValue(value, updateDisplay = true) {
    let parsedValue = this.parseValue(value);
    
    if (!isNaN(parsedValue) && parsedValue !== null && parsedValue !== undefined) {
      if (!this.allowDecimals) {
        parsedValue = Math.floor(parsedValue);
      }
      
      if (this.decimalPrecision !== undefined) {
        parsedValue = parseFloat(parsedValue.toFixed(this.decimalPrecision));
      }
    }
    
    this.setRawValue(parsedValue, updateDisplay);
    return this;
  }

  setRawValue(value, updateDisplay = true) {
    const oldValue = this.rawValue;
    this.rawValue = value;
    this.value = value; // Keep string value in sync
    
    if (updateDisplay && this.inputEl) {
      // Always show raw value in input for proper form submission
      this.showRawValue();
    }
    
    if (oldValue !== this.rawValue) {
      this.emit('change', {
        value: this.rawValue,
        oldValue: oldValue,
        field: this
      });
    }
  }

  getRawValue() {
    const inputValue = this.inputEl ? this.inputEl.value : this.value;
    const parsed = this.parseValue(inputValue);
    return parsed !== null && parsed !== undefined ? parsed : NaN;
  }

  // Override input processing
  processRawValue(value) {
    return value; // Don't apply string processing to numbers
  }

  onInput(event) {
    const inputValue = event.target.value;
    const parsedValue = this.parseValue(inputValue);
    
    // Update raw value without formatting during input
    this.rawValue = parsedValue;
    this.value = parsedValue;
    
    if (this.validateOnChange) {
      this.validate();
    }
    
    this.emit('input', { value: parsedValue, event });
  }

  onChange(event) {
    const inputValue = event.target.value;
    const parsedValue = this.parseValue(inputValue);
    const oldValue = this.lastValue;
    
    this.setRawValue(parsedValue, false);
    this.lastValue = parsedValue;
    
    this.emit('change', {
      value: parsedValue,
      oldValue: oldValue,
      event: event,
      field: this
    });
  }

  // Validation
  validate() {
    const value = this.rawValue;
    
    // Call parent validation first
    if (!super.validate()) {
      return false;
    }
    
    // Number-specific validations
    if (value !== null && value !== undefined && !isNaN(value)) {
      // Min value validation
      if (this.minValue !== undefined && value < this.minValue) {
        this.markInvalid(`Value must be at least ${this.minValue}`);
        return false;
      }
      
      // Max value validation
      if (this.maxValue !== undefined && value > this.maxValue) {
        this.markInvalid(`Value must be at most ${this.maxValue}`);
        return false;
      }
      
      // Negative check
      if (!this.allowNegative && value < 0) {
        this.markInvalid('Negative values are not allowed');
        return false;
      }
      
      // Decimal check
      if (!this.allowDecimals && value % 1 !== 0) {
        this.markInvalid('Decimal values are not allowed');
        return false;
      }
    }
    
    this.clearInvalid();
    return true;
  }

  // Build number input mask
  buildNumberMask() {
    let pattern = '';
    
    // Allow digits
    pattern += '\\d';
    
    // Allow decimal separator
    if (this.allowDecimals) {
      pattern += this.decimalSeparator === '.' ? '\\.' : this.decimalSeparator;
    }
    
    // Allow negative sign
    if (this.allowNegative) {
      pattern += '\\-';
    }
    
    // Allow exponential notation
    if (this.allowExponential) {
      pattern += 'eE\\+\\-';
    }
    
    return new RegExp(`[${pattern}]`);
  }

  // Utility methods
  isEqual(value1, value2) {
    // Handle null/undefined
    if (value1 === value2) return true;
    if (value1 == null || value2 == null) return false;
    
    // Compare as numbers with precision tolerance
    const precision = this.decimalPrecision || 10;
    const tolerance = Math.pow(10, -precision);
    
    return Math.abs(value1 - value2) < tolerance;
  }
}