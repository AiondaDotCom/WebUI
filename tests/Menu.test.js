/**
 * Unit tests for Menu component
 * Tests menu creation, item rendering, click handlers, keyboard navigation,
 * submenu functionality, context menu positioning, accessibility features,
 * and integration scenarios
 */

import { Menu } from '../src/components/Menu.js';
import { MenuItem } from '../src/components/MenuItem.js';

describe('Menu', () => {
  let menu;
  let container;

  beforeEach(() => {
    menu = null;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (menu && !menu.destroyed) {
      menu.destroy();
    }
    menu = null;
    document.body.removeChild(container);
    document.body.innerHTML = '';
  });

  describe('Constructor and Configuration', () => {
    test('should create menu with default config', () => {
      menu = new Menu();

      expect(menu.items).toEqual([]);
      expect(menu.autoHide).toBe(true);
      expect(menu.closeOnClick).toBe(true);
      expect(typeof menu.showAt).toBe('function');
      expect(menu.visible).toBe(false);
      expect(menu.currentTarget).toBeNull();
    });

    test('should create menu with custom config', () => {
      const config = {
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' }
        ],
        autoHide: false,
        closeOnClick: false,
        cls: 'custom-menu'
      };

      menu = new Menu(config);

      expect(menu.items).toHaveLength(2);
      expect(menu.autoHide).toBe(false);
      expect(menu.closeOnClick).toBe(false);
      expect(menu.cls).toBe('custom-menu');
    });

    test('should handle null config gracefully', () => {
      menu = new Menu(null);

      expect(menu.items).toEqual([]);
      expect(menu.autoHide).toBe(true);
      expect(menu.closeOnClick).toBe(true);
    });

    test('should handle undefined config gracefully', () => {
      menu = new Menu(undefined);

      expect(menu.items).toEqual([]);
      expect(menu.autoHide).toBe(true);
      expect(menu.closeOnClick).toBe(true);
    });
  });

  describe('Menu Creation and Rendering', () => {
    test('should create template with no items', () => {
      menu = new Menu();
      const template = menu.createTemplate();

      expect(template).toContain('aionda-menu');
      expect(template).toContain('hidden');
    });

    test('should create template with menu items', () => {
      menu = new Menu({
        items: [
          { text: 'File', icon: '📁' },
          { text: 'Edit', icon: '✏️' },
          '-',
          { text: 'View', icon: '👁️' }
        ]
      });

      const template = menu.createTemplate();

      expect(template).toContain('File');
      expect(template).toContain('Edit');
      expect(template).toContain('View');
      expect(template).toContain('📁');
      expect(template).toContain('✏️');
      expect(template).toContain('👁️');
      expect(template).toContain('aionda-menu-separator');
    });

    test('should render menu correctly', () => {
      menu = new Menu({
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' }
        ]
      });

      menu.render();

      expect(menu.rendered).toBe(true);
      expect(menu.el).toBeTruthy();
      expect(menu.el.classList.contains('aionda-menu')).toBe(true);
    });

    test('should handle separator items', () => {
      menu = new Menu({
        items: [
          { text: 'Item 1' },
          '-',
          { type: 'separator' },
          { text: 'Item 2' }
        ]
      });

      const template = menu.createTemplate();
      const separatorCount = (template.match(/aionda-menu-separator/g) || []).length;

      expect(separatorCount).toBe(2);
    });

    test('should create menu items with proper attributes', () => {
      menu = new Menu({
        items: [
          { 
            text: 'Copy', 
            icon: '📋', 
            shortcut: 'Ctrl+C',
            id: 'copy-item',
            tooltip: 'Copy selected text'
          }
        ]
      });

      const template = menu.createTemplate();

      expect(template).toContain('Copy');
      expect(template).toContain('📋');
      expect(template).toContain('Ctrl+C');
      expect(template).toContain('copy-item');
      expect(template).toContain('Copy selected text');
    });
  });

  describe('Menu Display and Positioning', () => {
    test('should show menu at specific position', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      menu.showAt(100, 200);

      expect(menu.visible).toBe(true);
      expect(menu.el.classList.contains('hidden')).toBe(false);
      expect(menu.el.style.left).toBe('100px');
      expect(menu.el.style.top).toBe('200px');
    });

    test('should show menu at event position', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 150,
        clientY: 250,
        target: container
      };

      menu.renderTo(container);
      menu.showAtEvent(mockEvent, container);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(menu.visible).toBe(true);
      expect(menu.currentTarget).toBe(container);
    });

    test('should hide menu', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      menu.showAt(100, 200);
      menu.hide();

      expect(menu.visible).toBe(false);
      expect(menu.currentTarget).toBeNull();
      expect(menu.el.classList.contains('hidden')).toBe(true);
    });

    test('should adjust position when menu goes off screen', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      
      const originalViewportWidth = window.innerWidth;
      const originalViewportHeight = window.innerHeight;
      
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });

      menu.showAt(750, 550);
      menu.adjustPosition();

      expect(parseInt(menu.el.style.left)).toBeLessThan(750);
      expect(parseInt(menu.el.style.top)).toBeLessThan(550);

      Object.defineProperty(window, 'innerWidth', { value: originalViewportWidth, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: originalViewportHeight, writable: true });
    });
  });

  describe('Menu Item Interaction', () => {
    test('should handle menu item clicks', () => {
      const mockHandler = jest.fn();
      menu = new Menu({
        items: [
          { text: 'Item 1', handler: mockHandler },
          { text: 'Item 2' }
        ]
      });

      menu.renderTo(container);
      menu.show();

      const itemEl = menu.el.querySelector('[data-item-index="0"]');
      itemEl.click();

      expect(mockHandler).toHaveBeenCalled();
    });

    test('should emit itemclick event', () => {
      const clickHandler = jest.fn();
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.on('itemclick', clickHandler);
      menu.renderTo(container);
      menu.show();

      const itemEl = menu.el.querySelector('[data-item-index="0"]');
      itemEl.click();

      expect(clickHandler).toHaveBeenCalled();
    });

    test('should not handle clicks on disabled items', () => {
      const mockHandler = jest.fn();
      menu = new Menu({
        items: [
          { text: 'Disabled Item', disabled: true, handler: mockHandler }
        ]
      });

      menu.renderTo(container);
      menu.show();

      const itemEl = menu.el.querySelector('.aionda-menu-item-disabled');
      itemEl.click();

      expect(mockHandler).not.toHaveBeenCalled();
    });

    test('should close menu on item click when closeOnClick is true', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        closeOnClick: true
      });

      menu.renderTo(container);
      menu.showAt(100, 100);

      const itemEl = menu.el.querySelector('[data-item-index="0"]');
      itemEl.click();

      expect(menu.visible).toBe(false);
    });

    test('should not close menu on item click when closeOnClick is false', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        closeOnClick: false
      });

      menu.renderTo(container);
      menu.showAt(100, 100);

      const itemEl = menu.el.querySelector('[data-item-index="0"]');
      itemEl.click();

      expect(menu.visible).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    test('should hide menu on Escape key', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      menu.showAt(100, 100);

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expect(menu.visible).toBe(false);
    });

    test('should handle keyboard navigation between items', () => {
      menu = new Menu({
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' },
          { text: 'Item 3' }
        ]
      });

      menu.renderTo(container);
      menu.show();

      const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });

      menu.el.dispatchEvent(arrowDownEvent);
      menu.el.dispatchEvent(arrowUpEvent);

      expect(menu.el.contains(document.activeElement)).toBe(true);
    });
  });

  describe('Auto-hide Functionality', () => {
    test('should hide menu on outside click when autoHide is true', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        autoHide: true
      });

      menu.renderTo(container);
      menu.showAt(100, 100);

      document.body.click();

      expect(menu.visible).toBe(false);
    });

    test('should not hide menu on outside click when autoHide is false', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        autoHide: false
      });

      menu.renderTo(container);
      menu.showAt(100, 100);

      document.body.click();

      expect(menu.visible).toBe(true);
    });

    test('should hide menu on outside contextmenu when autoHide is true', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        autoHide: true
      });

      menu.renderTo(container);
      menu.showAt(100, 100);

      const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true });
      document.body.dispatchEvent(contextMenuEvent);

      expect(menu.visible).toBe(false);
    });
  });

  describe('Menu Item Management', () => {
    test('should add new item to menu', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      const newItem = { text: 'New Item' };
      menu.addItem(newItem);

      expect(menu.items).toHaveLength(2);
      expect(menu.items[1]).toEqual(newItem);
    });

    test('should remove item from menu', () => {
      menu = new Menu({
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' },
          { text: 'Item 3' }
        ]
      });

      menu.removeItem(1);

      expect(menu.items).toHaveLength(2);
      expect(menu.items[0].text).toBe('Item 1');
      expect(menu.items[1].text).toBe('Item 3');
    });

    test('should set new items array', () => {
      menu = new Menu({
        items: [{ text: 'Old Item' }]
      });

      const newItems = [
        { text: 'New Item 1' },
        { text: 'New Item 2' }
      ];

      menu.setItems(newItems);

      expect(menu.items).toEqual(newItems);
    });

    test('should get item by index', () => {
      const items = [
        { text: 'Item 1' },
        { text: 'Item 2' }
      ];

      menu = new Menu({ items });

      expect(menu.getItem(0)).toEqual(items[0]);
      expect(menu.getItem(1)).toEqual(items[1]);
      expect(menu.getItem(2)).toBeUndefined();
    });

    test('should refresh menu after item changes', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);

      const originalHTML = menu.el.innerHTML;
      menu.addItem({ text: 'New Item' });

      expect(menu.el.innerHTML).not.toBe(originalHTML);
    });
  });

  describe('Event Handling', () => {
    test('should emit show event when menu is shown', () => {
      const showHandler = jest.fn();
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.on('show', showHandler);
      menu.renderTo(container);
      menu.showAt(100, 100);

      expect(showHandler).toHaveBeenCalledWith({
        target: null,
        x: 100,
        y: 100
      });
    });

    test('should emit hide event when menu is hidden', () => {
      const hideHandler = jest.fn();
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.on('hide', hideHandler);
      menu.renderTo(container);
      menu.showAt(100, 100);
      menu.hide();

      expect(hideHandler).toHaveBeenCalled();
    });
  });

  describe('Accessibility Features', () => {
    test('should have proper ARIA attributes', () => {
      menu = new Menu({
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' }
        ]
      });

      menu.renderTo(container);

      expect(menu.el.getAttribute('role')).toBe('menu');
      
      const menuItems = menu.el.querySelectorAll('.aionda-menu-item');
      menuItems.forEach(item => {
        expect(item.getAttribute('role')).toBe('menuitem');
      });
    });

    test('should handle focus management', () => {
      menu = new Menu({
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' }
        ]
      });

      menu.renderTo(container);
      menu.show();

      const firstItem = menu.el.querySelector('.aionda-menu-item');
      firstItem.focus();

      expect(document.activeElement).toBe(firstItem);
    });

    test('should support disabled state for accessibility', () => {
      menu = new Menu({
        items: [
          { text: 'Enabled Item' },
          { text: 'Disabled Item', disabled: true }
        ]
      });

      menu.renderTo(container);

      const disabledItem = menu.el.querySelector('.aionda-menu-item-disabled');
      
      expect(disabledItem.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('Integration and Edge Cases', () => {
    test('should handle empty items array', () => {
      menu = new Menu({ items: [] });

      menu.renderTo(container);

      expect(menu.el.classList.contains('aionda-menu')).toBe(true);
    });

    test('should handle null items array', () => {
      menu = new Menu({ items: null });

      expect(menu.items).toEqual([]);
    });

    test('should track visibility state correctly', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      expect(menu.isVisible()).toBe(false);

      menu.renderTo(container);
      menu.showAt(100, 100);

      expect(menu.isVisible()).toBe(true);

      menu.hide();

      expect(menu.isVisible()).toBe(false);
    });

    test('should handle multiple show/hide cycles', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);

      for (let i = 0; i < 5; i++) {
        menu.showAt(100, 100);
        expect(menu.isVisible()).toBe(true);
        
        menu.hide();
        expect(menu.isVisible()).toBe(false);
      }
    });

    test('should clean up event listeners on destroy', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      menu.showAt(100, 100);

      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      menu.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(menu.destroyed).toBe(true);

      removeEventListenerSpy.mockRestore();
    });

    test('should handle context menu positioning near viewport edges', () => {
      menu = new Menu({
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' },
          { text: 'Item 3' }
        ]
      });

      menu.renderTo(container);

      Object.defineProperty(window, 'innerWidth', { value: 200, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 200, writable: true });

      menu.showAt(190, 190);
      menu.adjustPosition();

      const rect = menu.el.getBoundingClientRect();
      
      expect(rect.right).toBeLessThanOrEqual(200);
      expect(rect.bottom).toBeLessThanOrEqual(200);
    });
  });

  describe('Trigger Event Handling', () => {
    test('should bind to click trigger', () => {
      const triggerEl = document.createElement('button');
      document.body.appendChild(triggerEl);
      
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        trigger: triggerEl,
        showOn: 'click'
      });

      expect(menu.trigger).toBe(triggerEl);
      expect(menu.showOn).toBe('click');
      
      document.body.removeChild(triggerEl);
    });

    test('should bind to hover trigger', () => {
      const triggerEl = document.createElement('button');
      document.body.appendChild(triggerEl);
      
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        trigger: triggerEl,
        showOn: 'hover'
      });

      expect(menu.showOn).toBe('hover');
      
      document.body.removeChild(triggerEl);
    });

    test('should bind to context menu trigger', () => {
      const triggerEl = document.createElement('div');
      document.body.appendChild(triggerEl);
      
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        trigger: triggerEl,
        contextMenu: true
      });

      expect(menu.contextMenu).toBe(true);
      
      document.body.removeChild(triggerEl);
    });

    test('should handle trigger element by selector string', () => {
      const triggerEl = document.createElement('button');
      triggerEl.id = 'test-trigger';
      document.body.appendChild(triggerEl);
      
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        trigger: '#test-trigger'
      });

      expect(menu.trigger).toBe('#test-trigger');
      
      document.body.removeChild(triggerEl);
    });
  });

  describe('Position Calculation', () => {
    test('should calculate position with getBoundingClientRect', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      
      const mockRect = {
        left: 100,
        top: 50,
        right: 200,
        bottom: 100,
        width: 100,
        height: 50
      };
      
      const mockElement = {
        getBoundingClientRect: () => mockRect
      };

      menu.positionMenu(mockElement);
      
      expect(menu.el.style.left).toBe('100px');
      expect(menu.el.style.top).toBe('100px');
    });

    test('should handle position calculation with offset', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        offset: { x: 10, y: 5 }
      });

      menu.renderTo(container);
      menu.positionMenu({ x: 100, y: 50 });
      
      expect(menu.el.style.left).toBe('110px');
      expect(menu.el.style.top).toBe('55px');
    });

    test('should handle right alignment', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        align: 'right'
      });

      menu.renderTo(container);
      
      const mockRect = {
        left: 100,
        right: 200,
        top: 50,
        bottom: 100
      };
      
      const mockElement = {
        getBoundingClientRect: () => mockRect
      };

      menu.positionMenu(mockElement);
      
      expect(menu.el.style.left).toBe('200px');
    });
  });

  describe('Submenu Functionality', () => {
    test('should show submenu for items with submenu property', () => {
      menu = new Menu({
        items: [
          { 
            text: 'Item with submenu',
            submenu: [
              { text: 'Submenu Item 1' },
              { text: 'Submenu Item 2' }
            ]
          }
        ]
      });

      menu.renderTo(container);
      
      const parentItem = { 
        submenu: [{ text: 'Sub1' }, { text: 'Sub2' }],
        el: menu.el.querySelector('.aionda-menu-item')
      };

      menu.showSubmenu(parentItem);
      
      expect(menu.activeSubmenu).toBeDefined();
    });

    test('should hide active submenu', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      
      // Mock an active submenu
      const mockSubmenu = {
        hide: jest.fn()
      };
      menu.activeSubmenu = mockSubmenu;

      menu.hideActiveSubmenu();
      
      expect(mockSubmenu.hide).toHaveBeenCalled();
      expect(menu.activeSubmenu).toBeNull();
    });

    test('should toggle submenu visibility', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      
      const parentItem = { 
        submenu: [{ text: 'Sub1' }],
        el: menu.el.querySelector('.aionda-menu-item')
      };

      // Test show
      menu.toggleSubmenu(parentItem);
      expect(menu.activeSubmenu).toBeDefined();

      // Test hide
      menu.toggleSubmenu(parentItem);
      expect(menu.activeSubmenu).toBeNull();
    });

    test('should set ARIA expanded attributes for submenus', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      
      const itemEl = menu.el.querySelector('.aionda-menu-item');
      const parentItem = { 
        submenu: [{ text: 'Sub1' }],
        el: itemEl
      };

      menu.showSubmenu(parentItem);
      
      expect(itemEl.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Focus Management Edge Cases', () => {
    test('should handle focus when no focusable items exist', () => {
      menu = new Menu({
        items: [
          { text: 'Disabled Item', disabled: true },
          '-',
          { text: 'Another Disabled', disabled: true }
        ]
      });

      menu.renderTo(container);
      menu.show();
      
      expect(menu.getFirstFocusableIndex()).toBe(-1);
      expect(menu.getLastFocusableIndex()).toBe(-1);
    });

    test('should handle keyboard navigation with mixed item types', () => {
      menu = new Menu({
        items: [
          { text: 'Item 1' },
          '-',
          { text: 'Disabled', disabled: true },
          { text: 'Item 2' },
          { type: 'separator' },
          { text: 'Item 3' }
        ]
      });

      menu.renderTo(container);
      menu.show();
      
      // First focusable should be index 0
      expect(menu.getFirstFocusableIndex()).toBe(0);
      
      // Next after 0 should skip separator and disabled item
      expect(menu.getNextFocusableIndex(0)).toBe(3);
      
      // Last focusable should be index 5
      expect(menu.getLastFocusableIndex()).toBe(5);
    });

    test('should cycle focus navigation correctly', () => {
      menu = new Menu({
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' },
          { text: 'Item 3' }
        ]
      });

      menu.renderTo(container);
      menu.show();
      
      // Test wrap-around from last to first
      expect(menu.getNextFocusableIndex(2)).toBe(0);
      
      // Test wrap-around from first to last
      expect(menu.getPreviousFocusableIndex(0)).toBe(2);
    });

    test('should update active descendant for accessibility', () => {
      menu = new Menu({
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' }
        ]
      });

      menu.renderTo(container);
      menu.show();
      
      // Mock focus method
      menu.menuItems[1].focus = jest.fn();
      
      menu.setFocusedItemIndex(1);
      
      expect(menu.focusedItemIndex).toBe(1);
      expect(menu.menuItems[1].focus).toHaveBeenCalled();
    });
  });

  describe('Timer and Delayed Actions', () => {
    test('should schedule hide with delay', (done) => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      menu.show();
      
      menu.scheduleHide();
      
      expect(menu.hideTimer).toBeDefined();
      
      setTimeout(() => {
        expect(menu.isVisible()).toBe(false);
        done();
      }, 350);
    });

    test('should cancel scheduled hide', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }]
      });

      menu.renderTo(container);
      menu.show();
      
      menu.scheduleHide();
      expect(menu.hideTimer).toBeDefined();
      
      menu.cancelHide();
      expect(menu.hideTimer).toBeNull();
    });

    test('should handle submenu delay timer', () => {
      menu = new Menu({
        items: [{ text: 'Item 1' }],
        submenuDelay: 200
      });

      expect(menu.submenuDelay).toBe(200);
      expect(menu.submenuTimer).toBeNull();
    });
  });
});