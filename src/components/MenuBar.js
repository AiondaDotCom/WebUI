import { Component } from '../core/Component.js';
import { Menu } from './Menu.js';

/**
 * @component MenuBar
 * @extends Component
 * @description A horizontal menu bar component for application-level navigation with dropdown menus
 * @category Navigation Components
 * @since 1.0.0
 * @example
 * // Application menu bar
 * const menuBar = new AiondaWebUI.MenuBar({
 *   items: [
 *     {
 *       text: 'File',
 *       menu: [
 *         { text: 'New', icon: '📄', shortcut: 'Ctrl+N', handler: newFile },
 *         { text: 'Open', icon: '📁', shortcut: 'Ctrl+O', handler: openFile },
 *         '-',
 *         { text: 'Exit', icon: '❌', handler: exit }
 *       ]
 *     },
 *     {
 *       text: 'Edit',
 *       menu: [
 *         { text: 'Cut', icon: '✂️', shortcut: 'Ctrl+X', handler: cut },
 *         { text: 'Copy', icon: '📋', shortcut: 'Ctrl+C', handler: copy },
 *         { text: 'Paste', icon: '📌', shortcut: 'Ctrl+V', handler: paste }
 *       ]
 *     }
 *   ]
 * });
 */
export class MenuBar extends Component {
    /**
   * @config
   * @property {Array} [items=[]] - Array of menu bar items with dropdown menus
   * @property {string} [orientation='horizontal'] - Menu bar orientation
   * @property {boolean} [enableMnemonics=true] - Whether to enable Alt+key navigation
   * @property {string} [cls] - Additional CSS classes
   */
  constructor(config = {}) {
    super(config);
    
    config = config || {};
    
    this.items = config.items || [];
    this.orientation = config.orientation || 'horizontal';
    this.enableMnemonics = config.enableMnemonics !== false;
    this.showOnHover = config.showOnHover !== false;
    
    this.menuBarEl = null;
    this.menuItems = [];
    this.activeMenu = null;
    this.focusedItemIndex = -1;
    this.menubarMode = false; // Keyboard navigation mode
    
    this.boundDocumentClick = this.onDocumentClick.bind(this);
    this.boundDocumentKeyDown = this.onDocumentKeyDown.bind(this);
    this.boundItemMouseEnter = this.onItemMouseEnter.bind(this);
    this.boundItemMouseLeave = this.onItemMouseLeave.bind(this);
    this.boundItemClick = this.onItemClick.bind(this);
    
    this.initializeItems();
  }

  createTemplate() {
    const classes = this.getMenuBarClasses().join(' ');
    const itemsHtml = this.getItemsHtml();

    return `<div class="${classes}" role="menubar" aria-label="Application menu">${itemsHtml}</div>`;
  }

  getMenuBarClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-menubar',
      'flex',
      'bg-gray-100',
      'border-b',
      'border-gray-200',
      'px-2',
      'py-1'
    ];

    if (this.orientation === 'vertical') {
      classes.push('flex-col', 'w-48');
    } else {
      classes.push('flex-row');
    }

    return classes;
  }

  getItemsHtml() {
    return this.items.map((itemConfig, index) => {
      const disabled = itemConfig.disabled ? ' aionda-menubar-item-disabled opacity-50 cursor-not-allowed' : '';
      const icon = itemConfig.icon ? `<span class="mr-1">${itemConfig.icon}</span>` : '';
      const hasMenu = itemConfig.menu && itemConfig.menu.length > 0;
      const dropdown = hasMenu ? ' <span class="text-xs">▼</span>' : '';
      const tooltip = itemConfig.tooltip ? ` title="${itemConfig.tooltip}"` : '';
      const id = itemConfig.id ? ` id="${itemConfig.id}"` : '';
      const ariaDisabled = itemConfig.disabled ? ' aria-disabled="true"' : '';
      const ariaHaspopup = hasMenu ? ' aria-haspopup="true" aria-expanded="false"' : '';
      
      return `<div class="aionda-menubar-item px-3 py-2 text-sm cursor-pointer hover:bg-gray-200 rounded flex items-center select-none${disabled}" role="menuitem" data-item-index="${index}"${tooltip}${id}${ariaDisabled}${ariaHaspopup} tabindex="0">${icon}${itemConfig.text}${dropdown}</div>`;
    }).join('');
  }

  initializeItems() {
    this.menuItems = [];
    
    this.items.forEach((itemConfig, index) => {
      const menuItem = { 
        disabled: itemConfig.disabled || false, 
        index,
        config: itemConfig,
        menu: null,
        focus: () => {
          const itemEl = this.menuBarEl?.querySelector(`[data-item-index="${index}"]`);
          if (itemEl) {
            itemEl.focus();
          }
        }
      };
      
      // Create dropdown menu if menu items are defined
      if (itemConfig.menu && itemConfig.menu.length > 0) {
        menuItem.menu = new Menu({
          items: itemConfig.menu,
          floating: true,
          autoHide: false,
          showOn: 'click'
        });
        
        // Listen for menu hide events
        menuItem.menu.on('hide', () => {
          if (this.activeMenu === menuItem.menu) {
            this.activeMenu = null;
            this.exitMenubarMode();
          }
          const itemEl = this.menuBarEl?.querySelector(`[data-item-index="${index}"]`);
          if (itemEl) {
            itemEl.setAttribute('aria-expanded', 'false');
          }
        });
        
        // Listen for menu item clicks
        menuItem.menu.on('itemclick', (data) => {
          this.emit('menuitemclick', { 
            menuItem: data.item, 
            menuIndex: index, 
            menuConfig: itemConfig,
            event: data.event 
          });
        });
      }
      
      this.menuItems.push(menuItem);
    });
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.menuBarEl = this.el;
    
    // Menu bar item interactions
    this.menuBarEl.addEventListener('click', this.boundItemClick);
    this.menuBarEl.addEventListener('mouseenter', this.boundItemMouseEnter, true);
    this.menuBarEl.addEventListener('mouseleave', this.boundItemMouseLeave, true);
    
    // Keyboard navigation
    this.menuBarEl.addEventListener('keydown', (event) => {
      this.onMenuBarKeyDown(event);
    });
    
    // Focus handling
    this.menuBarEl.addEventListener('focusin', () => {
      this.enterMenubarMode();
    });
    
    this.menuBarEl.addEventListener('focusout', (event) => {
      // Only exit menubar mode if focus is leaving the menubar entirely
      if (!this.menuBarEl.contains(event.relatedTarget)) {
        this.exitMenubarMode();
      }
    });
  }

  onItemClick(event) {
    const itemEl = event.target.closest('.aionda-menubar-item');
    if (!itemEl || itemEl.classList.contains('aionda-menubar-item-disabled')) {
      return;
    }

    const index = parseInt(itemEl.getAttribute('data-item-index'), 10);
    const menuItem = this.menuItems[index];
    
    if (!menuItem) return;

    event.preventDefault();
    event.stopPropagation();
    
    this.setFocusedItemIndex(index);
    this.enterMenubarMode();
    
    if (menuItem.menu) {
      if (this.activeMenu === menuItem.menu) {
        this.hideActiveMenu();
      } else {
        this.showMenu(menuItem, itemEl);
      }
    } else {
      // Handle direct menu item click (no dropdown)
      this.emit('itemclick', { 
        item: menuItem.config, 
        index, 
        event 
      });
      
      if (menuItem.config.handler) {
        menuItem.config.handler(menuItem.config, event);
      }
    }
  }

  onItemMouseEnter(event) {
    const itemEl = event.target.closest('.aionda-menubar-item');
    if (!itemEl || itemEl.classList.contains('aionda-menubar-item-disabled')) {
      return;
    }

    const index = parseInt(itemEl.getAttribute('data-item-index'), 10);
    const menuItem = this.menuItems[index];
    
    if (!menuItem) return;

    // If in menubar mode or a menu is already open, show this menu on hover
    if (this.menubarMode || this.activeMenu) {
      this.setFocusedItemIndex(index);
      
      if (menuItem.menu && this.showOnHover) {
        this.showMenu(menuItem, itemEl);
      }
    }
  }

  onItemMouseLeave(event) {
    // Only handle if leaving the menubar entirely
    if (!this.menuBarEl.contains(event.relatedTarget)) {
      // Don't hide menu immediately on mouse leave
    }
  }

  showMenu(menuItem, itemEl) {
    if (!menuItem.menu) return;

    this.hideActiveMenu();
    
    // Position and show the menu with z-index fixes for window contexts
    const rect = itemEl.getBoundingClientRect();
    menuItem.menu.render();
    
    // Use normal menu positioning
    menuItem.menu.showAtPosition(rect.left, rect.bottom);
    
    // Apply minimal window-specific CSS fixes if in window context
    const isInWindow = this.el.closest('.aionda-window');
    if (isInWindow) {
      // Apply only essential fixes to ensure menu visibility without breaking normal behavior
      menuItem.menu.el.style.zIndex = '999999';
      menuItem.menu.el.style.position = 'fixed';
      menuItem.menu.el.style.top = (rect.bottom + 2) + 'px';
      menuItem.menu.el.style.left = rect.left + 'px';
      menuItem.menu.el.style.transition = 'none'; // Disable transitions to prevent floating animation
      menuItem.menu.el.style.transform = 'none'; // Reset any transforms
      
      // Move to body only if not already there
      if (menuItem.menu.el.parentNode !== document.body) {
        document.body.appendChild(menuItem.menu.el);
      }
      
      // Track window movement and update menu position
      this.setupWindowMovementTracking(menuItem, itemEl);
    }
    
    this.activeMenu = menuItem.menu;
    itemEl.setAttribute('aria-expanded', 'true');
    
    // Bind global events while menu is open
    this.bindGlobalEvents();
    
    this.emit('menushow', { menuItem, menu: menuItem.menu });
  }

  hideActiveMenu() {
    if (this.activeMenu) {
      this.activeMenu.hide();
      this.activeMenu = null;
      this.unbindGlobalEvents();
      this.stopWindowMovementTracking();
    }
  }
  
  setupWindowMovementTracking(menuItem, itemEl) {
    // Clean up any existing tracking
    this.stopWindowMovementTracking();
    
    const windowElement = this.el.closest('.aionda-window');
    if (!windowElement) return;
    
    // Store references for cleanup
    this.trackedWindow = windowElement;
    this.trackedMenuItem = menuItem;
    this.trackedItemEl = itemEl;
    
    // Use MutationObserver to watch for style changes (position changes)
    this.windowObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          this.updateMenuPosition();
        }
      });
    });
    
    this.windowObserver.observe(windowElement, {
      attributes: true,
      attributeFilter: ['style']
    });
    
    // Also listen for transform changes that might indicate movement
    this.positionCheckInterval = setInterval(() => {
      this.updateMenuPosition();
    }, 100); // Check every 100ms for smooth tracking
  }
  
  stopWindowMovementTracking() {
    if (this.windowObserver) {
      this.windowObserver.disconnect();
      this.windowObserver = null;
    }
    
    if (this.positionCheckInterval) {
      clearInterval(this.positionCheckInterval);
      this.positionCheckInterval = null;
    }
    
    this.trackedWindow = null;
    this.trackedMenuItem = null;
    this.trackedItemEl = null;
  }
  
  updateMenuPosition() {
    if (!this.activeMenu || !this.trackedMenuItem || !this.trackedItemEl) return;
    
    // Get current position of the menu bar item
    const rect = this.trackedItemEl.getBoundingClientRect();
    
    // Update menu position
    if (this.activeMenu.el) {
      this.activeMenu.el.style.top = (rect.bottom + 2) + 'px';
      this.activeMenu.el.style.left = rect.left + 'px';
    }
  }

  enterMenubarMode() {
    this.menubarMode = true;
    this.menuBarEl.classList.add('aionda-menubar-active');
    
    if (this.focusedItemIndex === -1) {
      this.focusFirstItem();
    }
  }

  exitMenubarMode() {
    if (!this.activeMenu) { // Only exit if no menu is open
      this.menubarMode = false;
      this.focusedItemIndex = -1;
      this.menuBarEl.classList.remove('aionda-menubar-active');
      this.hideActiveMenu();
    }
  }

  onMenuBarKeyDown(event) {
    if (!this.menubarMode) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.hideActiveMenu();
        this.exitMenubarMode();
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        this.focusPreviousItem();
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        this.focusNextItem();
        break;
        
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault();
        const currentItem = this.menuItems[this.focusedItemIndex];
        if (currentItem && currentItem.menu) {
          const itemEl = this.menuBarEl.querySelector(`[data-item-index="${this.focusedItemIndex}"]`);
          this.showMenu(currentItem, itemEl);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
        
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
        
      default:
        // Handle mnemonics (Alt+letter)
        if (this.enableMnemonics && event.altKey) {
          const key = event.key.toLowerCase();
          const item = this.items.find(item => 
            item.text && item.text.toLowerCase().startsWith(key)
          );
          if (item) {
            const index = this.items.indexOf(item);
            this.setFocusedItemIndex(index);
            event.preventDefault();
          }
        }
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
      
      // Auto-show menu if one is already open
      if (this.activeMenu) {
        const nextItem = this.menuItems[nextIndex];
        if (nextItem && nextItem.menu) {
          const itemEl = this.menuBarEl.querySelector(`[data-item-index="${nextIndex}"]`);
          this.showMenu(nextItem, itemEl);
        } else {
          this.hideActiveMenu();
        }
      }
    }
  }

  focusPreviousItem() {
    const currentIndex = this.focusedItemIndex;
    const prevIndex = this.getPreviousFocusableIndex(currentIndex);
    if (prevIndex !== -1) {
      this.setFocusedItemIndex(prevIndex);
      
      // Auto-show menu if one is already open
      if (this.activeMenu) {
        const prevItem = this.menuItems[prevIndex];
        if (prevItem && prevItem.menu) {
          const itemEl = this.menuBarEl.querySelector(`[data-item-index="${prevIndex}"]`);
          this.showMenu(prevItem, itemEl);
        } else {
          this.hideActiveMenu();
        }
      }
    }
  }

  getFirstFocusableIndex() {
    return this.menuItems.findIndex(item => !item.disabled);
  }

  getLastFocusableIndex() {
    for (let i = this.menuItems.length - 1; i >= 0; i--) {
      if (!this.menuItems[i].disabled) {
        return i;
      }
    }
    return -1;
  }

  getNextFocusableIndex(currentIndex) {
    for (let i = currentIndex + 1; i < this.menuItems.length; i++) {
      if (!this.menuItems[i].disabled) {
        return i;
      }
    }
    return this.getFirstFocusableIndex();
  }

  getPreviousFocusableIndex(currentIndex) {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!this.menuItems[i].disabled) {
        return i;
      }
    }
    return this.getLastFocusableIndex();
  }

  setFocusedItemIndex(index) {
    if (index >= 0 && index < this.menuItems.length) {
      this.focusedItemIndex = index;
      
      // Update visual focus
      this.menuBarEl.querySelectorAll('.aionda-menubar-item').forEach((el, i) => {
        if (i === index) {
          el.classList.add('bg-gray-300');
          el.focus();
        } else {
          el.classList.remove('bg-gray-300');
        }
      });
    }
  }

  bindGlobalEvents() {
    document.addEventListener('click', this.boundDocumentClick, true);
    document.addEventListener('keydown', this.boundDocumentKeyDown, true);
  }

  unbindGlobalEvents() {
    document.removeEventListener('click', this.boundDocumentClick, true);
    document.removeEventListener('keydown', this.boundDocumentKeyDown, true);
  }

  onDocumentClick(event) {
    // Hide menu if clicking outside menubar and menu
    if (this.activeMenu && 
        !this.menuBarEl.contains(event.target) && 
        !this.activeMenu.el.contains(event.target)) {
      this.hideActiveMenu();
      this.exitMenubarMode();
    }
  }

  onDocumentKeyDown(event) {
    // Handle global Alt key for menubar activation
    if (event.key === 'Alt' && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      this.enterMenubarMode();
      if (this.focusedItemIndex === -1) {
        this.focusFirstItem();
      }
    }
  }

  // Public API methods
  addItem(itemConfig, index) {
    if (index !== undefined && index >= 0 && index < this.items.length) {
      this.items.splice(index, 0, itemConfig);
    } else {
      this.items.push(itemConfig);
    }
    
    this.initializeItems();
    
    if (this.rendered) {
      this.updateMenuBar();
    }
    
    return itemConfig;
  }

  removeItem(item) {
    const index = typeof item === 'number' ? item : this.items.indexOf(item);
    
    if (index >= 0 && index < this.items.length) {
      const removedItem = this.items.splice(index, 1)[0];
      
      // Clean up menu if it exists
      const menuItem = this.menuItems[index];
      if (menuItem && menuItem.menu) {
        menuItem.menu.destroy();
      }
      
      this.initializeItems();
      
      if (this.rendered) {
        this.updateMenuBar();
      }
      
      return removedItem;
    }
    
    return null;
  }

  updateMenuBar() {
    if (this.menuBarEl) {
      this.menuBarEl.innerHTML = this.getItemsHtml();
      this.setupEventListeners();
    }
  }

  setItems(items) {
    // Clean up existing menus
    this.menuItems.forEach(menuItem => {
      if (menuItem.menu) {
        menuItem.menu.destroy();
      }
    });
    
    this.items = items || [];
    this.initializeItems();
    
    if (this.rendered) {
      this.updateMenuBar();
    }
  }

  getItem(index) {
    return this.items[index];
  }

  isMenuOpen() {
    return this.activeMenu !== null;
  }

  destroy() {
    this.hideActiveMenu();
    this.unbindGlobalEvents();
    this.stopWindowMovementTracking();
    
    // Clean up all menus
    this.menuItems.forEach(menuItem => {
      if (menuItem.menu) {
        menuItem.menu.destroy();
      }
    });
    
    this.menuItems = [];
    
    super.destroy();
  }
}