/**
 * Unit tests for ThemeToggle component
 * Tests UI component interaction, event handling, accessibility, and integration with ThemeManager
 */

import { ThemeToggle } from '../src/components/ThemeToggle.js';
import { ThemeManager } from '../src/core/ThemeManager.js';
import { Component } from '../src/core/Component.js';

describe('ThemeToggle', () => {
  let themeToggle;
  let themeManager;
  let mockMatchMedia;
  let localStorageMock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      data: {},
      getItem: jest.fn((key) => localStorageMock.data[key] || null),
      setItem: jest.fn((key, value) => { localStorageMock.data[key] = value; }),
      removeItem: jest.fn((key) => { delete localStorageMock.data[key]; }),
      clear: jest.fn(() => { localStorageMock.data = {}; })
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock matchMedia
    mockMatchMedia = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    window.matchMedia = jest.fn(() => mockMatchMedia);

    document.body.innerHTML = '';
    document.documentElement.className = '';
    
    themeManager = new ThemeManager({ autoInit: false });
    themeToggle = null;
  });

  afterEach(() => {
    if (themeToggle && !themeToggle.destroyed) {
      themeToggle.destroy();
    }
    if (themeManager && !themeManager.destroyed) {
      themeManager.destroy();
    }
    themeToggle = null;
    themeManager = null;
    document.body.innerHTML = '';
    document.documentElement.className = '';
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create ThemeToggle with default config', () => {
      themeToggle = new ThemeToggle();
      
      expect(themeToggle).toBeInstanceOf(Component);
      expect(themeToggle.config.type).toBe('button');
      expect(themeToggle.config.showLabels).toBe(true);
      expect(themeToggle.config.showIcons).toBe(true);
    });

    test('should create ThemeToggle with custom config', () => {
      themeToggle = new ThemeToggle({
        type: 'switch',
        showLabels: false,
        showIcons: false,
        lightLabel: 'Light Mode',
        darkLabel: 'Dark Mode',
        themeManager: themeManager
      });
      
      expect(themeToggle.config.type).toBe('switch');
      expect(themeToggle.config.showLabels).toBe(false);
      expect(themeToggle.config.showIcons).toBe(false);
      expect(themeToggle.config.lightLabel).toBe('Light Mode');
      expect(themeToggle.config.darkLabel).toBe('Dark Mode');
      expect(themeToggle.themeManager).toBe(themeManager);
    });

    test('should create its own ThemeManager if none provided', () => {
      themeToggle = new ThemeToggle();
      
      expect(themeToggle.themeManager).toBeInstanceOf(ThemeManager);
    });

    test('should use provided ThemeManager', () => {
      themeToggle = new ThemeToggle({ themeManager: themeManager });
      
      expect(themeToggle.themeManager).toBe(themeManager);
    });
  });

  describe('template creation', () => {
    test('should create button template with icons and labels', () => {
      themeToggle = new ThemeToggle();
      const template = themeToggle.createTemplate();
      
      expect(template).toContain('button');
      expect(template).toContain('theme-toggle');
      expect(template).toContain('aria-label');
      expect(template).toContain('role="switch"');
    });

    test('should create switch template', () => {
      themeToggle = new ThemeToggle({ type: 'switch' });
      const template = themeToggle.createTemplate();
      
      expect(template).toContain('theme-toggle-switch');
      expect(template).toContain('input');
      expect(template).toContain('type="checkbox"');
    });

    test('should hide labels when showLabels is false', () => {
      themeToggle = new ThemeToggle({ showLabels: false });
      const template = themeToggle.createTemplate();
      
      expect(template).not.toContain('Light');
      expect(template).not.toContain('Dark');
    });

    test('should hide icons when showIcons is false', () => {
      themeToggle = new ThemeToggle({ showIcons: false });
      const template = themeToggle.createTemplate();
      
      expect(template).not.toContain('☀️');
      expect(template).not.toContain('🌙');
    });

    test('should use custom labels', () => {
      themeToggle = new ThemeToggle({
        lightLabel: 'Day Mode',
        darkLabel: 'Night Mode'
      });
      const template = themeToggle.createTemplate();
      
      expect(template).toContain('Day Mode');
      expect(template).toContain('Night Mode');
    });

    test('should use custom icons', () => {
      themeToggle = new ThemeToggle({
        lightIcon: '💡',
        darkIcon: '🌚'
      });
      const template = themeToggle.createTemplate();
      
      expect(template).toContain('💡');
      expect(template).toContain('🌚');
    });
  });

  describe('rendering and DOM interaction', () => {
    beforeEach(() => {
      themeManager.init();
      themeToggle = new ThemeToggle({ themeManager: themeManager });
    });

    test('should render to container element', () => {
      const container = document.createElement('div');
      container.id = 'theme-toggle-container';
      document.body.appendChild(container);
      
      themeToggle.renderTo('#theme-toggle-container');
      
      expect(container.children.length).toBe(1);
      expect(container.querySelector('.theme-toggle')).toBeTruthy();
    });

    test('should update appearance based on current theme', () => {
      themeToggle.renderTo(document.body);
      
      // Light theme
      themeManager.setTheme('light');
      themeToggle.updateAppearance();
      expect(themeToggle.el.getAttribute('aria-pressed')).toBe('false');
      
      // Dark theme
      themeManager.setTheme('dark');
      themeToggle.updateAppearance();
      expect(themeToggle.el.getAttribute('aria-pressed')).toBe('true');
    });

    test('should update switch state for switch type', () => {
      themeToggle.destroy();
      themeToggle = new ThemeToggle({ 
        type: 'switch', 
        themeManager: themeManager 
      });
      themeToggle.renderTo(document.body);
      
      const checkbox = themeToggle.el.querySelector('input[type="checkbox"]');
      
      themeManager.setTheme('light');
      themeToggle.updateAppearance();
      expect(checkbox.checked).toBe(false);
      
      themeManager.setTheme('dark');
      themeToggle.updateAppearance();
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      themeManager.init();
      themeToggle = new ThemeToggle({ themeManager: themeManager });
      themeToggle.renderTo(document.body);
    });

    test('should toggle theme on button click', () => {
      const button = themeToggle.el.querySelector('button') || themeToggle.el;
      
      expect(themeManager.getCurrentTheme()).toBe('light');
      
      button.click();
      expect(themeManager.getCurrentTheme()).toBe('dark');
      
      button.click();
      expect(themeManager.getCurrentTheme()).toBe('light');
    });

    test('should toggle theme on switch change', () => {
      themeToggle.destroy();
      themeToggle = new ThemeToggle({ 
        type: 'switch', 
        themeManager: themeManager 
      });
      themeToggle.renderTo(document.body);
      
      const checkbox = themeToggle.el.querySelector('input[type="checkbox"]');
      
      expect(themeManager.getCurrentTheme()).toBe('light');
      
      checkbox.click();
      expect(themeManager.getCurrentTheme()).toBe('dark');
      
      checkbox.click();
      expect(themeManager.getCurrentTheme()).toBe('light');
    });

    test('should handle keyboard navigation', () => {
      const button = themeToggle.el.querySelector('button') || themeToggle.el;
      
      // Space key
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', code: 'Space' });
      button.dispatchEvent(spaceEvent);
      expect(themeManager.getCurrentTheme()).toBe('dark');
      
      // Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' });
      button.dispatchEvent(enterEvent);
      expect(themeManager.getCurrentTheme()).toBe('light');
    });

    test('should emit toggle events', () => {
      const toggleSpy = jest.fn();
      themeToggle.on('toggle', toggleSpy);
      
      const button = themeToggle.el.querySelector('button') || themeToggle.el;
      button.click();
      
      expect(toggleSpy).toHaveBeenCalledWith({
        theme: 'dark',
        previousTheme: 'light'
      });
    });

    test('should prevent default for keyboard events', () => {
      const button = themeToggle.el.querySelector('button') || themeToggle.el;
      
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', code: 'Space' });
      const preventDefaultSpy = jest.spyOn(spaceEvent, 'preventDefault');
      
      button.dispatchEvent(spaceEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('theme manager integration', () => {
    beforeEach(() => {
      themeManager.init();
      themeToggle = new ThemeToggle({ themeManager: themeManager });
      themeToggle.renderTo(document.body);
    });

    test('should sync with theme manager changes', () => {
      // External theme change
      themeManager.setTheme('dark');
      
      expect(themeToggle.el.getAttribute('aria-pressed')).toBe('true');
    });

    test('should handle theme manager events', () => {
      const updateSpy = jest.spyOn(themeToggle, 'updateAppearance');
      
      themeManager.setTheme('dark');
      
      expect(updateSpy).toHaveBeenCalled();
    });

    test('should work with lazy-initialized theme manager', () => {
      themeToggle.destroy();
      const lazyThemeManager = new ThemeManager({ autoInit: false });
      themeToggle = new ThemeToggle({ themeManager: lazyThemeManager });
      themeToggle.renderTo(document.body);
      
      // Initialize after component creation
      lazyThemeManager.init();
      
      const button = themeToggle.el.querySelector('button') || themeToggle.el;
      button.click();
      
      expect(lazyThemeManager.getCurrentTheme()).toBe('dark');
      lazyThemeManager.destroy();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      themeManager.init();
      themeToggle = new ThemeToggle({ themeManager: themeManager });
      themeToggle.renderTo(document.body);
    });

    test('should have proper ARIA attributes', () => {
      const element = themeToggle.el.querySelector('button') || themeToggle.el;
      
      expect(element.getAttribute('role')).toBe('switch');
      expect(element.getAttribute('aria-label')).toBeTruthy();
      expect(element.hasAttribute('aria-pressed')).toBe(true);
    });

    test('should update aria-pressed on theme change', () => {
      const element = themeToggle.el.querySelector('button') || themeToggle.el;
      
      themeManager.setTheme('light');
      expect(element.getAttribute('aria-pressed')).toBe('false');
      
      themeManager.setTheme('dark');
      expect(element.getAttribute('aria-pressed')).toBe('true');
    });

    test('should be keyboard focusable', () => {
      const element = themeToggle.el.querySelector('button') || themeToggle.el;
      
      expect(element.tabIndex).toBe(0);
    });

    test('should have proper aria-label for screen readers', () => {
      const element = themeToggle.el.querySelector('button') || themeToggle.el;
      const ariaLabel = element.getAttribute('aria-label');
      
      expect(ariaLabel).toContain('theme');
      expect(ariaLabel.toLowerCase()).toMatch(/toggle|switch|change/);
    });

    test('should update aria-label based on current theme', () => {
      themeToggle.destroy();
      themeToggle = new ThemeToggle({ 
        themeManager: themeManager,
        dynamicAriaLabel: true
      });
      themeToggle.renderTo(document.body);
      
      const element = themeToggle.el.querySelector('button') || themeToggle.el;
      
      themeManager.setTheme('light');
      themeToggle.updateAppearance();
      expect(element.getAttribute('aria-label')).toContain('dark');
      
      themeManager.setTheme('dark');
      themeToggle.updateAppearance();
      expect(element.getAttribute('aria-label')).toContain('light');
    });
  });

  describe('configuration options', () => {
    test('should support custom CSS classes', () => {
      themeToggle = new ThemeToggle({
        cssClass: 'custom-theme-toggle',
        themeManager: themeManager
      });
      themeToggle.renderTo(document.body);
      
      expect(themeToggle.el.classList.contains('custom-theme-toggle')).toBe(true);
    });

    test('should support custom button text', () => {
      themeToggle = new ThemeToggle({
        buttonText: 'Toggle Theme',
        themeManager: themeManager
      });
      const template = themeToggle.createTemplate();
      
      expect(template).toContain('Toggle Theme');
    });

    test('should support size variants', () => {
      themeToggle = new ThemeToggle({
        size: 'large',
        themeManager: themeManager
      });
      themeToggle.renderTo(document.body);
      
      expect(themeToggle.el.classList.contains('theme-toggle-large')).toBe(true);
    });

    test('should support icon-only mode', () => {
      themeToggle = new ThemeToggle({
        showLabels: false,
        iconOnly: true,
        themeManager: themeManager
      });
      const template = themeToggle.createTemplate();
      
      expect(template).not.toContain('Light');
      expect(template).not.toContain('Dark');
      expect(template).toContain('☀️');
      expect(template).toContain('🌙');
    });
  });

  describe('animation and transitions', () => {
    beforeEach(() => {
      themeManager.init();
      themeToggle = new ThemeToggle({ 
        themeManager: themeManager,
        animated: true
      });
      themeToggle.renderTo(document.body);
    });

    test('should add animation classes during transition', () => {
      const button = themeToggle.el.querySelector('button') || themeToggle.el;
      
      button.click();
      
      expect(themeToggle.el.classList.contains('theme-toggle-animating')).toBe(true);
    });

    test('should remove animation classes after transition', (done) => {
      const button = themeToggle.el.querySelector('button') || themeToggle.el;
      
      button.click();
      
      setTimeout(() => {
        expect(themeToggle.el.classList.contains('theme-toggle-animating')).toBe(false);
        done();
      }, 300);
    });

    test('should support custom animation duration', () => {
      themeToggle.destroy();
      themeToggle = new ThemeToggle({
        themeManager: themeManager,
        animated: true,
        animationDuration: 500
      });
      themeToggle.renderTo(document.body);
      
      expect(themeToggle.config.animationDuration).toBe(500);
    });
  });

  describe('error handling and edge cases', () => {
    test('should handle missing theme manager gracefully', () => {
      themeToggle = new ThemeToggle({ themeManager: null });
      
      expect(() => themeToggle.renderTo(document.body)).not.toThrow();
      expect(themeToggle.themeManager).toBeInstanceOf(ThemeManager);
    });

    test('should handle destroyed theme manager', () => {
      themeManager.init();
      themeToggle = new ThemeToggle({ themeManager: themeManager });
      themeToggle.renderTo(document.body);
      
      themeManager.destroy();
      
      const button = themeToggle.el.querySelector('button') || themeToggle.el;
      expect(() => button.click()).not.toThrow();
    });

    test('should handle multiple rapid clicks', () => {
      themeManager.init();
      themeToggle = new ThemeToggle({ themeManager: themeManager });
      themeToggle.renderTo(document.body);
      
      const button = themeToggle.el.querySelector('button') || themeToggle.el;
      
      // Rapid clicks
      button.click();
      button.click();
      button.click();
      
      expect(themeManager.getCurrentTheme()).toBe('dark');
    });

    test('should handle invalid configuration gracefully', () => {
      expect(() => {
        themeToggle = new ThemeToggle({
          type: 'invalid',
          size: 'invalid',
          themeManager: themeManager
        });
      }).not.toThrow();
    });

    test('should clean up event listeners on destroy', () => {
      themeManager.init();
      themeToggle = new ThemeToggle({ themeManager: themeManager });
      themeToggle.renderTo(document.body);
      
      const removeEventListenerSpy = jest.spyOn(themeToggle.themeManager, 'off');
      
      themeToggle.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe('theming and styling', () => {
    beforeEach(() => {
      themeManager.init();
    });

    test('should apply theme-specific CSS classes', () => {
      themeToggle = new ThemeToggle({ themeManager: themeManager });
      themeToggle.renderTo(document.body);
      
      themeManager.setTheme('dark');
      themeToggle.updateAppearance();
      
      expect(themeToggle.el.classList.contains('theme-toggle-dark')).toBe(true);
      
      themeManager.setTheme('light');
      themeToggle.updateAppearance();
      
      expect(themeToggle.el.classList.contains('theme-toggle-light')).toBe(true);
    });

    test('should support custom theme classes', () => {
      themeToggle = new ThemeToggle({
        themeManager: themeManager,
        themeClasses: {
          light: 'my-light-theme',
          dark: 'my-dark-theme'
        }
      });
      themeToggle.renderTo(document.body);
      
      themeManager.setTheme('dark');
      themeToggle.updateAppearance();
      
      expect(themeToggle.el.classList.contains('my-dark-theme')).toBe(true);
    });
  });
});