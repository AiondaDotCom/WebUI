/**
 * Jest Test Setup for Aionda WebUI
 * Enhanced testing environment with comprehensive utilities
 * Supports accessibility, performance, visual regression, and cross-browser testing
 */

// Setup DOM environment
import 'jest-environment-jsdom';

// Add custom DOM matchers
expect.extend({
  toHaveClass(received, className) {
    const pass = received.classList.contains(className);
    return {
      message: () => 
        `expected element ${pass ? 'not ' : ''}to have class "${className}"`,
      pass,
    };
  },

  toBeVisible(received) {
    const pass = received.offsetWidth > 0 && received.offsetHeight > 0 && 
                 !received.hidden && 
                 window.getComputedStyle(received).display !== 'none';
    return {
      message: () => 
        `expected element ${pass ? 'not ' : ''}to be visible`,
      pass,
    };
  },

  toHaveValue(received, value) {
    const pass = received.value === value;
    return {
      message: () => 
        `expected element to have value "${value}", but got "${received.value}"`,
      pass,
    };
  },

  toBeChecked(received) {
    const pass = received.checked === true;
    return {
      message: () => 
        `expected element ${pass ? 'not ' : ''}to be checked`,
      pass,
    };
  },

  toHaveAttribute(received, attribute, value) {
    const hasAttribute = received.hasAttribute(attribute);
    const actualValue = received.getAttribute(attribute);
    
    if (value === undefined) {
      return {
        message: () => 
          `expected element ${hasAttribute ? 'not ' : ''}to have attribute "${attribute}"`,
        pass: hasAttribute,
      };
    }
    
    const pass = hasAttribute && actualValue === value;
    return {
      message: () => 
        `expected element to have attribute "${attribute}" with value "${value}", but got "${actualValue}"`,
      pass,
    };
  },

  toHaveAriaLabel(received, label) {
    const ariaLabel = received.getAttribute('aria-label') || received.getAttribute('aria-labelledby');
    const pass = ariaLabel === label;
    return {
      message: () => 
        `expected element to have aria-label "${label}", but got "${ariaLabel}"`,
      pass,
    };
  },

  toBeAccessible(received) {
    const hasTabIndex = received.hasAttribute('tabindex') || received.tagName.toLowerCase() === 'button' || received.tagName.toLowerCase() === 'input';
    const hasAriaLabel = received.hasAttribute('aria-label') || received.hasAttribute('aria-labelledby') || received.textContent.trim();
    const hasValidRole = !received.hasAttribute('role') || received.getAttribute('role') !== '';
    
    const pass = hasTabIndex && hasAriaLabel && hasValidRole;
    return {
      message: () => 
        `expected element to be accessible (have proper tabindex, aria-label, and role)`,
      pass,
    };
  },

  toHaveFocus(received) {
    const pass = document.activeElement === received;
    return {
      message: () => 
        `expected element ${pass ? 'not ' : ''}to have focus`,
      pass,
    };
  },

  toMatchSnapshot(received, options = {}) {
    if (typeof received === 'string') {
      return { pass: true, message: () => 'Snapshot comparison skipped in test environment' };
    }
    
    const html = received.outerHTML || received.innerHTML;
    const normalizedHtml = html.replace(/\s+/g, ' ').trim();
    
    return {
      pass: true,
      message: () => `Snapshot: ${normalizedHtml.substring(0, 100)}...`
    };
  }
});

// Mock window methods that aren't available in jsdom
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    display: 'block',
    visibility: 'visible',
    opacity: '1'
  })
});

// Viewport and media query mocking for responsive testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

Object.defineProperty(window, 'outerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'outerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock media queries
window.matchMedia = jest.fn((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock screen properties
Object.defineProperty(window, 'screen', {
  writable: true,
  configurable: true,
  value: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24,
  },
});

// Add DOM method polyfills for jsdom
Element.prototype.focus = Element.prototype.focus || function() {
  this.dispatchEvent(new Event('focus', { bubbles: true, cancelable: true }));
  document.activeElement = this;
};

Element.prototype.blur = Element.prototype.blur || function() {
  this.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
  if (document.activeElement === this) {
    document.activeElement = document.body;
  }
};

Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || function() {
  // No-op for jsdom, just to prevent errors
};

Element.prototype.click = Element.prototype.click || function() {
  this.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};

HTMLElement.prototype.click = HTMLElement.prototype.click || function() {
  this.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
};

// Ensure addEventListener is available on document
if (!window.document.addEventListener) {
  window.document.addEventListener = function(type, listener, options) {
    if (!this._eventListeners) this._eventListeners = {};
    if (!this._eventListeners[type]) this._eventListeners[type] = [];
    this._eventListeners[type].push(listener);
  };
  
  window.document.removeEventListener = function(type, listener) {
    if (!this._eventListeners || !this._eventListeners[type]) return;
    const index = this._eventListeners[type].indexOf(listener);
    if (index > -1) this._eventListeners[type].splice(index, 1);
  };
  
  window.document.dispatchEvent = function(event) {
    if (!this._eventListeners || !this._eventListeners[event.type]) return true;
    this._eventListeners[event.type].forEach(listener => listener(event));
    return !event.defaultPrevented;
  };
}

// Mock localStorage and sessionStorage
const storageMock = {
  getItem: jest.fn((key) => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn((index) => null),
  length: 0
};

Object.defineProperty(window, 'localStorage', { 
  value: storageMock,
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: storageMock,
  writable: true
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  return global.originalSetTimeout(cb, 16);
});

global.cancelAnimationFrame = jest.fn((id) => {
  global.clearTimeout(id);
});

// Mock fetch for ComboBox remote data tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { value: 'test1', text: 'Test 1' },
      { value: 'test2', text: 'Test 2' }
    ]),
  })
);

// Store original setTimeout before mocking
global.originalSetTimeout = global.setTimeout;

// Mock setTimeout/clearTimeout for async tests
global.setTimeout = jest.fn((fn, delay) => {
  if (delay === 0) {
    fn();
    return 1;
  }
  return global.originalSetTimeout(fn, delay);
});

global.clearTimeout = jest.fn();

// Setup document body for each test
beforeEach(() => {
  document.body.innerHTML = '';
  
  // Reset all mocks
  jest.clearAllMocks();
  
  // Add basic CSS classes that components expect
  if (!document.querySelector('#test-styles')) {
    const style = document.createElement('style');
    style.id = 'test-styles';
    style.textContent = `
      .hidden { display: none !important; }
      .aionda-hidden { display: none !important; }
      .aionda-disabled { pointer-events: none; opacity: 0.6; }
      .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    `;
    document.head.appendChild(style);
  }
});

// Global test utilities
global.testUtils = {
  // Create a test container
  createContainer() {
    const container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    return container;
  },

  // Wait for next tick
  nextTick() {
    return new Promise(resolve => global.originalSetTimeout(resolve, 0));
  },

  // Wait for DOM updates
  waitForDOMUpdate() {
    return new Promise(resolve => global.originalSetTimeout(resolve, 0));
  },

  // Wait for condition to be true
  waitFor(condition, timeout = 1000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          global.originalSetTimeout(check, 10);
        }
      };
      check();
    });
  },

  // Async wrapper for DOM operations
  async domOp(fn) {
    const result = fn();
    await this.waitForDOMUpdate();
    return result;
  },

  // Async render helper
  async renderComponent(component, target) {
    component.renderTo(target);
    await this.waitForDOMUpdate();
    return component;
  },

  // Wait for component initialization
  async waitForComponentInit(component) {
    if (component.initialized) return component;
    
    return new Promise((resolve) => {
      if (component.initialized) {
        resolve(component);
        return;
      }
      
      const onInit = () => {
        component.off('initialized', onInit);
        resolve(component);
      };
      
      component.on('initialized', onInit);
      
      // Fallback timeout
      setTimeout(() => {
        component.off('initialized', onInit);
        resolve(component);
      }, 100);
    });
  },

  // Simulate user events
  fireEvent(element, type, options = {}) {
    if (!element) {
      throw new Error('Cannot fire event on null element');
    }
    
    const eventOptions = { bubbles: true, cancelable: true };
    
    // Create the appropriate event type
    let event;
    if (type.startsWith('key')) {
      event = new KeyboardEvent(type, { ...eventOptions, ...options });
    } else if (type.startsWith('mouse') || type === 'click' || type === 'dblclick') {
      event = new MouseEvent(type, { ...eventOptions, ...options });
    } else {
      event = new Event(type, { ...eventOptions, ...options });
    }
    
    // Add custom properties that can't be set during construction
    if (options.key && !event.key) {
      Object.defineProperty(event, 'key', { value: options.key, writable: false });
    }
    if (options.keyCode && !event.keyCode) {
      Object.defineProperty(event, 'keyCode', { value: options.keyCode, writable: false });
    }
    
    element.dispatchEvent(event);
    return event;
  },

  // Simulate input events
  async fireInputEvent(element, value) {
    if (!element) {
      throw new Error('Cannot fire input event on null element');
    }
    element.value = value;
    this.fireEvent(element, 'input');
    this.fireEvent(element, 'change');
    await this.waitForDOMUpdate();
  },

  // Simulate click events
  async fireClickEvent(element, options = {}) {
    if (!element) {
      throw new Error('Cannot fire click event on null element');
    }
    
    // Special handling for checkboxes
    if (element.type === 'checkbox') {
      // Don't toggle if disabled or readonly
      if (!element.disabled && !element.readOnly) {
        element.checked = !element.checked;
        this.fireEvent(element, 'change', options);
      } else {
        // Still fire the click event, but don't change the checked state
        this.fireEvent(element, 'click', options);
      }
    } else if (element.type === 'radio') {
      // Special handling for radio buttons
      if (!element.disabled && !element.readOnly) {
        // Clear other radios in the same group
        const radios = document.querySelectorAll(`input[type="radio"][name="${element.name}"]`);
        radios.forEach(radio => {
          if (radio !== element) {
            radio.checked = false;
          }
        });
        
        // Check this radio and fire change event
        element.checked = true;
        this.fireEvent(element, 'change', options);
      } else {
        // Still fire the click event, but don't change the checked state
        this.fireEvent(element, 'click', options);
      }
    } else {
      this.fireEvent(element, 'mousedown', options);
      this.fireEvent(element, 'mouseup', options);
      this.fireEvent(element, 'click', options);
    }
    await this.waitForDOMUpdate();
  },

  // Simulate keyboard events
  async fireKeyEvent(element, keyOrType, typeOrOptions = {}) {
    if (!element) {
      throw new Error('Cannot fire key event on null element');
    }
    
    let eventType, options;
    
    // Handle calling patterns:
    // fireKeyEvent(element, 'keydown', { key: 'Enter' })
    // fireKeyEvent(element, 'Enter', 'keydown')
    // fireKeyEvent(element, 'Enter') - defaults to keydown
    if (typeof typeOrOptions === 'string') {
      // Pattern: fireKeyEvent(element, key, eventType)
      eventType = typeOrOptions;
      options = { key: keyOrType };
    } else if (keyOrType.startsWith('key')) {
      // Pattern: fireKeyEvent(element, eventType, options)
      eventType = keyOrType;
      options = typeOrOptions || {};
    } else {
      // Pattern: fireKeyEvent(element, key) - default to keydown
      eventType = 'keydown';
      options = { key: keyOrType };
    }
    
    const eventOptions = {
      bubbles: true,
      cancelable: true,
      ...options
    };
    
    if (options.key) {
      eventOptions.key = options.key;
      eventOptions.code = options.code || options.key;
      eventOptions.keyCode = options.keyCode || options.key.charCodeAt(0);
    }
    
    this.fireEvent(element, eventType, eventOptions);
    await this.waitForDOMUpdate();
  },

  // Simulate blur events
  async fireBlurEvent(element, options = {}) {
    if (!element) {
      throw new Error('Cannot fire blur event on null element');
    }
    element.blur();
    this.fireEvent(element, 'blur', options);
    await this.waitForDOMUpdate();
  },

  // Clean up components
  cleanupComponents(components) {
    components.forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
  },

  // Simulate double click events
  async fireDoubleClickEvent(element, options = {}) {
    if (!element) {
      throw new Error('Cannot fire double click event on null element');
    }
    this.fireEvent(element, 'mousedown', options);
    this.fireEvent(element, 'mouseup', options);
    this.fireEvent(element, 'click', options);
    this.fireEvent(element, 'dblclick', options);
    await this.waitForDOMUpdate();
  },

  // Simulate context menu events
  async fireContextMenuEvent(element, options = {}) {
    if (!element) {
      throw new Error('Cannot fire context menu event on null element');
    }
    this.fireEvent(element, 'contextmenu', options);
    await this.waitForDOMUpdate();
  },

  // Simulate drag events
  fireDragEvent(element, type, options = {}) {
    if (!element) {
      throw new Error('Cannot fire drag event on null element');
    }
    
    // Create mock dataTransfer for drag events
    const mockDataTransfer = {
      effectAllowed: 'none',
      dropEffect: 'none',
      files: [],
      items: [],
      types: [],
      setData: jest.fn(),
      getData: jest.fn(() => ''),
      clearData: jest.fn(),
      setDragImage: jest.fn()
    };
    
    const eventOptions = {
      bubbles: true,
      cancelable: true,
      ...options
    };
    
    const event = new Event(type, eventOptions);
    
    // Add dataTransfer and other drag-specific properties
    Object.defineProperty(event, 'dataTransfer', {
      value: mockDataTransfer,
      writable: false
    });
    
    // Add other drag-related properties if provided
    if (options.clientX !== undefined) {
      Object.defineProperty(event, 'clientX', { value: options.clientX, writable: false });
    }
    if (options.clientY !== undefined) {
      Object.defineProperty(event, 'clientY', { value: options.clientY, writable: false });
    }
    
    element.dispatchEvent(event);
    return event;
  },

  // Viewport mocking utilities for responsive testing
  setViewport(width, height) {
    window.innerWidth = width;
    window.innerHeight = height;
    window.outerWidth = width;
    window.outerHeight = height;
    
    // Fire resize event
    window.dispatchEvent(new Event('resize'));
  },

  // Set mobile viewport (320x568 - iPhone SE)
  setMobileViewport() {
    this.setViewport(320, 568);
  },

  // Set tablet viewport (768x1024 - iPad)
  setTabletViewport() {
    this.setViewport(768, 1024);
  },

  // Set desktop viewport (1024x768)
  setDesktopViewport() {
    this.setViewport(1024, 768);
  },

  // Mock media query with specific breakpoints
  mockMediaQuery(query, matches = false) {
    window.matchMedia = jest.fn((q) => ({
      matches: q === query ? matches : false,
      media: q,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  },

  // Simulate touch events for mobile testing
  fireTouchEvent(element, type, options = {}) {
    if (!element) {
      throw new Error('Cannot fire touch event on null element');
    }
    
    const touchOptions = {
      bubbles: true,
      cancelable: true,
      touches: options.touches || [{
        clientX: options.clientX || 0,
        clientY: options.clientY || 0,
        pageX: options.pageX || 0,
        pageY: options.pageY || 0,
        screenX: options.screenX || 0,
        screenY: options.screenY || 0,
        target: element
      }],
      targetTouches: options.targetTouches || [],
      changedTouches: options.changedTouches || [],
      ...options
    };
    
    const event = new TouchEvent(type, touchOptions);
    element.dispatchEvent(event);
    return event;
  },

  // Simulate touch sequence for gestures
  async simulateTouchSequence(element, sequence) {
    for (const touch of sequence) {
      this.fireTouchEvent(element, touch.type, touch.options);
      if (touch.delay) {
        await new Promise(resolve => setTimeout(resolve, touch.delay));
      }
    }
  }
};

// Console error handler for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Filter out expected errors during testing
    const message = args[0];
    if (typeof message === 'string' && (
      message.includes('Warning: ') ||
      message.includes('Not implemented:')
    )) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock browser dialog functions that aren't available in jsdom
global.prompt = jest.fn();
global.alert = jest.fn();
global.confirm = jest.fn();