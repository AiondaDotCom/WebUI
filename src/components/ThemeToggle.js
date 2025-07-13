import { Component } from '../core/Component.js';
import { ThemeManager } from '../core/ThemeManager.js';

/**
 * ThemeToggle Component - Pure ES6
 * Toggle switch for dark/light theme with icons and accessibility
 */
export class ThemeToggle extends Component {
  constructor(config = {}) {
    super(config);
    
    this.config = {
      type: 'button',
      size: 'medium',
      showLabels: true,
      showIcons: true,
      animated: false,
      dynamicAriaLabel: false,
      lightLabel: 'Light',
      darkLabel: 'Dark',
      lightIcon: '☀️',
      darkIcon: '🌙',
      buttonText: null,
      cssClass: null,
      iconOnly: false,
      themeClasses: null,
      animationDuration: 200,
      themeManager: null,
      ...config
    };
    
    this.themeManager = this.config.themeManager || new ThemeManager({ autoInit: false });
    
    if (!this.themeManager.getCurrentTheme()) {
      this.themeManager.init();
    }
    
    this.currentTheme = this.themeManager.getCurrentTheme() || 'light';
    this.isDark = this.currentTheme === 'dark';
    
    this.setupThemeListener();
  }

  setupThemeListener() {
    if (this.themeManager && this.themeManager.on) {
      this.themeManager.on('themeChanged', (event) => {
        this.currentTheme = event.theme;
        this.isDark = event.theme === 'dark';
        if (this.rendered) {
          this.updateAppearance();
        }
      });
    }
  }

  createTemplate() {
    if (this.config.type === 'switch') {
      return this.createSwitchTemplate();
    }
    return this.createButtonTemplate();
  }

  createButtonTemplate() {
    const ariaLabel = this.getAriaLabel();
    const content = this.getButtonContent();
    
    return `
      <button class="${this.getButtonClasses()}" 
              role="switch" 
              aria-pressed="${this.isDark}"
              aria-label="${ariaLabel}"
              tabindex="0"
              type="button">
        ${content}
      </button>
    `;
  }
  
  getButtonContent() {
    if (this.config.buttonText) {
      return this.config.buttonText;
    }
    
    if (this.config.iconOnly) {
      return this.config.showIcons ? `${this.config.lightIcon} ${this.config.darkIcon}` : '';
    }
    
    let content = '';
    if (this.config.showIcons && this.config.showLabels) {
      content = `${this.config.lightIcon} ${this.config.lightLabel} / ${this.config.darkIcon} ${this.config.darkLabel}`;
    } else if (this.config.showIcons) {
      content = `${this.config.lightIcon} ${this.config.darkIcon}`;
    } else if (this.config.showLabels) {
      content = `${this.config.lightLabel} / ${this.config.darkLabel}`;
    }
    
    return content;
  }

  createSwitchTemplate() {
    const ariaLabel = this.getAriaLabel();
    
    return `
      <div class="${this.getSwitchContainerClasses()}">
        <input type="checkbox" 
               class="aionda-theme-toggle-switch-input sr-only"
               ${this.isDark ? 'checked' : ''}
               aria-label="${ariaLabel}">
        <div class="aionda-theme-toggle-switch-track">
          <div class="aionda-theme-toggle-switch-thumb">
            ${this.config.showIcons ? (this.isDark ? this.config.darkIcon : this.config.lightIcon) : ''}
          </div>
        </div>
        ${this.config.showLabels ? `
          <span class="aionda-theme-toggle-switch-label">
            ${this.isDark ? this.config.darkLabel : this.config.lightLabel}
          </span>
        ` : ''}
      </div>
    `;
  }

  getButtonClasses() {
    const classes = [
      'theme-toggle',
      'inline-flex',
      'items-center',
      'gap-2',
      'px-4',
      'py-2',
      'rounded',
      'border',
      'cursor-pointer',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500'
    ];

    if (this.config.cssClass) {
      classes.push(this.config.cssClass);
    }

    if (this.config.size === 'large') {
      classes.push('theme-toggle-large', 'text-lg', 'px-6', 'py-3');
    } else if (this.config.size === 'small') {
      classes.push('theme-toggle-small', 'text-sm', 'px-2', 'py-1');
    }

    if (this.config.animated) {
      classes.push('transition-all', 'duration-200');
    }

    const themeClass = this.isDark ? 'theme-toggle-dark' : 'theme-toggle-light';
    classes.push(themeClass);

    if (this.config.themeClasses) {
      const customThemeClass = this.isDark ? 
        this.config.themeClasses.dark : this.config.themeClasses.light;
      if (customThemeClass) {
        classes.push(customThemeClass);
      }
    }

    return classes.join(' ');
  }

  getSwitchContainerClasses() {
    const classes = [
      'aionda-theme-toggle-switch',
      'inline-flex',
      'items-center',
      'gap-3',
      'cursor-pointer'
    ];

    if (this.config.cssClass) {
      classes.push(this.config.cssClass);
    }

    return classes.join(' ');
  }

  getAriaLabel() {
    if (this.config.dynamicAriaLabel) {
      return this.isDark ? 
        `Switch to ${this.config.lightLabel.toLowerCase()} theme` :
        `Switch to ${this.config.darkLabel.toLowerCase()} theme`;
    }
    return 'Toggle theme';
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

    this.rendered = true;
    this.emit('render');

    return this.el;
  }

  setupEventListeners() {
    super.setupEventListeners();

    if (this.config.type === 'switch') {
      const checkbox = this.el.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.addEventListener('change', (event) => this.onSwitchChange(event));
      }
    } else {
      this.el.addEventListener('click', (event) => this.onClick(event));
    }
    
    this.el.addEventListener('keydown', (event) => this.onKeyDown(event));
    this.el.addEventListener('focus', (event) => this.onFocus(event));
    this.el.addEventListener('blur', (event) => this.onBlur(event));
  }

  onSwitchChange(event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    this.toggle();
  }

  onClick(event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    this.toggle();
  }

  onKeyDown(event) {
    if (this.disabled) return;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  onFocus(event) {
    this.emit('focus', { themeToggle: this, event });
  }

  onBlur(event) {
    this.emit('blur', { themeToggle: this, event });
  }

  toggle() {
    if (!this.themeManager || this.themeManager.destroyed) {
      return;
    }

    const previousTheme = this.themeManager.getCurrentTheme();
    
    if (this.config.animated && this.el) {
      this.el.classList.add('theme-toggle-animating');
      setTimeout(() => {
        if (this.el && !this.destroyed) {
          this.el.classList.remove('theme-toggle-animating');
        }
      }, this.config.animationDuration);
    }

    this.themeManager.toggleTheme();
    const newTheme = this.themeManager.getCurrentTheme();
    
    this.emit('toggle', { 
      theme: newTheme,
      previousTheme: previousTheme
    });
  }

  updateAppearance() {
    if (!this.rendered || !this.el) return;

    // Update internal state first
    this.currentTheme = this.themeManager.getCurrentTheme() || 'light';
    this.isDark = this.currentTheme === 'dark';

    if (this.config.type === 'switch') {
      const checkbox = this.el.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = this.isDark;
      }
    } else {
      this.el.setAttribute('aria-pressed', this.isDark.toString());
      
      if (this.config.dynamicAriaLabel) {
        this.el.setAttribute('aria-label', this.getAriaLabel());
      }
      
      // Preserve animation class when updating appearance
      const hasAnimatingClass = this.el.classList.contains('theme-toggle-animating');
      this.el.className = this.getButtonClasses();
      if (hasAnimatingClass) {
        this.el.classList.add('theme-toggle-animating');
      }
      this.el.innerHTML = this.getButtonContent();
    }

    this.emit('statechange', { 
      themeToggle: this, 
      theme: this.currentTheme,
      isDark: this.isDark
    });
  }

  updateToggleState() {
    this.updateAppearance();
  }

  setTheme(theme) {
    if (this.themeManager && !this.themeManager.destroyed) {
      this.themeManager.setTheme(theme);
    }
    return this;
  }

  getTheme() {
    return this.currentTheme;
  }

  setSize(size) {
    this.config.size = size;
    if (this.rendered) {
      this.updateAppearance();
    }
    return this;
  }

  focus() {
    this.el?.focus();
    return this;
  }

  blur() {
    this.el?.blur();
    return this;
  }

  destroy() {
    if (this.themeManager && this.themeManager.off) {
      this.themeManager.off('themeChanged');
    }
    super.destroy();
  }
}