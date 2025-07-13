import { Component } from '../core/Component.js';

/**
 * @component MenuItem
 * @extends Component
 * @description An individual menu item with icon, text, keyboard shortcuts, and submenu support
 * @category Navigation Components
 * @since 1.0.0
 * @example
 * // Menu item with icon and handler
 * const menuItem = new AiondaWebUI.MenuItem({
 *   text: 'Save',
 *   iconCls: 'fas fa-save',
 *   shortcut: 'Ctrl+S',
 *   handler: saveDocument
 * });
 */
export class MenuItem extends Component {
    /**
   * @config
   * @property {string} [text] - Menu item text
   * @property {string} [iconCls] - CSS class for menu item icon
   * @property {Function} [handler] - Click handler function
   * @property {string} [shortcut] - Keyboard shortcut text to display
   * @property {boolean} [disabled=false] - Whether menu item is disabled
   * @property {boolean} [checked=false] - Whether menu item is checked
   * @property {string} [group] - Group name for radio-style menu items
   * @property {Menu} [menu] - Submenu to show on hover
   * @property {string} [href] - URL for link-style menu items
   */
  constructor(config = {}) {
    super(config);
    
    config = config || {};
    
    this.text = config.text || config.label || '';
    this.icon = config.icon || '';
    this.iconAlign = config.iconAlign || 'left';
    this.shortcut = config.shortcut || '';
    this.href = config.href;
    this.target = config.target;
    this.handler = config.handler;
    this.separator = config.separator || false;
    this.submenu = config.submenu || null;
    this.checked = config.checked || false;
    this.checkable = config.checkable || false;
    this.radioGroup = config.radioGroup || null;
    this.disabled = config.disabled || false;
    this.menu = null;
    
    this.menuItemEl = null;
  }

  createTemplate() {
    if (this.separator) {
      return '<div class="aionda-menu-separator" role="separator"></div>';
    }

    const isLink = !!this.href;
    const tag = isLink ? 'a' : 'div';
    const attributes = this.getElementAttributes();
    const classes = this.getMenuItemClasses().join(' ');
    const content = this.getMenuItemContent();
    const hasSubmenu = this.submenu && this.submenu.length > 0;

    return `
      <${tag} class="${classes}" ${attributes} role="menuitem" 
           tabindex="${this.disabled ? '-1' : '0'}"
           ${hasSubmenu ? 'aria-haspopup="true" aria-expanded="false"' : ''}>
        ${content}
        ${hasSubmenu ? '<span class="aionda-menu-arrow">▶</span>' : ''}
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
    }

    if (this.disabled) {
      attrs.push('aria-disabled="true"');
    }

    if (this.checked) {
      attrs.push('aria-checked="true"');
    }

    if (this.radioGroup) {
      attrs.push(`data-radio-group="${this.radioGroup}"`);
    }

    return attrs.join(' ');
  }

  getMenuItemClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-menu-item',
      'flex',
      'items-center',
      'px-3',
      'py-2',
      'text-sm',
      'cursor-pointer',
      'select-none',
      'relative'
    ];

    if (this.separator) {
      classes.push('border-t', 'border-gray-200', 'my-1', 'mx-2');
      return classes;
    }

    classes.push(
      'hover:bg-gray-100',
      'focus:bg-gray-100',
      'focus:outline-none',
      'transition-colors',
      'duration-150'
    );

    if (this.disabled) {
      classes.push('opacity-50', 'cursor-not-allowed');
    }

    if (this.checked) {
      classes.push('bg-blue-50', 'text-blue-700');
    }

    return classes;
  }

  getMenuItemContent() {
    if (this.separator) return '';

    const iconHtml = this.getIconHtml();
    const textHtml = this.text ? `<span class="aionda-menu-text flex-1">${this.text}</span>` : '';
    const shortcutHtml = this.getShortcutHtml();
    const checkHtml = this.getCheckHtml();

    if (this.iconAlign === 'right') {
      return `
        ${checkHtml}
        ${textHtml}
        ${shortcutHtml}
        ${iconHtml}
      `;
    }

    return `
      ${checkHtml}
      ${iconHtml}
      ${textHtml}
      ${shortcutHtml}
    `;
  }

  getIconHtml() {
    if (!this.icon) return '';
    const alignClass = this.iconAlign === 'right' ? 'aionda-menu-icon-right ml-auto' : 'aionda-menu-icon-left mr-2';
    return `<span class="aionda-menu-icon ${alignClass} w-4 h-4 flex items-center justify-center">${this.icon}</span>`;
  }

  getShortcutHtml() {
    if (!this.shortcut) return '';
    return `<span class="aionda-menu-shortcut ml-auto text-xs text-gray-400">${this.shortcut}</span>`;
  }

  getCheckHtml() {
    if (!this.checked && !this.radioGroup) return '';
    
    const checkIcon = this.radioGroup ? '●' : '✓';
    const visibility = this.checked ? 'visible' : 'invisible';
    
    return `<span class="aionda-menu-check mr-2 w-4 h-4 flex items-center justify-center text-blue-600 ${visibility}">${checkIcon}</span>`;
  }

  setupEventListeners() {
    super.setupEventListeners();

    if (this.separator) return;

    this.menuItemEl = this.el;
    this.menuItemEl.addEventListener('click', (event) => this.onClick(event));
    this.menuItemEl.addEventListener('mouseover', (event) => this.onMouseEnter(event));
    this.menuItemEl.addEventListener('mouseout', (event) => this.onMouseLeave(event));
    this.menuItemEl.addEventListener('focus', (event) => this.onFocus(event));
    this.menuItemEl.addEventListener('blur', (event) => this.onBlur(event));
    this.menuItemEl.addEventListener('keydown', (event) => this.onKeyDown(event));
  }

  onClick(event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }

    if (this.submenu && this.submenu.length > 0) {
      event.preventDefault();
      this.toggleSubmenu();
      return;
    }

    if (this.radioGroup) {
      this.selectRadioItem();
    } else if (this.hasCheckbox()) {
      this.toggle();
    }

    if (this.handler) {
      this.handler(this, event);
    }

    this.emit('click', { menuItem: this, event });

    if (this.href) {
      if (this.target === '_blank') {
        window.open(this.href, this.target);
      } else {
        window.location.href = this.href;
      }
    }

    if (this.menu) {
      this.menu.hide();
    }
  }

  onMouseEnter(event) {
    if (this.disabled) return;
    
    this.focus();
    
    if (this.submenu && this.submenu.length > 0) {
      this.showSubmenu();
    }
    
    this.emit('mouseover', { menuItem: this, event });
  }

  onMouseLeave(event) {
    if (this.disabled) return;
    this.emit('mouseout', { menuItem: this, event });
  }

  onFocus(event) {
    if (this.disabled) return;
    this.emit('focus', { menuItem: this, event });
  }

  onBlur(event) {
    if (this.disabled) return;
    this.emit('blur', { menuItem: this, event });
  }

  onKeyDown(event) {
    if (this.disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onClick(event);
        break;
      case 'ArrowRight':
        if (this.submenu && this.submenu.length > 0) {
          event.preventDefault();
          this.showSubmenu();
        }
        break;
      case 'ArrowLeft':
        if (this.menu && this.menu.parentMenu) {
          event.preventDefault();
          this.menu.hide();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPrevious();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNext();
        break;
      case 'Escape':
        event.preventDefault();
        if (this.menu) {
          this.menu.hide();
        }
        break;
    }
  }

  hasCheckbox() {
    return this.checked !== undefined && !this.radioGroup;
  }

  isSeparator() {
    return this.separator;
  }

  toggle() {
    this.setChecked(!this.checked);
    return this;
  }

  setChecked(checked) {
    this.checked = checked;
    if (this.rendered) {
      this.menuItemEl.setAttribute('aria-checked', checked.toString());
      this.updateContent();
      this.updateClasses();
    }
    this.emit('check', { menuItem: this, checked });
    return this;
  }

  selectRadioItem() {
    if (!this.radioGroup || !this.menu) return;

    this.menu.getRadioGroupItems(this.radioGroup).forEach(item => {
      if (item !== this) {
        item.setChecked(false);
      }
    });
    
    this.setChecked(true);
    return this;
  }

  setText(text) {
    this.text = text;
    if (this.rendered) {
      this.updateContent();
    }
    return this;
  }

  setIcon(icon) {
    this.icon = icon;
    if (this.rendered) {
      this.updateContent();
    }
    return this;
  }

  setShortcut(shortcut) {
    this.shortcut = shortcut;
    if (this.rendered) {
      this.updateContent();
    }
    return this;
  }

  showSubmenu() {
    if (!this.submenu) return;
    if (this.menu && this.menu.showSubmenu) {
      this.menu.showSubmenu(this);
    }
  }

  hideSubmenu() {
    if (!this.submenu) return;
    if (this.menu && this.menu.hideSubmenu) {
      this.menu.hideSubmenu(this);
    }
  }

  toggleSubmenu() {
    if (!this.submenu) return;
    if (this.menu && this.menu.toggleSubmenu) {
      this.menu.toggleSubmenu(this);
    }
  }

  focus() {
    if (this.menuItemEl && !this.disabled) {
      this.menuItemEl.focus();
      if (this.menu) {
        this.menu.setFocusedItem(this);
      }
    }
    return this;
  }

  blur() {
    if (this.menuItemEl) {
      this.menuItemEl.blur();
    }
    return this;
  }

  focusNext() {
    if (this.menu) {
      this.menu.focusNextItem();
    }
  }

  focusPrevious() {
    if (this.menu) {
      this.menu.focusPreviousItem();
    }
  }

  updateContent() {
    if (this.menuItemEl && !this.separator) {
      this.menuItemEl.innerHTML = this.getMenuItemContent() + 
        (this.submenu && this.submenu.length > 0 ? '<span class="aionda-menu-arrow">▶</span>' : '');
    }
  }

  updateClasses() {
    if (this.menuItemEl) {
      this.menuItemEl.className = this.getMenuItemClasses().join(' ');
    }
  }

  enable() {
    this.disabled = false;
    if (this.menuItemEl) {
      this.menuItemEl.removeAttribute('aria-disabled');
      this.menuItemEl.setAttribute('tabindex', '0');
      this.updateClasses();
    }
    return this;
  }

  disable() {
    this.disabled = true;
    if (this.menuItemEl) {
      this.menuItemEl.setAttribute('aria-disabled', 'true');
      this.menuItemEl.setAttribute('tabindex', '-1');
      this.updateClasses();
    }
    return this;
  }

  destroy() {
    if (this.submenu && this.submenu.destroy) {
      this.submenu.destroy();
    }
    super.destroy();
  }
}