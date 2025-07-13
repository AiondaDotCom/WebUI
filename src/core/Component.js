import { EventEmitter } from './EventEmitter.js';
import { SecurityUtils } from './SecurityUtils.js';
import { BrowserDetect, EventCompat, DOMCompat } from '../utils/BrowserCompat.js';
import { i18n } from './I18n.js';

/**
 * Base Component class - Pure ES6
 * All UI components extend from this base
 */
let componentIdCounter = 0;

export class Component extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Version tracking
    this.version = '1.0.0';
    this.apiVersion = '1.0';
    this._deprecated = new Map(); // Track deprecated methods/properties
    
    // Handle null/undefined config
    config = config || {};
    
    // Store renderTo before merging to avoid overwriting the method
    this._autoRenderTarget = config.renderTo;
    
    // Merge config with defaults, excluding renderTo
    const mergedConfig = this.mergeConfig(config);
    delete mergedConfig.renderTo; // Remove renderTo to avoid overwriting the method
    
    // Apply merged config to instance
    Object.assign(this, mergedConfig);

    this.el = null;
    this.rendered = false;
    this.destroyed = false;
    this.initialized = false;
    
    // Mark as initialized immediately
    this.initialized = true;
    
    // Auto-render if renderTo is provided
    if (this._autoRenderTarget) {
      const autoRenderTarget = this._autoRenderTarget;
      setTimeout(() => {
        if (!this.destroyed && !this.rendered && typeof this.renderTo === 'function') {
          this.renderTo(autoRenderTarget);
        }
      }, 0);
    }
  }

  getDefaultConfig() {
    return {
      id: this.generateId(),
      cls: '',
      width: undefined,
      height: undefined,
      hidden: false,
      disabled: false,
      responsive: true,
      style: {},
      locale: undefined // Will use global i18n locale if not specified
    };
  }

  mergeConfig(config) {
    const defaults = this.getDefaultConfig();
    const merged = Object.assign({}, defaults, config);
    
    // Handle special cases for objects that should be merged, not replaced
    if (defaults.style && config.style) {
      merged.style = Object.assign({}, defaults.style, config.style);
    }
    
    return merged;
  }

  generateId() {
    return `aionda-component-${++componentIdCounter}`;
  }

  getBaseClasses() {
    const classes = ['aionda-component'];
    
    if (this.cls) {
      classes.push(...this.cls.split(' ').filter(Boolean));
    }
    
    if (this.hidden) classes.push('aionda-hidden');
    if (this.disabled) classes.push('aionda-disabled');
    if (this.responsive) classes.push('aionda-responsive');

    return classes;
  }

  applyStyles() {
    if (!this.el) return;

    if (this.width !== undefined) {
      this.el.style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    }
    
    if (this.height !== undefined) {
      this.el.style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
    }

    Object.assign(this.el.style, this.style);
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
    
    // Preserve original template classes and add base classes
    const originalClasses = this.el.className.split(' ').filter(Boolean);
    const baseClasses = this.getBaseClasses();
    const allClasses = [...originalClasses, ...baseClasses];
    this.el.className = allClasses.join(' ');
    
    this.applyStyles();
    this.setupEventListeners();

    this.rendered = true;
    this.emit('render');

    return this.el;
  }

  renderTo(target) {
    const element = this.render();
    const container = typeof target === 'string' ? document.querySelector(target) : target;
    
    if (!container) {
      throw new Error(`Render target not found: ${target}`);
    }

    container.appendChild(element);
    return element;
  }

  createTemplate() {
    throw new Error('createTemplate() must be implemented by subclass');
  }

  setupEventListeners() {
    // Override in subclasses
    // Add browser compatibility layer for older browsers
    if (BrowserDetect.isIE() || BrowserDetect.isOldEdge()) {
      this.addIECompatibilityFixes();
    }
  }

  addIECompatibilityFixes() {
    // Add IE-specific fixes for this component
    if (this.el) {
      // Fix focus management in IE
      const focusableElements = this.el.querySelectorAll('input, button, select, textarea, [tabindex]');
      focusableElements.forEach(element => {
        // Ensure proper tabindex for keyboard navigation
        if (!element.hasAttribute('tabindex') && !element.disabled) {
          element.setAttribute('tabindex', '0');
        }
      });
    }
  }

  show() {
    this.hidden = false;
    if (this.el) {
      this.el.classList.remove('aionda-hidden');
    }
    this.emit('show');
    return this;
  }

  hide() {
    this.hidden = true;
    if (this.el) {
      this.el.classList.add('aionda-hidden');
    }
    this.emit('hide');
    return this;
  }

  enable() {
    this.disabled = false;
    if (this.el) {
      this.el.classList.remove('aionda-disabled');
    }
    return this;
  }

  disable() {
    this.disabled = true;
    if (this.el) {
      this.el.classList.add('aionda-disabled');
    }
    return this;
  }

  addClass(cls) {
    if (this.el) {
      this.el.classList.add(cls);
    }
    return this;
  }

  removeClass(cls) {
    if (this.el) {
      this.el.classList.remove(cls);
    }
    return this;
  }

  hasClass(cls) {
    return this.el?.classList.contains(cls) || false;
  }

  getEl() {
    return this.el;
  }

  destroy() {
    if (this.destroyed) return;

    this.emit('destroy');
    
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    
    this.removeAllListeners();
    this.destroyed = true;
    this.rendered = false;
    this.el = null;
  }

  isDestroyed() {
    return this.destroyed;
  }

  isRendered() {
    return this.rendered;
  }

  isInitialized() {
    return this.initialized;
  }

  async waitForInitialization() {
    if (this.initialized) return this;
    
    return new Promise((resolve) => {
      const onInit = () => {
        this.off('initialized', onInit);
        resolve(this);
      };
      this.on('initialized', onInit);
    });
  }

  // Version management methods
  getVersion() {
    return this.version;
  }

  getApiVersion() {
    return this.apiVersion;
  }

  isCompatibleWith(requiredVersion) {
    const [major, minor] = this.version.split('.').map(Number);
    const [reqMajor, reqMinor] = requiredVersion.split('.').map(Number);
    
    // Major version must match for compatibility
    if (major !== reqMajor) return false;
    
    // Minor version must be >= required
    return minor >= reqMinor;
  }

  // Deprecation warning system
  _warnDeprecated(methodName, newMethod, version) {
    if (this._deprecated.has(methodName)) return; // Only warn once per session
    
    this._deprecated.set(methodName, true);
    const message = `Warning: ${methodName} is deprecated${version ? ` since v${version}` : ''}${newMethod ? `. Use ${newMethod} instead.` : '.'}`;
    
    if (console && console.warn) {
      console.warn(message, this);
    }
  }

  // Security utilities
  escapeHtml(text) {
    return SecurityUtils.escapeHtml(text);
  }

  sanitizeHtml(html) {
    return SecurityUtils.sanitizeHtml(html);
  }

  sanitizeInput(value, options) {
    return SecurityUtils.sanitizeInput(value, options);
  }

  isSafeForTemplate(value) {
    return SecurityUtils.isSafeForTemplate(value);
  }

  // Internationalization methods
  t(key, params = {}, options = {}) {
    // Use component-specific locale if provided, otherwise use global locale
    const locale = this.locale || options.locale;
    return i18n.t(key, params, { ...options, locale });
  }

  getLocale() {
    return this.locale || i18n.getLocale();
  }

  setLocale(locale) {
    const oldLocale = this.locale;
    this.locale = locale;
    this.emit('localeChanged', { oldLocale, newLocale: locale });
    return this;
  }

  formatDate(date, options = {}) {
    return i18n.formatDate(date, options);
  }

  formatNumber(number, options = {}) {
    return i18n.formatNumber(number, options);
  }

  formatCurrency(amount, currency = 'USD', options = {}) {
    return i18n.formatCurrency(amount, currency, options);
  }

  // Backward compatibility aliases with deprecation warnings
  getEl() {
    this._warnDeprecated('getEl()', 'direct property access (component.el)', '1.1.0');
    return this.el;
  }

  isDestroyed() {
    this._warnDeprecated('isDestroyed()', 'direct property access (component.destroyed)', '1.1.0');
    return this.destroyed;
  }

  isRendered() {
    this._warnDeprecated('isRendered()', 'direct property access (component.rendered)', '1.1.0');
    return this.rendered;
  }

  isInitialized() {
    this._warnDeprecated('isInitialized()', 'direct property access (component.initialized)', '1.1.0');
    return this.initialized;
  }
}