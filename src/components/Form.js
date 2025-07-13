import { Component } from '../core/Component.js';
import { TextField } from './TextField.js';
import { NumberField } from './NumberField.js';
import { ComboBox } from './ComboBox.js';
import { Checkbox } from './Checkbox.js';
import { DateField } from './DateField.js';
import { TextArea } from './TextArea.js';
import { RadioGroup } from './RadioGroup.js';
import { RichTextField } from './RichTextField.js';

/**
 * @component Form
 * @extends Component
 * @description A form container with validation, layout management, and submission handling
 * @category Data Components
 * @since 1.0.0
 * @example
 * // Form with validation
 * const form = new AiondaWebUI.Form({
 *   title: 'User Registration',
 *   layout: 'vertical',
 *   items: [textField, emailField, submitButton],
 *   url: '/api/register'
 * });
 * form.renderTo('#container');
 */
export class Form extends Component {
    /**
   * @config
   * @property {string} [title] - Form title
   * @property {string} [layout='vertical'] - Form layout ('vertical', 'horizontal', 'inline')
   * @property {Array} [items=[]] - Array of form fields and components
   * @property {string} [url] - Form submission URL
   * @property {string} [method='POST'] - HTTP method for submission
   * @property {Object} [baseParams] - Base parameters to include with submission
   * @property {number} [timeout=30000] - Request timeout in milliseconds
   * @property {boolean} [trackResetOnLoad=false] - Whether to track initial values for reset
   * @property {boolean} [monitorValid=true] - Whether to monitor form validity
   * @property {string} [labelAlign='top'] - Default label alignment for fields
   * @property {number} [labelWidth=120] - Default label width in pixels
   */
  constructor(config = {}) {
    super(config);
    config = config || {};
    
    // Form-specific version tracking
    this.version = '1.0.2'; // Updated with validation improvements
    this.apiVersion = '1.0';
    
    this.url = config.url; // Submit URL
    this.method = config.method || 'POST';
    this.layout = config.layout || 'vertical'; // vertical, horizontal, inline
    this.labelAlign = config.labelAlign || 'top'; // top, left, right
    this.labelWidth = config.labelWidth || 120;
    this.fieldDefaults = config.fieldDefaults || {};
    this.trackResetOnLoad = config.trackResetOnLoad || false;
    this.standardSubmit = config.standardSubmit || false;
    this.timeout = config.timeout || 30000;
    
    // Form state
    this.fields = new Map(); // field name -> field component
    this.values = new Map(); // field name -> current value
    this.originalValues = new Map(); // field name -> original value
    this.errors = new Map(); // field name -> error message
    this.submitting = false;
    this.valid = true;
    
    // Validation rules
    this.validators = new Map(); // field name -> validation functions
    
    // Form element
    this.formEl = null;
    
    // Items array for tracking
    this.items = [];
    this.buttons = [];
    
    // Store items for later addition during render
    if (config.items) {
      this.pendingItems = config.items;
      // Add field objects to items array immediately for API compatibility
      config.items.forEach(item => {
        const field = this.createField(item);
        this.items.push(field);
      });
    } else {
      this.pendingItems = [];
    }
    
    // Handle fields array (alternative to items)
    if (config.fields) {
      config.fields.forEach(field => {
        this.add(field);
      });
    }
    
    // Handle buttons array - store for later rendering
    if (config.buttons) {
      this.buttons = config.buttons;
    }
  }

  createTemplate() {
    const classes = this.getFormClasses();
    return `
      <form class="${classes.join(' ')}" 
            novalidate 
            role="form" 
            aria-label="${this.title || 'Form'}"
            aria-describedby="${this.id}-status">
        <div class="aionda-form-body">
          <!-- Form fields will be inserted here -->
        </div>
        <div class="aionda-form-buttons hidden mt-4 flex space-x-3">
          <!-- Form buttons will be inserted here -->
        </div>
        <div id="${this.id}-status" 
             class="aionda-form-status sr-only" 
             aria-live="polite" 
             aria-atomic="true">
          <!-- Status messages for screen readers -->
        </div>
      </form>
    `;
  }

  getFormClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-form',
      'bg-white',
      'dark:bg-gray-800'
    ];

    if (this.layout === 'horizontal') {
      classes.push('aionda-form-horizontal');
    } else if (this.layout === 'inline') {
      classes.push('aionda-form-inline', 'flex', 'flex-wrap', 'gap-4');
    } else {
      classes.push('aionda-form-vertical', 'space-y-4');
    }

    return classes;
  }

  setupEventListeners() {
    super.setupEventListeners();
    
    this.formEl = this.el;
    this.bodyEl = this.el.querySelector('.aionda-form-body');
    this.buttonsEl = this.el.querySelector('.aionda-form-buttons');
    
    // Register pending items with the form now that it's rendered
    if (this.pendingItems && this.pendingItems.length > 0) {
      this.pendingItems.forEach((itemConfig, index) => {
        // Get the field that was already created in constructor
        const field = this.items[index];
        if (field && field.name) {
          // Register the field with the form (validators, values, etc.)
          this.registerField(field, itemConfig);
        }
      });
      this.pendingItems = [];
    }
    
    // Render all items that aren't yet in the DOM
    this.items.forEach(item => {
      if (item && item.render && (!item.el || !item.el.parentNode)) {
        this.registerField(item, {});
      }
    });
    
    // Render buttons
    if (this.buttons && this.buttons.length > 0) {
      this.buttons.forEach(button => {
        this.addButton(button);
      });
    }
    
    // Form submission
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
    
    // Field value changes
    this.on('fieldchange', (data) => {
      this.onFieldChange(data.field, data.value, data.oldValue);
    });
    
    // Field validation events
    this.on('fieldvalid', (data) => {
      this.errors.delete(data.field);
      this.updateValidationState();
    });
    
    this.on('fieldinvalid', (data) => {
      this.errors.set(data.field, data.message);
      this.updateValidationState();
    });
  }

  // Field management
  add(fieldConfig) {
    let field;
    
    if (fieldConfig.render && typeof fieldConfig.render === 'function') {
      // Already a component instance
      field = fieldConfig;
    } else {
      // Create field from config
      field = this.createField(fieldConfig);
    }
    
    // Add to items array
    this.items.push(field);
    
    // Register the field with the form
    this.registerField(field, fieldConfig);
    
    return field;
  }

  createField(config) {
    const cmp = config.cmp || 'textfield';
    
    // Use direct class references
    const fieldClasses = {
      textfield: TextField,
      numberfield: NumberField,
      combobox: ComboBox,
      checkbox: Checkbox,
      datefield: DateField,
      textarea: TextArea,
      radiogroup: RadioGroup,
      richtextfield: RichTextField
    };
    
    const FieldClass = fieldClasses[cmp];
    
    if (FieldClass) {
      return new FieldClass(config);
    }
    
    // Fallback for unknown field types
    const mockField = {
      name: config.name,
      fieldLabel: config.fieldLabel || config.label,
      value: config.value || '',
      checked: config.checked || false,
      cmp: cmp,
      el: null,
      listeners: new Map(),
      allowBlank: config.allowBlank !== false,
      render: () => {
        const div = document.createElement('div');
        div.className = `aionda-${cmp}`;
        div.innerHTML = `<div class="text-gray-500 p-4 border border-dashed border-gray-300 rounded">
          Field: ${config.name} (${cmp}) - Component not yet implemented
        </div>`;
        mockField.el = div;
        return div;
      },
      setValue: (value) => {
        const oldValue = mockField.value;
        mockField.value = value;
        if (mockField.cmp === 'checkbox') {
          mockField.checked = value;
        } else if (mockField.cmp === 'radiogroup') {
          // For radiogroup, value is the selected radio value
          mockField.selectedValue = value;
        }
        mockField.emit('change', { value, oldValue });
      },
      getValue: () => {
        if (mockField.cmp === 'checkbox') {
          return mockField.checked ? 'on' : '';
        } else if (mockField.cmp === 'radiogroup') {
          return mockField.selectedValue || '';
        }
        return mockField.value;
      },
      isChecked: () => mockField.checked,
      on: (event, handler) => {
        if (!mockField.listeners.has(event)) {
          mockField.listeners.set(event, new Set());
        }
        mockField.listeners.get(event).add(handler);
      },
      emit: (event, data) => {
        const handlers = mockField.listeners.get(event);
        if (handlers) {
          handlers.forEach(handler => handler(data));
        }
      }
    };
    
    return mockField;
  }

  registerField(field, fieldConfig) {
    if (!field.name) return;
    
    // Add to fields map
    this.fields.set(field.name, field);
    
    // Apply field defaults
    Object.assign(field, this.fieldDefaults, fieldConfig);
    
    // Set form reference
    field.form = this;
    
    // Setup field validation if provided
    if (fieldConfig.validators || fieldConfig.validator) {
      const validators = Array.isArray(fieldConfig.validators) ? 
        fieldConfig.validators : [fieldConfig.validator || fieldConfig.validators];
      this.validators.set(field.name, validators.filter(Boolean));
    }
    
    // Set initial value
    if (fieldConfig.value !== undefined) {
      this.values.set(field.name, fieldConfig.value);
      this.originalValues.set(field.name, fieldConfig.value);
    } else if (fieldConfig.checked !== undefined && field.cmp === 'checkbox') {
      // Handle checkbox checked state
      const value = fieldConfig.checked ? 'on' : '';
      this.values.set(field.name, value);
      this.originalValues.set(field.name, value);
      field.checked = fieldConfig.checked;
    }
    
    // Render field to form body if body exists and field can be rendered
    if (this.bodyEl && field.render) {
      if (!field.el) {
        const fieldEl = field.render();
        this.bodyEl.appendChild(fieldEl);
      } else if (!field.el.parentNode) {
        // Field has been rendered but not attached to DOM
        this.bodyEl.appendChild(field.el);
      }
    }
    
    // Setup field event listeners
    this.setupFieldListeners(field);
  }

  setupFieldListeners(field) {
    if (!field.on) return;
    
    // Listen for field value changes
    field.on('change', (data) => {
      this.onFieldChange(field.name, data.value, data.oldValue);
    });
    
    // Listen for field validation events
    field.on('valid', () => {
      this.emit('fieldvalid', { field: field.name });
    });
    
    field.on('invalid', (data) => {
      this.emit('fieldinvalid', { field: field.name, message: data.message });
    });
  }

  onFieldChange(fieldName, newValue, oldValue) {
    this.values.set(fieldName, newValue);
    
    // Validate field if it has validators
    this.validateField(fieldName);
    
    // Check if form is dirty
    this.updateDirtyState();
    
    this.emit('change', {
      field: fieldName,
      value: newValue,
      oldValue: oldValue
    });
  }

  // Validation
  validateField(fieldName) {
    const field = this.fields.get(fieldName);
    const value = this.values.get(fieldName);
    const validators = this.validators.get(fieldName) || [];
    
    
    if (!field) return true;
    
    // If field has its own validate method, use it (this will trigger markInvalid with correct aria-live)
    if (field.validate && typeof field.validate === 'function') {
      const isValid = field.validate();
      if (!isValid) {
        return false; // Field validation will emit its own invalid events
      }
    } else {
      // Fallback to form-level validation for fields without validate method
      
      // Check allowBlank property
      if (field.allowBlank === false && (!value || value.toString().trim() === '')) {
        // Use custom validator message if available
        const fieldValidators = this.validators.get(fieldName) || [];
        const requiredValidator = fieldValidators.find(v => v && v.type === 'required');
        const message = requiredValidator?.message || 'This field is required';
        this.emit('fieldinvalid', { field: fieldName, message });
        return false;
      }
      
      // Run validators from validators array
      for (const validator of validators) {
        const result = this.runValidator(validator, value, field);
        if (result !== true) {
          this.emit('fieldinvalid', { field: fieldName, message: result });
          return false;
        }
      }
      
      // Run field's own validateFn if it exists
      if (field.validateFn && typeof field.validateFn === 'function') {
        const result = field.validateFn(value, field);
        if (result !== null && result !== undefined && result !== true) {
          this.emit('fieldinvalid', { field: fieldName, message: result });
          return false;
        }
      }
    }
    
    this.emit('fieldvalid', { field: fieldName });
    return true;
  }

  runValidator(validator, value, field) {
    if (typeof validator === 'function') {
      return validator(value, field);
    }
    
    if (typeof validator === 'object') {
      const { type, message, ...options } = validator;
      
      switch (type) {
        case 'required':
          return value && value.toString().trim().length > 0 ? true : 
            (message || 'This field is required');
            
        case 'minLength':
          return !value || value.length >= options.min ? true :
            (message || `Minimum length is ${options.min} characters`);
            
        case 'maxLength':
          return !value || value.length <= options.max ? true :
            (message || `Maximum length is ${options.max} characters`);
            
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return !value || emailRegex.test(value) ? true :
            (message || 'Please enter a valid email address');
            
        case 'number':
          return !value || !isNaN(parseFloat(value)) ? true :
            (message || 'Please enter a valid number');
            
        case 'regex':
          return !value || options.pattern.test(value) ? true :
            (message || 'Invalid format');
            
        case 'date':
          if (!value) return true;
          const date = field.cmp === 'datefield' ? field.getDateValue() : new Date(value);
          return date && !isNaN(date.getTime()) ? true : 
            (message || 'Please enter a valid date');
            
        case 'dateRange':
          if (!value) return true;
          const dateVal = field.cmp === 'datefield' ? field.getDateValue() : new Date(value);
          if (!dateVal || isNaN(dateVal.getTime())) return message || 'Invalid date';
          
          if (options.min && dateVal < new Date(options.min)) {
            return message || `Date must be after ${options.min}`;
          }
          if (options.max && dateVal > new Date(options.max)) {
            return message || `Date must be before ${options.max}`;
          }
          return true;
            
        default:
          return true;
      }
    }
    
    return true;
  }

  isValid() {
    // Sync field values before validation
    this.syncFieldValues();
    
    // Validate all fields
    let valid = true;
    for (const fieldName of this.fields.keys()) {
      if (!this.validateField(fieldName)) {
        valid = false;
      }
    }
    return valid;
  }

  syncFieldValues() {
    // Update internal values from current field values
    for (const [name, field] of this.fields.entries()) {
      if (field && field.getValue) {
        this.values.set(name, field.getValue());
      }
    }
  }

  updateValidationState() {
    this.valid = this.errors.size === 0;
    
    // Update screen reader status
    this.updateAriaStatus();
    
    this.emit('validitychange', { valid: this.valid, errors: Array.from(this.errors.entries()) });
  }
  
  updateAriaStatus() {
    const statusEl = this.el?.querySelector(`#${this.id}-status`);
    if (!statusEl) return;
    
    if (this.errors.size > 0) {
      const errorCount = this.errors.size;
      const errorMessage = errorCount === 1 ? 
        `Form has 1 error: ${Array.from(this.errors.values())[0]}` :
        `Form has ${errorCount} errors`;
      statusEl.textContent = errorMessage;
    } else {
      statusEl.textContent = 'Form is valid';
    }
  }

  // Data management
  getValues() {
    const values = {};
    for (const [name, value] of this.values.entries()) {
      values[name] = value;
    }
    return values;
  }

  setValues(values) {
    for (const [name, value] of Object.entries(values)) {
      const field = this.fields.get(name);
      if (field && field.setValue) {
        field.setValue(value);
        this.values.set(name, value);
      } else {
        this.values.set(name, value);
      }
    }
    
    if (this.trackResetOnLoad) {
      this.originalValues = new Map(this.values);
    }
    
    this.updateDirtyState();
  }

  reset() {
    for (const [name, originalValue] of this.originalValues.entries()) {
      const field = this.fields.get(name);
      if (field && field.setValue) {
        if (field.cmp === 'checkbox') {
          const checked = originalValue === 'on';
          field.checked = checked;
          field.setValue(checked);
        } else {
          field.setValue(originalValue);
        }
      }
      // Always update the values map to ensure consistency
      this.values.set(name, originalValue);
    }
    
    this.errors.clear();
    this.updateValidationState();
    this.updateDirtyState();
    this.emit('reset');
  }

  isDirty() {
    for (const [name, currentValue] of this.values.entries()) {
      const originalValue = this.originalValues.get(name);
      if (currentValue !== originalValue) {
        return true;
      }
    }
    return false;
  }

  updateDirtyState() {
    const dirty = this.isDirty();
    this.emit('dirtychange', { dirty });
  }

  // Form submission
  async submit(options = {}) {
    if (this.submitting) return;
    
    const submitOptions = { ...options };
    
    // Set flag for form submission validation
    this.validatingForSubmission = true;
    
    // Validate form before submission
    if (!this.isValid()) {
      this.validatingForSubmission = false;
      this.emit('invalid', { errors: Array.from(this.errors.entries()) });
      return;
    }
    
    this.validatingForSubmission = false;
    
    this.submitting = true;
    this.emit('beforesubmit', { values: this.getValues(), options: submitOptions });
    
    try {
      let result;
      
      if (this.standardSubmit || !this.url) {
        // Standard HTML form submission
        result = this.doStandardSubmit();
      } else {
        // AJAX submission
        result = await this.doAjaxSubmit(submitOptions);
      }
      
      this.submitting = false;
      this.emit('submit', { values: this.getValues() });
      
      return result;
      
    } catch (error) {
      this.submitting = false;
      this.emit('exception', { error, values: this.getValues() });
      throw error;
    }
  }

  doStandardSubmit() {
    if (this.url) {
      this.formEl.action = this.url;
      this.formEl.method = this.method;
    }
    this.formEl.submit();
    return { success: true };
  }

  async doAjaxSubmit(options) {
    const values = this.getValues();
    const requestOptions = {
      method: this.method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(values),
      ...options
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    requestOptions.signal = controller.signal;
    
    try {
      const response = await fetch(this.url, requestOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Utility methods
  getField(name) {
    return this.fields.get(name);
  }

  findField(name) {
    return this.getField(name) || null;
  }

  getFieldValues() {
    return this.getValues();
  }

  markInvalid(errors) {
    if (Array.isArray(errors)) {
      errors.forEach(error => {
        this.errors.set(error.field, error.message);
      });
    } else if (typeof errors === 'object') {
      for (const [field, message] of Object.entries(errors)) {
        this.errors.set(field, message);
      }
    }
    this.updateValidationState();
  }

  clearInvalid() {
    this.errors.clear();
    this.updateValidationState();
  }

  // Remove field from form
  remove(field) {
    if (!field || !field.name) return;
    
    const fieldName = field.name;
    
    // Remove from fields map
    this.fields.delete(fieldName);
    
    // Remove from items array
    const index = this.items.indexOf(field);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    
    // Remove values and validators
    this.values.delete(fieldName);
    this.originalValues.delete(fieldName);
    this.validators.delete(fieldName);
    this.errors.delete(fieldName);
    
    // Remove from DOM if rendered
    if (field.el && field.el.parentNode) {
      field.el.parentNode.removeChild(field.el);
    }
    
    this.updateValidationState();
  }

  // Get validation errors
  getErrors() {
    this.isValid(); // Trigger validation
    return Array.from(this.errors.entries());
  }

  // Alias for getErrors() - for compatibility
  getValidationErrors() {
    return this.getErrors();
  }

  // Main validation method for tests
  validate() {
    return this.isValid();
  }

  hasErrors() {
    return this.errors.size > 0;
  }

  // Add field method for tests
  addField(fieldConfig) {
    return this.add(fieldConfig);
  }

  // Remove field method for tests
  removeField(field) {
    return this.remove(field);
  }

  // Button management
  addButton(buttonConfig) {
    if (!this.buttonsEl) return;
    
    this.buttonsEl.classList.remove('hidden');
    
    // Create button (this will use our Button component when available)
    const button = document.createElement('button');
    button.type = buttonConfig.type || 'button';
    button.className = `px-4 py-2 rounded font-medium ${buttonConfig.cls || 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'}`;
    button.textContent = buttonConfig.text || 'Button';
    
    if (buttonConfig.handler) {
      button.addEventListener('click', () => {
        buttonConfig.handler(this);
      });
    }
    
    this.buttonsEl.appendChild(button);
    return button;
  }
}