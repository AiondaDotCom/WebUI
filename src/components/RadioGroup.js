import { Component } from '../core/Component.js';
import { Radio } from './Radio.js';

export class RadioGroup extends Component {
  constructor(config = {}) {
    super(config);
    
    config = config || {};
    
    this.name = config.name || this.id;
    this.fieldLabel = config.fieldLabel || config.label || '';
    this.value = config.value || '';
    this.items = config.items || [];
    this.columns = config.columns || 1;
    this.layout = config.layout || 'vertical';
    
    this.readOnly = config.readOnly || false;
    this.allowBlank = config.allowBlank !== false;
    this.submitValue = config.submitValue !== false;
    this.validators = config.validators || [];
    
    this.labelAlign = config.labelAlign || 'top';
    this.labelWidth = config.labelWidth || 120;
    this.radioGroupCls = config.radioGroupCls || '';
    this.focusCls = config.focusCls || 'ring-2 ring-blue-500';
    
    this.size = config.size || 'md';
    
    this.originalValue = this.value;
    this.lastValue = this.value;
    this.valid = true;
    this.errorMessage = '';
    this.hasFocus = false;
    
    this.labelEl = null;
    this.groupEl = null;
    this.errorEl = null;
    this.radios = new Map();
    this.form = config.form || null;
    
    if (this.form && typeof this.form.add === 'function') {
      this.form.add(this);
    }
    this.focusedRadioIndex = -1;
  }

  createTemplate() {
    const labelTemplate = this.createLabelTemplate();
    const groupTemplate = this.createGroupTemplate();
    const errorTemplate = this.createErrorTemplate();
    
    return `
      <div class="${this.getFieldClasses().join(' ')}">
        ${labelTemplate}
        <div class="aionda-radiogroup-input-wrap">
          ${groupTemplate}
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
    
    return `
      <label id="${this.id}-label" class="${labelClasses.join(' ')}">
        ${this.fieldLabel}
      </label>
    `;
  }

  createGroupTemplate() {
    const groupClasses = [
      'aionda-radiogroup-items',
      'space-y-2'
    ];
    
    if (this.layout === 'horizontal') {
      groupClasses.splice(-1, 1, 'space-x-4', 'flex', 'flex-wrap');
    }
    
    if (this.columns > 1) {
      groupClasses.push('grid', `grid-cols-${this.columns}`, 'gap-2');
      return this.createColumnGroupTemplate();
    }
    
    const itemsHtml = this.items.filter(item => item !== null && item !== undefined).map((item, index) => {
      return this.createRadioItemTemplate(item, index);
    }).join('');
    
    return `
      <div class="${groupClasses.join(' ')}" role="radiogroup" ${this.fieldLabel ? `aria-labelledby="${this.id}-label"` : ''}>
        ${itemsHtml}
      </div>
    `;
  }

  createColumnGroupTemplate() {
    const itemsPerColumn = Math.ceil(this.items.length / this.columns);
    const columns = [];
    
    for (let col = 0; col < this.columns; col++) {
      const start = col * itemsPerColumn;
      const end = Math.min(start + itemsPerColumn, this.items.length);
      const columnItems = this.items.slice(start, end).filter(item => item !== null && item !== undefined);
      
      const columnHtml = columnItems.map((item, index) => {
        return this.createRadioItemTemplate(item, start + index);
      }).join('');
      
      columns.push(`<div class="aionda-radiogroup-column">${columnHtml}</div>`);
    }
    
    return `
      <div class="aionda-radiogroup-items grid grid-cols-${this.columns} gap-2" role="radiogroup" ${this.fieldLabel ? `aria-labelledby="${this.id}-label"` : ''}>
        ${columns.join('')}
      </div>
    `;
  }

  createRadioItemTemplate(item, index) {
    const radioId = `${this.id}-radio-${item.inputValue}-${index}`;
    const isChecked = this.value === item.inputValue;
    
    const itemClasses = [
      'aionda-radiogroup-item'
    ];
    
    if (this.layout === 'horizontal') {
      itemClasses.push('flex-shrink-0');
    }
    
    return `
      <div class="${itemClasses.join(' ')}" data-radio-index="${index}">
        <div class="flex items-center">
          <input
            id="${radioId}"
            name="${this.name}"
            type="radio"
            value="${item.inputValue}"
            class="aionda-radio-input ${this.getSizeClasses().join(' ')} border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 transition-colors duration-200"
            ${isChecked ? 'checked' : ''}
            ${this.readOnly ? 'readonly' : ''}
            ${this.disabled ? 'disabled' : ''}
            aria-label="${item.boxLabel || item.label || item.text || item.inputValue}"
            aria-describedby="${item.description ? `${radioId}-desc` : ''}"
            role="radio"
          >
          <label for="${radioId}" class="aionda-radio-label ml-2 text-sm text-gray-700 cursor-pointer select-none">
            ${item.boxLabel || item.label || item.text || item.inputValue}
          </label>
        </div>
        ${item.description ? `<div id="${radioId}-desc" class="ml-6 text-xs text-gray-500">${item.description}</div>` : ''}
      </div>
    `;
  }

  createErrorTemplate() {
    return `
      <div class="aionda-radiogroup-error text-sm text-red-600 mt-1 hidden">
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
      'aionda-radiogroup',
      'aionda-field'
    ];
    
    if (this.size) {
      classes.push(`aionda-radiogroup-${this.size}`);
    }
    
    if (this.layout === 'horizontal') {
      classes.push('aionda-radiogroup-horizontal');
    } else {
      classes.push('aionda-radiogroup-vertical');
    }
    
    if (this.columns > 1) {
      classes.push(`aionda-radiogroup-columns-${this.columns}`);
    }
    
    if (!this.valid) {
      classes.push('aionda-field-invalid');
    }
    
    return classes;
  }

  setupEventListeners() {
    super.setupEventListeners();
    
    this.labelEl = this.el.querySelector('.aionda-field-label');
    this.groupEl = this.el.querySelector('.aionda-radiogroup-items');
    this.errorEl = this.el.querySelector('.aionda-radiogroup-error');
    this.radioInputs = this.el.querySelectorAll('.aionda-radio-input');
    
    this.radioInputs.forEach((input, index) => {
      input.addEventListener('change', (e) => this.onRadioChange(e, index));
      input.addEventListener('click', (e) => this.onRadioClick(e, index));
      input.addEventListener('focus', (e) => this.onRadioFocus(e, index));
      input.addEventListener('blur', (e) => this.onRadioBlur(e, index));
      input.addEventListener('keydown', (e) => this.onRadioKeyDown(e, index));
    });
    
    // Also handle label clicks
    const labels = this.el.querySelectorAll('.aionda-radio-label');
    labels.forEach((label, index) => {
      label.addEventListener('click', (e) => this.onLabelClick(e, index));
    });
  }

  onRadioChange(event, index) {
    if (this.readOnly || this.disabled) {
      event.preventDefault();
      return;
    }
    
    const oldValue = this.value;
    this.value = event.target.value;
    this.focusedRadioIndex = index;
    
    this.updateDisplay();
    
    this.emit('change', {
      field: this.name,
      value: this.value,
      oldValue: oldValue
    });
    
    if (this.form && typeof this.form.emit === 'function') {
      this.form.emit('change', {
        field: this.name,
        value: this.value,
        oldValue: oldValue
      });
    }
  }

  onRadioClick(event, index) {
    if (this.readOnly || this.disabled) {
      event.preventDefault();
      return;
    }
    
    const radio = event.target;
    if (!radio.checked) {
      radio.checked = true;
      const changeEvent = new Event('change', { bubbles: true });
      radio.dispatchEvent(changeEvent);
    }
  }

  onLabelClick(event, index) {
    if (this.readOnly || this.disabled) {
      event.preventDefault();
      return;
    }
    
    // Find the corresponding radio input
    if (index >= 0 && index < this.radioInputs.length) {
      const radio = this.radioInputs[index];
      if (!radio.disabled && !radio.checked) {
        radio.checked = true;
        const changeEvent = new Event('change', { bubbles: true });
        radio.dispatchEvent(changeEvent);
      }
    }
  }

  onRadioFocus(event, index) {
    this.hasFocus = true;
    this.focusedRadioIndex = index;
    this.emit('focus', { event, field: this, index });
  }

  onRadioBlur(event, index) {
    this.hasFocus = false;
    this.emit('blur', { event, field: this, index });
  }

  onRadioKeyDown(event, index) {
    this.focusedRadioIndex = index;
    this.handleKeyNavigation(event, index);
    this.emit('keydown', { key: event.key, event, field: this, index });
  }

  getCurrentFocusedIndex() {
    if (!this.radioInputs) return -1;
    
    for (let i = 0; i < this.radioInputs.length; i++) {
      if (this.radioInputs[i] === document.activeElement) {
        return i;
      }
    }
    
    return this.focusedRadioIndex >= 0 ? this.focusedRadioIndex : 0;
  }

  handleKeyNavigation(event, currentIndex) {
    if (this.readOnly || this.disabled) return;
    
    let targetIndex = -1;
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        event.stopPropagation();
        targetIndex = this.getNextRadioIndex(currentIndex);
        if (targetIndex >= 0) {
          this.selectRadio(targetIndex);
          this.focusRadio(targetIndex);
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        event.stopPropagation();
        targetIndex = this.getPreviousRadioIndex(currentIndex);
        if (targetIndex >= 0) {
          this.selectRadio(targetIndex);
          this.focusRadio(targetIndex);
        }
        break;
        
      case ' ':
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        if (currentIndex >= 0 && currentIndex < this.radioInputs.length) {
          this.selectRadio(currentIndex);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        event.stopPropagation();
        targetIndex = this.getFirstEnabledRadioIndex();
        if (targetIndex >= 0) {
          this.selectRadio(targetIndex);
          this.focusRadio(targetIndex);
        }
        break;
        
      case 'End':
        event.preventDefault();
        event.stopPropagation();
        targetIndex = this.getLastEnabledRadioIndex();
        if (targetIndex >= 0) {
          this.selectRadio(targetIndex);
          this.focusRadio(targetIndex);
        }
        break;
    }
  }

  getNextRadioIndex(currentIndex) {
    if (!this.radioInputs || this.radioInputs.length === 0) return -1;
    
    // Start from the next index after current
    for (let i = currentIndex + 1; i < this.radioInputs.length; i++) {
      if (!this.radioInputs[i].disabled) {
        return i;
      }
    }
    
    // Wrap around to the beginning
    for (let i = 0; i < currentIndex; i++) {
      if (!this.radioInputs[i].disabled) {
        return i;
      }
    }
    
    return -1;
  }

  getPreviousRadioIndex(currentIndex) {
    if (!this.radioInputs || this.radioInputs.length === 0) return -1;
    
    // Start from the previous index before current
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!this.radioInputs[i].disabled) {
        return i;
      }
    }
    
    // Wrap around to the end
    for (let i = this.radioInputs.length - 1; i > currentIndex; i--) {
      if (!this.radioInputs[i].disabled) {
        return i;
      }
    }
    
    return -1;
  }

  getFirstEnabledRadioIndex() {
    if (!this.radioInputs || this.radioInputs.length === 0) return -1;
    
    for (let i = 0; i < this.radioInputs.length; i++) {
      if (!this.radioInputs[i].disabled) {
        return i;
      }
    }
    return -1;
  }

  getLastEnabledRadioIndex() {
    if (!this.radioInputs || this.radioInputs.length === 0) return -1;
    
    for (let i = this.radioInputs.length - 1; i >= 0; i--) {
      if (!this.radioInputs[i].disabled) {
        return i;
      }
    }
    return -1;
  }

  focusRadio(index) {
    if (index >= 0 && index < this.radioInputs.length) {
      this.radioInputs[index].focus();
      this.focusedRadioIndex = index;
    }
  }

  selectRadio(index) {
    if (index >= 0 && index < this.radioInputs.length) {
      const radio = this.radioInputs[index];
      if (!radio.disabled && !this.readOnly) {
        // Clear all other radios first
        this.radioInputs.forEach(r => {
          if (r !== radio) {
            r.checked = false;
          }
        });
        
        // Select the target radio
        radio.checked = true;
        this.focusedRadioIndex = index;
        
        // Trigger change event
        const changeEvent = new Event('change', { bubbles: true });
        radio.dispatchEvent(changeEvent);
      }
    }
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    const validItem = this.items.find(item => item.inputValue === value);
    if (validItem || value === '' || value === null || value === undefined) {
      const oldValue = this.value;
      this.value = value || '';
      this.updateDisplay();
      
      if (this.form && typeof this.form.emit === 'function') {
        this.form.emit('change', {
          field: this.name,
          value: this.value,
          oldValue: oldValue
        });
      }
    }
    return this;
  }

  updateDisplay() {
    if (this.radioInputs) {
      this.radioInputs.forEach((input) => {
        input.checked = input.value === this.value;
      });
    }
  }

  getSelectedItem() {
    if (this.value === null || this.value === undefined) {
      return null;
    }
    
    return this.items.find(item => item.inputValue === this.value) || null;
  }

  getSelectedIndex() {
    if (this.value === null || this.value === undefined) {
      return -1;
    }
    
    return this.items.findIndex(item => item.inputValue === this.value);
  }

  selectByIndex(index) {
    if (index >= 0 && index < this.items.length) {
      this.setValue(this.items[index].inputValue);
    }
    return this;
  }

  clearSelection() {
    this.setValue('');
    return this;
  }

  addItem(item) {
    this.items.push(item);
    if (this.el) {
      this.updateDOM();
    }
    return this;
  }

  removeItem(inputValue) {
    const index = this.items.findIndex(item => item.inputValue === inputValue);
    if (index >= 0) {
      this.items.splice(index, 1);
      if (this.value === inputValue) {
        this.clearSelection();
      }
      if (this.el) {
        this.updateDOM();
      }
    }
    return this;
  }

  setItems(items) {
    this.items = items || [];
    if (this.value !== null && !this.items.find(item => item.inputValue === this.value)) {
      this.clearSelection();
    }
    if (this.el) {
      this.updateDOM();
    }
    return this;
  }

  clearItems() {
    this.items = [];
    this.clearSelection();
    if (this.el) {
      this.updateDOM();
    }
    return this;
  }

  updateDOM() {
    if (this.el && this.el.parentNode) {
      const parentNode = this.el.parentNode;
      const nextSibling = this.el.nextSibling;
      const oldEl = this.el;
      
      // Force re-rendering by clearing the rendered state
      this.rendered = false;
      this.el = null;
      
      const newEl = this.render();
      
      // Replace the old element with the new one
      parentNode.removeChild(oldEl);
      
      if (nextSibling) {
        parentNode.insertBefore(newEl, nextSibling);
      } else {
        parentNode.appendChild(newEl);
      }
      
      this.el = newEl;
      this.setupEventListeners();
    }
  }

  reset() {
    this.setValue(this.originalValue);
    this.clearInvalid();
    return this;
  }

  isDirty() {
    return this.value !== this.originalValue;
  }

  validate() {
    if (this.validators && Array.isArray(this.validators)) {
      for (const validator of this.validators) {
        if (validator.type === 'required' && (this.value === null || this.value === undefined || this.value === '')) {
          this.markInvalid(validator.message || 'This field is required');
          return false;
        }
      }
    }
    
    if (!this.allowBlank && (this.value === null || this.value === undefined || this.value === '')) {
      this.markInvalid('This field is required');
      return false;
    }
    
    this.clearInvalid();
    return true;
  }

  isValid() {
    return this.validate();
  }

  markInvalid(message) {
    this.valid = false;
    this.errorMessage = message;
    
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
    
    if (this.errorEl) {
      this.errorEl.textContent = '';
      this.errorEl.classList.add('hidden');
    }
    
    this.emit('valid', { field: this });
    return this;
  }

  focus() {
    const selectedIndex = this.getSelectedIndex();
    const targetIndex = selectedIndex >= 0 ? selectedIndex : this.getFirstEnabledRadioIndex();
    
    if (targetIndex >= 0) {
      this.focusRadio(targetIndex);
    }
    
    return this;
  }

  blur() {
    if (this.focusedRadioIndex >= 0 && this.focusedRadioIndex < this.radioInputs.length) {
      this.radioInputs[this.focusedRadioIndex].blur();
    }
    return this;
  }

  setReadOnly(readOnly) {
    this.readOnly = readOnly;
    
    if (this.radioInputs) {
      this.radioInputs.forEach(input => {
        if (readOnly) {
          input.setAttribute('readonly', '');
        } else {
          input.removeAttribute('readonly');
        }
      });
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
    
    if (this.radioInputs) {
      this.radioInputs.forEach(input => {
        if (disabled) {
          input.setAttribute('disabled', '');
        } else {
          input.removeAttribute('disabled');
        }
      });
    }
    
    return this;
  }

}