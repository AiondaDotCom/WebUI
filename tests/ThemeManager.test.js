import { ThemeManager } from '../src/core/ThemeManager.js';

describe('ThemeManager', () => {
  let themeManager;
  let mockLocalStorage;
  let mockMatchMedia;

  beforeEach(() => {
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };

    mockMatchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    });

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    Object.defineProperty(global, 'matchMedia', {
      value: mockMatchMedia,
      writable: true
    });

    // Mock document for theme application
    global.document = {
      documentElement: {
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        },
        style: {
          setProperty: jest.fn()
        }
      }
    };

    themeManager = new ThemeManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize with default options', () => {
      expect(themeManager.options.storageKey).toBe('aionda-webui-theme');
      expect(themeManager.options.autoDetect).toBe(true);
      expect(themeManager.options.defaultTheme).toBe('light');
      expect(themeManager.options.themes).toHaveProperty('light');
      expect(themeManager.options.themes).toHaveProperty('dark');
    });

    test('should accept custom options', () => {
      const customOptions = {
        storageKey: 'custom-theme',
        autoDetect: false,
        defaultTheme: 'dark'
      };
      
      const customThemeManager = new ThemeManager(customOptions);
      
      expect(customThemeManager.options.storageKey).toBe('custom-theme');
      expect(customThemeManager.options.autoDetect).toBe(false);
      expect(customThemeManager.options.defaultTheme).toBe('dark');
    });

    test('should initialize current theme', () => {
      expect(themeManager.currentTheme).toBeDefined();
      expect(themeManager.systemPreference).toBeDefined();
    });
  });

  describe('System Preference Detection', () => {
    test('should detect light preference by default', () => {
      const preference = themeManager.detectSystemPreference();
      expect(preference).toBe('light');
    });

    test('should detect dark preference when media query matches', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      });

      const newThemeManager = new ThemeManager();
      expect(newThemeManager.systemPreference).toBe('dark');
    });

    test('should handle missing matchMedia gracefully', () => {
      delete global.matchMedia;
      
      const newThemeManager = new ThemeManager();
      expect(newThemeManager.systemPreference).toBe('light');
    });
  });

  describe('Theme Persistence', () => {
    test('should load persisted theme from localStorage', () => {
      const themeData = { name: 'dark', timestamp: Date.now() };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(themeData));

      const newThemeManager = new ThemeManager();
      expect(newThemeManager.currentTheme).toBe('dark');
    });

    test('should handle invalid persisted theme data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      const newThemeManager = new ThemeManager();
      expect(newThemeManager.currentTheme).toBe('light');
    });

    test('should persist theme to localStorage', () => {
      themeManager.persistTheme('dark');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'aionda-webui-theme',
        expect.stringContaining('"name":"dark"')
      );
    });

    test('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => themeManager.persistTheme('dark')).not.toThrow();
    });
  });

  describe('Theme Setting', () => {
    test('should set valid theme', () => {
      const result = themeManager.setTheme('dark');
      
      expect(result).toBe(true);
      expect(themeManager.currentTheme).toBe('dark');
    });

    test('should reject invalid theme', () => {
      const result = themeManager.setTheme('invalid');
      
      expect(result).toBe(false);
      expect(themeManager.currentTheme).not.toBe('invalid');
    });

    test('should emit themeChanged event', () => {
      const listener = jest.fn();
      themeManager.on('themeChanged', listener);
      
      themeManager.setTheme('dark');
      
      expect(listener).toHaveBeenCalledWith({
        theme: 'dark',
        previousTheme: 'light',
        themeData: themeManager.getTheme('dark')
      });
    });

    test('should optionally skip persistence', () => {
      themeManager.setTheme('dark', false);
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Theme Toggle', () => {
    test('should toggle between available themes', () => {
      themeManager.setTheme('light');
      
      const result = themeManager.toggleTheme();
      
      expect(result).toBe(true);
      expect(themeManager.currentTheme).toBe('dark');
    });

    test('should cycle through all themes', () => {
      themeManager.addTheme('custom', { colors: {} });
      
      themeManager.setTheme('light');
      themeManager.toggleTheme();
      expect(themeManager.currentTheme).toBe('dark');
      
      themeManager.toggleTheme();
      expect(themeManager.currentTheme).toBe('custom');
      
      themeManager.toggleTheme();
      expect(themeManager.currentTheme).toBe('light');
    });
  });

  describe('Custom Themes', () => {
    test('should add new theme', () => {
      const customTheme = {
        displayName: 'Custom',
        className: 'theme-custom',
        colors: { primary: '#FF0000' }
      };
      
      const result = themeManager.addTheme('custom', customTheme);
      
      expect(result.name).toBe('custom');
      expect(themeManager.isValidTheme('custom')).toBe(true);
    });

    test('should support theme inheritance', () => {
      const childTheme = {
        extends: 'dark',
        colors: { accent: '#FF0000' }
      };
      
      const result = themeManager.addTheme('custom', childTheme);
      
      expect(result.colors.primary).toBe('#60A5FA');
      expect(result.colors.accent).toBe('#FF0000');
    });

    test('should remove theme', () => {
      themeManager.addTheme('custom', { colors: {} });
      
      const result = themeManager.removeTheme('custom');
      
      expect(result).toBe(true);
      expect(themeManager.isValidTheme('custom')).toBe(false);
    });

    test('should not remove active theme', () => {
      themeManager.setTheme('dark');
      
      const result = themeManager.removeTheme('dark');
      
      expect(result).toBe(false);
      expect(themeManager.isValidTheme('dark')).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    test('should return current theme', () => {
      themeManager.setTheme('dark');
      
      expect(themeManager.getCurrentTheme()).toBe('dark');
    });

    test('should return available themes', () => {
      const themes = themeManager.getAvailableThemes();
      
      expect(themes).toContain('light');
      expect(themes).toContain('dark');
    });

    test('should validate theme names', () => {
      expect(themeManager.isValidTheme('light')).toBe(true);
      expect(themeManager.isValidTheme('dark')).toBe(true);
      expect(themeManager.isValidTheme('invalid')).toBe(false);
    });

    test('should detect dark theme', () => {
      themeManager.setTheme('dark');
      
      expect(themeManager.isDark()).toBe(true);
      expect(themeManager.isLight()).toBe(false);
    });

    test('should detect light theme', () => {
      themeManager.setTheme('light');
      
      expect(themeManager.isLight()).toBe(true);
      expect(themeManager.isDark()).toBe(false);
    });
  });

  describe('Component Theme Inheritance', () => {
    test('should return current theme for component without theme', () => {
      const component = {};
      
      const theme = themeManager.getThemeForComponent(component);
      
      expect(theme).toBe(themeManager.getTheme());
    });

    test('should return component specific theme', () => {
      const component = { theme: 'dark' };
      
      const theme = themeManager.getThemeForComponent(component);
      
      expect(theme).toBe(themeManager.getTheme('dark'));
    });

    test('should inherit from parent component', () => {
      const parentComponent = { theme: 'dark' };
      const component = { parentComponent };
      
      const theme = themeManager.getThemeForComponent(component);
      
      expect(theme).toBe(themeManager.getTheme('dark'));
    });
  });

  describe('Cleanup', () => {
    test('should destroy properly', () => {
      themeManager.destroy();
      
      expect(themeManager.currentTheme).toBeNull();
      expect(themeManager.systemPreference).toBeNull();
    });
  });
});