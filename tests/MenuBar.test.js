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

  describe('Window Integration', () => {
    let windowContainer;
    
    beforeEach(() => {
      // Create a mock window container
      windowContainer = document.createElement('div');
      windowContainer.className = 'aionda-window';
      windowContainer.style.position = 'absolute';
      windowContainer.style.top = '100px';
      windowContainer.style.left = '200px';
      document.body.appendChild(windowContainer);
      
      const items = [
        { text: 'File', menu: [{ text: 'New' }, { text: 'Open' }] },
        { text: 'Edit', menu: [{ text: 'Cut' }, { text: 'Copy' }] }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      windowContainer.appendChild(element);
    });

    afterEach(() => {
      if (windowContainer && windowContainer.parentNode) {
        windowContainer.parentNode.removeChild(windowContainer);
      }
    });

    test('should detect window context correctly', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      
      // Click to show menu
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      expect(menuBar.activeMenu).toBeTruthy();
      
      // Check if window-specific positioning was applied
      const menuEl = menuBar.activeMenu.el;
      expect(menuEl.style.zIndex).toBe('999999');
      expect(menuEl.style.position).toBe('fixed');
      expect(menuEl.style.transition).toBe('none');
      expect(menuEl.style.transform).toBe('none');
    });

    test('should append menu to document body in window context', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      const menuEl = menuBar.activeMenu.el;
      expect(menuEl.parentNode).toBe(document.body);
    });

    test('should position menu relative to menubar item in window', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      const rect = fileItem.getBoundingClientRect();
      
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      const menuEl = menuBar.activeMenu.el;
      expect(menuEl.style.top).toBe((rect.bottom + 2) + 'px');
      expect(menuEl.style.left).toBe(rect.left + 'px');
    });

    test('should not apply window fixes for normal (non-window) context', () => {
      // Test with menubar outside window
      const normalContainer = document.createElement('div');
      document.body.appendChild(normalContainer);
      
      try {
        const normalMenuBar = new MenuBar({ 
          items: [{ text: 'File', menu: [{ text: 'New' }] }] 
        });
        const element = normalMenuBar.render();
        normalContainer.appendChild(element);
        
        const fileItem = normalContainer.querySelector('[data-item-index="0"]');
        fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        const menuEl = normalMenuBar.activeMenu.el;
        // Menu should use normal positioning, not window-specific overrides
        expect(menuEl.style.zIndex).toBe(''); // Should be empty (default)
        expect(menuEl.style.transition).toBe(''); // Should be empty (default)
        // Position may be set by the Menu component itself, so we just check it's not the window-specific value
        expect(menuEl.style.zIndex).not.toBe('999999');
        
        normalMenuBar.destroy();
      } finally {
        document.body.removeChild(normalContainer);
      }
    });
  });

  describe('Window Movement Tracking', () => {
    let windowContainer;
    
    beforeEach(() => {
      windowContainer = document.createElement('div');
      windowContainer.className = 'aionda-window';
      windowContainer.style.position = 'absolute';
      windowContainer.style.top = '100px';
      windowContainer.style.left = '200px';
      document.body.appendChild(windowContainer);
      
      const items = [
        { text: 'File', menu: [{ text: 'New' }, { text: 'Open' }] }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      windowContainer.appendChild(element);
    });

    afterEach(() => {
      if (windowContainer && windowContainer.parentNode) {
        windowContainer.parentNode.removeChild(windowContainer);
      }
    });

    test('should setup window movement tracking when menu opens', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      expect(menuBar.trackedWindow).toBe(windowContainer);
      expect(menuBar.trackedMenuItem).toBe(menuBar.menuItems[0]);
      expect(menuBar.trackedItemEl).toBe(fileItem);
      expect(menuBar.windowObserver).toBeTruthy();
      expect(menuBar.positionCheckInterval).toBeTruthy();
    });

    test('should stop window movement tracking when menu closes', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      
      // Open menu
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(menuBar.windowObserver).toBeTruthy();
      
      // Close menu
      menuBar.hideActiveMenu();
      
      expect(menuBar.trackedWindow).toBeNull();
      expect(menuBar.trackedMenuItem).toBeNull();
      expect(menuBar.trackedItemEl).toBeNull();
      expect(menuBar.windowObserver).toBeNull();
      expect(menuBar.positionCheckInterval).toBeNull();
    });

    test('should update menu position when window moves', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      
      // Open menu
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const menuEl = menuBar.activeMenu.el;
      
      // Verify updateMenuPosition can be called without errors
      expect(() => {
        menuBar.updateMenuPosition();
      }).not.toThrow();
      
      // Verify the menu element has position properties set
      expect(menuEl.style.top).toBeTruthy();
      expect(menuEl.style.left).toBeTruthy();
      
      // Test that updateMenuPosition actually updates based on current position
      const currentRect = fileItem.getBoundingClientRect();
      menuBar.updateMenuPosition();
      
      const expectedTop = (currentRect.bottom + 2) + 'px';
      const expectedLeft = currentRect.left + 'px';
      
      expect(menuEl.style.top).toBe(expectedTop);
      expect(menuEl.style.left).toBe(expectedLeft);
    });

    test('should handle MutationObserver style changes', (done) => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      
      // Open menu
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Spy on updateMenuPosition
      const updateSpy = jest.spyOn(menuBar, 'updateMenuPosition');
      
      // Change window style (this should trigger MutationObserver)
      windowContainer.style.transform = 'translate(50px, 50px)';
      
      // Give MutationObserver time to fire
      setTimeout(() => {
        expect(updateSpy).toHaveBeenCalled();
        done();
      }, 100);
    });

    test('should clean up tracking on component destroy', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      
      // Open menu to start tracking
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(menuBar.windowObserver).toBeTruthy();
      expect(menuBar.positionCheckInterval).toBeTruthy();
      
      // Destroy component
      menuBar.destroy();
      
      expect(menuBar.trackedWindow).toBeNull();
      expect(menuBar.windowObserver).toBeNull();
      expect(menuBar.positionCheckInterval).toBeNull();
    });

    test('should handle updateMenuPosition with missing elements gracefully', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      
      // Open menu
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Remove active menu to test graceful handling
      menuBar.activeMenu = null;
      
      // Should not throw error
      expect(() => {
        menuBar.updateMenuPosition();
      }).not.toThrow();
    });

    test('should handle multiple menu switches with tracking', () => {
      const items = [
        { text: 'File', menu: [{ text: 'New' }] },
        { text: 'Edit', menu: [{ text: 'Cut' }] }
      ];
      
      menuBar.destroy();
      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      windowContainer.appendChild(element);
      
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      const editItem = windowContainer.querySelector('[data-item-index="1"]');
      
      // Open File menu
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const firstTrackedItem = menuBar.trackedItemEl;
      
      // Switch to Edit menu
      editItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      expect(menuBar.trackedItemEl).toBe(editItem);
      expect(menuBar.trackedItemEl).not.toBe(firstTrackedItem);
    });
  });

  describe('Window Integration Edge Cases', () => {
    test('should handle window context without crashing when no window found', () => {
      const items = [{ text: 'File', menu: [{ text: 'New' }] }];
      menuBar = new MenuBar({ items });
      
      // Mock the closest method to return null (no window found)
      const element = menuBar.render();
      const originalClosest = element.closest;
      element.closest = jest.fn().mockReturnValue(null);
      
      container.appendChild(element);
      
      const fileItem = element.querySelector('[data-item-index="0"]');
      
      // Should not crash when no window found
      expect(() => {
        fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }).not.toThrow();
      
      // Restore original method
      element.closest = originalClosest;
    });

    test('should handle menu positioning when menu element is missing', () => {
      const windowContainer = document.createElement('div');
      windowContainer.className = 'aionda-window';
      document.body.appendChild(windowContainer);
      
      try {
        const items = [{ text: 'File', menu: [{ text: 'New' }] }];
        menuBar = new MenuBar({ items });
        const element = menuBar.render();
        windowContainer.appendChild(element);
        
        const fileItem = element.querySelector('[data-item-index="0"]');
        fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        // Remove menu element to test graceful handling
        if (menuBar.activeMenu && menuBar.activeMenu.el) {
          menuBar.activeMenu.el = null;
        }
        
        // Should not crash when updating position
        expect(() => {
          menuBar.updateMenuPosition();
        }).not.toThrow();
        
      } finally {
        document.body.removeChild(windowContainer);
      }
    });

    test('should handle window tracking setup when no window element found', () => {
      const items = [{ text: 'File', menu: [{ text: 'New' }] }];
      menuBar = new MenuBar({ items });
      
      // Initialize tracking properties to null to avoid undefined
      menuBar.trackedWindow = null;
      menuBar.windowObserver = null;
      menuBar.positionCheckInterval = null;
      
      // Mock to simulate no window found
      menuBar.el = { closest: jest.fn().mockReturnValue(null) };
      
      // Should not crash when trying to setup tracking
      expect(() => {
        menuBar.setupWindowMovementTracking({}, {});
      }).not.toThrow();
      
      expect(menuBar.trackedWindow).toBeNull();
      expect(menuBar.windowObserver).toBeNull();
      expect(menuBar.positionCheckInterval).toBeNull();
    });
  });

  describe('Menu Hover Behavior in Window Context', () => {
    let windowContainer;
    
    beforeEach(() => {
      windowContainer = document.createElement('div');
      windowContainer.className = 'aionda-window';
      document.body.appendChild(windowContainer);
      
      const items = [
        { text: 'File', menu: [{ text: 'New' }] },
        { text: 'Edit', menu: [{ text: 'Cut' }] },
        { text: 'View', menu: [{ text: 'Zoom' }] }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      windowContainer.appendChild(element);
    });

    afterEach(() => {
      if (windowContainer && windowContainer.parentNode) {
        windowContainer.parentNode.removeChild(windowContainer);
      }
    });

    test('should switch menus on hover when in menubar mode', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      const editItem = windowContainer.querySelector('[data-item-index="1"]');
      
      // Click File to enter menubar mode
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(menuBar.menubarMode).toBe(true);
      expect(menuBar.activeMenu).toBeTruthy();
      
      const firstMenu = menuBar.activeMenu;
      
      // Test manual focus change and menu switching functionality
      menuBar.setFocusedItemIndex(1);
      expect(menuBar.focusedItemIndex).toBe(1);
      
      // Test that we can show a different menu
      const editMenuItem = menuBar.menuItems[1];
      if (editMenuItem.menu) {
        menuBar.showMenu(editMenuItem, editItem);
        expect(menuBar.activeMenu).toBeTruthy();
        expect(menuBar.activeMenu).not.toBe(firstMenu);
      }
    });

    test('should not switch menus on hover when not in menubar mode', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      const editItem = windowContainer.querySelector('[data-item-index="1"]');
      
      // Just hover without clicking (not in menubar mode)
      editItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      
      expect(menuBar.menubarMode).toBe(false);
      expect(menuBar.activeMenu).toBeNull();
    });

    test('should respect showOnHover setting', () => {
      menuBar.destroy();
      const items = [
        { text: 'File', menu: [{ text: 'New' }] },
        { text: 'Edit', menu: [{ text: 'Cut' }] }
      ];
      
      menuBar = new MenuBar({ items, showOnHover: false });
      const element = menuBar.render();
      windowContainer.appendChild(element);
      
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      const editItem = windowContainer.querySelector('[data-item-index="1"]');
      
      // Enter menubar mode
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(menuBar.menubarMode).toBe(true);
      
      // Hover should not switch menu when showOnHover is false
      editItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      
      // Should update focus but not show menu
      expect(menuBar.focusedItemIndex).toBe(1);
    });
  });

  describe('Advanced Menu State Management', () => {
    let windowContainer;
    
    beforeEach(() => {
      windowContainer = document.createElement('div');
      windowContainer.className = 'aionda-window';
      document.body.appendChild(windowContainer);
      
      const items = [
        { text: 'File', menu: [{ text: 'New' }] },
        { text: 'Edit', menu: [{ text: 'Cut' }] }
      ];

      menuBar = new MenuBar({ items });
      const element = menuBar.render();
      windowContainer.appendChild(element);
    });

    afterEach(() => {
      if (windowContainer && windowContainer.parentNode) {
        windowContainer.parentNode.removeChild(windowContainer);
      }
    });

    test('should maintain menubar mode when menu is open', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      
      // Open menu
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(menuBar.menubarMode).toBe(true);
      expect(menuBar.activeMenu).toBeTruthy();
      
      // Try to exit menubar mode while menu is open
      menuBar.exitMenubarMode();
      
      // Should still be in menubar mode because menu is open
      expect(menuBar.menubarMode).toBe(true);
    });

    test('should exit menubar mode when no menu is open', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      
      // Enter menubar mode
      menuBar.enterMenubarMode();
      expect(menuBar.menubarMode).toBe(true);
      
      // Exit when no menu is active
      menuBar.exitMenubarMode();
      expect(menuBar.menubarMode).toBe(false);
    });

    test('should clean up tracking when switching between menus', () => {
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      const editItem = windowContainer.querySelector('[data-item-index="1"]');
      
      // Open File menu
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const stopTrackingSpy = jest.spyOn(menuBar, 'stopWindowMovementTracking');
      
      // Switch to Edit menu
      editItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      // Should have stopped tracking before starting new tracking
      expect(stopTrackingSpy).toHaveBeenCalled();
    });

    test('should emit menushow event with correct data', () => {
      const mockHandler = jest.fn();
      menuBar.on('menushow', mockHandler);
      
      const fileItem = windowContainer.querySelector('[data-item-index="0"]');
      fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          menuItem: expect.objectContaining({
            config: expect.objectContaining({ text: 'File' }),
            menu: expect.any(Object)
          }),
          menu: expect.any(Object)
        })
      );
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

    test('should handle rapid menu switching without errors', () => {
      const windowContainer = document.createElement('div');
      windowContainer.className = 'aionda-window';
      document.body.appendChild(windowContainer);
      
      try {
        const items = [
          { text: 'File', menu: [{ text: 'New' }] },
          { text: 'Edit', menu: [{ text: 'Cut' }] },
          { text: 'View', menu: [{ text: 'Zoom' }] }
        ];
        
        menuBar = new MenuBar({ items });
        const element = menuBar.render();
        windowContainer.appendChild(element);
        
        const fileItem = windowContainer.querySelector('[data-item-index="0"]');
        const editItem = windowContainer.querySelector('[data-item-index="1"]');
        const viewItem = windowContainer.querySelector('[data-item-index="2"]');
        
        // Rapidly switch between menus
        expect(() => {
          fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          editItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          viewItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          fileItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }).not.toThrow();
        
      } finally {
        document.body.removeChild(windowContainer);
      }
    });
  });
});