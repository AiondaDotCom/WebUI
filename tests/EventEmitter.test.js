/**
 * Unit tests for EventEmitter
 * Tests the core event system functionality
 */

import { EventEmitter } from '../src/core/EventEmitter.js';

describe('EventEmitter', () => {
  let emitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  afterEach(() => {
    emitter = null;
  });

  describe('constructor', () => {
    test('should create empty listeners map', () => {
      expect(emitter.listeners).toBeInstanceOf(Map);
      expect(emitter.listeners.size).toBe(0);
    });
  });

  describe('on()', () => {
    test('should add event listener', () => {
      const listener = jest.fn();
      const result = emitter.on('test', listener);

      expect(result).toBe(emitter); // Should return this for chaining
      expect(emitter.listenerCount('test')).toBe(1);
    });

    test('should add multiple listeners for same event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      expect(emitter.listenerCount('test')).toBe(2);
    });

    test('should add listeners for different events', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('event1', listener1);
      emitter.on('event2', listener2);

      expect(emitter.listenerCount('event1')).toBe(1);
      expect(emitter.listenerCount('event2')).toBe(1);
      expect(emitter.eventNames()).toEqual(['event1', 'event2']);
    });
  });

  describe('emit()', () => {
    test('should call listeners when event is emitted', () => {
      const listener = jest.fn();
      emitter.on('test', listener);

      const result = emitter.emit('test', 'data');

      expect(result).toBe(true);
      expect(listener).toHaveBeenCalledWith('data');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('should call all listeners for an event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      emitter.emit('test', 'data');

      expect(listener1).toHaveBeenCalledWith('data');
      expect(listener2).toHaveBeenCalledWith('data');
    });

    test('should return false when no listeners exist', () => {
      const result = emitter.emit('nonexistent');
      expect(result).toBe(false);
    });

    test('should handle listener errors gracefully', () => {
      const errorListener = jest.fn(() => {
        throw new Error('Test error');
      });
      const goodListener = jest.fn();

      emitter.on('test', errorListener);
      emitter.on('test', goodListener);

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = emitter.emit('test', 'data');

      expect(result).toBe(true);
      expect(errorListener).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error in event listener for 'test':",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('off()', () => {
    test('should remove specific listener', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('test', listener1);
      emitter.on('test', listener2);

      const result = emitter.off('test', listener1);

      expect(result).toBe(emitter); // Should return this for chaining
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.emit('test', 'data');
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    test('should remove event from map when no listeners remain', () => {
      const listener = jest.fn();

      emitter.on('test', listener);
      emitter.off('test', listener);

      expect(emitter.listeners.has('test')).toBe(false);
      expect(emitter.listenerCount('test')).toBe(0);
    });

    test('should handle removing non-existent listener gracefully', () => {
      const listener = jest.fn();

      expect(() => emitter.off('nonexistent', listener)).not.toThrow();
      expect(() => emitter.off('test', listener)).not.toThrow();
    });
  });

  describe('once()', () => {
    test('should call listener only once', () => {
      const listener = jest.fn();

      const result = emitter.once('test', listener);

      expect(result).toBe(emitter); // Should return this for chaining

      emitter.emit('test', 'data1');
      emitter.emit('test', 'data2');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('data1');
    });

    test('should remove listener after first call', () => {
      const listener = jest.fn();

      emitter.once('test', listener);
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.emit('test', 'data');
      expect(emitter.listenerCount('test')).toBe(0);
    });
  });

  describe('removeAllListeners()', () => {
    test('should remove all listeners for specific event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.on('test1', listener1);
      emitter.on('test1', listener2);
      emitter.on('test2', listener1);

      const result = emitter.removeAllListeners('test1');

      expect(result).toBe(emitter); // Should return this for chaining
      expect(emitter.listenerCount('test1')).toBe(0);
      expect(emitter.listenerCount('test2')).toBe(1);
    });

    test('should remove all listeners for all events when no event specified', () => {
      const listener = jest.fn();

      emitter.on('test1', listener);
      emitter.on('test2', listener);

      emitter.removeAllListeners();

      expect(emitter.listenerCount('test1')).toBe(0);
      expect(emitter.listenerCount('test2')).toBe(0);
      expect(emitter.eventNames()).toEqual([]);
    });
  });

  describe('listenerCount()', () => {
    test('should return correct count of listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      expect(emitter.listenerCount('test')).toBe(0);

      emitter.on('test', listener1);
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.on('test', listener2);
      expect(emitter.listenerCount('test')).toBe(2);

      emitter.off('test', listener1);
      expect(emitter.listenerCount('test')).toBe(1);
    });

    test('should return 0 for non-existent event', () => {
      expect(emitter.listenerCount('nonexistent')).toBe(0);
    });
  });

  describe('eventNames()', () => {
    test('should return array of event names', () => {
      const listener = jest.fn();

      expect(emitter.eventNames()).toEqual([]);

      emitter.on('event1', listener);
      emitter.on('event2', listener);

      const names = emitter.eventNames();
      expect(names).toContain('event1');
      expect(names).toContain('event2');
      expect(names.length).toBe(2);
    });

    test('should not include events with no listeners', () => {
      const listener = jest.fn();

      emitter.on('test', listener);
      emitter.off('test', listener);

      expect(emitter.eventNames()).toEqual([]);
    });
  });

  describe('method chaining', () => {
    test('should support method chaining', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const result = emitter
        .on('event1', listener1)
        .on('event2', listener2)
        .removeAllListeners('event1')
        .off('event2', listener2);

      expect(result).toBe(emitter);
      expect(emitter.eventNames()).toEqual([]);
    });
  });

  describe('edge cases', () => {
    test('should handle same listener added multiple times', () => {
      const listener = jest.fn();

      emitter.on('test', listener);
      emitter.on('test', listener); // Same listener again

      // Set should prevent duplicates
      expect(emitter.listenerCount('test')).toBe(1);

      emitter.emit('test', 'data');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('should handle undefined/null data in emit', () => {
      const listener = jest.fn();

      emitter.on('test', listener);

      emitter.emit('test', undefined);
      expect(listener).toHaveBeenCalledWith(undefined);

      emitter.emit('test', null);
      expect(listener).toHaveBeenCalledWith(null);

      emitter.emit('test'); // No data
      expect(listener).toHaveBeenCalledWith(undefined);
    });
  });
});