import { Component } from '../core/Component.js';
import { Button } from './Button.js';

/**
 * @component MessageBox
 * @extends Component
 * @description A modal dialog for displaying messages, confirmations, and prompts to users
 * @category Feedback Components
 * @since 1.0.0
 * @example
 * // Confirmation dialog
 * MessageBox.confirm({
 *   title: 'Confirm Delete',
 *   message: 'Are you sure you want to delete this item?',
 *   buttons: ['Yes', 'No'],
 *   fn: (result) => {
 *     if (result === 'yes') deleteItem();
 *   }
 * });
 */
export class MessageBox extends Component {
    /**
   * @config
   * @property {string} [title=''] - Dialog title
   * @property {string} [message=''] - Dialog message text
   * @property {Array} [buttons=['OK']] - Array of button labels
   * @property {string} [icon] - Icon to display ('info', 'warning', 'error', 'question')
   * @property {Function} [fn] - Callback function when dialog is closed
   * @property {Object} [scope] - Scope for callback function
   * @property {boolean} [modal=true] - Whether dialog is modal
   * @property {number} [width=300] - Dialog width
   * @property {number} [height] - Dialog height (auto if not specified)
   * @property {boolean} [closable=false] - Whether dialog has close button
   */
  constructor(config = {}) {
    super(config);
    
    config = config || {};
    
    this.title = config.title || '';
    this.message = config.message || '';
    this.icon = config.icon || '';
    this.iconType = config.iconType || 'info';
    this.buttons = config.buttons || [];
    this.defaultButton = config.defaultButton || 0;
    this.allowEscape = config.allowEscape !== false;
    this.modal = config.modal !== false;
    this.value = config.value || '';
    this.inputType = config.inputType || 'text';
    this.showInput = config.showInput || false;
    
    this.overlay = null;
    this.dialogEl = null;
    this.inputEl = null;
    this.resolvePromise = null;
    this.rejectPromise = null;
    this.mutationObserver = null;
  }

  static alert(message, title = 'Alert', options = {}) {
    return new Promise((resolve, reject) => {
      const messageBox = new MessageBox({
        title,
        message,
        iconType: options.iconType || 'info',
        icon: options.icon || MessageBox.getDefaultIcon('info'),
        buttons: [{
          text: options.buttonText || 'OK',
          variant: 'primary',
          handler: () => {
            messageBox.rejectPromise = null;
            resolve();
            messageBox.close();
          }
        }],
        ...options
      });
      
      messageBox.resolvePromise = resolve;
      messageBox.rejectPromise = reject;
      messageBox.show();
    });
  }

  static confirm(message, title = 'Confirm', options = {}) {
    return new Promise((resolve, reject) => {
      const messageBox = new MessageBox({
        title,
        message,
        iconType: options.iconType || 'question',
        icon: options.icon || MessageBox.getDefaultIcon('question'),
        buttons: [
          {
            text: options.cancelText || 'Cancel',
            variant: 'secondary',
            handler: () => {
              messageBox.rejectPromise = null;
              resolve(false);
              messageBox.close();
            }
          },
          {
            text: options.confirmText || 'OK',
            variant: 'primary',
            handler: () => {
              messageBox.rejectPromise = null;
              resolve(true);
              messageBox.close();
            }
          }
        ],
        defaultButton: 1,
        ...options
      });
      
      messageBox.resolvePromise = resolve;
      messageBox.rejectPromise = reject;
      messageBox.show();
    });
  }

  static prompt(message, title = 'Input', defaultValue = '', options = {}) {
    return new Promise((resolve, reject) => {
      const messageBox = new MessageBox({
        title,
        message,
        iconType: options.iconType || 'question',
        icon: options.icon || MessageBox.getDefaultIcon('question'),
        showInput: true,
        value: defaultValue,
        inputType: options.inputType || 'text',
        buttons: [
          {
            text: options.cancelText || 'Cancel',
            variant: 'secondary',
            handler: () => {
              messageBox.rejectPromise = null;
              resolve(null);
              messageBox.close();
            }
          },
          {
            text: options.confirmText || 'OK',
            variant: 'primary',
            handler: () => {
              const value = messageBox.getValue();
              messageBox.rejectPromise = null;
              resolve(value);
              messageBox.close();
            }
          }
        ],
        defaultButton: 1,
        ...options
      });
      
      messageBox.resolvePromise = resolve;
      messageBox.rejectPromise = reject;
      messageBox.show();
    });
  }

  static getDefaultIcon(type) {
    const icons = {
      info: `<svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
             </svg>`,
      warning: `<svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>`,
      error: `<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>`,
      success: `<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>`,
      question: `<svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                 </svg>`
    };
    return icons[type] || icons.info;
  }

  createTemplate() {
    const iconHtml = this.icon ? `<div class="aionda-messagebox-icon mr-4 flex-shrink-0">${this.icon}</div>` : '';
    const inputHtml = this.showInput ? this.createInputTemplate() : '';
    
    return `
      <div class="aionda-messagebox-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="aionda-messagebox-dialog bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
          <div class="aionda-messagebox-header px-6 py-4 border-b border-gray-200">
            <h3 class="aionda-messagebox-title text-lg font-medium text-gray-900">${this.title}</h3>
          </div>
          <div class="aionda-messagebox-body px-6 py-4">
            <div class="flex items-start">
              ${iconHtml}
              <div class="flex-1">
                <div class="aionda-messagebox-message text-sm text-gray-500 mb-4">${this.message}</div>
                ${inputHtml}
              </div>
            </div>
          </div>
          <div class="aionda-messagebox-footer px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <!-- Buttons will be inserted here -->
          </div>
        </div>
      </div>
    `;
  }

  createInputTemplate() {
    return `
      <input type="${this.inputType}" 
             class="aionda-messagebox-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
             value="${this.value}" 
             placeholder="Enter value...">
    `;
  }

  render() {
    if (this.destroyed) {
      throw new Error('Cannot render destroyed component');
    }

    if (this.rendered && this.el) {
      return this.el;
    }

    const template = this.createTemplate();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template.trim();
    this.el = wrapper.firstElementChild;

    if (!this.el) {
      throw new Error('Component template must return a valid HTML element');
    }

    this.el.id = this.id;
    this.setupEventListeners();
    this.renderButtons();

    this.rendered = true;
    this.emit('render');

    return this.el;
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.overlay = this.el;
    this.dialogEl = this.el.querySelector('.aionda-messagebox-dialog');
    this.inputEl = this.el.querySelector('.aionda-messagebox-input');

    if (this.allowEscape) {
      document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    if (this.modal) {
      this.overlay.addEventListener('click', (event) => {
        if (event.target === this.overlay) {
          this.onCancel();
        }
      });
    }

    if (this.inputEl) {
      this.inputEl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.onEnter();
        }
      });
    }
  }

  renderButtons() {
    const footer = this.el.querySelector('.aionda-messagebox-footer');
    if (!footer) return;

    this.buttons.forEach((buttonConfig, index) => {
      const button = new Button({
        text: buttonConfig.text,
        variant: buttonConfig.variant || 'secondary',
        size: buttonConfig.size || 'md',
        handler: (btn, event) => {
          this.emit('buttonclick', { 
            button: buttonConfig, 
            buttonIndex: index, 
            event 
          });
          
          if (buttonConfig.handler) {
            buttonConfig.handler(btn, event);
          }
        }
      });

      const buttonEl = button.render();
      footer.appendChild(buttonEl);

      if (index === this.defaultButton) {
        setTimeout(() => buttonEl.focus(), 100);
      }
    });
  }

  onKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    }
  }

  onEnter() {
    const defaultBtn = this.buttons[this.defaultButton];
    if (defaultBtn && defaultBtn.handler) {
      defaultBtn.handler();
    }
  }

  onCancel() {
    const cancelBtn = this.buttons.find(btn => btn.variant === 'secondary');
    if (cancelBtn && cancelBtn.handler) {
      cancelBtn.handler();
    } else {
      this.hide();
    }
  }

  getValue() {
    return this.inputEl ? this.inputEl.value : this.value;
  }

  setValue(value) {
    this.value = value;
    if (this.inputEl) {
      this.inputEl.value = value;
    }
    return this;
  }

  show() {
    this.render();
    
    if (!document.body.contains(this.el)) {
      document.body.appendChild(this.el);
    }
    
    this.el.style.display = 'flex';
    
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.removedNodes) {
            if (node === this.el) {
              this.destroy();
              return;
            }
          }
        }
      }
    });
    
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    requestAnimationFrame(() => {
      this.dialogEl.classList.add('animate-in');
      
      if (this.showInput && this.inputEl) {
        setTimeout(() => {
          this.inputEl.focus();
        }, 100);
      }
    });

    this.emit('show');
    return this;
  }

  hide() {
    if (this.el) {
      this.el.style.display = 'none';
    }
    this.emit('hide');
    return this;
  }

  close() {
    if (this.allowEscape) {
      document.removeEventListener('keydown', this.onKeyDown.bind(this));
    }

    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }

    this.emit('close');
    this.destroy();
    return this;
  }

  destroy() {
    if (this.destroyed) return;

    if (this.allowEscape) {
      document.removeEventListener('keydown', this.onKeyDown.bind(this));
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.rejectPromise) {
      this.rejectPromise(new Error('MessageBox was destroyed'));
      this.rejectPromise = null;
    }

    super.destroy();
  }
}