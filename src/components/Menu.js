import { Component } from '../core/Component.js';
import { MenuItem } from './MenuItem.js';

/**
 * @component Menu
 * @extends Component
 * @description A context menu or dropdown menu component with hierarchical items and keyboard navigation
 * @category Navigation Components
 * @since 1.0.0
 * @example
 * // Context menu with items
 * const menu = new AiondaWebUI.Menu({
 *   items: [
 *     { text: 'New', iconCls: 'fas fa-plus', handler: createNew },
 *     { text: 'Open', iconCls: 'fas fa-folder-open', handler: openFile },
 *     '-', // separator
 *     { text: 'Exit', iconCls: 'fas fa-times', handler: exit }
 *   ]
 * });
 */
export class Menu extends Component {
    /**
   * @config
   * @property {Array} [items=[]] - Array of menu items or separators
   * @property {boolean} [floating=true] - Whether menu floats above other content
   * @property {boolean} [shadow=true] - Whether to show drop shadow
   * @property {string} [cls] - Additional CSS classes
   * @property {number} [minWidth=120] - Minimum menu width
   * @property {boolean} [allowOtherMenus=false] - Whether other menus can be open simultaneously
   */
  constructor(config = {}) {
    super(config);
    
    config = config || {};
    
    this.items = config.items || [];
    this.showOn = config.showOn || 'click';
    this.trigger = config.trigger || null;
    this.align = config.align || 'left';
    this.offset = config.offset || { x: 0, y: 0 };
    this.autoHide = config.autoHide !== false;
    this.closeOnClick = config.closeOnClick !== false;
    this.floating = config.floating !== false;
    this.parentMenu = config.parentMenu || null;
    this.submenuDelay = config.submenuDelay || 100;
    this.contextMenu = config.contextMenu || false;
    this.visible = false;
    this.currentTarget = null;
    
    this.menuEl = null;
    this.menuItems = [];
    this.focusedItemIndex = -1;
    this.activeSubmenu = null;
    this.submenuTimer = null;
    this.hideTimer = null;
    this.shown = false;
    
    this.boundDocumentClick = this.onDocumentClick.bind(this);
    this.boundDocumentKeyDown = this.onDocumentKeyDown.bind(this);
    this.boundDocumentContextMenu = this.onDocumentContextMenu.bind(this);
    this.boundContextMenu = this.onContextMenu.bind(this);
    this.boundTriggerEvent = this.onTriggerEvent.bind(this);
    
    this.initializeItems();
    this.bindTrigger();
  }

  createTemplate() {
    const classes = this.getMenuClasses().join(' ');
    const style = this.getMenuStyle();
    const itemsHtml = this.getItemsHtml();

    return `<div class="${classes}" style="${style}" role="menu" aria-hidden="true">${itemsHtml}</div>`;
  }

  getMenuClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-menu',
      'absolute',
      'z-50',
      'min-w-48',
      'bg-white',
      'border',
      'border-gray-200',
      'rounded-md',
      'shadow-lg',
      'py-1',
      'focus:outline-none'
    ];

    if (this.floating) {
      classes.push('aionda-menu-floating');
    }

    if (this.contextMenu) {
      classes.push('aionda-menu-context');
    }

    if (!this.visible) {
      classes.push('hidden');
    }

    classes.push('transition-all', 'duration-150', 'ease-out');

    return classes;
  }

  getMenuStyle() {
    const styles = [];
    
    if (this.floating) {
      styles.push('position: fixed');
    }
    
    return styles.join('; ');
  }

  getItemsHtml() {
    return this.items.map((itemConfig, index) => {
      if (itemConfig === '-' || itemConfig.type === 'separator') {
        return `<div class="aionda-menu-separator border-t border-gray-200 my-1"></div>`;
      }
      
      const disabled = itemConfig.disabled ? ' aionda-menu-item-disabled opacity-50 cursor-not-allowed' : '';
      const icon = itemConfig.icon ? `<span class="mr-2">${itemConfig.icon}</span>` : '';
      const shortcut = itemConfig.shortcut ? `<span class="ml-auto text-sm text-gray-500">${itemConfig.shortcut}</span>` : '';
      const tooltip = itemConfig.tooltip ? ` title="${itemConfig.tooltip}"` : '';
      const id = itemConfig.id ? ` id="${itemConfig.id}"` : '';
      const ariaDisabled = itemConfig.disabled ? ' aria-disabled="true"' : '';
      
      return `<div class="aionda-menu-item px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center${disabled}" role="menuitem" data-item-index="${index}"${tooltip}${id}${ariaDisabled} tabindex="0">${icon}${itemConfig.text}${shortcut}</div>`;
    }).join('');
  }

  initializeItems() {
    this.menuItems = [];
    
    this.items.forEach((itemConfig, index) => {
      if (itemConfig === '-' || (itemConfig && itemConfig.type === 'separator')) {
        this.menuItems.push({ disabled: true, separator: true, index });
      } else {
        this.menuItems.push({ 
          disabled: itemConfig.disabled || false, 
          separator: false, 
          index,
          focus: () => {
            const itemEl = this.menuEl?.querySelector(`[data-item-index="${index}"]`);
            if (itemEl) {
              itemEl.focus();
            }
          }
        });
      }
    });
  }

  bindTrigger() {
    if (!this.trigger) return;

    const triggerEl = typeof this.trigger === 'string' 
      ? document.querySelector(this.trigger) 
      : this.trigger;
    
    if (!triggerEl) return;

    if (this.contextMenu) {
      triggerEl.addEventListener('contextmenu', this.boundContextMenu);
    } else {
      const eventType = this.showOn === 'hover' ? 'mouseenter' : 'click';
      triggerEl.addEventListener(eventType, this.boundTriggerEvent);
      
      if (this.showOn === 'hover') {
        triggerEl.addEventListener('mouseleave', () => {
          this.scheduleHide();
        });
      }
    }
  }

  unbindTrigger() {
    if (!this.trigger) return;

    const triggerEl = typeof this.trigger === 'string' 
      ? document.querySelector(this.trigger) 
      : this.trigger;
    
    if (!triggerEl) return;

    if (this.contextMenu) {
      triggerEl.removeEventListener('contextmenu', this.boundContextMenu);
    } else {
      const eventType = this.showOn === 'hover' ? 'mouseenter' : 'click';
      triggerEl.removeEventListener(eventType, this.boundTriggerEvent);
      
      if (this.showOn === 'hover') {
        triggerEl.removeEventListener('mouseleave', this.scheduleHide);
      }
    }
  }

  onTriggerEvent(event) {
    event.preventDefault();
    
    if (this.shown) {
      this.hide();
    } else {
      this.showAtPosition(event.target);
    }
  }

  onContextMenu(event) {
    event.preventDefault();
    this.showAtPosition(event.clientX, event.clientY);
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.menuEl = this.el;
    
    this.menuEl.addEventListener('mouseenter', () => {
      this.cancelHide();
    });
    
    this.menuEl.addEventListener('mouseleave', () => {
      if (this.showOn === 'hover' && this.autoHide) {
        this.scheduleHide();
      }
    });

    this.menuEl.addEventListener('click', (event) => {
      const itemEl = event.target.closest('.aionda-menu-item');
      if (itemEl && !itemEl.classList.contains('aionda-menu-item-disabled')) {
        const index = parseInt(itemEl.getAttribute('data-item-index'), 10);
        const item = this.items[index];
        
        if (item && item.handler) {
          item.handler(item, event);
        }
        
        this.emit('itemclick', { item, index, event });
        
        if (this.closeOnClick) {
          this.hide();
        }
      }
    });
  }

  render() {
    const element = super.render();
    
    if (!document.body.contains(element)) {
      document.body.appendChild(element);
    }
    
    return element;
  }

  show() {
    if (this.visible) return this;

    this.render();
    this.visible = true;
    this.shown = true;
    
    this.menuEl.classList.remove('hidden');
    this.menuEl.setAttribute('aria-hidden', 'false');
    
    this.focusedItemIndex = -1;
    this.bindGlobalEvents();
    
    setTimeout(() => {
      this.focusFirstItem();
    }, 100);
    
    this.emit('show', { target: this.currentTarget, x: this.showAtX || 0, y: this.showAtY || 0 });
    return this;
  }

  hide() {
    if (!this.visible) return this;

    this.visible = false;
    this.shown = false;
    this.currentTarget = null;
    this.hideActiveSubmenu();
    
    this.menuEl.classList.add('hidden');
    this.menuEl.setAttribute('aria-hidden', 'true');
    
    this.unbindGlobalEvents();
    this.focusedItemIndex = -1;
    
    this.emit('hide');
    return this;
  }

  toggle() {
    return this.visible ? this.hide() : this.show();
  }

  showAtPosition(x, y) {
    this.showAtX = x;
    this.showAtY = y;
    this.show();
    this.positionMenu({ x, y });
    return this;
  }
  
  showAt(x, y) {
    return this.showAtPosition(x, y);
  }

  showAtEvent(event, target) {
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
    
    this.currentTarget = target;
    this.showAtPosition(event.clientX, event.clientY);
    return this;
  }

  positionMenu(position) {
    if (!this.menuEl) return;

    let x, y;
    
    if (position && typeof position === 'object') {
      if (position.x !== undefined && position.y !== undefined) {
        x = position.x;
        y = position.y;
      } else if (position.getBoundingClientRect) {
        const rect = position.getBoundingClientRect();
        if (this.align === 'right') {
          x = rect.right;
        } else {
          x = rect.left;
        }
        y = rect.bottom;
      }
    }
    
    if (x === undefined || y === undefined) {
      x = 0;
      y = 0;
    }
    
    x += this.offset.x;
    y += this.offset.y;
    
    const menuRect = this.menuEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 10;
    }
    if (x < 10) {
      x = 10;
    }
    
    if (y + menuRect.height > viewportHeight) {
      y = y - menuRect.height;
      if (y < 10) {
        y = 10;
      }
    }
    
    this.menuEl.style.left = `${x}px`;
    this.menuEl.style.top = `${y}px`;
  }

  bindGlobalEvents() {
    document.addEventListener('click', this.boundDocumentClick, true);
    document.addEventListener('keydown', this.boundDocumentKeyDown, true);
    document.addEventListener('contextmenu', this.boundDocumentContextMenu, true);
  }

  unbindGlobalEvents() {
    document.removeEventListener('click', this.boundDocumentClick, true);
    document.removeEventListener('keydown', this.boundDocumentKeyDown, true);
    document.removeEventListener('contextmenu', this.boundDocumentContextMenu, true);
  }

  onDocumentContextMenu(event) {
    if (!this.autoHide) return;
    
    if (this.menuEl && this.menuEl.contains(event.target)) {
      return;
    }
    
    this.hide();
  }

  onDocumentClick(event) {
    if (!this.autoHide) return;
    
    if (this.menuEl && this.menuEl.contains(event.target)) {
      return;
    }
    
    if (this.trigger) {
      const triggerEl = typeof this.trigger === 'string' 
        ? document.querySelector(this.trigger) 
        : this.trigger;
      if (triggerEl && triggerEl.contains(event.target)) {
        return;
      }
    }
    
    this.hide();
  }

  onDocumentKeyDown(event) {
    if (!this.visible) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.hide();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem();
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
    }
  }

  focusFirstItem() {
    const firstIndex = this.getFirstFocusableIndex();
    if (firstIndex !== -1) {
      this.setFocusedItemIndex(firstIndex);
    }
  }

  focusLastItem() {
    const lastIndex = this.getLastFocusableIndex();
    if (lastIndex !== -1) {
      this.setFocusedItemIndex(lastIndex);
    }
  }

  focusNextItem() {
    const currentIndex = this.focusedItemIndex;
    const nextIndex = this.getNextFocusableIndex(currentIndex);
    if (nextIndex !== -1) {
      this.setFocusedItemIndex(nextIndex);
    }
  }

  focusPreviousItem() {
    const currentIndex = this.focusedItemIndex;
    const prevIndex = this.getPreviousFocusableIndex(currentIndex);
    if (prevIndex !== -1) {
      this.setFocusedItemIndex(prevIndex);
    }
  }

  getFirstFocusableIndex() {
    return this.menuItems.findIndex(item => !item.disabled && !item.separator);
  }

  getLastFocusableIndex() {
    for (let i = this.menuItems.length - 1; i >= 0; i--) {
      if (!this.menuItems[i].disabled && !this.menuItems[i].separator) {
        return i;
      }
    }
    return -1;
  }

  getNextFocusableIndex(currentIndex) {
    for (let i = currentIndex + 1; i < this.menuItems.length; i++) {
      if (!this.menuItems[i].disabled && !this.menuItems[i].separator) {
        return i;
      }
    }
    return this.getFirstFocusableIndex();
  }

  getPreviousFocusableIndex(currentIndex) {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!this.menuItems[i].disabled && !this.menuItems[i].separator) {
        return i;
      }
    }
    return this.getLastFocusableIndex();
  }

  setFocusedItemIndex(index) {
    if (index >= 0 && index < this.menuItems.length) {
      this.focusedItemIndex = index;
      this.menuItems[index].focus();
    }
  }

  setFocusedItem(menuItem) {
    const index = this.menuItems.indexOf(menuItem);
    if (index !== -1) {
      this.focusedItemIndex = index;
    }
  }

  showSubmenu(parentItem) {
    if (!parentItem.submenu || parentItem.submenu.length === 0) return;

    this.hideActiveSubmenu();

    const submenu = new Menu({
      items: parentItem.submenu,
      parentMenu: this,
      floating: true,
      autoHide: false
    });

    submenu.render();
    
    const parentRect = parentItem.el.getBoundingClientRect();
    const menuRect = this.menuEl.getBoundingClientRect();
    
    submenu.showAt({
      x: menuRect.right - 2,
      y: parentRect.top
    });

    this.activeSubmenu = submenu;
    parentItem.el.setAttribute('aria-expanded', 'true');
  }

  hideSubmenu(parentItem) {
    if (this.activeSubmenu) {
      this.activeSubmenu.hide();
      this.activeSubmenu = null;
    }
    
    if (parentItem && parentItem.el) {
      parentItem.el.setAttribute('aria-expanded', 'false');
    }
  }

  toggleSubmenu(parentItem) {
    if (this.activeSubmenu) {
      this.hideSubmenu(parentItem);
    } else {
      this.showSubmenu(parentItem);
    }
  }

  hideActiveSubmenu() {
    if (this.activeSubmenu) {
      this.activeSubmenu.hide();
      this.activeSubmenu = null;
    }
  }

  scheduleHide() {
    this.cancelHide();
    this.hideTimer = setTimeout(() => {
      this.hide();
    }, 300);
  }

  cancelHide() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  getRadioGroupItems(radioGroup) {
    return this.menuItems.filter(item => item.radioGroup === radioGroup);
  }

  addItem(itemConfig, index) {
    if (index !== undefined && index >= 0 && index < this.items.length) {
      this.items.splice(index, 0, itemConfig);
    } else {
      this.items.push(itemConfig);
    }
    
    this.initializeItems();
    
    if (this.rendered) {
      this.updateMenuItems();
    }
    
    return itemConfig;
  }

  removeItem(item) {
    const index = typeof item === 'number' ? item : this.items.indexOf(item);
    
    if (index >= 0 && index < this.items.length) {
      const removedItem = this.items.splice(index, 1)[0];
      
      this.initializeItems();
      
      if (this.rendered) {
        this.updateMenuItems();
      }
      
      return removedItem;
    }
    
    return null;
  }

  updateMenuItems() {
    if (this.menuEl) {
      this.menuEl.innerHTML = this.getItemsHtml();
      this.setupEventListeners();
    }
  }

  setItems(items) {
    this.items = items || [];
    this.initializeItems();
    if (this.rendered) {
      this.updateMenuItems();
    }
  }

  getItem(index) {
    return this.items[index];
  }

  isVisible() {
    return this.shown;
  }

  adjustPosition() {
    if (!this.menuEl) return;

    const rect = this.menuEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 10;

    let currentLeft = parseInt(this.menuEl.style.left) || 0;
    let currentTop = parseInt(this.menuEl.style.top) || 0;

    // Get menu dimensions - use reasonable defaults if getBoundingClientRect returns 0 (testing environment)
    let menuWidth = rect.width || 192; // Default min-w-48 = 192px
    let menuHeight = rect.height || 100; // Reasonable default for menu height

    // Calculate new positions to ensure menu stays within viewport with margin
    let newLeft = currentLeft;
    let newTop = currentTop;

    // Check horizontal bounds - if menu would extend beyond viewport, adjust
    if (currentLeft + menuWidth > viewportWidth - margin) {
      newLeft = Math.max(margin, viewportWidth - menuWidth - margin);
    }
    if (newLeft < margin) {
      newLeft = margin;
    }

    // Check vertical bounds - if menu would extend beyond viewport, adjust  
    if (currentTop + menuHeight > viewportHeight - margin) {
      newTop = Math.max(margin, viewportHeight - menuHeight - margin);
    }
    if (newTop < margin) {
      newTop = margin;
    }

    // Apply the new positions
    this.menuEl.style.left = `${newLeft}px`;
    this.menuEl.style.top = `${newTop}px`;
  }

  destroy() {
    this.hide();
    this.unbindTrigger();
    this.menuItems = [];
    
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    
    if (this.submenuTimer) {
      clearTimeout(this.submenuTimer);
    }
    
    super.destroy();
  }
}