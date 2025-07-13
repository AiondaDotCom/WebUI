/**
 * Theme Test Utilities for Aionda WebUI
 * Provides comprehensive mocking and testing utilities for theme-related functionality
 */

export const ThemeTestUtils = {
  /**
   * Creates a mock ThemeManager with all required methods and properties
   */
  createMockThemeManager(options = {}) {
    const mockThemeManager = {
      currentTheme: options.defaultTheme || 'light',
      systemPreference: options.systemPreference || 'light',
      initialized: true,
      destroyed: false,
      options: {
        storageKey: 'aionda-webui-theme',
        autoDetect: true,
        autoInit: true,
        defaultTheme: 'light',
        themes: {
          light: {
            name: 'light',
            displayName: 'Light',
            className: 'theme-light',
            colors: {
              primary: '#3B82F6',
              secondary: '#6B7280',
              accent: '#10B981',
              background: '#FFFFFF',
              surface: '#F9FAFB',
              text: '#111827',
              textSecondary: '#6B7280'
            }
          },
          dark: {
            name: 'dark',
            displayName: 'Dark',
            className: 'theme-dark dark',
            colors: {
              primary: '#60A5FA',
              secondary: '#9CA3AF',
              accent: '#34D399',
              background: '#111827',
              surface: '#1F2937',
              text: '#F9FAFB',
              textSecondary: '#D1D5DB'
            }
          }
        },
        ...options.options
      },
      
      // Event system
      listeners: new Map(),
      on: jest.fn((event, callback) => {
        if (!mockThemeManager.listeners.has(event)) {
          mockThemeManager.listeners.set(event, []);
        }
        mockThemeManager.listeners.get(event).push(callback);
      }),
      off: jest.fn((event, callback) => {
        if (mockThemeManager.listeners.has(event)) {
          const callbacks = mockThemeManager.listeners.get(event);
          const index = callbacks.indexOf(callback);
          if (index > -1) callbacks.splice(index, 1);
        }
      }),
      emit: jest.fn((event, data) => {
        if (mockThemeManager.listeners.has(event)) {
          mockThemeManager.listeners.get(event).forEach(callback => callback(data));
        }
      }),
      
      // Core methods
      initialize: jest.fn(() => {
        mockThemeManager.initialized = true;
      }),
      init: jest.fn(() => mockThemeManager.initialize()),
      getCurrentTheme: jest.fn(() => mockThemeManager.currentTheme),
      getTheme: jest.fn((name) => {
        const themeName = name || mockThemeManager.currentTheme;
        return mockThemeManager.options.themes[themeName] || null;
      }),
      setTheme: jest.fn((theme, persist = true) => {
        const previousTheme = mockThemeManager.currentTheme;
        mockThemeManager.currentTheme = theme;
        mockThemeManager.emit('themeChanged', {
          theme,
          previousTheme,
          themeData: mockThemeManager.getTheme(theme)
        });
        return true;
      }),
      toggleTheme: jest.fn(() => {
        const current = mockThemeManager.currentTheme;
        const next = current === 'light' ? 'dark' : 'light';
        return mockThemeManager.setTheme(next);
      }),
      isDark: jest.fn(() => mockThemeManager.currentTheme === 'dark'),
      isLight: jest.fn(() => mockThemeManager.currentTheme === 'light'),
      isDestroyed: jest.fn(() => mockThemeManager.destroyed),
      destroy: jest.fn(() => {
        mockThemeManager.destroyed = true;
        mockThemeManager.initialized = false;
        mockThemeManager.listeners.clear();
      }),
      
      // Theme utility methods
      getAvailableThemes: jest.fn(() => Object.keys(mockThemeManager.options.themes)),
      isValidTheme: jest.fn((theme) => !!mockThemeManager.options.themes[theme]),
      getSystemPreference: jest.fn(() => mockThemeManager.systemPreference),
      getThemeForComponent: jest.fn((component) => {
        if (component && component.theme && mockThemeManager.isValidTheme(component.theme)) {
          return mockThemeManager.getTheme(component.theme);
        }
        return mockThemeManager.getTheme();
      }),
      applyTheme: jest.fn(),
      applyThemeToElement: jest.fn(() => true),
      
      // Storage methods
      persistTheme: jest.fn(),
      hasPersistedTheme: jest.fn(() => false),
      loadPersistedTheme: jest.fn(),
      
      // System preference methods
      detectSystemPreference: jest.fn(() => mockThemeManager.systemPreference),
      setupSystemListener: jest.fn(),
      enableAutoDetect: jest.fn(),
      disableAutoDetect: jest.fn(),
      
      // Theme management
      addTheme: jest.fn((name, config) => {
        mockThemeManager.options.themes[name] = { name, ...config };
        return mockThemeManager.options.themes[name];
      }),
      removeTheme: jest.fn((name) => {
        if (name === mockThemeManager.currentTheme) return false;
        delete mockThemeManager.options.themes[name];
        return true;
      }),
      
      reset: jest.fn(() => {
        mockThemeManager.currentTheme = mockThemeManager.options.defaultTheme;
        mockThemeManager.emit('themeReset', { theme: mockThemeManager.currentTheme });
      })
    };
    
    return mockThemeManager;
  },

  /**
   * Creates standardized test scenarios for theme testing
   */
  createThemeTestScenarios() {
    return {
      lightTheme: {
        theme: 'light',
        expectedClasses: ['theme-light'],
        expectedAriaPressed: 'false',
        isDark: false,
        isLight: true,
        expectedColors: {
          primary: '#3B82F6',
          background: '#FFFFFF',
          text: '#111827'
        }
      },
      darkTheme: {
        theme: 'dark',
        expectedClasses: ['theme-dark', 'dark'],
        expectedAriaPressed: 'true',
        isDark: true,
        isLight: false,
        expectedColors: {
          primary: '#60A5FA',
          background: '#111827',
          text: '#F9FAFB'
        }
      }
    };
  },

  /**
   * Mocks system color scheme preference
   */
  mockSystemPreference(preference = 'light') {
    const mockMatchMedia = jest.fn((query) => ({
      matches: query === '(prefers-color-scheme: dark)' && preference === 'dark',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
    
    return mockMatchMedia;
  },

  /**
   * Sets up the theme testing environment with proper DOM mocking
   */
  setupThemeTestEnvironment(initialTheme = 'light') {
    // Reset document classes
    document.documentElement.className = '';
    
    // Mock document element theme operations
    const mockClassList = {
      add: jest.fn((...classes) => {
        classes.forEach(cls => {
          if (!document.documentElement.className.includes(cls)) {
            document.documentElement.className += ` ${cls}`;
          }
        });
      }),
      remove: jest.fn((...classes) => {
        classes.forEach(cls => {
          document.documentElement.className = document.documentElement.className
            .replace(new RegExp(`\\b${cls}\\b`, 'g'), '').trim();
        });
      }),
      contains: jest.fn((className) => {
        return document.documentElement.className.includes(className);
      }),
      toggle: jest.fn((className) => {
        if (mockClassList.contains(className)) {
          mockClassList.remove(className);
        } else {
          mockClassList.add(className);
        }
      })
    };
    
    Object.defineProperty(document.documentElement, 'classList', {
      value: mockClassList,
      writable: true
    });
    
    // Mock style property setting
    const mockStyle = {
      setProperty: jest.fn((property, value) => {
        if (!document.documentElement.style._properties) {
          document.documentElement.style._properties = {};
        }
        document.documentElement.style._properties[property] = value;
      }),
      getProperty: jest.fn((property) => {
        return document.documentElement.style._properties?.[property] || '';
      }),
      removeProperty: jest.fn((property) => {
        if (document.documentElement.style._properties) {
          delete document.documentElement.style._properties[property];
        }
      })
    };
    
    Object.defineProperty(document.documentElement, 'style', {
      value: mockStyle,
      writable: true
    });
    
    // Set initial theme class
    if (initialTheme) {
      mockClassList.add(`theme-${initialTheme}`);
      if (initialTheme === 'dark') {
        mockClassList.add('dark');
      }
    }
    
    return {
      classList: mockClassList,
      style: mockStyle
    };
  },

  /**
   * Verifies theme application on an element
   */
  verifyThemeApplication(element, theme, scenarios) {
    const scenario = scenarios[`${theme}Theme`];
    if (!scenario) {
      throw new Error(`No test scenario found for theme: ${theme}`);
    }
    
    // Check ARIA attributes for interactive elements
    if (element.hasAttribute('aria-pressed')) {
      const ariaPressed = element.getAttribute('aria-pressed');
      expect(ariaPressed).toBe(scenario.expectedAriaPressed);
    }
    
    // Check theme classes if element supports them
    if (element.classList && scenario.expectedClasses) {
      scenario.expectedClasses.forEach(className => {
        const hasClass = element.classList.contains(className) || 
                        element.querySelector(`.${className}`) !== null ||
                        element.className.includes(className);
        expect(hasClass).toBeTruthy();
      });
    }
    
    return true;
  },

  /**
   * Creates a test suite for theme-aware components
   */
  createThemeTestSuite(ComponentClass, componentName) {
    return {
      [`${componentName} theme integration`]: () => {
        let component;
        let mockThemeManager;
        let scenarios;

        beforeEach(() => {
          scenarios = ThemeTestUtils.createThemeTestScenarios();
          mockThemeManager = ThemeTestUtils.createMockThemeManager();
          ThemeTestUtils.setupThemeTestEnvironment();
          component = new ComponentClass({ themeManager: mockThemeManager });
        });

        afterEach(() => {
          if (component && !component.destroyed) {
            component.destroy();
          }
          mockThemeManager = null;
        });

        test('should respond to theme changes', () => {
          component.renderTo(document.body);
          
          // Test light theme
          mockThemeManager.setTheme('light');
          expect(mockThemeManager.emit).toHaveBeenCalledWith('themeChanged', 
            expect.objectContaining({ theme: 'light' }));

          // Test dark theme
          mockThemeManager.setTheme('dark');
          expect(mockThemeManager.emit).toHaveBeenCalledWith('themeChanged', 
            expect.objectContaining({ theme: 'dark' }));
        });

        test('should apply theme-specific styles', () => {
          component.renderTo(document.body);
          
          // Test both theme scenarios
          Object.entries(scenarios).forEach(([scenarioName, scenario]) => {
            mockThemeManager.currentTheme = scenario.theme;
            if (typeof component.updateAppearance === 'function') {
              component.updateAppearance();
            }
            
            ThemeTestUtils.verifyThemeApplication(component.el, scenario.theme, scenarios);
          });
        });
      }
    };
  },

  /**
   * Simulates theme changes during testing
   */
  async simulateThemeChange(themeManager, fromTheme, toTheme) {
    const previousTheme = fromTheme;
    themeManager.currentTheme = toTheme;
    
    // Trigger theme change event
    themeManager.emit('themeChanged', {
      theme: toTheme,
      previousTheme: previousTheme,
      themeData: themeManager.getTheme(toTheme)
    });
    
    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 0));
  },

  /**
   * Validates that a component properly handles theme destruction
   */
  testThemeManagerDestruction(component, themeManager) {
    // Render component
    component.renderTo(document.body);
    expect(component.rendered).toBe(true);
    
    // Destroy theme manager
    themeManager.destroy();
    
    // Test that component doesn't crash when theme manager is destroyed
    expect(() => {
      if (typeof component.toggle === 'function') {
        component.toggle();
      }
      if (typeof component.updateAppearance === 'function') {
        component.updateAppearance();
      }
    }).not.toThrow();
  }
};

// Global setup for theme testing
global.ThemeTestUtils = ThemeTestUtils;