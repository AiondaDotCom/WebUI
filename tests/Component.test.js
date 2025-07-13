/**
 * Unit tests for Component base class
 * Tests the core component functionality
 */

import { Component } from '../src/core/Component.js';

// Test implementation of Component for testing
class TestComponent extends Component {
  createTemplate() {
    return '<div class="test-component">Test Content</div>';
  }
}

// Component with custom event listeners
class TestComponentWithEvents extends Component {
  createTemplate() {
    return '<button class="test-button">Click me</button>';
  }

  setupEventListeners() {
    if (this.el) {
      this.el.addEventListener('click', () => {
        this.emit('clicked');
      });
    }
  }
}

describe('Component', () => {
  let component;

  beforeEach(() => {
    component = null;
    // Note: Component ID counter increments globally, so we'll work with incrementing IDs
  });

  afterEach(() => {
    if (component && !component.destroyed) {
      component.destroy();
    }
    component = null;
    // Clean up any leftover DOM elements
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create component with default config', () => {
      component = new TestComponent();

      expect(component.id).toMatch(/^aionda-component-\d+$/);
      expect(component.cls).toBe('');
      expect(component.width).toBeUndefined();
      expect(component.height).toBeUndefined();
      expect(component.hidden).toBe(false);
      expect(component.disabled).toBe(false);
      expect(component.responsive).toBe(true);
      expect(component.style).toEqual({});
      expect(component.el).toBeNull();
      expect(component.rendered).toBe(false);
      expect(component.destroyed).toBe(false);
    });

    test('should create component with custom config', () => {
      const config = {
        id: 'custom-id',
        cls: 'custom-class another-class',
        width: 300,
        height: '200px',
        hidden: true,
        disabled: true,
        responsive: false,
        style: { backgroundColor: 'red' }
      };

      component = new TestComponent(config);

      expect(component.id).toBe('custom-id');
      expect(component.cls).toBe('custom-class another-class');
      expect(component.width).toBe(300);
      expect(component.height).toBe('200px');
      expect(component.hidden).toBe(true);
      expect(component.disabled).toBe(true);
      expect(component.responsive).toBe(false);
      expect(component.style).toEqual({ backgroundColor: 'red' });
    });

    test('should auto-render when renderTo provided', async () => {
      const container = testUtils.createContainer();
      
      component = new TestComponent({ renderTo: container });

      // Auto-render happens with setTimeout, so we need to wait
      await testUtils.nextTick();
      
      expect(component.isRendered()).toBe(true);
      expect(container.children.length).toBe(1);
      expect(container.firstElementChild).toBe(component.getEl());
    });
  });

  describe('generateId()', () => {
    test('should generate unique IDs', () => {
      const component1 = new TestComponent();
      const component2 = new TestComponent();

      expect(component1.id).not.toBe(component2.id);
      expect(component1.id).toMatch(/^aionda-component-\d+$/);
      expect(component2.id).toMatch(/^aionda-component-\d+$/);

      component1.destroy();
      component2.destroy();
    });
  });

  describe('getBaseClasses()', () => {
    test('should return base classes', () => {
      component = new TestComponent();
      const classes = component.getBaseClasses();

      expect(classes).toContain('aionda-component');
      expect(classes).toContain('aionda-responsive');
    });

    test('should include custom classes', () => {
      component = new TestComponent({ cls: 'custom-class another-class' });
      const classes = component.getBaseClasses();

      expect(classes).toContain('aionda-component');
      expect(classes).toContain('custom-class');
      expect(classes).toContain('another-class');
    });

    test('should include state classes', () => {
      component = new TestComponent({ 
        hidden: true, 
        disabled: true,
        responsive: false 
      });
      const classes = component.getBaseClasses();

      expect(classes).toContain('aionda-component');
      expect(classes).toContain('aionda-hidden');
      expect(classes).toContain('aionda-disabled');
      expect(classes).not.toContain('aionda-responsive');
    });

    test('should filter empty classes', () => {
      component = new TestComponent({ cls: 'valid-class  another-valid' });
      const classes = component.getBaseClasses();

      expect(classes).toContain('valid-class');
      expect(classes).toContain('another-valid');
      expect(classes).not.toContain('');
    });
  });

  describe('render()', () => {
    test('should render component', () => {
      component = new TestComponent();
      const el = component.render();

      expect(el).toBeInstanceOf(HTMLElement);
      expect(el.id).toBe(component.id);
      expect(el).toHaveClass('aionda-component');
      expect(el).toHaveClass('test-component');
      expect(el.textContent).toBe('Test Content');
      expect(component.isRendered()).toBe(true);
      expect(component.getEl()).toBe(el);
    });

    test('should apply styles during render', () => {
      component = new TestComponent({
        width: 300,
        height: '200px',
        style: { backgroundColor: 'red', color: 'white' }
      });

      const el = component.render();

      expect(el.style.width).toBe('300px');
      expect(el.style.height).toBe('200px');
      expect(el.style.backgroundColor).toBe('red');
      expect(el.style.color).toBe('white');
    });

    test('should emit render event', () => {
      component = new TestComponent();
      const renderSpy = jest.fn();
      component.on('render', renderSpy);

      component.render();

      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    test('should return same element on subsequent renders', () => {
      component = new TestComponent();
      const el1 = component.render();
      const el2 = component.render();

      expect(el1).toBe(el2);
    });

    test('should throw error when destroyed', () => {
      component = new TestComponent();
      component.destroy();

      expect(() => component.render()).toThrow('Cannot render destroyed component');
    });

    test('should throw error when template returns invalid HTML', () => {
      class InvalidComponent extends Component {
        createTemplate() {
          return ''; // Invalid - empty string
        }
      }

      component = new InvalidComponent();
      expect(() => component.render()).toThrow('Component template must return a valid HTML element');
    });
  });

  describe('renderTo()', () => {
    test('should render to DOM element', () => {
      const container = testUtils.createContainer();
      component = new TestComponent();

      const el = component.renderTo(container);

      expect(container.children.length).toBe(1);
      expect(container.firstElementChild).toBe(el);
      expect(component.isRendered()).toBe(true);
    });

    test('should render to CSS selector', () => {
      const container = testUtils.createContainer();
      component = new TestComponent();

      const el = component.renderTo('#test-container');

      expect(container.children.length).toBe(1);
      expect(container.firstElementChild).toBe(el);
    });

    test('should throw error for invalid target', () => {
      component = new TestComponent();

      expect(() => component.renderTo('#nonexistent')).toThrow('Render target not found: #nonexistent');
      expect(() => component.renderTo(null)).toThrow('Render target not found: null');
    });
  });

  describe('createTemplate()', () => {
    test('should throw error in base class', () => {
      component = new Component();
      expect(() => component.createTemplate()).toThrow('createTemplate() must be implemented by subclass');
    });
  });

  describe('show/hide', () => {
    beforeEach(() => {
      component = new TestComponent({ hidden: true });
      component.render();
    });

    test('should show component', () => {
      const showSpy = jest.fn();
      component.on('show', showSpy);

      const result = component.show();

      expect(result).toBe(component); // Should return this for chaining
      expect(component.hidden).toBe(false);
      expect(component.getEl()).not.toHaveClass('aionda-hidden');
      expect(showSpy).toHaveBeenCalledTimes(1);
    });

    test('should hide component', () => {
      component.show(); // First show it
      const hideSpy = jest.fn();
      component.on('hide', hideSpy);

      const result = component.hide();

      expect(result).toBe(component); // Should return this for chaining
      expect(component.hidden).toBe(true);
      expect(component.getEl()).toHaveClass('aionda-hidden');
      expect(hideSpy).toHaveBeenCalledTimes(1);
    });

    test('should work when not rendered', () => {
      const newComponent = new TestComponent();
      
      expect(() => newComponent.show()).not.toThrow();
      expect(() => newComponent.hide()).not.toThrow();
      expect(newComponent.hidden).toBe(true);

      newComponent.destroy();
    });
  });

  describe('enable/disable', () => {
    beforeEach(() => {
      component = new TestComponent({ disabled: true });
      component.render();
    });

    test('should enable component', () => {
      const result = component.enable();

      expect(result).toBe(component); // Should return this for chaining
      expect(component.disabled).toBe(false);
      expect(component.getEl()).not.toHaveClass('aionda-disabled');
    });

    test('should disable component', () => {
      component.enable(); // First enable it
      const result = component.disable();

      expect(result).toBe(component); // Should return this for chaining
      expect(component.disabled).toBe(true);
      expect(component.getEl()).toHaveClass('aionda-disabled');
    });

    test('should work when not rendered', () => {
      const newComponent = new TestComponent();
      
      expect(() => newComponent.enable()).not.toThrow();
      expect(() => newComponent.disable()).not.toThrow();
      expect(newComponent.disabled).toBe(true);

      newComponent.destroy();
    });
  });

  describe('CSS class methods', () => {
    beforeEach(() => {
      component = new TestComponent();
      component.render();
    });

    test('should add CSS class', () => {
      const result = component.addClass('new-class');

      expect(result).toBe(component); // Should return this for chaining
      expect(component.getEl()).toHaveClass('new-class');
    });

    test('should remove CSS class', () => {
      component.addClass('temp-class');
      const result = component.removeClass('temp-class');

      expect(result).toBe(component); // Should return this for chaining
      expect(component.getEl()).not.toHaveClass('temp-class');
    });

    test('should check if has CSS class', () => {
      expect(component.hasClass('aionda-component')).toBe(true);
      expect(component.hasClass('nonexistent-class')).toBe(false);

      component.addClass('test-class');
      expect(component.hasClass('test-class')).toBe(true);
    });

    test('should work when not rendered', () => {
      const newComponent = new TestComponent();
      
      expect(() => newComponent.addClass('test')).not.toThrow();
      expect(() => newComponent.removeClass('test')).not.toThrow();
      expect(newComponent.hasClass('test')).toBe(false);

      newComponent.destroy();
    });
  });

  describe('destroy()', () => {
    test('should destroy component', () => {
      const container = testUtils.createContainer();
      component = new TestComponent();
      component.renderTo(container);

      const destroySpy = jest.fn();
      component.on('destroy', destroySpy);

      component.destroy();

      expect(component.destroyed).toBe(true);
      expect(component.isRendered()).toBe(false);
      expect(component.getEl()).toBeNull();
      expect(container.children.length).toBe(0);
      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    test('should remove all event listeners', () => {
      component = new TestComponent();
      const listener = jest.fn();
      component.on('test', listener);

      expect(component.listenerCount('test')).toBe(1);

      component.destroy();

      expect(component.listenerCount('test')).toBe(0);
    });

    test('should be safe to call multiple times', () => {
      component = new TestComponent();
      component.render();

      expect(() => {
        component.destroy();
        component.destroy();
        component.destroy();
      }).not.toThrow();

      expect(component.destroyed).toBe(true);
    });

    test('should work when not rendered', () => {
      component = new TestComponent();

      expect(() => component.destroy()).not.toThrow();
      expect(component.destroyed).toBe(true);
    });
  });

  describe('setupEventListeners()', () => {
    test('should setup custom event listeners', () => {
      component = new TestComponentWithEvents();
      component.render();

      const clickSpy = jest.fn();
      component.on('clicked', clickSpy);

      testUtils.fireClickEvent(component.getEl());

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('state methods', () => {
    beforeEach(() => {
      component = new TestComponent();
    });

    test('should track destroyed state', () => {
      expect(component.destroyed).toBe(false);
      component.destroy();
      expect(component.destroyed).toBe(true);
    });

    test('should track rendered state', () => {
      expect(component.isRendered()).toBe(false);
      component.render();
      expect(component.isRendered()).toBe(true);
      component.destroy();
      expect(component.isRendered()).toBe(false);
    });
  });

  describe('method chaining', () => {
    test('should support method chaining', () => {
      component = new TestComponent();
      component.render();

      const result = component
        .show()
        .enable()
        .addClass('chained-class')
        .removeClass('chained-class')
        .hide()
        .disable();

      expect(result).toBe(component);
      expect(component.hidden).toBe(true);
      expect(component.disabled).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle null/undefined config', () => {
      expect(() => new TestComponent(null)).not.toThrow();
      expect(() => new TestComponent(undefined)).not.toThrow();
    });

    test('should handle width and height as strings', () => {
      component = new TestComponent({
        width: '50%',
        height: 'auto'
      });

      component.render();

      expect(component.getEl().style.width).toBe('50%');
      expect(component.getEl().style.height).toBe('auto');
    });

    test('should handle empty style object', () => {
      component = new TestComponent({ style: {} });
      
      expect(() => component.render()).not.toThrow();
    });
  });
});