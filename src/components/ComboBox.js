import { Component } from '../core/Component.js';
import { BrowserDetect, EventCompat, DOMCompat } from '../utils/BrowserCompat.js';

/**
 * ComboBox Component - Pure ES6
 * Dropdown with search, remote data, and custom templates
 * 
 * @class ComboBox
 * @extends Component
 * @description A sophisticated dropdown component with search functionality, remote data loading, and custom templating
 * @example
 * const comboBox = new ComboBox({
 *   fieldLabel: 'Choose Country',
 *   store: countryStore,
 *   displayField: 'name',
 *   valueField: 'code',
 *   typeAhead: true,
 *   forceSelection: true,
 *   queryMode: 'remote'
 * });
 */
export class ComboBox extends Component {
  constructor(config = {}) {
    super(config);
    config = config || {};
    
    // Handle special cases for config merging
    this.name = this.name || this.id;
    this.fieldLabel = this.fieldLabel || this.label || '';
    
    // Templates
    this.tpl = config.tpl; // Item template
    this.displayTpl = config.displayTpl; // Selected value template
    
    // State
    this.originalValue = this.value;
    this.lastValue = this.value;
    this.selectedRecord = null;
    this.expanded = false;
    this.filtered = false;
    this.loading = false;
    this.valid = true;
    this.errorMessage = '';
    this.highlightedIndex = -1;
    
    // DOM elements
    this.inputEl = null;
    this.triggerEl = null;
    this.listEl = null;
    this.errorEl = null;
    this.dropdownEl = null;
    
    // Query handling
    this.lastQuery = '';
    this.queryTask = null;
    
    // Initialize data
    if (this.data.length > 0 && !this.store) {
      this.loadData(this.data);
    }
    
    // Set initial selection if value provided
    if (this.value) {
      this.selectedRecord = this.findRecord(this.valueField, this.value);
    }
  }

  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      name: undefined, // Will be set to id if not provided
      fieldLabel: '',
      label: '',
      value: '',
      displayField: 'text',
      valueField: 'value',
      emptyText: '',
      store: undefined,
      data: [],
      queryMode: 'local',
      queryParam: 'query',
      minChars: 0,
      queryDelay: 500,
      editable: true,
      forceSelection: false,
      typeAhead: false,
      selectOnFocus: false,
      allowBlank: true,
      readOnly: false,
      labelAlign: 'top',
      labelWidth: 120,
      listConfig: {},
      pageSize: 25,
      tpl: undefined,
      displayTpl: undefined
    };
  }

  createTemplate() {
    const labelTemplate = this.createLabelTemplate();
    const inputTemplate = this.createInputTemplate();
    const errorTemplate = this.createErrorTemplate();
    
    return `
      <div class="${this.getFieldClasses().join(' ')}">
        ${labelTemplate}
        <div class="aionda-combobox-input-wrap relative">
          ${inputTemplate}
          ${errorTemplate}
        </div>
        ${this.createDropdownTemplate()}
      </div>
    `;
  }

  createLabelTemplate() {
    if (!this.fieldLabel) return '';
    
    const requiredMark = !this.allowBlank ? '<span class="text-red-500 ml-1">*</span>' : '';
    
    return `
      <label class="aionda-combobox-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" for="${this.id}-input">
        ${this.fieldLabel}${requiredMark}
      </label>
    `;
  }

  createInputTemplate() {
    const inputClasses = [
      'aionda-combobox-input',
      'block',
      'w-full',
      'px-3',
      'py-2.5',
      'pr-10',
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
      'dark:focus:border-blue-500',
      // Mobile-first responsive design
      'min-h-[44px]', // iOS minimum touch target
      'text-base', // Prevents zoom on mobile
      'sm:text-sm', // Smaller text on desktop
      'touch-manipulation'
    ];
    
    if (this.readOnly || !this.editable) {
      inputClasses.push('bg-gray-50', 'cursor-default', 'dark:bg-gray-600');
    }
    
    const displayValue = this.getDisplayValue();
    
    return `
      <div class="relative">
        <input 
          class="${inputClasses.join(' ')}"
          id="${this.id}-input"
          name="${this.name}"
          type="text"
          value="${this.escapeHtml(displayValue)}"
          placeholder="${this.escapeHtml(this.emptyText)}"
          role="combobox"
          aria-expanded="false"
          aria-controls="${this.id}-dropdown"
          aria-autocomplete="list"
          ${this.readOnly || !this.editable ? 'readonly' : ''}
          ${this.disabled ? 'disabled' : ''}
          autocomplete="off">
        <button 
          class="aionda-combobox-trigger absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 min-w-[44px] touch-manipulation"
          type="button"
          ${this.disabled ? 'disabled' : ''}>
          <svg class="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
    `;
  }

  createErrorTemplate() {
    return `
      <div class="aionda-combobox-error text-sm text-red-600 dark:text-red-400 mt-1 hidden">
        <!-- Error message will be inserted here -->
      </div>
    `;
  }

  createDropdownTemplate() {
    return `
      <div id="${this.id}-dropdown" class="aionda-combobox-dropdown absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg hidden" role="listbox">
        <div class="aionda-combobox-list max-h-48 sm:max-h-60 overflow-auto overscroll-contain">
          <!-- List items will be inserted here -->
        </div>
        <div class="aionda-combobox-loading hidden p-3 text-center text-gray-500 dark:text-gray-400">
          <div class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        </div>
        <div class="aionda-combobox-empty hidden p-3 text-center text-gray-500 dark:text-gray-400">
          No items to display
        </div>
      </div>
    `;
  }

  getFieldClasses() {
    const classes = [
      'aionda-component',
      'aionda-combobox',
      'aionda-field',
      'relative'
    ];
    
    if (this.cls) {
      classes.push(...this.cls.split(' ').filter(Boolean));
    }
    
    if (this.hidden) classes.push('aionda-hidden');
    if (this.disabled) classes.push('aionda-disabled');
    if (this.responsive) classes.push('aionda-responsive');
    
    if (!this.valid) {
      classes.push('aionda-field-invalid');
    }
    
    return classes;
  }

  setupEventListeners() {
    super.setupEventListeners();
    
    this.inputEl = this.el.querySelector('.aionda-combobox-input');
    this.triggerEl = this.el.querySelector('.aionda-combobox-trigger');
    this.listEl = this.el.querySelector('.aionda-combobox-list');
    this.errorEl = this.el.querySelector('.aionda-combobox-error');
    this.dropdownEl = this.el.querySelector('.aionda-combobox-dropdown');
    this.loadingEl = this.el.querySelector('.aionda-combobox-loading');
    this.emptyEl = this.el.querySelector('.aionda-combobox-empty');
    
    // Input events
    this.inputEl.addEventListener('input', (e) => this.onInput(e));
    this.inputEl.addEventListener('focus', (e) => this.onFocus(e));
    this.inputEl.addEventListener('blur', (e) => this.onBlur(e));
    this.inputEl.addEventListener('keydown', (e) => this.onKeyDown(e));
    
    // Trigger button
    this.triggerEl.addEventListener('click', (e) => this.onTriggerClick(e));
    
    // List events
    this.listEl.addEventListener('click', (e) => this.onListClick(e));
    this.listEl.addEventListener('mouseover', (e) => this.onListMouseOver(e));
    
    // Outside click to close
    document.addEventListener('click', (e) => this.onDocumentClick(e));
    
    // Store events
    if (this.store) {
      this.store.on('load', () => this.onStoreLoad());
      this.store.on('beforeload', () => this.onStoreBeforeLoad());
    }
  }

  // Event handlers
  onInput(event) {
    const value = event ? event.target.value : (this.inputEl ? this.inputEl.value : '');
    this.lastQuery = value;
    
    if (this.editable) {
      this.doQuery(value);
    }
    
    if (event) {
      this.emit('input', { value, event });
    }
  }

  onFocus(event) {
    if (this.selectOnFocus) {
      setTimeout(() => this.inputEl.select(), 10);
    }
    
    if (!this.expanded && this.minChars === 0) {
      this.expand();
    }
    
    this.emit('focus', { field: this, event });
  }

  onBlur(event) {
    // Delay collapse to allow list clicks
    setTimeout(() => {
      if (!this.hasFocus()) {
        this.collapse();
        this.validateForceSelection();
      }
    }, 100);
    
    if (event) {
      this.emit('blur', { field: this, event });
    } else {
      // Called without event (from tests)
      this.validateForceSelection();
    }
  }

  validateForceSelection() {
    if (this.forceSelection && this.inputEl && this.inputEl.value) {
      const record = this.findRecordByDisplay(this.inputEl.value);
      if (!record) {
        this.valid = false;
        this.clearValue();
      }
    }
  }

  findRecordByDisplay(displayValue) {
    const records = this.getRecords();
    return records.find(record => 
      (record[this.displayField] || '').toLowerCase() === displayValue.toLowerCase()
    );
  }

  onKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.expanded) {
          this.selectNext();
        } else {
          this.expand();
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (this.expanded) {
          this.selectPrevious();
        }
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.expanded && this.highlightedIndex >= 0) {
          this.selectHighlighted();
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.collapse();
        break;
        
      case 'Tab':
        if (this.expanded && this.highlightedIndex >= 0) {
          this.selectHighlighted();
        }
        this.collapse();
        break;
    }
    
    this.emit('keydown', { field: this, key: event.key, event });
  }

  onTriggerClick(event) {
    event.preventDefault();
    if (this.disabled || this.readOnly) return;
    
    if (this.expanded) {
      this.collapse();
    } else {
      this.expand();
      this.inputEl.focus();
    }
  }

  onListClick(event) {
    const item = event.target.closest('.aionda-combobox-item');
    if (item) {
      const index = parseInt(item.dataset.index);
      this.select(index);
    }
  }

  onListMouseOver(event) {
    const item = event.target.closest('.aionda-combobox-item');
    if (item) {
      this.highlightItem(item);
    }
  }

  onDocumentClick(event) {
    if (this.el && !this.el.contains(event.target)) {
      this.collapse();
    }
  }

  onStoreBeforeLoad() {
    this.setLoading(true);
  }

  onStoreLoad() {
    this.setLoading(false);
    this.refreshList();
  }

  // Query and filtering
  doQuery(query) {
    if (this.queryTask) {
      clearTimeout(this.queryTask);
    }
    
    this.queryTask = setTimeout(() => {
      if (query.length >= this.minChars) {
        if (this.queryMode === 'remote' && this.store) {
          this.store.load({ [this.queryParam]: query });
        } else {
          this.filterLocal(query);
        }
        
        if (!this.expanded) {
          this.expand();
        }
      } else {
        this.collapse();
      }
    }, this.queryDelay);
  }

  filterLocal(query) {
    this.filtered = query.length > 0;
    this.refreshList(query);
  }

  // Data management
  loadData(data) {
    this.data = data || [];
    if (this.listEl) {
      this.refreshList();
    }
    return this;
  }

  getRecords() {
    if (this.store) {
      return this.store.getRecords();
    }
    return this.data;
  }

  getFilteredData() {
    const records = this.getRecords();
    const query = this.inputEl ? this.inputEl.value : this.lastQuery;
    
    if (!query || query.trim() === '') {
      return records;
    }
    
    const queryLower = query.toLowerCase();
    return records.filter(record => {
      const displayValue = String(record[this.displayField] || '').toLowerCase();
      return displayValue.includes(queryLower);
    });
  }

  findRecord(field, value) {
    const records = this.getRecords();
    return records.find(record => record[field] === value);
  }

  // List management
  refreshList(query = '') {
    if (!this.listEl) return;
    
    const records = this.getRecords();
    let filteredRecords = records;
    
    // Apply local filter if needed
    if (query && this.queryMode === 'local') {
      const queryLower = query.toLowerCase();
      filteredRecords = records.filter(record => {
        const displayValue = String(record[this.displayField] || '').toLowerCase();
        return displayValue.includes(queryLower);
      });
    }
    
    this.listEl.innerHTML = '';
    this.highlightedIndex = -1;
    
    if (filteredRecords.length === 0) {
      this.showEmpty();
      return;
    }
    
    this.hideEmpty();
    
    filteredRecords.forEach((record, index) => {
      const item = this.createListItem(record, index);
      this.listEl.appendChild(item);
    });
  }

  createListItem(record, index) {
    const div = document.createElement('div');
    div.className = 'aionda-combobox-item px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-white flex items-center';
    div.dataset.index = index;
    div.dataset.value = record[this.valueField];
    div.setAttribute('role', 'option');
    div.setAttribute('id', `${this.id}-option-${index}`);
    
    if (this.tpl && typeof this.tpl === 'function') {
      div.innerHTML = this.tpl(record);
    } else {
      div.textContent = record[this.displayField] || record[this.valueField] || '';
    }
    
    // Highlight if selected
    if (record[this.valueField] === this.value) {
      div.classList.add('bg-blue-100', 'text-blue-900', 'dark:bg-blue-900/40', 'dark:text-blue-200');
    }
    
    return div;
  }

  // Selection management
  select(index) {
    const records = this.getFilteredData();
    const record = records[index];
    
    if (record) {
      this.setValue(record[this.valueField]);
      this.selectedRecord = record;
      this.updateDisplay();
      this.collapse();
      
      // Find original index in full dataset
      const originalIndex = this.getRecords().findIndex(r => r[this.valueField] === record[this.valueField]);
      
      this.emit('select', { 
        combo: this,
        record, 
        index: originalIndex
      });
    }
  }

  selectHighlighted() {
    if (this.highlightedIndex >= 0) {
      this.select(this.highlightedIndex);
    }
  }

  selectNext() {
    const items = this.listEl.querySelectorAll('.aionda-combobox-item');
    if (items.length === 0) return;
    
    if (this.highlightedIndex < 0) {
      this.highlightedIndex = 0;
    } else {
      this.highlightedIndex = this.highlightedIndex < items.length - 1 ? this.highlightedIndex + 1 : 0;
    }
    this.highlightItem(items[this.highlightedIndex]);
    this.updateActiveDescendant();
  }

  selectPrevious() {
    const items = this.listEl.querySelectorAll('.aionda-combobox-item');
    if (items.length === 0) return;
    
    if (this.highlightedIndex < 0) {
      this.highlightedIndex = items.length - 1;
    } else {
      this.highlightedIndex = this.highlightedIndex > 0 ? this.highlightedIndex - 1 : items.length - 1;
    }
    this.highlightItem(items[this.highlightedIndex]);
    this.updateActiveDescendant();
  }

  highlightItem(item) {
    // Remove previous highlight
    const prev = this.listEl ? this.listEl.querySelector('.highlighted') : null;
    if (prev) {
      prev.classList.remove('highlighted', 'bg-blue-100', 'text-blue-900', 'dark:bg-blue-900/40', 'dark:text-blue-200');
    }
    
    // Add new highlight
    if (item) {
      item.classList.add('highlighted', 'bg-blue-100', 'text-blue-900', 'dark:bg-blue-900/40', 'dark:text-blue-200');
      
      // Update highlighted index based on item
      this.highlightedIndex = parseInt(item.dataset.index) || 0;
      
      // Update ARIA attributes
      this.updateActiveDescendant();
      
      // Cross-browser scrollIntoView with fallback
      if (typeof item.scrollIntoView === 'function') {
        try {
          // Modern browsers with options support
          item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } catch (e) {
          // Fallback for older browsers
          item.scrollIntoView(false);
        }
      } else {
        // Manual scroll fallback for very old browsers
        const container = item.offsetParent || item.parentElement;
        if (container) {
          const itemTop = DOMCompat.getOffset(item).top;
          const containerTop = DOMCompat.getOffset(container).top;
          const relativeTop = itemTop - containerTop;
          container.scrollTop = relativeTop - (container.clientHeight / 2);
        }
      }
    }
  }

  // Dropdown management
  expand() {
    if (this.expanded || this.disabled || this.readOnly) return;
    
    this.expanded = true;
    this.dropdownEl.classList.remove('hidden');
    this.triggerEl.querySelector('svg').classList.add('rotate-180');
    
    // Update ARIA attributes
    this.inputEl.setAttribute('aria-expanded', 'true');
    
    // Position dropdown
    this.positionDropdown();
    
    // Refresh list with current data
    this.refreshList(this.lastQuery);
    
    this.emit('expand');
  }

  isExpanded() {
    return this.expanded;
  }

  collapse() {
    if (!this.expanded) return;
    
    this.expanded = false;
    this.dropdownEl.classList.add('hidden');
    this.triggerEl.querySelector('svg').classList.remove('rotate-180');
    
    // Update ARIA attributes
    this.inputEl.setAttribute('aria-expanded', 'false');
    this.inputEl.removeAttribute('aria-activedescendant');
    
    // Reset highlighted index
    this.highlightedIndex = -1;
    
    this.emit('collapse');
  }

  positionDropdown() {
    const rect = this.inputEl.getBoundingClientRect();
    const dropdown = this.dropdownEl;
    
    dropdown.style.width = `${rect.width}px`;
    dropdown.style.left = '0px';
    dropdown.style.top = '100%';
  }

  // Loading and empty states
  setLoading(loading) {
    this.loading = loading;
    
    if (loading) {
      this.loadingEl.classList.remove('hidden');
      this.listEl.classList.add('hidden');
      this.emptyEl.classList.add('hidden');
    } else {
      this.loadingEl.classList.add('hidden');
      this.listEl.classList.remove('hidden');
    }
  }

  showEmpty() {
    this.emptyEl.classList.remove('hidden');
    this.listEl.classList.add('hidden');
  }

  hideEmpty() {
    this.emptyEl.classList.add('hidden');
    this.listEl.classList.remove('hidden');
  }

  // Value management
  getValue() {
    return this.value;
  }

  setValue(value) {
    const oldValue = this.value;
    this.value = value;
    this.selectedRecord = this.findRecord(this.valueField, value);
    this.updateDisplay();
    
    // Reset validation state when setting a value
    if (value && this.selectedRecord) {
      this.valid = true;
    }
    
    // Emit change event when value changes
    if (oldValue !== value) {
      this.emit('change', { 
        value: this.value, 
        oldValue, 
        record: this.selectedRecord,
        combo: this 
      });
      
      // Emit select event when we have a valid record
      if (this.selectedRecord) {
        const originalIndex = this.getRecords().findIndex(r => r[this.valueField] === this.selectedRecord[this.valueField]);
        this.emit('select', {
          combo: this,
          record: this.selectedRecord,
          index: originalIndex
        });
      }
    }
    
    return this;
  }

  getSelection() {
    return this.selectedRecord;
  }

  clearValue() {
    this.value = '';
    this.selectedRecord = null;
    this.updateDisplay();
    return this;
  }

  getDisplayValue() {
    if (this.selectedRecord) {
      if (this.displayTpl && typeof this.displayTpl === 'function') {
        return this.displayTpl(this.selectedRecord);
      }
      return this.selectedRecord[this.displayField] || this.selectedRecord[this.valueField] || '';
    }
    
    const record = this.findRecord(this.valueField, this.value);
    if (record) {
      return record[this.displayField] || record[this.valueField] || '';
    }
    
    return this.value;
  }

  updateDisplay() {
    if (this.inputEl) {
      this.inputEl.value = this.getDisplayValue();
    }
  }

  reset() {
    this.setValue(this.originalValue);
    this.collapse();
    return this;
  }

  // Validation
  validate() {
    if (!this.allowBlank && (!this.value || this.value === '')) {
      this.valid = false;
      return false;
    }
    
    if (this.forceSelection && this.inputEl && this.inputEl.value) {
      const record = this.findRecordByDisplay(this.inputEl.value);
      if (!record) {
        this.valid = false;
        return false;
      }
    }
    
    // Only set valid to true if we haven't been marked invalid by forceSelection
    if (this.valid !== false) {
      this.valid = true;
    }
    return this.valid;
  }

  // Utility methods
  hasFocus() {
    return this.el.contains(document.activeElement);
  }

  updateActiveDescendant() {
    if (this.highlightedIndex >= 0 && this.expanded) {
      const items = this.listEl.querySelectorAll('.aionda-combobox-item');
      const highlightedItem = items[this.highlightedIndex];
      if (highlightedItem && highlightedItem.id) {
        this.inputEl.setAttribute('aria-activedescendant', highlightedItem.id);
      }
    } else {
      this.inputEl.removeAttribute('aria-activedescendant');
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}