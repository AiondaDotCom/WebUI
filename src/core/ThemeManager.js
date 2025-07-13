import { EventEmitter } from './EventEmitter.js';

export class ThemeManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
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
      ...options
    };

    this.currentTheme = null;
    this.systemPreference = null;
    this.themeChangeListeners = new Set();
    this.initialized = false;
    this.destroyed = false;
    
    if (this.options.autoInit !== false) {
      this.initialize();
    }
  }

  initialize() {
    if (this.initialized || this.destroyed) {
      return;
    }
    
    this.detectSystemPreference();
    this.loadPersistedTheme();
    this.setupSystemListener();
    this.applyTheme();
    this.initialized = true;
  }
  
  init() {
    return this.initialize();
  }

  detectSystemPreference() {
    const matchMedia = (typeof window !== 'undefined' && window.matchMedia) || 
                      (typeof global !== 'undefined' && global.matchMedia);
    
    if (matchMedia) {
      const prefersDark = matchMedia('(prefers-color-scheme: dark)');
      this.systemPreference = prefersDark.matches ? 'dark' : 'light';
      return this.systemPreference;
    }
    
    this.systemPreference = 'light';
    return this.systemPreference;
  }

  detectSystemTheme() {
    return this.detectSystemPreference();
  }

  setupSystemListener() {
    const matchMedia = (typeof window !== 'undefined' && window.matchMedia) || 
                      (typeof global !== 'undefined' && global.matchMedia);
    
    if (matchMedia) {
      const prefersDark = matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e) => {
        const newPreference = e.matches ? 'dark' : 'light';
        this.systemPreference = newPreference;
        
        if (this.options.autoDetect && !this.hasPersistedTheme()) {
          this.setTheme(newPreference, false);
        }
        
        this.emit('systemPreferenceChanged', {
          preference: newPreference,
          currentTheme: this.currentTheme
        });
      };
      
      if (prefersDark.addEventListener) {
        prefersDark.addEventListener('change', handleSystemChange);
      }
    }
  }

  loadPersistedTheme() {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.options.storageKey);
        if (stored) {
          const themeData = JSON.parse(stored);
          if (this.isValidTheme(themeData.name)) {
            this.currentTheme = themeData.name;
            return;
          }
        }
      } catch (error) {
        console.warn('ThemeManager: Failed to load persisted theme:', error);
      }
    }
    
    this.currentTheme = this.options.autoDetect && this.systemPreference ? 
      this.systemPreference : this.options.defaultTheme;
  }

  hasPersistedTheme() {
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(this.options.storageKey) !== null;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  persistTheme(themeName) {
    if (typeof localStorage !== 'undefined') {
      try {
        const themeData = {
          name: themeName,
          timestamp: Date.now()
        };
        localStorage.setItem(this.options.storageKey, JSON.stringify(themeData));
      } catch (error) {
        console.warn('ThemeManager: Failed to persist theme:', error);
      }
    }
  }

  setTheme(themeName, persist = true) {
    if (!this.isValidTheme(themeName)) {
      console.warn(`ThemeManager: Invalid theme "${themeName}"`);
      return false;
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = themeName;

    if (persist) {
      this.persistTheme(themeName);
    }

    this.applyTheme();

    this.emit('themeChanged', {
      theme: themeName,
      previousTheme: previousTheme,
      themeData: this.getTheme(themeName)
    });

    return true;
  }

  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const availableThemes = Object.keys(this.options.themes);
    const currentIndex = availableThemes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    const nextTheme = availableThemes[nextIndex];
    
    return this.setTheme(nextTheme);
  }

  applyTheme() {
    const doc = (typeof document !== 'undefined' && document) || 
                (typeof global !== 'undefined' && global.document);
                
    if (!doc || !doc.documentElement) {
      return;
    }

    const theme = this.getTheme(this.currentTheme);
    if (!theme) {
      return;
    }

    this.removeAllThemeClasses();
    
    const classes = theme.className.split(' ').filter(cls => cls.trim());
    if (doc.documentElement.classList) {
      doc.documentElement.classList.add(...classes);
    }

    this.applyCSSVariables(theme);
    
    this.emit('themeApplied', {
      theme: this.currentTheme,
      themeData: theme
    });
  }

  removeAllThemeClasses() {
    const doc = (typeof document !== 'undefined' && document) || 
                (typeof global !== 'undefined' && global.document);
                
    if (!doc || !doc.documentElement || !doc.documentElement.classList) {
      return;
    }
    
    const allClasses = Object.values(this.options.themes)
      .flatMap(theme => theme.className.split(' '))
      .filter(cls => cls.trim());
    
    doc.documentElement.classList.remove(...allClasses);
  }

  applyCSSVariables(theme) {
    if (!theme.colors) {
      return;
    }

    const doc = (typeof document !== 'undefined' && document) || 
                (typeof global !== 'undefined' && global.document);
                
    if (!doc || !doc.documentElement || !doc.documentElement.style) {
      return;
    }

    const root = doc.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
  }

  addTheme(themeName, themeConfig) {
    if (!themeName || typeof themeConfig !== 'object') {
      throw new Error('ThemeManager: Invalid theme configuration');
    }

    const theme = {
      name: themeName,
      displayName: themeConfig.displayName || themeName,
      className: themeConfig.className || `theme-${themeName}`,
      colors: themeConfig.colors || {},
      extends: themeConfig.extends,
      ...themeConfig
    };

    if (theme.extends && this.options.themes[theme.extends]) {
      const parentTheme = this.options.themes[theme.extends];
      theme.colors = { ...parentTheme.colors, ...theme.colors };
    }

    this.options.themes[themeName] = theme;

    this.emit('themeAdded', {
      theme: themeName,
      themeData: theme
    });

    return theme;
  }

  removeTheme(themeName) {
    if (themeName === this.currentTheme) {
      console.warn('ThemeManager: Cannot remove currently active theme');
      return false;
    }

    if (!this.options.themes[themeName]) {
      return false;
    }

    delete this.options.themes[themeName];

    this.emit('themeRemoved', {
      theme: themeName
    });

    return true;
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getTheme(themeName = null) {
    themeName = themeName || this.currentTheme;
    return this.options.themes[themeName] || null;
  }

  getAvailableThemes() {
    return Object.keys(this.options.themes);
  }

  getThemeData(themeName = null) {
    return this.getTheme(themeName);
  }

  isValidTheme(themeName) {
    return Boolean(this.options.themes[themeName]);
  }

  getSystemPreference() {
    return this.systemPreference;
  }

  enableAutoDetect() {
    this.options.autoDetect = true;
    if (!this.hasPersistedTheme()) {
      this.setTheme(this.systemPreference, false);
    }
  }

  disableAutoDetect() {
    this.options.autoDetect = false;
  }

  reset() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.options.storageKey);
      } catch (error) {
        console.warn('ThemeManager: Failed to clear persisted theme:', error);
      }
    }

    this.currentTheme = this.options.autoDetect ? 
      this.systemPreference : this.options.defaultTheme;
    
    this.applyTheme();

    this.emit('themeReset', {
      theme: this.currentTheme
    });
  }

  getThemeForComponent(component) {
    if (!component || typeof component !== 'object') {
      return this.getTheme();
    }

    if (component.theme && this.isValidTheme(component.theme)) {
      return this.getTheme(component.theme);
    }

    if (component.parentComponent) {
      return this.getThemeForComponent(component.parentComponent);
    }

    return this.getTheme();
  }

  applyThemeToElement(element, themeName = null) {
    if (!element || typeof element.classList === 'undefined') {
      return false;
    }

    const theme = this.getTheme(themeName);
    if (!theme) {
      return false;
    }

    const themeClasses = Object.values(this.options.themes)
      .flatMap(t => t.className.split(' '))
      .filter(cls => cls.trim());

    element.classList.remove(...themeClasses);

    const classes = theme.className.split(' ').filter(cls => cls.trim());
    element.classList.add(...classes);

    return true;
  }

  isDark() {
    return this.currentTheme === 'dark';
  }

  isLight() {
    return this.currentTheme === 'light';
  }

  isDestroyed() {
    return this.destroyed;
  }

  destroy() {
    this.removeAllListeners();
    this.themeChangeListeners.clear();
    this.currentTheme = null;
    this.systemPreference = null;
    this.destroyed = true;
    this.initialized = false;
  }
}

const themeManager = new ThemeManager();

