/**
 * Unit tests for NumberField component
 * Tests numeric input functionality, formatting, and validation
 */

import { NumberField } from '../src/components/NumberField.js';

describe('NumberField', () => {
  let numberField;

  beforeEach(() => {
    numberField = null;
  });

  afterEach(() => {
    if (numberField && !numberField.destroyed) {
      if (numberField) numberField.destroy();
    }
    numberField = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create numberfield with default config', () => {
      numberField = new NumberField();

      expect(numberField.minValue).toBeUndefined();
      expect(numberField.maxValue).toBeUndefined();
      expect(numberField.step).toBe(1);
      expect(numberField.allowDecimals).toBe(true);
      expect(numberField.decimalPrecision).toBe(2);
      expect(numberField.thousandSeparator).toBe('');
      expect(numberField.decimalSeparator).toBe('.');
      expect(numberField.currencySymbol).toBe('');
    });

    test('should create numberfield with custom config', () => {
      const config = {
        minValue: 0,
        maxValue: 100,
        step: 5,
        allowDecimals: false,
        currencySymbol: '$',
        thousandSeparator: ','
      };

      numberField = new NumberField(config);

      expect(numberField.minValue).toBe(0);
      expect(numberField.maxValue).toBe(100);
      expect(numberField.step).toBe(5);
      expect(numberField.allowDecimals).toBe(false);
      expect(numberField.currencySymbol).toBe('$');
      expect(numberField.thousandSeparator).toBe(',');
    });
  });

  describe('rendering', () => {
    test('should render number field with spinners', () => {
      numberField = new NumberField({
        fieldLabel: 'Age',
        value: 25,
        minValue: 0,
        maxValue: 120
      });
      const el = numberField.render();

      expect(el).toHaveClass('aionda-numberfield');
      const input = el.querySelector('input[type="number"]');
      expect(input).not.toBeNull();
      expect(input.value).toBe('25');
      
      const label = el.querySelector('label');
      expect(label.textContent).toContain('Age');
    });

    test('should include spinner buttons when enabled', () => {
      numberField = new NumberField({ spinners: true });
      const el = numberField.render();

      const upBtn = el.querySelector('.aionda-numberfield-spinner-up');
      const downBtn = el.querySelector('.aionda-numberfield-spinner-down');
      
      expect(upBtn).not.toBeNull();
      expect(downBtn).not.toBeNull();
    });
  });

  describe('value management', () => {
    beforeEach(async () => {
      numberField = new NumberField({ value: 10 });
      numberField.render();
      await testUtils.waitForDOMUpdate();
    });

    test('should get numeric value', () => {
      expect(numberField.getValue()).toBe(10);
    });

    test('should set numeric value', async () => {
      numberField.setValue(42);
      await testUtils.waitForDOMUpdate();

      expect(numberField.getValue()).toBe(42);
      expect(numberField.inputEl.value).toBe('42');
    });

    test('should handle string values', async () => {
      numberField.setValue('25');
      await testUtils.waitForDOMUpdate();

      expect(numberField.getValue()).toBe(25);
    });

    test('should handle invalid values', async () => {
      numberField.setValue('abc');
      await testUtils.waitForDOMUpdate();

      expect(numberField.getValue()).toBeNaN();
    });
  });

  describe('validation', () => {
    test('should validate minimum value', async () => {
      numberField = new NumberField({ minValue: 10 });
      numberField.render();
      await testUtils.waitForDOMUpdate();

      numberField.setValue(5);
      await testUtils.waitForDOMUpdate();
      expect(numberField.validate()).toBe(false);

      numberField.setValue(15);
      await testUtils.waitForDOMUpdate();
      expect(numberField.validate()).toBe(true);
    });

    test('should validate maximum value', async () => {
      numberField = new NumberField({ maxValue: 100 });
      numberField.render();
      await testUtils.waitForDOMUpdate();

      numberField.setValue(150);
      await testUtils.waitForDOMUpdate();
      expect(numberField.validate()).toBe(false);

      numberField.setValue(50);
      await testUtils.waitForDOMUpdate();
      expect(numberField.validate()).toBe(true);
    });

    test('should validate decimal precision', async () => {
      numberField = new NumberField({ 
        allowDecimals: true,
        decimalPrecision: 2
      });
      numberField.render();
      await testUtils.waitForDOMUpdate();

      numberField.setValue(10.123);
      await testUtils.waitForDOMUpdate();
      expect(numberField.getValue()).toBe(10.12); // Rounded to 2 decimals
    });

    test('should reject decimals when not allowed', async () => {
      numberField = new NumberField({ allowDecimals: false });
      numberField.render();
      await testUtils.waitForDOMUpdate();

      numberField.setValue(10.5);
      await testUtils.waitForDOMUpdate();
      expect(numberField.getValue()).toBe(10); // Truncated
    });
  });

  describe('formatting', () => {
    test('should format with currency symbol', () => {
      numberField = new NumberField({
        currencySymbol: '$',
        value: 1000
      });
      const el = numberField.render();

      expect(el.textContent).toContain('$');
    });

    test('should format with thousand separators', () => {
      numberField = new NumberField({
        thousandSeparator: ',',
        value: 1000000
      });
      numberField.render();

      const formatted = numberField.getFormattedValue();
      expect(formatted).toBe('1,000,000');
    });
  });

  describe('spinner functionality', () => {
    beforeEach(async () => {
      numberField = new NumberField({
        value: 10,
        step: 5,
        spinners: true
      });
      numberField.render();
      await testUtils.waitForDOMUpdate();
    });

    test('should increment value on up button click', async () => {
      const upBtn = numberField.el.querySelector('.aionda-numberfield-spinner-up');
      
      await testUtils.fireClickEvent(upBtn);

      expect(numberField.getValue()).toBe(15);
    });

    test('should decrement value on down button click', async () => {
      const downBtn = numberField.el.querySelector('.aionda-numberfield-spinner-down');
      
      await testUtils.fireClickEvent(downBtn);

      expect(numberField.getValue()).toBe(5);
    });

    test('should respect min/max values with spinners', async () => {
      if (numberField) numberField.destroy();
      numberField = new NumberField({
        value: 10,
        minValue: 0,
        maxValue: 12,
        step: 5,
        spinners: true
      });
      numberField.render();
      await testUtils.waitForDOMUpdate();

      const upBtn = numberField.el.querySelector('.aionda-numberfield-spinner-up');
      const downBtn = numberField.el.querySelector('.aionda-numberfield-spinner-down');

      // Test max value
      await testUtils.fireClickEvent(upBtn);
      expect(numberField.getValue()).toBe(12); // Clamped to max

      // Test min value
      numberField.setValue(2);
      await testUtils.waitForDOMUpdate();
      await testUtils.fireClickEvent(downBtn);
      expect(numberField.getValue()).toBe(0); // Clamped to min
    });
  });

  describe('keyboard events', () => {
    beforeEach(async () => {
      numberField = new NumberField({ value: 10, step: 1 });
      await testUtils.renderComponent(numberField, testUtils.createContainer());
    });

    test('should increment on arrow up key', async () => {
      await testUtils.fireKeyEvent(numberField.inputEl, 'ArrowUp');

      expect(numberField.getValue()).toBe(11);
    });

    test('should decrement on arrow down key', async () => {
      await testUtils.fireKeyEvent(numberField.inputEl, 'ArrowDown');

      expect(numberField.getValue()).toBe(9);
    });
  });

  describe('formatting functionality', () => {
    test('should call formatValue on blur', () => {
      if (numberField) numberField.destroy();
      numberField = new NumberField({
        value: 1234,
        currencySymbol: '$'
      });
      numberField.render();
      document.body.appendChild(numberField.el);

      const formatSpy = jest.spyOn(numberField, 'formatValue');
      numberField.onBlur(new Event('blur'));
      
      expect(formatSpy).toHaveBeenCalled();
      formatSpy.mockRestore();
    });

    test('should call showRawValue on focus', () => {
      if (numberField) numberField.destroy();
      numberField = new NumberField({
        value: 1234.56
      });
      numberField.render();
      document.body.appendChild(numberField.el);

      const showRawSpy = jest.spyOn(numberField, 'showRawValue');
      numberField.onFocus(new Event('focus'));
      
      expect(showRawSpy).toHaveBeenCalled();
      showRawSpy.mockRestore();
    });

    test('should have formatting configuration options', () => {
      if (numberField) numberField.destroy();
      numberField = new NumberField({
        value: 1234.56,
        currencySymbol: '€',
        thousandSeparator: ',',
        decimalSeparator: '.',
        decimalPrecision: 2
      });
      
      expect(numberField.currencySymbol).toBe('€');
      expect(numberField.thousandSeparator).toBe(',');
      expect(numberField.decimalSeparator).toBe('.');
      expect(numberField.decimalPrecision).toBe(2);
    });

    test('should handle custom number format function', () => {
      const customFormat = jest.fn(val => `#${val}#`);
      
      if (numberField) numberField.destroy();
      numberField = new NumberField({
        value: 123,
        numberFormat: customFormat
      });
      
      expect(numberField.numberFormat).toBe(customFormat);
    });

    test('should handle empty value formatting', () => {
      if (numberField) numberField.destroy();
      numberField = new NumberField({
        value: null,
        currencySymbol: '$'
      });
      numberField.render();
      document.body.appendChild(numberField.el);
      
      // Test that formatValue handles null gracefully
      expect(() => numberField.formatValue()).not.toThrow();
    });
  });

  describe('mouse wheel support', () => {
    test('should increment on wheel up when focused', () => {
      if (numberField) numberField.destroy();
      numberField = new NumberField({
        value: 10,
        step: 5
      });
      numberField.render();
      document.body.appendChild(numberField.el);
      
      numberField.hasFocus = true;
      const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
      wheelEvent.preventDefault = jest.fn();
      numberField.onMouseWheel(wheelEvent);
      
      expect(numberField.getValue()).toBe(15);
    });

    test('should decrement on wheel down when focused', () => {
      if (numberField) numberField.destroy();
      numberField = new NumberField({
        value: 10,
        step: 5
      });
      numberField.render();
      document.body.appendChild(numberField.el);
      
      numberField.hasFocus = true;
      const wheelEvent = new WheelEvent('wheel', { deltaY: 100 });
      wheelEvent.preventDefault = jest.fn();
      numberField.onMouseWheel(wheelEvent);
      
      expect(numberField.getValue()).toBe(5);
    });

    test('should not respond to wheel when not focused', () => {
      if (numberField) numberField.destroy();
      numberField = new NumberField({
        value: 10,
        step: 5
      });
      numberField.render();
      document.body.appendChild(numberField.el);
      
      numberField.hasFocus = false;
      const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
      wheelEvent.preventDefault = jest.fn();
      numberField.onMouseWheel(wheelEvent);
      
      expect(numberField.getValue()).toBe(10); // No change
    });

    test('should not respond to wheel when readonly or disabled', () => {
      if (numberField) numberField.destroy();
      numberField = new NumberField({
        value: 10,
        step: 5,
        readOnly: true
      });
      numberField.render();
      document.body.appendChild(numberField.el);
      
      numberField.hasFocus = true;
      const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
      wheelEvent.preventDefault = jest.fn();
      numberField.onMouseWheel(wheelEvent);
      
      expect(numberField.getValue()).toBe(10); // No change
    });
  });

  describe('edge cases', () => {
    test('should handle null config', () => {
      expect(() => new NumberField(null)).not.toThrow();
    });

    test('should handle zero values', () => {
      numberField = new NumberField({ value: 0 });
      numberField.render();

      expect(numberField.getValue()).toBe(0);
    });

    test('should handle negative values', () => {
      numberField = new NumberField({ value: -10 });
      numberField.render();

      expect(numberField.getValue()).toBe(-10);
    });

    test('should handle very large numbers', () => {
      numberField = new NumberField({ value: Number.MAX_SAFE_INTEGER });
      numberField.render();

      expect(numberField.getValue()).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('should maintain rawValue as 0 when reset', () => {
      numberField = new NumberField({ value: 123 });
      numberField.render();
      numberField.rawValue = null;
      expect(numberField.getValue()).toBe(0); // Should return 0 instead of NaN
    });
  });
});