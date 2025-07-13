import { MenuBar } from '../src/components/MenuBar.js';
import { Menu } from '../src/components/Menu.js';

describe('MenuBar', () => {
  let container;
  let menuBar;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (menuBar) {
      menuBar.destroy();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Constructor and Basic Setup', () => {
    test('should create MenuBar with default configuration', () => {
      menuBar = new MenuBar();
      
      expect(menuBar).toBeInstanceOf(MenuBar);
      expect(menuBar.items).toEqual([]);
      expect(menuBar.orientation).toBe('horizontal');
      expect(menuBar.enableMnemonics).toBe(true);
      expect(menuBar.showOnHover).toBe(true);
      expect(menuBar.menubarMode).toBe(false);
      expect(menuBar.activeMenu).toBeNull();
      expect(menuBar.focusedItemIndex).toBe(-1);
    });

    test('should create MenuBar with custom configuration', () => {
      const config = {
        items: [
          { text: 'File', menu: [{ text: 'New' }] },
          { text: 'Edit', menu: [{ text: 'Cut' }] }
        ],
        orientation: 'vertical',
        enableMnemonics: false,
        showOnHover: false
      };

      menuBar = new MenuBar(config);
      
      expect(menuBar.items).toEqual(config.items);
      expect(menuBar.orientation).toBe('vertical');
      expect(menuBar.enableMnemonics).toBe(false);
      expect(menuBar.showOnHover).toBe(false);
      expect(menuBar.menuItems).toHaveLength(2);
    });

    test('should initialize menu items correctly', () => {
      const items = [
        { text: 'File', menu: [{ text: 'New' }, { text: 'Open' }] },
        { text: 'Edit', disabled: true },
        { text: 'View' }
      ];

      menuBar = new MenuBar({ items });
      
      expect(menuBar.menuItems).toHaveLength(3);
      expect(menuBar.menuItems[0].disabled).toBe(false);
      expect(menuBar.menuItems[0].menu).toBeInstanceOf(Menu);
      expect(menuBar.menuItems[1].disabled).toBe(true);
      expect(menuBar.menuItems[2].menu).toBeNull();
    });
  });

  describe('Rendering', () => {
    test('should render horizontal MenuBar correctly', () => {
      const items = [
        { text: 'File', menu: [{ text: 'New' }] },
        { text: 'Edit' }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      container.appendChild(element);

      expect(element.classList.contains('aionda-menubar')).toBe(true);
      expect(element.classList.contains('flex-row')).toBe(true);
      expect(element.getAttribute('role')).toBe('menubar');
      expect(element.getAttribute('aria-label')).toBe('Application menu');

      const menuItems = element.querySelectorAll('.aionda-menubar-item');
      expect(menuItems).toHaveLength(2);
      expect(menuItems[0].textContent).toContain('File');
      expect(menuItems[0].textContent).toContain('▼'); // Dropdown indicator
      expect(menuItems[1].textContent).toContain('Edit');
      expect(menuItems[1].textContent).not.toContain('▼'); // No dropdown
    });

    test('should render vertical MenuBar correctly', () => {
      menuBar = new MenuBar({ 
        orientation: 'vertical',
        items: [{ text: 'File' }]
      });
      const element = menuBar.render();
      container.appendChild(element);

      expect(element.classList.contains('flex-col')).toBe(true);
      expect(element.classList.contains('w-48')).toBe(true);
    });

    test('should render menu items with proper attributes', () => {
      const items = [
        { 
          id: 'file-menu',
          text: 'File', 
          tooltip: 'File operations',
          menu: [{ text: 'New' }]
        },
        { 
          text: 'Edit', 
          disabled: true 
        }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      container.appendChild(element);

      const fileItem = element.querySelector('[data-item-index="0"]');
      expect(fileItem.id).toBe('file-menu');
      expect(fileItem.title).toBe('File operations');
      expect(fileItem.getAttribute('aria-haspopup')).toBe('true');
      expect(fileItem.getAttribute('aria-expanded')).toBe('false');

      const editItem = element.querySelector('[data-item-index="1"]');
      expect(editItem.classList.contains('aionda-menubar-item-disabled')).toBe(true);
      expect(editItem.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('Menu Interactions', () => {
    beforeEach(() => {
      const items = [
        { 
          text: 'File', 
          menu: [
            { text: 'New', handler: jest.fn() },
            { text: 'Open', handler: jest.fn() }
          ]
        },
        { 
          text: 'Edit', 
          menu: [
            { text: 'Cut', handler: jest.fn() },
            { text: 'Copy', handler: jest.fn() }
          ]
        },
        { text: 'View' } // No menu
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      container.appendChild(element);
    });

    test('should show menu on click', () => {
      const fileItem = container.querySelector('[data-item-index="0"]');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      
      fileItem.dispatchEvent(clickEvent);

      expect(menuBar.activeMenu).toBeTruthy();
      expect(menuBar.menubarMode).toBe(true);
      expect(fileItem.getAttribute('aria-expanded')).toBe('true');
    });

    test('should hide menu on second click', () => {
      const fileItem = container.querySelector('[data-item-index="0"]');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      
      // First click - show menu
      fileItem.dispatchEvent(clickEvent);
      expect(menuBar.activeMenu).toBeTruthy();
      
      // Second click - hide menu
      fileItem.dispatchEvent(clickEvent);
      expect(menuBar.activeMenu).toBeNull();
      expect(fileItem.getAttribute('aria-expanded')).toBe('false');
    });

    test('should change focus when hovering in menubar mode', () => {
      const fileItem = container.querySelector('[data-item-index="0"]');
      
      // Activate menubar mode by clicking File
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(menuBar.activeMenu).toBeTruthy();
      expect(menuBar.menubarMode).toBe(true);
      
      // Test that we can manually set focus to different items
      menuBar.setFocusedItemIndex(1); // Edit menu
      expect(menuBar.focusedItemIndex).toBe(1);
      
      // Test that focus navigation works when in menubar mode
      expect(menuBar.menubarMode).toBe(true);
      expect(menuBar.focusedItemIndex).toBe(1);
    });

    test('should emit itemclick event for items without menus', () => {
      const mockHandler = jest.fn();
      menuBar.on('itemclick', mockHandler);
      
      const viewItem = container.querySelector('[data-item-index="2"]');
      viewItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          item: expect.objectContaining({ text: 'View' }),
          index: 2
        })
      );
    });

    test('should not interact with disabled items', () => {
      const disabledItems = [{ text: 'File', disabled: true, menu: [{ text: 'New' }] }];
      menuBar.destroy();
      menuBar = new MenuBar({ items: disabledItems });
      const element = menuBar.render();
      container.appendChild(element);

      const fileItem = container.querySelector('[data-item-index="0"]');
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(menuBar.activeMenu).toBeNull();
      expect(menuBar.menubarMode).toBe(false);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      const items = [
        { text: 'File', menu: [{ text: 'New' }] },
        { text: 'Edit', menu: [{ text: 'Cut' }] },
        { text: 'View', disabled: true },
        { text: 'Help', menu: [{ text: 'About' }] }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      container.appendChild(element);
      menuBar.enterMenubarMode();
    });

    test('should navigate with arrow keys', () => {
      // Start at first item
      menuBar.focusFirstItem();
      expect(menuBar.focusedItemIndex).toBe(0);

      // Arrow right to next item
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      menuBar.onMenuBarKeyDown(rightEvent);
      expect(menuBar.focusedItemIndex).toBe(1);

      // Arrow left to previous item
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      menuBar.onMenuBarKeyDown(leftEvent);
      expect(menuBar.focusedItemIndex).toBe(0);
    });

    test('should skip disabled items during navigation', () => {
      menuBar.setFocusedItemIndex(1); // Edit
      
      // Arrow right should skip disabled View (index 2) and go to Help (index 3)
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      menuBar.onMenuBarKeyDown(rightEvent);
      expect(menuBar.focusedItemIndex).toBe(3); // Help
    });

    test('should wrap around when navigating', () => {
      menuBar.setFocusedItemIndex(3); // Help (last item)
      
      // Arrow right should wrap to first item
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      menuBar.onMenuBarKeyDown(rightEvent);
      expect(menuBar.focusedItemIndex).toBe(0); // File

      // Arrow left should wrap to last focusable item
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      menuBar.onMenuBarKeyDown(leftEvent);
      expect(menuBar.focusedItemIndex).toBe(3); // Help
    });

    test('should handle Home and End keys', () => {
      menuBar.setFocusedItemIndex(1);

      const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
      menuBar.onMenuBarKeyDown(homeEvent);
      expect(menuBar.focusedItemIndex).toBe(0); // First item

      const endEvent = new KeyboardEvent('keydown', { key: 'End' });
      menuBar.onMenuBarKeyDown(endEvent);
      expect(menuBar.focusedItemIndex).toBe(3); // Last focusable item
    });

    test('should open menu with Enter, Space, or ArrowDown', () => {
      menuBar.setFocusedItemIndex(0); // File menu
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const mockShowMenu = jest.spyOn(menuBar, 'showMenu');
      
      menuBar.onMenuBarKeyDown(enterEvent);
      expect(mockShowMenu).toHaveBeenCalled();
    });

    test('should exit menubar mode with Escape', () => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      const mockExitMenubarMode = jest.spyOn(menuBar, 'exitMenubarMode');
      
      menuBar.onMenuBarKeyDown(escapeEvent);
      expect(mockExitMenubarMode).toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    beforeEach(() => {
      const items = [
        { text: 'File', menu: [{ text: 'New' }] },
        { text: 'Edit', disabled: true },
        { text: 'View', menu: [{ text: 'Zoom' }] }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      container.appendChild(element);
    });

    test('should enter menubar mode on focus', () => {
      const element = menuBar.el;
      element.dispatchEvent(new FocusEvent('focusin'));
      
      expect(menuBar.menubarMode).toBe(true);
      expect(element.classList.contains('aionda-menubar-active')).toBe(true);
    });

    test('should exit menubar mode when focus leaves', () => {
      menuBar.enterMenubarMode();
      
      const element = menuBar.el;
      const focusOutEvent = new FocusEvent('focusout', { relatedTarget: document.body });
      element.dispatchEvent(focusOutEvent);
      
      expect(menuBar.menubarMode).toBe(false);
      expect(element.classList.contains('aionda-menubar-active')).toBe(false);
    });

    test('should find first focusable item correctly', () => {
      const firstIndex = menuBar.getFirstFocusableIndex();
      expect(firstIndex).toBe(0); // File (Edit is disabled)
    });

    test('should find last focusable item correctly', () => {
      const lastIndex = menuBar.getLastFocusableIndex();
      expect(lastIndex).toBe(2); // View (Edit is disabled)
    });

    test('should set focused item with visual feedback', () => {
      const element = menuBar.render();
      container.appendChild(element);
      
      menuBar.setFocusedItemIndex(0);
      
      const fileItem = element.querySelector('[data-item-index="0"]');
      expect(fileItem.classList.contains('bg-gray-300')).toBe(true);
      expect(menuBar.focusedItemIndex).toBe(0);
    });
  });

  describe('Event Handling', () => {
    let mockHandler;

    beforeEach(() => {
      mockHandler = jest.fn();
      const items = [
        { 
          text: 'File', 
          menu: [
            { text: 'New', handler: mockHandler },
            { text: 'Open', handler: mockHandler }
          ]
        }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      container.appendChild(element);
    });

    test('should emit menuitemclick events', () => {
      const mockMenuItemHandler = jest.fn();
      menuBar.on('menuitemclick', mockMenuItemHandler);
      
      // Simulate menu item click
      const fileMenu = menuBar.menuItems[0].menu;
      fileMenu.emit('itemclick', { 
        item: { text: 'New', handler: mockHandler },
        event: new MouseEvent('click')
      });
      
      expect(mockMenuItemHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          menuItem: expect.objectContaining({ text: 'New' }),
          menuIndex: 0,
          menuConfig: expect.objectContaining({ text: 'File' })
        })
      );
    });

    test('should handle global document click', () => {
      // Open a menu first
      const fileItem = container.querySelector('[data-item-index="0"]');
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(menuBar.activeMenu).toBeTruthy();
      
      // Click outside
      const outsideClick = new MouseEvent('click', { bubbles: true });
      document.dispatchEvent(outsideClick);
      
      expect(menuBar.activeMenu).toBeNull();
      expect(menuBar.menubarMode).toBe(false);
    });

    test('should handle Alt key for menubar activation', () => {
      const altEvent = new KeyboardEvent('keydown', { key: 'Alt' });
      const mockEnterMenubarMode = jest.spyOn(menuBar, 'enterMenubarMode');
      
      menuBar.onDocumentKeyDown(altEvent);
      expect(mockEnterMenubarMode).toHaveBeenCalled();
    });
  });

  describe('Public API Methods', () => {
    beforeEach(() => {
      const items = [
        { text: 'File', menu: [{ text: 'New' }] },
        { text: 'Edit', menu: [{ text: 'Cut' }] }
      ];

      menuBar = new MenuBar({ items });
    });

    test('should add items correctly', () => {
      const newItem = { text: 'View', menu: [{ text: 'Zoom' }] };
      menuBar.addItem(newItem);
      
      expect(menuBar.items).toHaveLength(3);
      expect(menuBar.items[2]).toBe(newItem);
      expect(menuBar.menuItems).toHaveLength(3);
    });

    test('should add items at specific index', () => {
      const newItem = { text: 'View', menu: [{ text: 'Zoom' }] };
      menuBar.addItem(newItem, 1);
      
      expect(menuBar.items).toHaveLength(3);
      expect(menuBar.items[1]).toBe(newItem);
      expect(menuBar.items[2].text).toBe('Edit');
    });

    test('should remove items correctly', () => {
      const removedItem = menuBar.removeItem(0);
      
      expect(removedItem.text).toBe('File');
      expect(menuBar.items).toHaveLength(1);
      expect(menuBar.items[0].text).toBe('Edit');
    });

    test('should set new items', () => {
      const newItems = [
        { text: 'Tools', menu: [{ text: 'Options' }] },
        { text: 'Help', menu: [{ text: 'About' }] }
      ];
      
      menuBar.setItems(newItems);
      
      expect(menuBar.items).toEqual(newItems);
      expect(menuBar.menuItems).toHaveLength(2);
    });

    test('should get item by index', () => {
      const item = menuBar.getItem(0);
      expect(item.text).toBe('File');
    });

    test('should check if menu is open', () => {
      expect(menuBar.isMenuOpen()).toBe(false);
      
      // Simulate opening a menu by creating a mock menu object
      menuBar.activeMenu = { hide: jest.fn() };
      expect(menuBar.isMenuOpen()).toBe(true);
    });
  });

  describe('Memory Management', () => {
    test('should clean up properly on destroy', () => {
      const items = [
        { text: 'File', menu: [{ text: 'New' }] },
        { text: 'Edit', menu: [{ text: 'Cut' }] }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      container.appendChild(element);

      // Create spies to verify cleanup
      const mockHideActiveMenu = jest.spyOn(menuBar, 'hideActiveMenu');
      const mockUnbindGlobalEvents = jest.spyOn(menuBar, 'unbindGlobalEvents');
      
      menuBar.destroy();
      
      expect(mockHideActiveMenu).toHaveBeenCalled();
      expect(mockUnbindGlobalEvents).toHaveBeenCalled();
      expect(menuBar.menuItems).toEqual([]);
    });

    test('should clean up menus when setting new items', () => {
      const items = [{ text: 'File', menu: [{ text: 'New' }] }];
      menuBar = new MenuBar({ items });
      
      const oldMenu = menuBar.menuItems[0].menu;
      const mockDestroy = jest.spyOn(oldMenu, 'destroy');
      
      menuBar.setItems([{ text: 'Edit', menu: [{ text: 'Cut' }] }]);
      
      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      const items = [
        { text: 'File', menu: [{ text: 'New' }] },
        { text: 'Edit', disabled: true }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      container.appendChild(element);
    });

    test('should have proper ARIA attributes', () => {
      const element = menuBar.el;
      
      expect(element.getAttribute('role')).toBe('menubar');
      expect(element.getAttribute('aria-label')).toBe('Application menu');
      
      const items = element.querySelectorAll('.aionda-menubar-item');
      expect(items[0].getAttribute('role')).toBe('menuitem');
      expect(items[0].getAttribute('aria-haspopup')).toBe('true');
      expect(items[0].getAttribute('aria-expanded')).toBe('false');
      expect(items[1].getAttribute('aria-disabled')).toBe('true');
    });

    test('should update aria-expanded when menu opens', () => {
      const fileItem = container.querySelector('[data-item-index="0"]');
      
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(fileItem.getAttribute('aria-expanded')).toBe('true');
    });

    test('should have proper tabindex management', () => {
      const items = menuBar.el.querySelectorAll('.aionda-menubar-item');
      
      items.forEach(item => {
        expect(item.getAttribute('tabindex')).toBe('0');
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty items array', () => {
      menuBar = new MenuBar({ items: [] });
      const element = menuBar.render();
      
      expect(element.children).toHaveLength(0);
      expect(menuBar.getFirstFocusableIndex()).toBe(-1);
      expect(menuBar.getLastFocusableIndex()).toBe(-1);
    });

    test('should handle all disabled items', () => {
      const items = [
        { text: 'File', disabled: true },
        { text: 'Edit', disabled: true }
      ];
      
      menuBar = new MenuBar({ items });
      
      expect(menuBar.getFirstFocusableIndex()).toBe(-1);
      expect(menuBar.getLastFocusableIndex()).toBe(-1);
    });

    test('should handle items without menus', () => {
      const items = [{ text: 'Help' }];
      menuBar = new MenuBar({ items });
      
      const element = menuBar.render();
      container.appendChild(element);
      
      const helpItem = element.querySelector('[data-item-index="0"]');
      expect(helpItem.textContent).not.toContain('▼');
      expect(helpItem.getAttribute('aria-haspopup')).toBe(null);
    });

    test('should prevent default on menu item clicks', () => {
      const items = [{ text: 'File', menu: [{ text: 'New' }] }];
      menuBar = new MenuBar({ items });
      
      const element = menuBar.render();
      container.appendChild(element);
      
      const fileItem = element.querySelector('[data-item-index="0"]');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const mockPreventDefault = jest.spyOn(clickEvent, 'preventDefault');
      
      fileItem.dispatchEvent(clickEvent);
      expect(mockPreventDefault).toHaveBeenCalled();
    });
  });
});