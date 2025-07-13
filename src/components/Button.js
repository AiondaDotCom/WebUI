import { Component } from '../core/Component.js';

/**
 * @component Button
 * @extends Component
 * @description A versatile button component with multiple variants, sizes, states, and accessibility features
 * @category Form Components
 * @since 1.0.0
 * @example
 * // Basic button usage
 * const button = new AiondaWebUI.Button({
 *   text: 'Click Me',
 *   variant: 'primary',
 *   size: 'lg',
 *   icon: 'user',
 *   handler: () => console.log('Clicked!')
 * });
 * button.renderTo('#container');
 */
export class Button extends Component {
  /**
   * @config
   * @property {string} [text=''] - Button text content
   * @property {string} [icon=''] - Icon class or name
   * @property {string} [iconAlign='left'] - Icon alignment ('left' or 'right')
   * @property {string} [variant='primary'] - Button variant ('primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark')
   * @property {string} [size='md'] - Button size ('xs', 'sm', 'md', 'lg', 'xl')
   * @property {boolean} [outline=false] - Whether to use outline style
   * @property {boolean} [pressed=false] - Whether button is in pressed state
   * @property {boolean} [loading=false] - Whether button is in loading state
   * @property {boolean} [block=false] - Whether button takes full width
   * @property {string} [href] - URL for link buttons
   * @property {string} [target] - Target for link buttons
   * @property {Function} [handler] - Click handler function
   * @property {string} [ariaLabel] - Accessibility label
   * @property {string} [ariaDescription] - Accessibility description
   */
  constructor(config = {}) {
    super(config);
    
    /**
     * Button DOM element reference
     * @type {Element|null}
     */
    this.buttonEl = null;
    
    /**
     * Button-specific version
     * @type {string}
     * @readonly
     */
    this.version = '1.0.1';
    
    /**
     * API version for compatibility
     * @type {string}
     * @readonly
     */
    this.apiVersion = '1.0';
  }

  /**
   * Returns the default configuration for Button
   * @returns {Object} Default configuration object
   * @protected
   */
  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      text: '',
      icon: '',
      iconAlign: 'left',
      variant: 'primary',
      size: 'md',
      outline: false,
      pressed: false,
      loading: false,
      block: false,
      href: undefined,
      target: undefined,
      handler: undefined,
      ariaLabel: undefined,
      ariaDescription: undefined
    };
  }

  createTemplate() {
    const isLink = !!this.href;
    const tag = isLink ? 'a' : 'button';
    const attributes = this.getElementAttributes();
    const classes = this.getButtonClasses().join(' ');
    const content = this.getButtonContent();

    return `
      <${tag} class="${classes}" ${attributes}>
        ${content}
      </${tag}>
    `;
  }

  getElementAttributes() {
    const attrs = [];
    
    if (this.href) {
      attrs.push(`href="${this.href}"`);
      if (this.target) {
        attrs.push(`target="${this.target}"`);
      }
      attrs.push(`role="button"`);
    } else {
      attrs.push(`type="button"`);
      if (this.disabled) {
        attrs.push('disabled');
        attrs.push('aria-disabled="true"');
      }
    }

    if (this.pressed) attrs.push('aria-pressed="true"');
    if (this.loading) attrs.push('aria-busy="true"');
    
    // Add ARIA label
    if (this.ariaLabel) {
      attrs.push(`aria-label="${this.ariaLabel}"`);
    } else if (this.text) {
      attrs.push(`aria-label="${this.text}"`);
    }
    
    // Add ARIA description if available
    if (this.ariaDescription) {
      attrs.push(`aria-describedby="${this.id}-desc"`);
    }
    
    // Ensure proper tabindex
    if (!this.disabled) {
      attrs.push('tabindex="0"');
    }

    return attrs.join(' ');
  }

  getButtonClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-button',
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'transition-all',
      'duration-150',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'dark:focus:ring-offset-gray-800'
    ];

    // Size classes
    switch (this.size) {
      case 'xs':
        classes.push('px-2.5', 'py-1.5', 'text-xs', 'rounded');
        break;
      case 'sm':
        classes.push('px-3', 'py-2', 'text-sm', 'rounded-md');
        break;
      case 'md':
        classes.push('px-4', 'py-2', 'text-sm', 'rounded-md');
        break;
      case 'lg':
        classes.push('px-4', 'py-2', 'text-base', 'rounded-md');
        break;
      case 'xl':
        classes.push('px-6', 'py-3', 'text-base', 'rounded-md');
        break;
    }

    // Variant classes
    if (this.outline) {
      classes.push(...this.getOutlineVariantClasses());
    } else {
      classes.push(...this.getSolidVariantClasses());
    }

    if (this.pressed) classes.push('aionda-button-pressed');
    if (this.loading) classes.push('aionda-button-loading', 'cursor-wait');
    if (this.block) classes.push('w-full');
    if (this.disabled) classes.push('opacity-50', 'cursor-not-allowed', 'dark:opacity-40');

    return classes;
  }

  getSolidVariantClasses() {
    switch (this.variant) {
      case 'primary':
        return [
          'bg-blue-600', 'text-white', 'border-transparent',
          'hover:bg-blue-700', 'focus:ring-blue-500', 'active:bg-blue-800',
          'dark:bg-blue-500', 'dark:hover:bg-blue-600', 'dark:focus:ring-blue-400', 'dark:active:bg-blue-700'
        ];
      case 'secondary':
        return [
          'bg-gray-600', 'text-white', 'border-transparent',
          'hover:bg-gray-700', 'focus:ring-gray-500', 'active:bg-gray-800',
          'dark:bg-gray-500', 'dark:hover:bg-gray-600', 'dark:focus:ring-gray-400', 'dark:active:bg-gray-700'
        ];
      case 'success':
        return [
          'bg-green-600', 'text-white', 'border-transparent',
          'hover:bg-green-700', 'focus:ring-green-500', 'active:bg-green-800',
          'dark:bg-green-500', 'dark:hover:bg-green-600', 'dark:focus:ring-green-400', 'dark:active:bg-green-700'
        ];
      case 'warning':
        return [
          'bg-yellow-600', 'text-white', 'border-transparent',
          'hover:bg-yellow-700', 'focus:ring-yellow-500', 'active:bg-yellow-800',
          'dark:bg-yellow-500', 'dark:hover:bg-yellow-600', 'dark:focus:ring-yellow-400', 'dark:active:bg-yellow-700'
        ];
      case 'danger':
        return [
          'bg-red-600', 'text-white', 'border-transparent',
          'hover:bg-red-700', 'focus:ring-red-500', 'active:bg-red-800',
          'dark:bg-red-500', 'dark:hover:bg-red-600', 'dark:focus:ring-red-400', 'dark:active:bg-red-700'
        ];
      case 'info':
        return [
          'bg-blue-600', 'text-white', 'border-transparent',
          'hover:bg-blue-700', 'focus:ring-blue-500', 'active:bg-blue-800',
          'dark:bg-blue-500', 'dark:hover:bg-blue-600', 'dark:focus:ring-blue-400', 'dark:active:bg-blue-700'
        ];
      case 'light':
        return [
          'bg-gray-200', 'text-gray-900', 'border-transparent',
          'hover:bg-gray-300', 'focus:ring-gray-500', 'active:bg-gray-400',
          'dark:bg-gray-700', 'dark:text-gray-100', 'dark:hover:bg-gray-600', 'dark:focus:ring-gray-400', 'dark:active:bg-gray-800'
        ];
      case 'dark':
        return [
          'bg-gray-800', 'text-white', 'border-transparent',
          'hover:bg-gray-900', 'focus:ring-gray-700', 'active:bg-gray-900',
          'dark:bg-gray-200', 'dark:text-gray-900', 'dark:hover:bg-gray-300', 'dark:focus:ring-gray-500', 'dark:active:bg-gray-400'
        ];
      default:
        return [
          'bg-blue-600', 'text-white', 'border-transparent',
          'hover:bg-blue-700', 'focus:ring-blue-500', 'active:bg-blue-800',
          'dark:bg-blue-500', 'dark:hover:bg-blue-600', 'dark:focus:ring-blue-400', 'dark:active:bg-blue-700'
        ];
    }
  }

  getOutlineVariantClasses() {
    switch (this.variant) {
      case 'primary':
        return [
          'border', 'border-blue-600', 'text-blue-600', 'bg-transparent',
          'hover:bg-blue-50', 'focus:ring-blue-500', 'active:bg-blue-100',
          'dark:border-blue-400', 'dark:text-blue-400', 'dark:hover:bg-blue-900/20', 'dark:focus:ring-blue-400', 'dark:active:bg-blue-900/30'
        ];
      case 'secondary':
        return [
          'border', 'border-gray-600', 'text-gray-600', 'bg-transparent',
          'hover:bg-gray-50', 'focus:ring-gray-500', 'active:bg-gray-100',
          'dark:border-gray-400', 'dark:text-gray-400', 'dark:hover:bg-gray-800/20', 'dark:focus:ring-gray-400', 'dark:active:bg-gray-800/30'
        ];
      case 'success':
        return [
          'border', 'border-green-600', 'text-green-600', 'bg-transparent',
          'hover:bg-green-50', 'focus:ring-green-500', 'active:bg-green-100',
          'dark:border-green-400', 'dark:text-green-400', 'dark:hover:bg-green-900/20', 'dark:focus:ring-green-400', 'dark:active:bg-green-900/30'
        ];
      case 'warning':
        return [
          'border', 'border-yellow-600', 'text-yellow-600', 'bg-transparent',
          'hover:bg-yellow-50', 'focus:ring-yellow-500', 'active:bg-yellow-100',
          'dark:border-yellow-400', 'dark:text-yellow-400', 'dark:hover:bg-yellow-900/20', 'dark:focus:ring-yellow-400', 'dark:active:bg-yellow-900/30'
        ];
      case 'danger':
        return [
          'border', 'border-red-600', 'text-red-600', 'bg-transparent',
          'hover:bg-red-50', 'focus:ring-red-500', 'active:bg-red-100',
          'dark:border-red-400', 'dark:text-red-400', 'dark:hover:bg-red-900/20', 'dark:focus:ring-red-400', 'dark:active:bg-red-900/30'
        ];
      default:
        return [
          'border', 'border-blue-600', 'text-blue-600', 'bg-transparent',
          'hover:bg-blue-50', 'focus:ring-blue-500', 'active:bg-blue-100',
          'dark:border-blue-400', 'dark:text-blue-400', 'dark:hover:bg-blue-900/20', 'dark:focus:ring-blue-400', 'dark:active:bg-blue-900/30'
        ];
    }
  }

  getButtonContent() {
    const iconHtml = this.getIconHtml();
    const loadingHtml = this.loading ? this.getLoadingHtml() : '';
    const textHtml = this.text ? `<span class="aionda-button-text">${this.text}</span>` : '';

    if (this.loading) {
      return `${loadingHtml}${textHtml ? ` ${textHtml}` : ''}`;
    }

    if (!iconHtml && !textHtml) {
      return '';
    }

    if (!iconHtml) {
      return textHtml;
    }

    if (this.iconAlign === 'right') {
      return `${textHtml}${textHtml ? ' ' : ''}${iconHtml}`;
    } else {
      return `${iconHtml}${textHtml ? ` ${textHtml}` : ''}`;
    }
  }

  getIconHtml() {
    if (!this.icon || this.loading) return '';
    return `<span class="aionda-button-icon">${this.icon}</span>`;
  }

  getLoadingHtml() {
    return `
      <svg class="aionda-button-spinner animate-spin -ml-1 mr-2 h-4 w-4" 
           xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
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
    this.applyStyles();
    this.setupEventListeners();
    this.updateDisabledState();
    this.updateAriaAttributes();

    this.rendered = true;
    this.emit('render');

    return this.el;
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.buttonEl = this.el;
    this.buttonEl.addEventListener('click', (event) => this.onClick(event));
    this.buttonEl.addEventListener('focus', (event) => this.onFocus(event));
    this.buttonEl.addEventListener('blur', (event) => this.onBlur(event));
    this.buttonEl.addEventListener('keydown', (event) => this.onKeyDown(event));
  }

  onClick(event) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    /**
     * @event click
     * @description Fired when button is clicked
     * @param {Object} event - Event object
     * @param {Button} event.field - The button component
     * @param {Event} event.event - Original DOM event
     */
    this.emit('click', { field: this, event });

    if (this.handler) {
      this.handler(this, event);
    }
  }

  onFocus(event) {
    this.emit('focus', { field: this, event });
  }

  onBlur(event) {
    this.emit('blur', { field: this, event });
  }

  onKeyDown(event) {
    if (this.disabled || this.loading) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onClick(event);
    }
    
    this.emit('keydown', { field: this, event, key: event.key });
  }

  /**
   * @method setText
   * @description Updates the button text content
   * @param {string} text - New button text
   * @returns {Button} Returns this for method chaining
   * @example
   * button.setText('New Text');
   */
  setText(text) {
    this.text = text;
    if (this.rendered) {
      this.updateContent();
    }
    return this;
  }

  /**
   * @method setIcon
   * @description Updates the button icon
   * @param {string} icon - New icon class or name
   * @returns {Button} Returns this for method chaining
   * @example
   * button.setIcon('fas fa-user');
   */
  setIcon(icon) {
    this.icon = icon;
    if (this.rendered) {
      this.updateContent();
    }
    return this;
  }

  setVariant(variant) {
    this.variant = variant;
    if (this.rendered) {
      this.updateClasses();
    }
    return this;
  }

  setSize(size) {
    this.size = size;
    if (this.rendered) {
      this.updateClasses();
    }
    return this;
  }

  setLoading(loading) {
    this.loading = loading;
    if (this.rendered) {
      this.updateContent();
      this.updateClasses();
      this.updateAriaAttributes();
    }
    return this;
  }

  setPressed(pressed) {
    this.pressed = pressed;
    if (this.rendered) {
      this.buttonEl.setAttribute('aria-pressed', pressed.toString());
      this.updateClasses();
    }
    return this;
  }

  toggle() {
    return this.setPressed(!this.pressed);
  }

  updateContent() {
    if (this.buttonEl) {
      this.buttonEl.innerHTML = this.getButtonContent();
    }
  }

  updateClasses() {
    if (this.buttonEl) {
      this.buttonEl.className = this.getButtonClasses().join(' ');
    }
  }

  focus() {
    this.buttonEl?.focus();
    return this;
  }

  blur() {
    this.buttonEl?.blur();
    return this;
  }

  enable() {
    this.disabled = false;
    if (this.rendered) {
      this.updateDisabledState();
      this.updateClasses();
      this.updateAriaAttributes();
    }
    return this;
  }

  disable() {
    this.disabled = true;
    if (this.rendered) {
      this.updateDisabledState();
      this.updateClasses();
      this.updateAriaAttributes();
    }
    return this;
  }

  setDisabled(disabled) {
    return disabled ? this.disable() : this.enable();
  }

  updateDisabledState() {
    if (this.buttonEl && !this.href) {
      if (this.disabled) {
        this.buttonEl.setAttribute('disabled', '');
      } else {
        this.buttonEl.removeAttribute('disabled');
      }
    }
  }

  updateAriaAttributes() {
    if (!this.buttonEl) return;

    if (this.pressed) {
      this.buttonEl.setAttribute('aria-pressed', 'true');
    } else {
      this.buttonEl.removeAttribute('aria-pressed');
    }

    if (this.loading) {
      this.buttonEl.setAttribute('aria-busy', 'true');
    } else {
      this.buttonEl.removeAttribute('aria-busy');
    }

    if (this.disabled) {
      this.buttonEl.setAttribute('aria-disabled', 'true');
    } else {
      this.buttonEl.removeAttribute('aria-disabled');
    }
  }
}