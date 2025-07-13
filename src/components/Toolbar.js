import { Component } from '../core/Component.js';
import { Button } from './Button.js';

export class Toolbar extends Component {
  constructor(config = {}) {
    super(config);
    
    config = config || {};
    
    this.orientation = config.orientation || 'horizontal';
    this.items = [];
    this.padding = config.padding !== false;
    this.border = config.border !== false;
    this.shadow = config.shadow || false;
    this.wrap = config.wrap || false;
    this.justify = config.justify || 'start';
    this.spacing = config.spacing || 'md';
    this.overflow = config.overflow || 'visible';
    this.height = config.height !== undefined ? config.height : 48;
    this.responsive = config.responsive !== false;
    
    this.overflowButton = null;
    this.overflowMenu = null;
    this.itemElements = [];
    this.separatorElements = [];
    this.spacerElements = [];
    this.resizeObserver = null;
    
    if (config.items) {
      config.items.forEach(item => this.items.push(item));
    }
  }

  createTemplate() {
    const classes = this.getToolbarClasses().join(' ');
    const style = this.orientation === 'horizontal' && typeof this.height === 'number' ? 
      `style="height: ${this.height}px; min-height: ${this.height}px;"` : '';
    
    return `<div class="${classes}" ${style}></div>`;
  }

  getToolbarClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-toolbar',
      'flex',
      'items-center',
      'bg-white'
    ];

    if (this.orientation === 'vertical') {
      classes.push('aionda-toolbar-vertical', 'flex-col');
    } else {
      classes.push('aionda-toolbar-horizontal', 'flex-row');
    }

    if (this.border) {
      classes.push('border-b', 'border-gray-200');
    }

    if (this.shadow) {
      classes.push('shadow-sm');
    }

    if (this.wrap) {
      classes.push('flex-wrap');
    }

    if (this.padding) {
      classes.push('px-4', 'py-2');
    }

    if (this.responsive) {
      classes.push('w-full');
    }

    classes.push(...this.getSpacingClasses());
    classes.push(...this.getJustifyClasses());
    classes.push(...this.getOverflowClasses());

    return classes;
  }

  getJustifyClasses() {
    const classes = [];
    
    switch (this.justify) {
      case 'start':
        classes.push('justify-start');
        break;
      case 'center':
        classes.push('justify-center');
        break;
      case 'end':
        classes.push('justify-end');
        break;
      case 'between':
        classes.push('justify-between');
        break;
      default:
        classes.push('justify-start');
        break;
    }
    
    return classes;
  }

  getSpacingClasses() {
    const classes = [];
    
    switch (this.spacing) {
      case 'sm':
        classes.push('gap-1');
        break;
      case 'md':
        classes.push('gap-2');
        break;
      case 'lg':
        classes.push('gap-4');
        break;
      case 'none':
        classes.push('gap-0');
        break;
      default:
        classes.push('gap-2');
        break;
    }
    
    return classes;
  }

  getOverflowClasses() {
    const classes = [];
    
    switch (this.overflow) {
      case 'visible':
        classes.push('overflow-visible');
        break;
      case 'hidden':
        classes.push('overflow-hidden');
        break;
      case 'scroll':
        classes.push('overflow-x-auto');
        break;
      default:
        classes.push('overflow-visible');
        break;
    }
    
    return classes;
  }

  renderItems() {
    return this.items.map((item, index) => {
      return this.renderItem(item, index);
    }).join('');
  }

  renderItem(item, index) {
    if (item === '|' || item === 'separator') {
      return this.renderSeparator(index);
    }
    
    if (item === '->' || item === 'spacer') {
      return this.renderSpacer(index);
    }

    if (item === '-' || item === 'fill') {
      return this.renderFill(index);
    }

    if (typeof item === 'string') {
      return this.renderText(item, index);
    }

    if (item && typeof item === 'object') {
      if (item.cmp === 'buttongroup') {
        return this.renderButtonGroup(item, index);
      }
      
      if (item.cmp === 'button' || !item.cmp) {
        return this.renderButton(item, index);
      }
      
      if (item.cmp === 'separator') {
        return this.renderSeparator(index);
      }
      
      if (item.cmp === 'spacer') {
        return this.renderSpacer(index);
      }
      
      if (item.cmp === 'fill') {
        return this.renderFill(index);
      }
      
      if (item.cmp === 'text') {
        return this.renderText(item.text || '', index);
      }
    }

    return '';
  }

  renderButton(config, index) {
    const buttonConfig = {
      size: 'sm',
      variant: 'secondary',
      outline: true,
      ...config,
      id: `${this.id}-btn-${index}`
    };
    
    return `<div class="aionda-toolbar-item" data-index="${index}" data-type="button">${this.createButtonHTML(buttonConfig)}</div>`;
  }

  renderButtonGroup(config, index) {
    const groupClasses = [
      'aionda-toolbar-buttongroup',
      'flex',
      this.orientation === 'vertical' ? 'flex-col' : 'flex-row',
      'rounded-md',
      'overflow-hidden',
      'border',
      'border-gray-300'
    ];

    const buttons = (config.items || []).map((btnConfig, btnIndex) => {
      const buttonConfig = {
        size: 'sm',
        variant: 'secondary',
        outline: false,
        ...btnConfig,
        id: `${this.id}-grp-${index}-btn-${btnIndex}`
      };
      
      return this.createButtonHTML(buttonConfig, true);
    }).join('');

    return `
      <div class="aionda-toolbar-item" data-index="${index}" data-type="buttongroup">
        <div class="${groupClasses.join(' ')}">
          ${buttons}
        </div>
      </div>
    `;
  }

  renderSeparator(index) {
    const separatorClasses = [
      'aionda-toolbar-separator',
      this.orientation === 'vertical' ? 'h-px w-full' : 'w-px h-6',
      'bg-gray-300',
      'mx-2'
    ];

    return `
      <div class="aionda-toolbar-item" data-index="${index}" data-type="separator">
        <div class="${separatorClasses.join(' ')}"></div>
      </div>
    `;
  }

  renderSpacer(index) {
    return `
      <div class="aionda-toolbar-item" data-index="${index}" data-type="spacer">
        <div class="aionda-toolbar-spacer w-4 h-4"></div>
      </div>
    `;
  }

  renderFill(index) {
    return `
      <div class="aionda-toolbar-item flex-1" data-index="${index}" data-type="fill">
        <div class="aionda-toolbar-fill"></div>
      </div>
    `;
  }

  renderText(text, index) {
    return `
      <div class="aionda-toolbar-item" data-index="${index}" data-type="text">
        <span class="aionda-toolbar-text text-sm text-gray-700 font-medium px-2">${text}</span>
      </div>
    `;
  }

  renderOverflowButton() {
    return `
      <div class="aionda-toolbar-overflow-btn hidden ml-2">
        <button type="button" class="aionda-toolbar-overflow-trigger inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
        </button>
      </div>
    `;
  }

  renderOverflowMenu() {
    return `
      <div class="aionda-toolbar-overflow-menu hidden absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
        <div class="py-1" role="menu"></div>
      </div>
    `;
  }

  createButtonHTML(config, isGrouped = false) {
    const classes = this.getButtonClasses(config, isGrouped);
    const attributes = this.getButtonAttributes(config);
    const content = this.getButtonContent(config);

    return `
      <button type="button" class="${classes.join(' ')}" ${attributes}>
        ${content}
      </button>
    `;
  }

  getButtonClasses(config, isGrouped = false) {
    const classes = [
      'aionda-toolbar-button',
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'transition-all',
      'duration-150',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-blue-500'
    ];

    if (!isGrouped) {
      classes.push('px-3', 'py-1.5', 'text-sm', 'rounded');
    } else {
      classes.push('px-3', 'py-1.5', 'text-sm', 'border-r', 'border-gray-300', 'last:border-r-0');
    }

    if (config.variant === 'primary') {
      classes.push('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    } else if (config.outline) {
      classes.push('border', 'border-gray-300', 'text-gray-700', 'bg-white', 'hover:bg-gray-50');
    } else {
      classes.push('text-gray-700', 'bg-gray-100', 'hover:bg-gray-200');
    }

    if (config.disabled) {
      classes.push('opacity-50', 'cursor-not-allowed');
    }

    return classes;
  }

  getButtonAttributes(config) {
    const attrs = [];
    
    if (config.disabled) {
      attrs.push('disabled');
    }
    
    if (config.title) {
      attrs.push(`title="${config.title}"`);
    }

    return attrs.join(' ');
  }

  getButtonContent(config) {
    const iconHtml = config.icon ? `<span class="aionda-button-icon">${config.icon}</span>` : '';
    const textHtml = config.text ? `<span class="aionda-button-text">${config.text}</span>` : '';

    if (!iconHtml && !textHtml) return '';
    if (!iconHtml) return textHtml;
    if (!textHtml) return iconHtml;

    const iconAlign = config.iconAlign || 'left';
    if (iconAlign === 'right') {
      return `${textHtml} ${iconHtml}`;
    } else {
      return `${iconHtml} ${textHtml}`;
    }
  }

  applyStyles() {
    if (!this.el) return;

    if (this.width !== undefined) {
      this.el.style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    }
    
    // Only apply height for horizontal orientation
    if (this.orientation === 'horizontal' && this.height !== undefined) {
      this.el.style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
    }

    Object.assign(this.el.style, this.style);
  }

  render() {
    const element = super.render();
    
    if (this.items && this.items.length > 0) {
      this.items.forEach(item => {
        this.add(item);
      });
    }
    
    return element;
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.el.addEventListener('click', (event) => this.onClick(event));
    
    if (this.enableOverflow) {
      const overflowBtn = this.el.querySelector('.aionda-toolbar-overflow-trigger');
      if (overflowBtn) {
        overflowBtn.addEventListener('click', () => this.toggleOverflowMenu());
      }
    }

    document.addEventListener('click', (event) => {
      if (!this.el.contains(event.target)) {
        this.hideOverflowMenu();
      }
    });
  }

  setupOverflowHandling() {
    if (!this.enableOverflow) return;

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkOverflow();
      });
      this.resizeObserver.observe(this.el);
    }

    this.checkOverflow();
  }

  checkOverflow() {
    if (!this.enableOverflow) return;

    const mainContainer = this.el.querySelector('.aionda-toolbar-main');
    const overflowBtn = this.el.querySelector('.aionda-toolbar-overflow-btn');
    
    if (!mainContainer || !overflowBtn) return;

    const containerWidth = this.el.clientWidth;
    const itemsWidth = Array.from(mainContainer.children).reduce((total, child) => {
      return total + child.offsetWidth;
    }, 0);

    const needsOverflow = itemsWidth > (containerWidth - 50);
    
    if (needsOverflow) {
      overflowBtn.classList.remove('hidden');
      this.moveItemsToOverflow();
    } else {
      overflowBtn.classList.add('hidden');
      this.moveItemsFromOverflow();
    }
  }

  moveItemsToOverflow() {
    const mainContainer = this.el.querySelector('.aionda-toolbar-main');
    const overflowMenu = this.el.querySelector('.aionda-toolbar-overflow-menu .py-1');
    
    if (!mainContainer || !overflowMenu) return;

    const items = Array.from(mainContainer.children);
    const containerWidth = this.el.clientWidth - 50;
    let currentWidth = 0;

    items.forEach((item, index) => {
      currentWidth += item.offsetWidth;
      
      if (currentWidth > containerWidth) {
        if (item.parentNode === mainContainer) {
          const overflowItem = this.createOverflowMenuItem(item, index);
          overflowMenu.appendChild(overflowItem);
          item.style.display = 'none';
        }
      }
    });
  }

  moveItemsFromOverflow() {
    const mainContainer = this.el.querySelector('.aionda-toolbar-main');
    const overflowMenu = this.el.querySelector('.aionda-toolbar-overflow-menu .py-1');
    
    if (!mainContainer || !overflowMenu) return;

    Array.from(mainContainer.children).forEach(item => {
      item.style.display = '';
    });

    overflowMenu.innerHTML = '';
  }

  createOverflowMenuItem(originalItem, index) {
    const menuItem = document.createElement('div');
    menuItem.className = 'aionda-toolbar-overflow-item px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer';
    menuItem.setAttribute('data-original-index', index);
    
    const button = originalItem.querySelector('button');
    if (button) {
      const text = button.querySelector('.aionda-button-text');
      const icon = button.querySelector('.aionda-button-icon');
      
      if (icon) menuItem.appendChild(icon.cloneNode(true));
      if (text) menuItem.appendChild(text.cloneNode(true));
      
      menuItem.addEventListener('click', () => {
        button.click();
        this.hideOverflowMenu();
      });
    }

    return menuItem;
  }

  toggleOverflowMenu() {
    const menu = this.el.querySelector('.aionda-toolbar-overflow-menu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  }

  hideOverflowMenu() {
    const menu = this.el.querySelector('.aionda-toolbar-overflow-menu');
    if (menu) {
      menu.classList.add('hidden');
    }
  }

  onClick(event) {
    const button = event.target.closest('.aionda-toolbar-button');
    if (!button) return;

    const item = button.closest('.aionda-toolbar-item');
    if (!item) return;

    const index = parseInt(item.getAttribute('data-index'));
    const type = item.getAttribute('data-type');
    const originalConfig = this.items[index];

    if (button.disabled) {
      event.preventDefault();
      return;
    }

    this.emit('buttonclick', {
      button: button,
      item: originalConfig,
      index: index,
      type: type,
      event: event
    });

    if (originalConfig && originalConfig.handler) {
      originalConfig.handler(originalConfig, event);
    }
  }

  add(item) {
    this.items.push(item);
    
    if (this.el) {
      if (item && typeof item.render === 'function') {
        const itemEl = item.render();
        this.el.appendChild(itemEl);
      } else if (item && item.nodeType) {
        this.el.appendChild(item);
      }
    }
    
    this.emit('itemAdd', { item });
    return this;
  }

  addSeparator() {
    const separator = document.createElement('div');
    const separatorClasses = [
      'aionda-toolbar-separator',
      this.orientation === 'vertical' ? 'border-t border-gray-300 w-6' : 'border-l border-gray-300 h-6'
    ];
    separator.className = separatorClasses.join(' ');
    
    this.add(separator);
    
    return separator;
  }

  addSpacer() {
    const spacer = document.createElement('div');
    spacer.className = 'aionda-toolbar-spacer flex-grow';
    
    this.add(spacer);
    
    return spacer;
  }

  remove(item) {
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items.splice(index, 1);
      
      if (this.el && item) {
        if (item.el && item.el.parentNode) {
          item.el.parentNode.removeChild(item.el);
        } else if (item.nodeType && item.parentNode) {
          item.parentNode.removeChild(item);
        }
      }
      
      this.emit('itemRemove', { item });
    }
    return this;
  }

  removeAll() {
    if (this.el) {
      this.el.innerHTML = '';
    }
    
    this.items = [];
    this.emit('clear');
    return this;
  }

  getItems() {
    return [...this.items];
  }

  addItem(item, index) {
    return this.add(item);
  }

  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      const item = this.items[index];
      return this.remove(item);
    }
    return this;
  }

  removeAllItems() {
    return this.removeAll();
  }

  setLayout(layout) {
    this.layout = layout;
    
    if (this.rendered) {
      this.refresh();
    }
    return this;
  }

  refresh() {
    if (!this.rendered) return;
    
    const mainContainer = this.el.querySelector('.aionda-toolbar-main');
    if (mainContainer) {
      mainContainer.innerHTML = this.renderItems();
      this.setupOverflowHandling();
    }
  }

  destroy() {
    this.items.forEach(item => {
      if (item && typeof item.destroy === 'function') {
        item.destroy();
      }
    });
    
    this.items = [];
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    super.destroy();
  }
}