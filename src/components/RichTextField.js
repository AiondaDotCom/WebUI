import { Component } from '../core/Component.js';

/**
 * @component RichTextField
 * @extends Component
 * @description A rich text input field with formatting toolbar for HTML content editing
 * @category Form Components
 * @since 1.0.0
 * @example
 * const richText = new AiondaWebUI.RichTextField({
 *   fieldLabel: 'Description',
 *   value: '<p>Initial <strong>formatted</strong> content</p>',
 *   height: 300,
 *   toolbar: ['bold', 'italic', 'underline', 'color', 'link']
 * });
 */
export class RichTextField extends Component {
  /**
   * @config
   * @property {string} [fieldLabel] - Label text displayed above the field
   * @property {string} [value=''] - Initial HTML content
   * @property {number} [height=200] - Height of the editor in pixels
   * @property {Array} [toolbar] - Array of toolbar buttons to show
   * @property {boolean} [allowHtml=true] - Whether to allow HTML input
   * @property {boolean} [required=false] - Whether field is required
   * @property {boolean} [disabled=false] - Whether field is disabled
   * @property {string} [placeholder] - Placeholder text
   * @property {Array} [validators] - Array of validation functions
   */
  constructor(config = {}) {
    super(config);
    
    this.fieldLabel = config.fieldLabel || '';
    this.value = config.value || '';
    this.height = config.height || 200;
    this.allowHtml = config.allowHtml !== undefined ? config.allowHtml : true;
    this.required = config.required || false;
    this.disabled = config.disabled || false;
    this.placeholder = config.placeholder || 'Enter text...';
    this.validators = config.validators || [];
    
    this.toolbar = config.toolbar || [
      'bold', 'italic', 'underline', 'strikethrough',
      'separator',
      'foreColor', 'backColor',
      'separator', 
      'fontSize', 'fontName',
      'separator',
      'justifyLeft', 'justifyCenter', 'justifyRight',
      'separator',
      'insertUnorderedList', 'insertOrderedList',
      'separator',
      'createLink', 'unlink',
      'separator',
      'undo', 'redo'
    ];
    
    this.editorEl = null;
    this.toolbarEl = null;
    this.isValid = true;
    this.validationMessage = '';
  }

  createTemplate() {
    const fieldLabelHtml = this.fieldLabel ? 
      `<label class="block text-sm font-medium text-gray-700 mb-2">${this.fieldLabel}${this.required ? ' *' : ''}</label>` : '';
    
    const toolbarHtml = this.createToolbarHtml();
    
    return `
      <div class="aionda-richtext-field">
        ${fieldLabelHtml}
        <div class="border border-gray-300 rounded-lg overflow-hidden ${this.disabled ? 'bg-gray-100' : 'bg-white'}">
          ${toolbarHtml}
          <div class="aionda-richtext-editor p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500" 
               style="height: ${this.height}px; overflow-y: auto;"
               contenteditable="${this.disabled ? 'false' : 'true'}"
               data-placeholder="${this.placeholder}">
            ${this.value}
          </div>
        </div>
        <div class="aionda-richtext-validation mt-1 text-sm text-red-600 hidden"></div>
      </div>
    `;
  }

  createToolbarHtml() {
    let toolbarItems = '';
    
    this.toolbar.forEach(item => {
      if (item === 'separator') {
        toolbarItems += '<div class="w-px h-6 bg-gray-300 mx-1"></div>';
      } else {
        toolbarItems += this.createToolbarButton(item);
      }
    });
    
    return `
      <div class="aionda-richtext-toolbar flex items-center space-x-1 p-2 bg-gray-50 border-b border-gray-300">
        ${toolbarItems}
      </div>
    `;
  }

  createToolbarButton(command) {
    const buttonConfigs = {
      bold: { icon: 'B', title: 'Bold', class: 'font-bold' },
      italic: { icon: 'I', title: 'Italic', class: 'italic' },
      underline: { icon: 'U', title: 'Underline', class: 'underline' },
      strikethrough: { icon: 'S', title: 'Strikethrough', class: 'line-through' },
      justifyLeft: { icon: '⫷', title: 'Align Left' },
      justifyCenter: { icon: '≡', title: 'Align Center' },
      justifyRight: { icon: '⫸', title: 'Align Right' },
      insertUnorderedList: { icon: '•', title: 'Bullet List' },
      insertOrderedList: { icon: '1.', title: 'Numbered List' },
      createLink: { icon: '🔗', title: 'Insert Link' },
      unlink: { icon: '🔗⃠', title: 'Remove Link' },
      undo: { icon: '↶', title: 'Undo' },
      redo: { icon: '↷', title: 'Redo' },
      foreColor: { icon: 'A', title: 'Text Color', type: 'color' },
      backColor: { icon: '🎨', title: 'Background Color', type: 'color' },
      fontSize: { icon: '📏', title: 'Font Size', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7'] },
      fontName: { icon: 'F', title: 'Font Family', type: 'select', options: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia'] }
    };
    
    const config = buttonConfigs[command];
    if (!config) return '';
    
    if (config.type === 'color') {
      return `
        <div class="relative">
          <button class="inline-flex items-center justify-center w-8 h-8 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer" 
                  title="${config.title}" data-command="${command}">
            <span class="${config.class || ''}">${config.icon}</span>
          </button>
          <input type="color" class="absolute inset-0 opacity-0 cursor-pointer" data-command="${command}" title="${config.title}">
        </div>
      `;
    } else if (config.type === 'select') {
      return `
        <select class="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100" data-command="${command}" title="${config.title}">
          <option value="">${config.title}</option>
          ${config.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
        </select>
      `;
    } else {
      return `
        <button class="inline-flex items-center justify-center w-8 h-8 text-sm border border-gray-300 rounded hover:bg-gray-100 ${config.class || ''}" 
                data-command="${command}" title="${config.title}">
          ${config.icon}
        </button>
      `;
    }
  }

  setupEventListeners() {
    super.setupEventListeners();
    
    this.editorEl = this.el.querySelector('.aionda-richtext-editor');
    this.toolbarEl = this.el.querySelector('.aionda-richtext-toolbar');
    
    // Toolbar button clicks
    this.toolbarEl.addEventListener('click', (e) => {
      const button = e.target.closest('[data-command]');
      if (button) {
        e.preventDefault();
        this.executeCommand(button.dataset.command, button);
      }
    });
    
    // Color picker changes
    this.toolbarEl.addEventListener('change', (e) => {
      if (e.target.type === 'color') {
        this.executeCommand(e.target.dataset.command, null, e.target.value);
      } else if (e.target.tagName === 'SELECT') {
        this.executeCommand(e.target.dataset.command, null, e.target.value);
        e.target.selectedIndex = 0; // Reset select
      }
    });
    
    // Editor events
    this.editorEl.addEventListener('input', () => {
      this.value = this.editorEl.innerHTML;
      this.validate();
      this.emit('change', { value: this.value, component: this });
    });
    
    this.editorEl.addEventListener('focus', () => {
      this.emit('focus', { component: this });
    });
    
    this.editorEl.addEventListener('blur', () => {
      this.validate();
      this.emit('blur', { component: this });
    });
    
    // Handle placeholder
    this.updatePlaceholder();
    this.editorEl.addEventListener('input', () => this.updatePlaceholder());
    this.editorEl.addEventListener('focus', () => this.updatePlaceholder());
    this.editorEl.addEventListener('blur', () => this.updatePlaceholder());
  }

  executeCommand(command, button, value) {
    // Ensure editor has focus and selection
    this.editorEl.focus();
    
    // For commands that need a selection, ensure we have one
    if (['bold', 'italic', 'underline', 'strikethrough', 'foreColor', 'backColor'].includes(command)) {
      const selection = window.getSelection();
      if (selection.rangeCount === 0 || selection.isCollapsed) {
        // If no selection, select all content
        const range = document.createRange();
        range.selectNodeContents(this.editorEl);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    try {
      // Enable CSS styling for better compatibility
      document.execCommand('styleWithCSS', false, true);
      
      if (command === 'createLink') {
        const url = prompt('Enter URL:');
        if (url) {
          document.execCommand(command, false, url);
        }
      } else if (command === 'fontSize') {
        if (value) {
          document.execCommand(command, false, value);
        }
      } else if (command === 'fontName') {
        if (value) {
          document.execCommand(command, false, value);
        }
      } else if (command === 'foreColor') {
        if (value) {
          // Try multiple approaches for color
          const success = document.execCommand('foreColor', false, value);
          if (!success) {
            // Fallback: wrap selection in span with style
            this.applyColorStyle('color', value);
          }
        }
      } else if (command === 'backColor' || command === 'hiliteColor') {
        if (value) {
          const success = document.execCommand('hiliteColor', false, value) || 
                         document.execCommand('backColor', false, value);
          if (!success) {
            // Fallback: wrap selection in span with background style
            this.applyColorStyle('background-color', value);
          }
        }
      } else {
        document.execCommand(command, false, value);
      }
      
      // Update button active state
      setTimeout(() => this.updateToolbarState(), 50);
      
      // Update value
      this.value = this.editorEl.innerHTML;
      this.emit('change', { value: this.value, component: this });
      
    } catch (error) {
      console.warn('RichTextField command failed:', command, error);
    }
  }

  applyColorStyle(property, value) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedContent = range.extractContents();
      
      const span = document.createElement('span');
      span.style[property] = value;
      span.appendChild(selectedContent);
      
      range.insertNode(span);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  updateToolbarState() {
    // Update button active states based on current selection
    const buttons = this.toolbarEl.querySelectorAll('[data-command]');
    buttons.forEach(button => {
      const command = button.dataset.command;
      try {
        if (document.queryCommandState(command)) {
          button.classList.add('bg-blue-100', 'text-blue-700');
        } else {
          button.classList.remove('bg-blue-100', 'text-blue-700');
        }
      } catch (e) {
        // Some commands don't support queryCommandState
      }
    });
  }

  updatePlaceholder() {
    const isEmpty = this.editorEl.textContent.trim() === '' && this.editorEl.innerHTML.trim() === '';
    
    if (isEmpty) {
      this.editorEl.classList.add('empty');
      if (!this.el.querySelector('.placeholder-style')) {
        const style = document.createElement('style');
        style.className = 'placeholder-style';
        style.textContent = `
          .aionda-richtext-editor.empty:before {
            content: attr(data-placeholder);
            color: #9CA3AF;
            pointer-events: none;
            position: absolute;
          }
        `;
        this.el.appendChild(style);
      }
    } else {
      this.editorEl.classList.remove('empty');
    }
  }

  getValue() {
    return this.allowHtml ? this.editorEl.innerHTML : this.editorEl.textContent;
  }

  setValue(value) {
    this.value = value || '';
    if (this.editorEl) {
      this.editorEl.innerHTML = this.value;
      this.updatePlaceholder();
      this.validate();
    }
  }

  getTextContent() {
    return this.editorEl ? this.editorEl.textContent : '';
  }

  clear() {
    this.setValue('');
  }

  focus() {
    if (this.editorEl) {
      this.editorEl.focus();
    }
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.editorEl) {
      this.editorEl.contentEditable = disabled ? 'false' : 'true';
      this.el.classList.toggle('opacity-50', disabled);
      
      const buttons = this.toolbarEl.querySelectorAll('button, select, input');
      buttons.forEach(btn => btn.disabled = disabled);
    }
  }

  validate() {
    this.isValid = true;
    this.validationMessage = '';
    
    const textContent = this.getTextContent().trim();
    
    // Required validation
    if (this.required && textContent === '') {
      this.isValid = false;
      this.validationMessage = 'This field is required';
    }
    
    // Custom validators
    if (this.isValid && this.validators.length > 0) {
      for (const validator of this.validators) {
        const result = validator(this.getValue(), this);
        if (result !== true) {
          this.isValid = false;
          this.validationMessage = result || 'Invalid value';
          break;
        }
      }
    }
    
    this.updateValidationDisplay();
    return this.isValid;
  }

  updateValidationDisplay() {
    const validationEl = this.el.querySelector('.aionda-richtext-validation');
    const editorContainer = this.el.querySelector('.border');
    
    if (this.isValid) {
      validationEl.classList.add('hidden');
      editorContainer.classList.remove('border-red-300');
      editorContainer.classList.add('border-gray-300');
    } else {
      validationEl.textContent = this.validationMessage;
      validationEl.classList.remove('hidden');
      editorContainer.classList.remove('border-gray-300');
      editorContainer.classList.add('border-red-300');
    }
  }

  isValidField() {
    return this.validate();
  }

  insertHtml(html) {
    this.editorEl.focus();
    try {
      document.execCommand('insertHTML', false, html);
      this.value = this.editorEl.innerHTML;
      this.emit('change', { value: this.value, component: this });
    } catch (error) {
      console.warn('Failed to insert HTML:', error);
    }
  }

  getWordCount() {
    const text = this.getTextContent();
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }

  getCharacterCount() {
    return this.getTextContent().length;
  }
}