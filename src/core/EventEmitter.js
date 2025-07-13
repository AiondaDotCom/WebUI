/**
 * @component EventEmitter
 * @description Event system providing observer pattern functionality with debugging and validation
 * @category Core Components
 * @since 1.0.0
 * @example
 * // Using EventEmitter
 * const emitter = new EventEmitter();
 * emitter.on('dataChange', (data) => console.log(data));
 * emitter.emit('dataChange', { value: 'new data' });
 */
export class EventEmitter {
  /**
   * Creates a new EventEmitter instance
   * @constructor
   */
  constructor() {
    /**
     * Map of event names to listener sets
     * @type {Map<string, Set<Function>>}
     * @private
     */
    this.listeners = new Map();
  }

  /**
   * Adds a listener for the specified event
   * @param {string} event - The event name
   * @param {Function} listener - The listener function
   * @returns {EventEmitter} Returns this for chaining
   * @example
   * emitter.on('data', (data) => console.log(data));
   */
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(listener);
    return this;
  }

  /**
   * Removes a listener for the specified event
   * @param {string} event - The event name
   * @param {Function} listener - The listener function to remove
   * @returns {EventEmitter} Returns this for chaining
   * @example
   * emitter.off('data', myListener);
   */
  off(event, listener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
    return this;
  }

  /**
   * Adds a one-time listener for the specified event
   * @param {string} event - The event name
   * @param {Function} listener - The listener function
   * @returns {EventEmitter} Returns this for chaining
   * @example
   * emitter.once('ready', () => console.log('Ready fired once'));
   */
  once(event, listener) {
    const onceWrapper = (data) => {
      this.off(event, onceWrapper);
      listener(data);
    };
    return this.on(event, onceWrapper);
  }

  /**
   * Emits an event to all registered listeners
   * @param {string} event - The event name to emit
   * @param {*} data - Optional data to pass to listeners
   * @returns {boolean} True if listeners were called, false otherwise
   * @example
   * emitter.emit('data', { message: 'Hello' });
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      // Debug logging for events with no listeners
      if (this.debugMode || (typeof window !== 'undefined' && window.AIONDA_DEBUG)) {
        console.debug(`[EventEmitter] Event '${event}' emitted but no listeners registered`);
      }
      return false;
    }

    const startTime = performance.now ? performance.now() : Date.now();
    let successCount = 0;
    let errorCount = 0;

    eventListeners.forEach(listener => {
      try {
        listener(data);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error in event listener for '${event}':`, error);
        
        // Emit error event if not already emitting an error event (prevent infinite loops)
        if (event !== 'error') {
          this.emit('error', { originalEvent: event, error, data });
        }
      }
    });

    // Performance monitoring
    if (this.debugMode || (typeof window !== 'undefined' && window.AIONDA_DEBUG)) {
      const duration = (performance.now ? performance.now() : Date.now()) - startTime;
      if (duration > 10) { // Warn about slow event processing
        console.warn(`[EventEmitter] Slow event processing for '${event}': ${duration.toFixed(2)}ms`, {
          event,
          listenerCount: eventListeners.size,
          successCount,
          errorCount
        });
      }
    }

    return true;
  }

  /**
   * Removes all listeners for a specific event or all events
   * @param {string} [event] - Optional event name. If not provided, removes all listeners
   * @returns {EventEmitter} Returns this for chaining
   * @example
   * emitter.removeAllListeners('data'); // Remove all 'data' listeners
   * emitter.removeAllListeners(); // Remove all listeners
   */
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }

  /**
   * Returns the number of listeners for a specific event
   * @param {string} event - The event name
   * @returns {number} Number of listeners for the event
   * @example
   * const count = emitter.listenerCount('data');
   */
  listenerCount(event) {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * Returns an array of registered event names
   * @returns {string[]} Array of event names
   * @example
   * const events = emitter.eventNames(); // ['data', 'ready', 'error']
   */
  eventNames() {
    return Array.from(this.listeners.keys());
  }

  /**
   * Enables debug mode for this EventEmitter instance
   * @param {boolean} enabled - Whether to enable debug mode
   * @returns {EventEmitter} Returns this for chaining
   */
  setDebugMode(enabled = true) {
    this.debugMode = enabled;
    return this;
  }

  /**
   * Gets detailed information about this EventEmitter instance
   * @returns {Object} Debug information object
   */
  getDebugInfo() {
    const info = {
      totalEvents: this.listeners.size,
      events: {},
      totalListeners: 0
    };

    this.listeners.forEach((listeners, event) => {
      info.events[event] = {
        listenerCount: listeners.size,
        listeners: Array.from(listeners).map(listener => ({
          name: listener.name || 'anonymous',
          code: listener.toString().substring(0, 100) + (listener.toString().length > 100 ? '...' : '')
        }))
      };
      info.totalListeners += listeners.size;
    });

    return info;
  }

  /**
   * Logs debug information about this EventEmitter to console
   * @returns {Object} Debug information object
   */
  inspect() {
    const info = this.getDebugInfo();
    console.group('🔍 EventEmitter Inspector');
    console.log('📊 Overview:', {
      totalEvents: info.totalEvents,
      totalListeners: info.totalListeners
    });
    
    Object.entries(info.events).forEach(([event, details]) => {
      console.log(`🎧 Event '${event}':`, details);
    });
    
    console.groupEnd();
    return info;
  }

  /**
   * Validates event name and warns about potential issues
   * @param {string} event - Event name to validate
   * @protected
   */
  validateEventName(event) {
    if (typeof event !== 'string') {
      console.warn(`[EventEmitter] Event name should be a string, got ${typeof event}:`, event);
    }
    
    if (event.includes(' ')) {
      console.warn(`[EventEmitter] Event name contains spaces: '${event}'. Consider using camelCase or kebab-case.`);
    }
    
    if (event.length > 50) {
      console.warn(`[EventEmitter] Event name is very long (${event.length} chars): '${event}'. Consider shorter names.`);
    }
  }

  /**
   * Enhanced version of 'on' with validation
   * @param {string} event - The event name
   * @param {Function} listener - The listener function
   * @returns {EventEmitter} Returns this for chaining
   */
  on(event, listener) {
    if (this.debugMode || (typeof window !== 'undefined' && window.AIONDA_DEBUG)) {
      this.validateEventName(event);
      
      if (typeof listener !== 'function') {
        throw new Error(`[EventEmitter] Listener must be a function, got ${typeof listener}`);
      }
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(listener);
    return this;
  }

  /**
   * Enhanced version of 'off' with validation
   * @param {string} event - The event name
   * @param {Function} listener - The listener function to remove
   * @returns {EventEmitter} Returns this for chaining
   */
  off(event, listener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const wasRemoved = eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
      
      if (this.debugMode && !wasRemoved) {
        console.warn(`[EventEmitter] Attempted to remove non-existent listener for event '${event}'`);
      }
    }
    return this;
  }

  /**
   * Removes all listeners with optional event filtering
   * @param {string} [event] - Optional event name. If not provided, removes all listeners
   * @returns {EventEmitter} Returns this for chaining
   */
  removeAllListeners(event) {
    if (event) {
      const hadListeners = this.listeners.has(event);
      this.listeners.delete(event);
      
      if (this.debugMode && hadListeners) {
        console.debug(`[EventEmitter] Removed all listeners for event '${event}'`);
      }
    } else {
      const totalRemoved = this.listeners.size;
      this.listeners.clear();
      
      if (this.debugMode && totalRemoved > 0) {
        console.debug(`[EventEmitter] Removed all listeners for ${totalRemoved} events`);
      }
    }
    return this;
  }
}