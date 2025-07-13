/**
 * Unit tests for Button component
 * Tests button functionality, variants, states, and interactions
 */

import { Button } from '../src/components/Button.js';
import { ThemeTestUtils } from './theme-test-utils.js';

describe('Button', () => {
  let button;

  beforeEach(() => {
    button = null;
  });

  afterEach(() => {
    if (button && !button.destroyed) {
      button.destroy();
    }
    button = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create button with default config', () => {
      button = new Button();

      expect(button.text).toBe('');
      expect(button.icon).toBe('');
      expect(button.iconAlign).toBe('left');
      expect(button.variant).toBe('primary');
      expect(button.size).toBe('md');
      expect(button.outline).toBe(false);
      expect(button.pressed).toBe(false);
      expect(button.loading).toBe(false);
      expect(button.block).toBe(false);
      expect(button.href).toBeUndefined();
      expect(button.target).toBeUndefined();
      expect(button.handler).toBeUndefined();
    });

    test('should create button with custom config', () => {
      const handler = jest.fn();
      const config = {
        text: 'Click Me',
        icon: '🚀',
        iconAlign: 'right',
        variant: 'secondary',
        size: 'lg',
        outline: true,
        pressed: true,
        loading: true,
        block: true,
        href: 'https://example.com',
        target: '_blank',
        handler
      };

      button = new Button(config);

      expect(button.text).toBe('Click Me');
      expect(button.icon).toBe('🚀');
      expect(button.iconAlign).toBe('right');
      expect(button.variant).toBe('secondary');
      expect(button.size).toBe('lg');
      expect(button.outline).toBe(true);
      expect(button.pressed).toBe(true);
      expect(button.loading).toBe(true);
      expect(button.block).toBe(true);
      expect(button.href).toBe('https://example.com');
      expect(button.target).toBe('_blank');
      expect(button.handler).toBe(handler);
    });
  });

  describe('createTemplate()', () => {
    test('should create button element by default', () => {
      button = new Button({ text: 'Test Button' });
      const el = button.render();

      expect(el.tagName.toLowerCase()).toBe('button');
      expect(el.type).toBe('button');
      expect(el.textContent).toContain('Test Button');
    });

    test('should create anchor element when href provided', () => {
      button = new Button({ 
        text: 'Link Button',
        href: 'https://example.com',
        target: '_blank'
      });
      const el = button.render();

      expect(el.tagName.toLowerCase()).toBe('a');
      expect(el.href).toBe('https://example.com/');
      expect(el.target).toBe('_blank');
      expect(el.textContent).toContain('Link Button');
    });

    test('should include aria attributes', () => {
      button = new Button({ 
        pressed: true,
        loading: true
      });
      const el = button.render();

      expect(el.getAttribute('aria-pressed')).toBe('true');
      expect(el.getAttribute('aria-busy')).toBe('true');
    });

    test('should set disabled attribute for disabled buttons', () => {
      button = new Button({ disabled: true });
      const el = button.render();

      expect(el.hasAttribute('disabled')).toBe(true);
    });

    test('should not set disabled attribute for disabled links', () => {
      button = new Button({ 
        disabled: true,
        href: 'https://example.com'
      });
      const el = button.render();

      expect(el.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('getButtonClasses()', () => {
    test('should include base button classes', () => {
      button = new Button();
      const classes = button.getButtonClasses();

      expect(classes).toContain('aionda-button');
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('justify-center');
      expect(classes).toContain('font-medium');
      expect(classes).toContain('transition-all');
      expect(classes).toContain('focus:outline-none');
      expect(classes).toContain('focus:ring-2');
    });

    test('should include size-specific classes', () => {
      const sizeTests = [
        { size: 'xs', expectedClasses: ['px-2.5', 'py-1.5', 'text-xs', 'rounded'] },
        { size: 'sm', expectedClasses: ['px-3', 'py-2', 'text-sm', 'rounded-md'] },
        { size: 'md', expectedClasses: ['px-4', 'py-2', 'text-sm', 'rounded-md'] },
        { size: 'lg', expectedClasses: ['px-4', 'py-2', 'text-base', 'rounded-md'] },
        { size: 'xl', expectedClasses: ['px-6', 'py-3', 'text-base', 'rounded-md'] }
      ];

      sizeTests.forEach(({ size, expectedClasses }) => {
        const testButton = new Button({ size });
        const classes = testButton.getButtonClasses();
        
        expectedClasses.forEach(cls => {
          expect(classes).toContain(cls);
        });

        testButton.destroy();
      });
    });

    test('should include state classes', () => {
      button = new Button({
        pressed: true,
        loading: true,
        block: true,
        disabled: true
      });
      const classes = button.getButtonClasses();

      expect(classes).toContain('aionda-button-pressed');
      expect(classes).toContain('aionda-button-loading');
      expect(classes).toContain('cursor-wait');
      expect(classes).toContain('w-full');
      expect(classes).toContain('opacity-50');
      expect(classes).toContain('cursor-not-allowed');
    });
  });

  describe('variant classes', () => {
    describe('solid variants', () => {
      test('should apply primary variant classes', () => {
        button = new Button({ variant: 'primary', outline: false });
        const classes = button.getSolidVariantClasses();

        expect(classes).toContain('bg-blue-600');
        expect(classes).toContain('text-white');
        expect(classes).toContain('hover:bg-blue-700');
        expect(classes).toContain('focus:ring-blue-500');
      });

      test('should apply all solid variant types', () => {
        const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'light', 'dark'];
        
        variants.forEach(variant => {
          const testButton = new Button({ variant, outline: false });
          const classes = testButton.getSolidVariantClasses();
          
          expect(classes.length).toBeGreaterThan(0);
          expect(classes).toContain('border-transparent');

          testButton.destroy();
        });
      });

      test('should handle unknown variant', () => {
        button = new Button({ variant: 'unknown', outline: false });
        const classes = button.getSolidVariantClasses();

        // Should default to primary
        expect(classes).toContain('bg-blue-600');
      });
    });

    describe('outline variants', () => {
      test('should apply primary outline classes', () => {
        button = new Button({ variant: 'primary', outline: true });
        const classes = button.getOutlineVariantClasses();

        expect(classes).toContain('border');
        expect(classes).toContain('border-blue-600');
        expect(classes).toContain('text-blue-600');
        expect(classes).toContain('bg-transparent');
        expect(classes).toContain('hover:bg-blue-50');
      });

      test('should apply all outline variant types', () => {
        const variants = ['primary', 'secondary', 'success', 'warning', 'danger'];
        
        variants.forEach(variant => {
          const testButton = new Button({ variant, outline: true });
          const classes = testButton.getOutlineVariantClasses();
          
          expect(classes.length).toBeGreaterThan(0);
          expect(classes).toContain('border');
          expect(classes).toContain('bg-transparent');

          testButton.destroy();
        });
      });

      test('should handle unknown outline variant', () => {
        button = new Button({ variant: 'unknown', outline: true });
        const classes = button.getOutlineVariantClasses();

        // Should default to primary
        expect(classes).toContain('border-blue-600');
      });
    });
  });

  describe('content generation', () => {
    test('should display text only', () => {
      button = new Button({ text: 'Text Only' });
      const content = button.getButtonContent();

      expect(content).toContain('Text Only');
      expect(content).toContain('aionda-button-text');
    });

    test('should display icon only', () => {
      button = new Button({ icon: '🚀' });
      const content = button.getButtonContent();

      expect(content).toContain('🚀');
      expect(content).toContain('aionda-button-icon');
      expect(content).not.toContain('aionda-button-text');
    });

    test('should display icon and text (left align)', () => {
      button = new Button({ 
        text: 'Launch',
        icon: '🚀',
        iconAlign: 'left'
      });
      const content = button.getButtonContent();

      expect(content).toContain('🚀');
      expect(content).toContain('Launch');
      expect(content.indexOf('🚀')).toBeLessThan(content.indexOf('Launch'));
    });

    test('should display icon and text (right align)', () => {
      button = new Button({ 
        text: 'Launch',
        icon: '🚀',
        iconAlign: 'right'
      });
      const content = button.getButtonContent();

      expect(content).toContain('🚀');
      expect(content).toContain('Launch');
      expect(content.indexOf('Launch')).toBeLessThan(content.indexOf('🚀'));
    });

    test('should display loading spinner', () => {
      button = new Button({ 
        text: 'Loading',
        loading: true
      });
      const content = button.getButtonContent();

      expect(content).toContain('aionda-button-spinner');
      expect(content).toContain('animate-spin');
      expect(content).toContain('Loading');
    });

    test('should hide icon when loading', () => {
      button = new Button({ 
        text: 'Loading',
        icon: '🚀',
        loading: true
      });
      const content = button.getButtonContent();

      expect(content).toContain('aionda-button-spinner');
      expect(content).not.toContain('🚀');
      expect(content).not.toContain('aionda-button-icon');
    });

    test('should handle empty text and icon', () => {
      button = new Button();
      const content = button.getButtonContent();

      expect(content).toBe('');
    });
  });

  describe('event handling', () => {
    beforeEach(async () => {
      button = new Button({ text: 'Test Button' });
      button.render();
      await testUtils.waitForDOMUpdate();
    });

    test('should emit click event', async () => {
      const clickSpy = jest.fn();
      button.on('click', clickSpy);

      await testUtils.fireClickEvent(button.buttonEl);

      expect(clickSpy).toHaveBeenCalledWith({
        field: button,
        event: expect.any(Event)
      });
    });

    test('should call handler on click', async () => {
      const handler = jest.fn();
      button.handler = handler;

      await testUtils.fireClickEvent(button.buttonEl);

      expect(handler).toHaveBeenCalledWith(button, expect.any(Event));
    });

    test('should prevent click when disabled', async () => {
      const clickSpy = jest.fn();
      const handler = jest.fn();
      
      button.on('click', clickSpy);
      button.handler = handler;
      button.disabled = true;
      await testUtils.waitForDOMUpdate();

      const event = new Event('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      button.buttonEl.dispatchEvent(event);
      await testUtils.waitForDOMUpdate();

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
    });

    test('should prevent click when loading', async () => {
      const clickSpy = jest.fn();
      const handler = jest.fn();
      
      button.on('click', clickSpy);
      button.handler = handler;
      button.loading = true;
      await testUtils.waitForDOMUpdate();

      const event = new Event('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      button.buttonEl.dispatchEvent(event);
      await testUtils.waitForDOMUpdate();

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
    });

    test('should emit focus event', async () => {
      const focusSpy = jest.fn();
      button.on('focus', focusSpy);

      testUtils.fireEvent(button.buttonEl, 'focus');
      await testUtils.waitForDOMUpdate();

      expect(focusSpy).toHaveBeenCalledWith({
        field: button,
        event: expect.any(Event)
      });
    });

    test('should emit blur event', async () => {
      const blurSpy = jest.fn();
      button.on('blur', blurSpy);

      testUtils.fireEvent(button.buttonEl, 'blur');
      await testUtils.waitForDOMUpdate();

      expect(blurSpy).toHaveBeenCalledWith({
        field: button,
        event: expect.any(Event)
      });
    });
  });

  describe('dynamic updates', () => {
    beforeEach(async () => {
      button = new Button({ text: 'Initial Text' });
      button.render();
      await testUtils.waitForDOMUpdate();
    });

    test('should update text', async () => {
      const result = button.setText('New Text');
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(button); // Should return this for chaining
      expect(button.text).toBe('New Text');
      expect(button.buttonEl.textContent).toContain('New Text');
    });

    test('should update icon', async () => {
      const result = button.setIcon('🚀');
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(button); // Should return this for chaining
      expect(button.icon).toBe('🚀');
      expect(button.buttonEl.innerHTML).toContain('🚀');
    });

    test('should update variant', async () => {
      const result = button.setVariant('success');
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(button); // Should return this for chaining
      expect(button.variant).toBe('success');
      expect(button.buttonEl.className).toContain('bg-green-600');
    });

    test('should update size', async () => {
      const result = button.setSize('lg');
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(button); // Should return this for chaining
      expect(button.size).toBe('lg');
      expect(button.buttonEl.className).toContain('text-base');
    });

    test('should update loading state', async () => {
      const result = button.setLoading(true);
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(button); // Should return this for chaining
      expect(button.loading).toBe(true);
      expect(button.buttonEl.innerHTML).toContain('aionda-button-spinner');
      expect(button.buttonEl.className).toContain('aionda-button-loading');
    });

    test('should update pressed state', async () => {
      const result = button.setPressed(true);
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(button); // Should return this for chaining
      expect(button.pressed).toBe(true);
      expect(button.buttonEl.getAttribute('aria-pressed')).toBe('true');
      expect(button.buttonEl.className).toContain('aionda-button-pressed');
    });

    test('should toggle pressed state', async () => {
      expect(button.pressed).toBe(false);

      const result = button.toggle();
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(button); // Should return this for chaining
      expect(button.pressed).toBe(true);

      button.toggle();
      await testUtils.waitForDOMUpdate();
      expect(button.pressed).toBe(false);
    });

    test('should handle updates when not rendered', () => {
      const newButton = new Button();

      expect(() => {
        newButton.setText('Test');
        newButton.setIcon('🚀');
        newButton.setVariant('success');
        newButton.setSize('lg');
        newButton.setLoading(true);
        newButton.setPressed(true);
      }).not.toThrow();

      newButton.destroy();
    });
  });

  describe('focus management', () => {
    beforeEach(async () => {
      button = new Button({ text: 'Focusable Button' });
      await testUtils.renderComponent(button, testUtils.createContainer());
    });

    test('should focus button', async () => {
      const focusSpy = jest.spyOn(button.buttonEl, 'focus');

      const result = button.focus();
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(button); // Should return this for chaining
      expect(focusSpy).toHaveBeenCalled();
    });

    test('should blur button', async () => {
      const blurSpy = jest.spyOn(button.buttonEl, 'blur');

      const result = button.blur();
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(button); // Should return this for chaining
      expect(blurSpy).toHaveBeenCalled();
    });

    test('should handle focus/blur when not rendered', () => {
      const newButton = new Button();

      expect(() => {
        newButton.focus();
        newButton.blur();
      }).not.toThrow();

      newButton.destroy();
    });
  });

  describe('accessibility', () => {
    test('should have proper ARIA attributes', () => {
      button = new Button({
        text: 'Accessible Button',
        pressed: true,
        loading: true
      });
      const el = button.render();

      expect(el.getAttribute('aria-pressed')).toBe('true');
      expect(el.getAttribute('aria-busy')).toBe('true');
    });

    test('should have focus ring classes', () => {
      button = new Button();
      const classes = button.getButtonClasses();

      expect(classes).toContain('focus:outline-none');
      expect(classes).toContain('focus:ring-2');
      expect(classes).toContain('focus:ring-offset-2');
    });

    test('should indicate disabled state visually', () => {
      button = new Button({ disabled: true });
      const el = button.render();

      console.log('Button disabled property:', button.disabled);
      console.log('Element classes:', el.className);
      console.log('Has disabled attribute:', el.hasAttribute('disabled'));

      expect(el.hasAttribute('disabled')).toBe(true);
      expect(el).toHaveClass('opacity-50');
      expect(el).toHaveClass('cursor-not-allowed');
    });
  });

  describe('method chaining', () => {
    test('should support method chaining', async () => {
      button = new Button();
      button.render();
      await testUtils.waitForDOMUpdate();

      const result = button
        .setText('Chained Button')
        .setIcon('🔗')
        .setVariant('success')
        .setSize('lg')
        .setLoading(false)
        .setPressed(false)
        .focus()
        .blur();
      
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(button);
      expect(button.text).toBe('Chained Button');
      expect(button.icon).toBe('🔗');
      expect(button.variant).toBe('success');
      expect(button.size).toBe('lg');
    });
  });

  describe('edge cases', () => {
    test('should handle null/undefined config', () => {
      expect(() => new Button(null)).not.toThrow();
      expect(() => new Button(undefined)).not.toThrow();
    });

    test('should handle empty strings', () => {
      button = new Button({
        text: '',
        icon: '',
        href: ''
      });

      expect(() => button.render()).not.toThrow();
    });

    test('should handle invalid sizes gracefully', () => {
      button = new Button({ size: 'invalid' });
      const classes = button.getButtonClasses();

      // Should still include basic classes but not size-specific ones
      expect(classes).toContain('aionda-button');
    });

    test('should handle href without target', () => {
      button = new Button({ href: 'https://example.com' });
      const el = button.render();

      expect(el.href).toBe('https://example.com/');
      expect(el.hasAttribute('target')).toBe(false);
    });

    test('should handle boolean attributes correctly', () => {
      button = new Button({ 
        pressed: false,
        loading: false
      });
      const el = button.render();

      expect(el.hasAttribute('aria-pressed')).toBe(false);
      expect(el.hasAttribute('aria-busy')).toBe(false);
    });
  });

  describe('responsive behavior', () => {
    test('should handle mobile viewport', () => {
      testUtils.setMobileViewport();
      button = new Button({ text: 'Test Button' });
      const el = button.render();

      expect(window.innerWidth).toBe(320);
      expect(el).toHaveClass('aionda-button');
    });

    test('should handle tablet viewport', () => {
      testUtils.setTabletViewport();
      button = new Button({ text: 'Test Button' });
      const el = button.render();

      expect(window.innerWidth).toBe(768);
      expect(el).toHaveClass('aionda-button');
    });

    test('should handle touch events on mobile', async () => {
      testUtils.setMobileViewport();
      button = new Button({ text: 'Test Button' });
      const el = button.render();
      
      const clickSpy = jest.fn();
      button.on('click', clickSpy);

      // Touch events should trigger click events
      await testUtils.fireClickEvent(el);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      button = new Button({ text: 'Test Button' });
      button.render();
    });

    test('should activate on Enter key', async () => {
      const clickSpy = jest.fn();
      button.on('click', clickSpy);

      await testUtils.fireKeyEvent(button.buttonEl, 'keydown', { key: 'Enter' });

      expect(clickSpy).toHaveBeenCalled();
    });

    test('should activate on Space key', async () => {
      const clickSpy = jest.fn();
      button.on('click', clickSpy);

      await testUtils.fireKeyEvent(button.buttonEl, 'keydown', { key: ' ' });

      expect(clickSpy).toHaveBeenCalled();
    });

    test('should not activate on keyboard when disabled', async () => {
      const clickSpy = jest.fn();
      button.on('click', clickSpy);
      button.disable();

      await testUtils.fireKeyEvent(button.buttonEl, 'keydown', { key: 'Enter' });
      await testUtils.fireKeyEvent(button.buttonEl, 'keydown', { key: ' ' });

      expect(clickSpy).not.toHaveBeenCalled();
    });

    test('should have accessible name from text content', () => {
      const el = button.render();
      const accessibleName = el.textContent.trim() || el.getAttribute('aria-label');
      expect(accessibleName).toBeTruthy();
      expect(accessibleName).toBe('Test Button');
    });

    test('should set aria-label for icon-only buttons', () => {
      button = new Button({ 
        iconCls: 'fa fa-search',
        text: '',
        ariaLabel: 'Search' 
      });
      const el = button.render();
      
      expect(el.getAttribute('aria-label')).toBe('Search');
    });

    test('should set role="button" for link variants', () => {
      button = new Button({ 
        text: 'Link Button',
        href: '#',
        variant: 'link'
      });
      const el = button.render();
      
      expect(el.getAttribute('role')).toBe('button');
    });

    test('should set aria-describedby when description is present', () => {
      button = new Button({ 
        text: 'Button',
        ariaDescription: 'This button does something important'
      });
      const el = button.render();
      
      const ariaDescribedby = el.getAttribute('aria-describedby');
      expect(ariaDescribedby).toBe(`${button.id}-desc`);
    });

    test('should announce loading state to screen readers', () => {
      button.setLoading(true);
      expect(button.buttonEl.getAttribute('aria-busy')).toBe('true');
      
      button.setLoading(false);
      expect(button.buttonEl.hasAttribute('aria-busy')).toBe(false);
    });

    test('should be focusable by default', () => {
      const el = button.render();
      expect(el.getAttribute('tabindex')).toBe('0');
    });

    test('should not be focusable when disabled', () => {
      button.disable();
      expect(button.buttonEl.hasAttribute('disabled')).toBe(true);
      expect(button.buttonEl.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('theme integration', () => {
    let mockThemeManager;
    let scenarios;

    beforeEach(() => {
      scenarios = ThemeTestUtils.createThemeTestScenarios();
      mockThemeManager = ThemeTestUtils.createMockThemeManager();
      ThemeTestUtils.setupThemeTestEnvironment();
    });

    afterEach(() => {
      if (mockThemeManager) {
        mockThemeManager.destroy();
        mockThemeManager = null;
      }
    });

    describe('theme awareness', () => {
      test('should render correctly in light theme environment', () => {
        // Setup light theme environment
        ThemeTestUtils.setupThemeTestEnvironment('light');
        mockThemeManager.setTheme('light');
        
        button = new Button({ 
          text: 'Light Button',
          variant: 'primary'
        });
        button.render();
        
        const classes = button.getButtonClasses();
        
        // Should include light theme specific classes
        expect(classes).toContain('focus:ring-offset-2');
        expect(classes).toContain('dark:focus:ring-offset-gray-800');
        expect(classes).toContain('dark:bg-blue-500');
        expect(classes).toContain('dark:hover:bg-blue-600');
      });

      test('should render correctly in dark theme environment', () => {
        // Setup dark theme environment  
        ThemeTestUtils.setupThemeTestEnvironment('dark');
        mockThemeManager.setTheme('dark');
        
        button = new Button({ 
          text: 'Dark Button',
          variant: 'primary'
        });
        button.render();
        
        const classes = button.getButtonClasses();
        
        // Should include dark theme specific classes
        expect(classes).toContain('dark:bg-blue-500');
        expect(classes).toContain('dark:hover:bg-blue-600');
        expect(classes).toContain('dark:focus:ring-blue-400');
        expect(classes).toContain('dark:active:bg-blue-700');
      });

      test('should handle theme changes without ThemeManager integration', () => {
        button = new Button({ text: 'Theme Aware Button' });
        button.render();
        
        // Component should work in both light and dark environments
        expect(() => {
          ThemeTestUtils.setupThemeTestEnvironment('light');
          button.updateClasses();
        }).not.toThrow();
        
        expect(() => {
          ThemeTestUtils.setupThemeTestEnvironment('dark');
          button.updateClasses();
        }).not.toThrow();
      });
    });

    describe('variant theme styling', () => {
      test('should apply correct dark mode classes for all solid variants', () => {
        const variants = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'light', 'dark'];
        
        variants.forEach(variant => {
          const testButton = new Button({ variant, outline: false });
          const classes = testButton.getSolidVariantClasses();
          
          // All variants should have dark theme support
          expect(classes.some(cls => cls.startsWith('dark:'))).toBe(true);
          
          testButton.destroy();
        });
      });

      test('should apply correct dark mode classes for all outline variants', () => {
        const variants = ['primary', 'secondary', 'success', 'warning', 'danger'];
        
        variants.forEach(variant => {
          const testButton = new Button({ variant, outline: true });
          const classes = testButton.getOutlineVariantClasses();
          
          // All outline variants should have dark theme support
          expect(classes.some(cls => cls.startsWith('dark:'))).toBe(true);
          
          testButton.destroy();
        });
      });

      test('should apply theme-specific primary variant classes', () => {
        button = new Button({ variant: 'primary', outline: false });
        const classes = button.getSolidVariantClasses();
        
        // Light theme classes
        expect(classes).toContain('bg-blue-600');
        expect(classes).toContain('hover:bg-blue-700');
        expect(classes).toContain('focus:ring-blue-500');
        
        // Dark theme classes
        expect(classes).toContain('dark:bg-blue-500');
        expect(classes).toContain('dark:hover:bg-blue-600');
        expect(classes).toContain('dark:focus:ring-blue-400');
      });

      test('should apply theme-specific light variant classes', () => {
        button = new Button({ variant: 'light', outline: false });
        const classes = button.getSolidVariantClasses();
        
        // Light theme classes
        expect(classes).toContain('bg-gray-200');
        expect(classes).toContain('text-gray-900');
        
        // Dark theme classes (inverted)
        expect(classes).toContain('dark:bg-gray-700');
        expect(classes).toContain('dark:text-gray-100');
      });

      test('should apply theme-specific dark variant classes', () => {
        button = new Button({ variant: 'dark', outline: false });
        const classes = button.getSolidVariantClasses();
        
        // Light theme classes
        expect(classes).toContain('bg-gray-800');
        expect(classes).toContain('text-white');
        
        // Dark theme classes (inverted)
        expect(classes).toContain('dark:bg-gray-200');
        expect(classes).toContain('dark:text-gray-900');
      });
    });

    describe('disabled state theme styling', () => {
      test('should apply theme-aware disabled classes', () => {
        button = new Button({ disabled: true });
        const classes = button.getButtonClasses();
        
        // Should include both light and dark disabled styling
        expect(classes).toContain('opacity-50');
        expect(classes).toContain('dark:opacity-40');
        expect(classes).toContain('cursor-not-allowed');
      });

      test('should work correctly when disabled in dark theme', () => {
        ThemeTestUtils.setupThemeTestEnvironment('dark');
        
        button = new Button({ 
          text: 'Disabled Dark Button',
          disabled: true
        });
        const el = button.render();
        
        expect(el.hasAttribute('disabled')).toBe(true);
        expect(el).toHaveClass('opacity-50');
        expect(el).toHaveClass('dark:opacity-40');
      });
    });

    describe('focus ring theme adaptation', () => {
      test('should include dark theme focus ring offset', () => {
        button = new Button({ text: 'Focus Test' });
        const classes = button.getButtonClasses();
        
        expect(classes).toContain('focus:ring-offset-2');
        expect(classes).toContain('dark:focus:ring-offset-gray-800');
      });

      test('should maintain accessibility in both themes', () => {
        ThemeTestUtils.setupThemeTestEnvironment('light');
        button = new Button({ text: 'Light Focus' });
        let el = button.render();
        
        expect(el).toHaveClass('focus:outline-none');
        expect(el).toHaveClass('focus:ring-2');
        
        button.destroy();
        
        ThemeTestUtils.setupThemeTestEnvironment('dark');
        button = new Button({ text: 'Dark Focus' });
        el = button.render();
        
        expect(el).toHaveClass('focus:outline-none');
        expect(el).toHaveClass('focus:ring-2');
        expect(el).toHaveClass('dark:focus:ring-offset-gray-800');
      });
    });

    describe('theme transition handling', () => {
      test('should handle theme switching gracefully', async () => {
        button = new Button({ text: 'Theme Switch Test' });
        button.render();
        
        // Simulate theme change from light to dark
        await ThemeTestUtils.simulateThemeChange(mockThemeManager, 'light', 'dark');
        
        // Button should still be functional
        expect(() => button.updateClasses()).not.toThrow();
        expect(button.buttonEl).toBeTruthy();
      });

      test('should work with destroyed theme manager', () => {
        button = new Button({ text: 'Orphaned Button' });
        button.render();
        
        // Destroy the theme manager (simulating cleanup scenarios)
        mockThemeManager.destroy();
        
        // Button should still function normally
        expect(() => {
          button.setText('Updated Text');
          button.setVariant('success');
          button.setLoading(true);
        }).not.toThrow();
      });
    });

    describe('theme-specific interactions', () => {
      test('should handle clicks correctly in both theme environments', async () => {
        const clickSpy = jest.fn();
        
        // Test in light theme
        ThemeTestUtils.setupThemeTestEnvironment('light');
        button = new Button({ text: 'Light Click' });
        button.on('click', clickSpy);
        button.render();
        
        await testUtils.fireClickEvent(button.buttonEl);
        expect(clickSpy).toHaveBeenCalledTimes(1);
        
        button.destroy();
        
        // Test in dark theme  
        ThemeTestUtils.setupThemeTestEnvironment('dark');
        button = new Button({ text: 'Dark Click' });
        button.on('click', clickSpy);
        button.render();
        
        await testUtils.fireClickEvent(button.buttonEl);
        expect(clickSpy).toHaveBeenCalledTimes(2);
      });

      test('should maintain keyboard accessibility across themes', async () => {
        const clickSpy = jest.fn();
        
        ThemeTestUtils.setupThemeTestEnvironment('dark');
        button = new Button({ text: 'Keyboard Test' });
        button.on('click', clickSpy);
        button.render();
        
        await testUtils.fireKeyEvent(button.buttonEl, 'keydown', { key: 'Enter' });
        expect(clickSpy).toHaveBeenCalled();
        
        await testUtils.fireKeyEvent(button.buttonEl, 'keydown', { key: ' ' });
        expect(clickSpy).toHaveBeenCalledTimes(2);
      });
    });

    describe('responsive theme behavior', () => {
      test('should work correctly in mobile dark theme', () => {
        testUtils.setMobileViewport();
        ThemeTestUtils.setupThemeTestEnvironment('dark');
        
        button = new Button({ text: 'Mobile Dark Button' });
        const el = button.render();
        
        expect(window.innerWidth).toBe(320);
        expect(el).toHaveClass('aionda-button');
        expect(el.className).toContain('dark:');
      });

      test('should handle touch events in dark theme', async () => {
        testUtils.setMobileViewport();
        ThemeTestUtils.setupThemeTestEnvironment('dark');
        
        button = new Button({ text: 'Touch Test' });
        const el = button.render();
        
        const clickSpy = jest.fn();
        button.on('click', clickSpy);
        
        // Touch events should trigger click events  
        await testUtils.fireClickEvent(el);
        
        expect(clickSpy).toHaveBeenCalled();
      });
    });

    describe('system preference integration', () => {
      test('should work with system dark mode preference', () => {
        ThemeTestUtils.mockSystemPreference('dark');
        ThemeTestUtils.setupThemeTestEnvironment('dark');
        
        button = new Button({ text: 'System Dark Button' });
        const el = button.render();
        
        // Button should render correctly regardless of system preference
        expect(el).toHaveClass('aionda-button');
        expect(el.className).toContain('dark:');
      });

      test('should work with system light mode preference', () => {
        ThemeTestUtils.mockSystemPreference('light');
        ThemeTestUtils.setupThemeTestEnvironment('light');
        
        button = new Button({ text: 'System Light Button' });
        const el = button.render();
        
        // Button should render correctly regardless of system preference
        expect(el).toHaveClass('aionda-button');
        expect(el.className).toContain('dark:'); // Still includes dark classes for theme switching
      });
    });

    describe('edge cases and error handling', () => {
      test('should handle invalid theme states gracefully', () => {
        button = new Button({ text: 'Error Test' });
        
        expect(() => {
          // Simulate corrupted theme environment
          document.documentElement.className = 'invalid-theme-class';
          button.render();
        }).not.toThrow();
      });

      test('should work without theme utilities loaded', () => {
        // Temporarily hide theme utilities
        const originalThemeTestUtils = global.ThemeTestUtils;
        delete global.ThemeTestUtils;
        
        button = new Button({ text: 'No Theme Utils' });
        
        expect(() => button.render()).not.toThrow();
        
        // Restore theme utilities
        global.ThemeTestUtils = originalThemeTestUtils;
      });

      test('should handle rapid theme switching', async () => {
        button = new Button({ text: 'Rapid Switch Test' });
        button.render();
        
        // Rapid theme changes
        for (let i = 0; i < 10; i++) {
          const theme = i % 2 === 0 ? 'light' : 'dark';
          ThemeTestUtils.setupThemeTestEnvironment(theme);
          button.updateClasses();
        }
        
        expect(button.buttonEl).toBeTruthy();
        expect(() => button.updateContent()).not.toThrow();
      });
    });
  });
});