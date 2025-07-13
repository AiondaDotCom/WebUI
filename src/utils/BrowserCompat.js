/**
 * Browser Compatibility Utilities and Polyfills
 * Ensures Aionda WebUI works across different browsers
 */

/**
 * Browser detection utilities
 */
export const BrowserDetect = {
  // Detect IE 11 and earlier
  isIE: () => {
    return navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1;
  },

  // Detect old Edge (EdgeHTML)
  isOldEdge: () => {
    return navigator.userAgent.indexOf('Edge') !== -1 && navigator.userAgent.indexOf('Edg') === -1;
  },

  // Detect Safari
  isSafari: () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },

  // Detect Firefox
  isFirefox: () => {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  },

  // Check if browser supports modern features
  supportsModernFeatures: () => {
    return (
      typeof Map !== 'undefined' &&
      typeof Set !== 'undefined' &&
      typeof Promise !== 'undefined' &&
      typeof Array.from !== 'undefined'
    );
  }
};

/**
 * Polyfills for older browsers
 */
export class Polyfills {
  static init() {
    this.polyfillClosest();
    this.polyfillMatches();
    this.polyfillRemove();
    this.polyfillCustomEvents();
    this.polyfillObjectAssign();
    this.polyfillArrayFrom();
    this.polyfillArrayIncludes();
    this.polyfillStringIncludes();
    this.polyfillScrollIntoView();
    this.polyfillIntersectionObserver();
    this.polyfillPromise();
    this.polyfillFetch();
  }

  // Polyfill Element.closest() for IE
  static polyfillClosest() {
    if (!Element.prototype.closest) {
      Element.prototype.closest = function(selector) {
        let element = this;
        while (element && element.nodeType === 1) {
          if (element.matches(selector)) {
            return element;
          }
          element = element.parentElement || element.parentNode;
        }
        return null;
      };
    }
  }

  // Polyfill Element.matches() for IE
  static polyfillMatches() {
    if (!Element.prototype.matches) {
      Element.prototype.matches = 
        Element.prototype.matchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function(selector) {
          const matches = (this.document || this.ownerDocument).querySelectorAll(selector);
          let i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {}
          return i > -1;
        };
    }
  }

  // Polyfill Element.remove() for IE
  static polyfillRemove() {
    if (!Element.prototype.remove) {
      Element.prototype.remove = function() {
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
      };
    }
  }

  // Polyfill CustomEvent for IE
  static polyfillCustomEvents() {
    if (typeof window.CustomEvent !== 'function') {
      function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      }
      CustomEvent.prototype = window.Event.prototype;
      window.CustomEvent = CustomEvent;
    }
  }

  // Polyfill Object.assign() for IE
  static polyfillObjectAssign() {
    if (typeof Object.assign !== 'function') {
      Object.assign = function(target, varArgs) {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        const to = Object(target);
        for (let index = 1; index < arguments.length; index++) {
          const nextSource = arguments[index];
          if (nextSource != null) {
            for (const nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      };
    }
  }

  // Polyfill Array.from() for IE
  static polyfillArrayFrom() {
    if (!Array.from) {
      Array.from = function(arrayLike, mapFn, thisArg) {
        const C = this;
        const items = Object(arrayLike);
        if (arrayLike == null) {
          throw new TypeError('Array.from requires an array-like object - not null or undefined');
        }
        const mapFunction = mapFn === undefined ? undefined : mapFn;
        if (typeof mapFunction !== 'undefined' && typeof mapFunction !== 'function') {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        const len = parseInt(items.length);
        const A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
        let k = 0;
        while (k < len) {
          const kValue = items[k];
          const mappedValue = typeof mapFunction === 'undefined' ? kValue : mapFunction.call(thisArg, kValue, k);
          A[k] = mappedValue;
          k += 1;
        }
        A.length = len;
        return A;
      };
    }
  }

  // Polyfill Array.includes() for IE
  static polyfillArrayIncludes() {
    if (!Array.prototype.includes) {
      Array.prototype.includes = function(searchElement, fromIndex) {
        const o = Object(this);
        const len = parseInt(o.length) || 0;
        if (len === 0) return false;
        const n = parseInt(fromIndex) || 0;
        let k;
        if (n >= 0) {
          k = n;
        } else {
          k = len + n;
          if (k < 0) {k = 0;}
        }
        function sameValueZero(x, y) {
          return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }
        for (; k < len; k++) {
          if (sameValueZero(o[k], searchElement)) {
            return true;
          }
        }
        return false;
      };
    }
  }

  // Polyfill String.includes() for IE
  static polyfillStringIncludes() {
    if (!String.prototype.includes) {
      String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
          start = 0;
        }
        if (start + search.length > this.length) {
          return false;
        } else {
          return this.indexOf(search, start) !== -1;
        }
      };
    }
  }

  // Polyfill smooth scrollIntoView for older browsers
  static polyfillScrollIntoView() {
    if (!Element.prototype.scrollIntoView || BrowserDetect.isIE() || BrowserDetect.isOldEdge()) {
      Element.prototype.scrollIntoView = function(options) {
        const element = this;
        const container = element.offsetParent || document.documentElement;
        
        if (typeof options === 'boolean') {
          options = { block: options ? 'start' : 'end' };
        }
        options = options || { block: 'start' };
        
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        let scrollTop = container.scrollTop;
        
        if (options.block === 'start') {
          scrollTop = elementRect.top - containerRect.top + container.scrollTop;
        } else if (options.block === 'end') {
          scrollTop = elementRect.bottom - containerRect.bottom + container.scrollTop;
        } else if (options.block === 'nearest') {
          if (elementRect.top < containerRect.top) {
            scrollTop = elementRect.top - containerRect.top + container.scrollTop;
          } else if (elementRect.bottom > containerRect.bottom) {
            scrollTop = elementRect.bottom - containerRect.bottom + container.scrollTop;
          }
        }
        
        container.scrollTop = scrollTop;
      };
    }
  }

  // Polyfill IntersectionObserver for older browsers
  static polyfillIntersectionObserver() {
    if (!window.IntersectionObserver) {
      window.IntersectionObserver = class {
        constructor(callback, options = {}) {
          this.callback = callback;
          this.options = options;
          this.observedElements = new Set();
        }
        
        observe(element) {
          this.observedElements.add(element);
          // Fallback: just call callback immediately
          setTimeout(() => {
            this.callback([{
              target: element,
              isIntersecting: true,
              intersectionRatio: 1,
              boundingClientRect: element.getBoundingClientRect(),
              intersectionRect: element.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now()
            }]);
          }, 0);
        }
        
        unobserve(element) {
          this.observedElements.delete(element);
        }
        
        disconnect() {
          this.observedElements.clear();
        }
      };
    }
  }

  // Basic Promise polyfill for very old browsers
  static polyfillPromise() {
    if (typeof Promise === 'undefined') {
      window.Promise = class {
        constructor(executor) {
          this.state = 'pending';
          this.value = undefined;
          this.handlers = [];
          
          const resolve = (value) => {
            if (this.state === 'pending') {
              this.state = 'fulfilled';
              this.value = value;
              this.handlers.forEach(handler => handler.onFulfilled(value));
            }
          };
          
          const reject = (reason) => {
            if (this.state === 'pending') {
              this.state = 'rejected';
              this.value = reason;
              this.handlers.forEach(handler => handler.onRejected(reason));
            }
          };
          
          try {
            executor(resolve, reject);
          } catch (error) {
            reject(error);
          }
        }
        
        then(onFulfilled, onRejected) {
          return new Promise((resolve, reject) => {
            const handler = {
              onFulfilled: (value) => {
                try {
                  const result = onFulfilled ? onFulfilled(value) : value;
                  resolve(result);
                } catch (error) {
                  reject(error);
                }
              },
              onRejected: (reason) => {
                try {
                  const result = onRejected ? onRejected(reason) : reason;
                  reject(result);
                } catch (error) {
                  reject(error);
                }
              }
            };
            
            if (this.state === 'fulfilled') {
              setTimeout(() => handler.onFulfilled(this.value), 0);
            } else if (this.state === 'rejected') {
              setTimeout(() => handler.onRejected(this.value), 0);
            } else {
              this.handlers.push(handler);
            }
          });
        }
        
        catch(onRejected) {
          return this.then(null, onRejected);
        }
        
        static resolve(value) {
          return new Promise(resolve => resolve(value));
        }
        
        static reject(reason) {
          return new Promise((resolve, reject) => reject(reason));
        }
      };
    }
  }

  // Basic fetch polyfill for older browsers
  static polyfillFetch() {
    if (!window.fetch) {
      window.fetch = function(url, options = {}) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const method = options.method || 'GET';
          
          xhr.open(method, url);
          
          // Set headers
          if (options.headers) {
            Object.keys(options.headers).forEach(key => {
              xhr.setRequestHeader(key, options.headers[key]);
            });
          }
          
          xhr.onload = () => {
            const response = {
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Map(),
              text: () => Promise.resolve(xhr.responseText),
              json: () => Promise.resolve(JSON.parse(xhr.responseText))
            };
            resolve(response);
          };
          
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.ontimeout = () => reject(new Error('Request timeout'));
          
          xhr.send(options.body);
        });
      };
    }
  }
}

/**
 * CSS compatibility utilities
 */
export class CSSCompat {
  static init() {
    this.addVendorPrefixes();
    this.fixFlexbox();
    this.fixGrid();
    this.addCompatibilityClasses();
  }

  // Add vendor prefixes for CSS properties
  static addVendorPrefixes() {
    const style = document.createElement('style');
    style.textContent = `
      /* Transform prefixes */
      .transform-none {
        -webkit-transform: none;
        -moz-transform: none;
        -ms-transform: none;
        transform: none;
      }
      
      /* Transition prefixes */
      .transition-all {
        -webkit-transition: all 0.15s ease-in-out;
        -moz-transition: all 0.15s ease-in-out;
        -ms-transition: all 0.15s ease-in-out;
        transition: all 0.15s ease-in-out;
      }
      
      /* Box shadow prefixes */
      .shadow-lg {
        -webkit-box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        -moz-box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
      
      /* User select prefixes */
      .select-none {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Fix flexbox issues in older browsers
  static fixFlexbox() {
    if (BrowserDetect.isIE()) {
      const style = document.createElement('style');
      style.textContent = `
        /* IE flexbox fixes */
        .flex {
          display: -ms-flexbox;
          display: flex;
        }
        
        .flex-1 {
          -ms-flex: 1 1 0%;
          flex: 1 1 0%;
        }
        
        .items-center {
          -ms-flex-align: center;
          align-items: center;
        }
        
        .justify-center {
          -ms-flex-pack: center;
          justify-content: center;
        }
        
        .justify-between {
          -ms-flex-pack: justify;
          justify-content: space-between;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Fix CSS Grid issues in older browsers
  static fixGrid() {
    if (BrowserDetect.isIE() || BrowserDetect.isOldEdge()) {
      const style = document.createElement('style');
      style.textContent = `
        /* CSS Grid fallbacks for IE/old Edge */
        .grid {
          display: -ms-grid;
          display: grid;
        }
        
        /* Use flexbox as fallback for grid layouts */
        .grid-fallback {
          display: flex;
          flex-wrap: wrap;
        }
        
        .grid-fallback > * {
          flex: 1 1 auto;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Add browser-specific compatibility classes
  static addCompatibilityClasses() {
    const html = document.documentElement;
    
    if (BrowserDetect.isIE()) {
      html.classList.add('browser-ie');
    }
    
    if (BrowserDetect.isOldEdge()) {
      html.classList.add('browser-old-edge');
    }
    
    if (BrowserDetect.isSafari()) {
      html.classList.add('browser-safari');
    }
    
    if (BrowserDetect.isFirefox()) {
      html.classList.add('browser-firefox');
    }
  }
}

/**
 * Event compatibility utilities
 */
export class EventCompat {
  // Get event with cross-browser compatibility
  static getEvent(event) {
    return event || window.event;
  }

  // Get event target with cross-browser compatibility
  static getTarget(event) {
    return event.target || event.srcElement;
  }

  // Prevent default with cross-browser compatibility
  static preventDefault(event) {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  }

  // Stop propagation with cross-browser compatibility
  static stopPropagation(event) {
    if (event.stopPropagation) {
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
  }

  // Add event listener with cross-browser compatibility
  static addEventListener(element, event, handler, useCapture = false) {
    if (element.addEventListener) {
      element.addEventListener(event, handler, useCapture);
    } else if (element.attachEvent) {
      element.attachEvent('on' + event, handler);
    } else {
      element['on' + event] = handler;
    }
  }

  // Remove event listener with cross-browser compatibility
  static removeEventListener(element, event, handler, useCapture = false) {
    if (element.removeEventListener) {
      element.removeEventListener(event, handler, useCapture);
    } else if (element.detachEvent) {
      element.detachEvent('on' + event, handler);
    } else {
      element['on' + event] = null;
    }
  }
}

/**
 * DOM compatibility utilities
 */
export class DOMCompat {
  // Get computed style with cross-browser compatibility
  static getComputedStyle(element, property) {
    if (window.getComputedStyle) {
      return window.getComputedStyle(element)[property];
    } else if (element.currentStyle) {
      return element.currentStyle[property];
    }
    return null;
  }

  // Set CSS property with vendor prefixes
  static setStyle(element, property, value) {
    const prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];
    
    prefixes.forEach(prefix => {
      const prefixedProperty = prefix + property;
      if (prefixedProperty in element.style) {
        element.style[prefixedProperty] = value;
      }
    });
  }

  // Get element offset with cross-browser compatibility
  static getOffset(element) {
    let top = 0;
    let left = 0;
    
    while (element) {
      top += element.offsetTop || 0;
      left += element.offsetLeft || 0;
      element = element.offsetParent;
    }
    
    return { top, left };
  }

  // Check if element contains another element
  static contains(parent, child) {
    if (parent.contains) {
      return parent.contains(child);
    } else {
      // Fallback for older browsers
      while (child) {
        if (child === parent) {
          return true;
        }
        child = child.parentNode;
      }
      return false;
    }
  }
}

/**
 * Initialize all compatibility fixes
 */
export function initBrowserCompat() {
  // Only run once
  if (window.aiondaBrowserCompatInitialized) {
    return;
  }
  
  try {
    Polyfills.init();
    CSSCompat.init();
    
    // Mark as initialized
    window.aiondaBrowserCompatInitialized = true;
    
    console.log('Aionda WebUI: Browser compatibility initialized');
  } catch (error) {
    console.warn('Aionda WebUI: Browser compatibility initialization failed:', error);
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrowserCompat);
  } else {
    initBrowserCompat();
  }
}