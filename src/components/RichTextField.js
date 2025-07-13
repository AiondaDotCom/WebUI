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
      'bold', 'italic', 'underline',
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
      foreColor: { icon: 'A', title: 'Text Color', type: 'textcolor' },
      backColor: { icon: '🖍️', title: 'Highlight Text', type: 'highlight' },
      fontSize: { icon: '📏', title: 'Font Size', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7'] },
      fontName: { icon: 'F', title: 'Font Family', type: 'select', options: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia'] }
    };
    
    const config = buttonConfigs[command];
    if (!config) return '';
    
    if (config.type === 'textcolor') {
      return `
        <div class="relative inline-block aionda-colorpicker-container">
          <button class="inline-flex items-center justify-center w-8 h-8 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer aionda-textcolor-btn" 
                  title="${config.title}" data-command="${command}">
            <span class="font-bold aionda-textcolor-display text-sm" style="color: #000000">${config.icon}</span>
          </button>
          <div class="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 hidden aionda-colorpicker-dropdown" style="width: 200px;">
            <div class="mb-3">
              <label class="block text-xs font-medium text-gray-700 mb-1">Choose text color:</label>
              <input type="color" class="w-full h-8 border border-gray-300 rounded aionda-textcolor-input" 
                     data-command="${command}" value="#000000">
            </div>
            <div class="flex justify-end space-x-2">
              <button class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 aionda-colorpicker-cancel">
                Cancel
              </button>
              <button class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 aionda-colorpicker-ok">
                OK
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (config.type === 'highlight') {
      return `
        <button class="inline-flex items-center justify-center w-8 h-8 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer text-yellow-500" 
                title="${config.title}" data-command="${command}">
          ${config.icon}
        </button>
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
    
    // Toolbar interactions
    this.toolbarEl.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-command]');
      if (button) {
        e.preventDefault();
        e.stopPropagation();
        
        const command = button.dataset.command;
        
        if (command === 'foreColor') {
          // Toggle color picker dropdown
          const dropdown = button.parentElement.querySelector('.aionda-colorpicker-dropdown');
          if (dropdown) {
            const isVisible = !dropdown.classList.contains('hidden');
            this.closeAllColorPickers();
            if (!isVisible) {
              dropdown.classList.remove('hidden');
            }
          }
        } else if (command === 'backColor') {
          // Highlight with fixed yellow color
          this.executeCommand('hiliteColor', button, '#ffff00');
        } else {
          this.executeCommand(command, button);
        }
      }
    });
    
    // Handle input changes (color pickers and selects)
    this.toolbarEl.addEventListener('change', (e) => {
      e.stopPropagation();
      
      if (e.target.type === 'color' && e.target.classList.contains('aionda-textcolor-input')) {
        const color = e.target.value;
        // Update the display color immediately
        const container = e.target.closest('.aionda-colorpicker-container');
        const display = container.querySelector('.aionda-textcolor-display');
        if (display) {
          display.style.color = color;
        }
      } else if (e.target.tagName === 'SELECT') {
        const value = e.target.value;
        if (value) {
          this.executeCommand(e.target.dataset.command, null, value);
          // Update select to show current value instead of resetting
          this.updateSelectDisplay(e.target);
        }
      }
    });

    // Handle color picker OK/Cancel buttons
    this.toolbarEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('aionda-colorpicker-ok')) {
        e.preventDefault();
        e.stopPropagation();
        
        const container = e.target.closest('.aionda-colorpicker-container');
        const colorInput = container.querySelector('.aionda-textcolor-input');
        const dropdown = container.querySelector('.aionda-colorpicker-dropdown');
        
        if (colorInput) {
          const color = colorInput.value;
          this.executeCommand('foreColor', null, color);
        }
        
        if (dropdown) {
          dropdown.classList.add('hidden');
        }
      } else if (e.target.classList.contains('aionda-colorpicker-cancel')) {
        e.preventDefault();
        e.stopPropagation();
        
        const container = e.target.closest('.aionda-colorpicker-container');
        const dropdown = container.querySelector('.aionda-colorpicker-dropdown');
        const colorInput = container.querySelector('.aionda-textcolor-input');
        const display = container.querySelector('.aionda-textcolor-display');
        
        // Reset color to original value
        if (colorInput && display) {
          const originalColor = colorInput.getAttribute('data-original-color') || '#000000';
          colorInput.value = originalColor;
          display.style.color = originalColor;
        }
        
        if (dropdown) {
          dropdown.classList.add('hidden');
        }
      }
    });
    
    // Prevent toolbar clicks from affecting editor focus/selection
    this.toolbarEl.addEventListener('mousedown', (e) => {
      if (e.target.type !== 'color' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
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

    // Close color pickers when clicking outside
    this.documentClickHandler = (e) => {
      if (!e.target.closest('.aionda-colorpicker-container')) {
        this.closeAllColorPickers();
      }
    };
    document.addEventListener('click', this.documentClickHandler);

    // Store original colors when dropdown opens
    this.toolbarEl.addEventListener('click', (e) => {
      if (e.target.closest('.aionda-textcolor-btn')) {
        const container = e.target.closest('.aionda-colorpicker-container');
        const colorInput = container.querySelector('.aionda-textcolor-input');
        if (colorInput) {
          colorInput.setAttribute('data-original-color', colorInput.value);
        }
      }
    });
  }

  closeAllColorPickers() {
    const dropdowns = this.toolbarEl.querySelectorAll('.aionda-colorpicker-dropdown');
    dropdowns.forEach(dropdown => {
      dropdown.classList.add('hidden');
    });
  }

  executeCommand(command, button, value) {
    // Ensure editor has focus
    this.editorEl.focus();
    
    // Store current selection before any operations
    const selection = window.getSelection();
    let savedRange = null;
    
    if (selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
    
    // For commands that need a selection, handle appropriately
    if (['bold', 'italic', 'underline', 'foreColor'].includes(command)) {
      // Only select all if no text is selected for formatting commands
      if (selection.rangeCount === 0 || selection.isCollapsed) {
        // If no selection, select all content for these commands
        const range = document.createRange();
        range.selectNodeContents(this.editorEl);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else if (['hiliteColor', 'backColor'].includes(command)) {
      // For highlighting, only work on selected text, don't select all
      if (selection.rangeCount === 0 || selection.isCollapsed) {
        // Don't do anything if no text is selected for highlighting
        return;
      }
    }
    
    try {
      // Enable CSS styling for better compatibility
      document.execCommand('styleWithCSS', false, true);
      
      if (command === 'createLink') {
        // Ensure we have text selected for link creation
        if (selection.rangeCount === 0 || selection.isCollapsed) {
          alert('Please select text first to create a link.');
          return;
        }
        
        const url = prompt('Enter URL:');
        if (url) {
          // Restore selection if needed
          if (savedRange) {
            selection.removeAllRanges();
            selection.addRange(savedRange);
          }
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
    const buttons = this.toolbarEl.querySelectorAll('button[data-command]');
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
    
    // Update font selects to show current values
    this.updateFontSelects();
  }

  updateSelectDisplay(selectElement) {
    // Keep the selected value visible instead of resetting
    const selectedValue = selectElement.value;
    const command = selectElement.dataset.command;
    
    // Update the select to show current formatting
    setTimeout(() => {
      try {
        if (command === 'fontSize') {
          const currentSize = document.queryCommandValue('fontSize');
          if (currentSize && selectElement.querySelector(`option[value="${currentSize}"]`)) {
            selectElement.value = currentSize;
          }
        } else if (command === 'fontName') {
          const currentFont = document.queryCommandValue('fontName');
          if (currentFont) {
            // Try to match font family
            const options = Array.from(selectElement.options);
            const matchingOption = options.find(option => 
              currentFont.toLowerCase().includes(option.value.toLowerCase()) ||
              option.value.toLowerCase().includes(currentFont.toLowerCase())
            );
            if (matchingOption) {
              selectElement.value = matchingOption.value;
            }
          }
        }
      } catch (e) {
        // Fallback: don't reset the select if we can't detect current value
        console.warn('Could not update select display:', e);
      }
    }, 100);
  }

  updateFontSelects() {
    // Update font size select
    const fontSizeSelect = this.toolbarEl.querySelector('select[data-command="fontSize"]');
    if (fontSizeSelect) {
      try {
        const currentSize = document.queryCommandValue('fontSize');
        if (currentSize && fontSizeSelect.querySelector(`option[value="${currentSize}"]`)) {
          fontSizeSelect.value = currentSize;
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Update font name select
    const fontNameSelect = this.toolbarEl.querySelector('select[data-command="fontName"]');
    if (fontNameSelect) {
      try {
        const currentFont = document.queryCommandValue('fontName');
        if (currentFont) {
          const options = Array.from(fontNameSelect.options);
          const matchingOption = options.find(option => 
            currentFont.toLowerCase().includes(option.value.toLowerCase()) ||
            option.value.toLowerCase().includes(currentFont.toLowerCase())
          );
          if (matchingOption) {
            fontNameSelect.value = matchingOption.value;
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
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

  destroy() {
    // Remove document click listener
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
    }
    
    super.destroy();
  }
}