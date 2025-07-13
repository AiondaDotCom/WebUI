/**
 * Unit tests for TextField component
 * Tests text input functionality, validation, formatting, and theme integration
 */

import { TextField } from '../src/components/TextField.js';
import { ThemeTestUtils } from './theme-test-utils.js';

describe('TextField', () => {
  let textField;

  beforeEach(() => {
    textField = null;
  });

  afterEach(() => {
    if (textField && !textField.destroyed) {
      textField.destroy();
    }
    textField = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create textfield with default config', () => {
      textField = new TextField();

      expect(textField.name).toBe(textField.id);
      expect(textField.fieldLabel).toBe('');
      expect(textField.value).toBe('');
      expect(textField.placeholder).toBe('');
      expect(textField.inputType).toBe('text');
      expect(textField.allowBlank).toBe(true);
      expect(textField.readOnly).toBe(false);
      expect(textField.labelAlign).toBe('top');
      expect(textField.validators).toEqual([]);
      expect(textField.valid).toBe(true);
    });

    test('should create textfield with custom config', () => {
      const config = {
        name: 'username',
        fieldLabel: 'Username',
        value: 'john_doe',
        placeholder: 'Enter username',
        maxLength: 50,
        allowBlank: false,
        validators: [{ type: 'required' }]
      };

      textField = new TextField(config);

      expect(textField.name).toBe('username');
      expect(textField.fieldLabel).toBe('Username');
      expect(textField.value).toBe('john_doe');
      expect(textField.placeholder).toBe('Enter username');
      expect(textField.maxLength).toBe(50);
      expect(textField.allowBlank).toBe(false);
      expect(textField.validators).toEqual([{ type: 'required' }]);
    });
  });

  describe('rendering', () => {
    test('should render text field with label', () => {
      textField = new TextField({
        fieldLabel: 'Test Field',
        value: 'test value'
      });
      const el = textField.render();

      console.log('Element classes:', el.classList.toString());
      expect(el).toHaveClass('aionda-textfield');
      const input = el.querySelector('input[type="text"]');
      expect(input).not.toBeNull();
      expect(input.value).toBe('test value');
      
      const label = el.querySelector('label');
      expect(label).not.toBeNull();
      expect(label.textContent).toContain('Test Field');
    });

    test('should render without label when not provided', () => {
      textField = new TextField();
      const el = textField.render();

      const label = el.querySelector('label');
      expect(label).toBeNull();
    });

    test('should apply custom input type', () => {
      textField = new TextField({ inputType: 'email' });
      const el = textField.render();
      const input = el.querySelector('input');

      expect(input.type).toBe('email');
    });
  });

  describe('value management', () => {
    beforeEach(async () => {
      textField = new TextField({ value: 'initial' });
      textField.render();
      await testUtils.waitForDOMUpdate();
    });

    test('should get value', () => {
      expect(textField.getValue()).toBe('initial');
    });

    test('should set value', async () => {
      textField.setValue('new value');
      await testUtils.waitForDOMUpdate();

      expect(textField.getValue()).toBe('new value');
      expect(textField.inputEl.value).toBe('new value');
    });

    test('should emit change event on value change', async () => {
      const changeSpy = jest.fn();
      textField.on('change', changeSpy);

      textField.setValue('changed');
      await testUtils.waitForDOMUpdate();

      expect(changeSpy).toHaveBeenCalledWith({
        field: textField.name,
        value: 'changed',
        oldValue: 'initial'
      });
    });
  });

  describe('validation', () => {
    test('should validate required field', async () => {
      textField = new TextField({
        allowBlank: false,
        validators: [{ type: 'required', message: 'Field is required' }]
      });
      textField.render();
      await testUtils.waitForDOMUpdate();

      textField.setValue('');
      await testUtils.waitForDOMUpdate();
      const isValid = textField.validate();

      expect(isValid).toBe(false);
      expect(textField.errorMessage).toBe('Field is required');
    });

    test('should validate email format', async () => {
      textField = new TextField({
        validators: [{ type: 'email', message: 'Invalid email' }]
      });
      textField.render();
      await testUtils.waitForDOMUpdate();

      textField.setValue('invalid-email');
      await testUtils.waitForDOMUpdate();
      expect(textField.validate()).toBe(false);

      textField.setValue('valid@email.com');
      await testUtils.waitForDOMUpdate();
      expect(textField.validate()).toBe(true);
    });

    test('should validate minimum length', async () => {
      textField = new TextField({
        validators: [{ type: 'minLength', min: 5, message: 'Too short' }]
      });
      textField.render();
      await testUtils.waitForDOMUpdate();

      textField.setValue('abc');
      await testUtils.waitForDOMUpdate();
      expect(textField.validate()).toBe(false);

      textField.setValue('abcdef');
      await testUtils.waitForDOMUpdate();
      expect(textField.validate()).toBe(true);
    });

    test('should emit validation events', async () => {
      const validSpy = jest.fn();
      const invalidSpy = jest.fn();
      
      textField = new TextField({
        validators: [{ type: 'required' }]
      });
      textField.render();
      await testUtils.waitForDOMUpdate();
      
      textField.on('valid', validSpy);
      textField.on('invalid', invalidSpy);

      textField.setValue('');
      await testUtils.waitForDOMUpdate();
      textField.validate();
      expect(invalidSpy).toHaveBeenCalled();

      textField.setValue('valid');
      await testUtils.waitForDOMUpdate();
      textField.validate();
      expect(validSpy).toHaveBeenCalled();
    });
  });

  describe('focus management', () => {
    beforeEach(async () => {
      textField = new TextField();
      await testUtils.renderComponent(textField, testUtils.createContainer());
    });

    test('should focus input', async () => {
      const focusSpy = jest.spyOn(textField.inputEl, 'focus');

      textField.focus();
      await testUtils.waitForDOMUpdate();

      expect(focusSpy).toHaveBeenCalled();
    });

    test('should blur input', async () => {
      const blurSpy = jest.spyOn(textField.inputEl, 'blur');

      textField.blur();
      await testUtils.waitForDOMUpdate();

      expect(blurSpy).toHaveBeenCalled();
    });

    test('should emit focus events', async () => {
      const focusSpy = jest.fn();
      textField.on('focus', focusSpy);

      testUtils.fireEvent(textField.inputEl, 'focus');
      await testUtils.waitForDOMUpdate();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    test('should handle null config', () => {
      expect(() => new TextField(null)).not.toThrow();
    });

    test('should handle empty string values', () => {
      textField = new TextField({ value: '' });
      textField.render();

      expect(textField.getValue()).toBe('');
    });

    test('should handle setting null value', () => {
      textField = new TextField();
      textField.render();

      textField.setValue(null);
      expect(textField.getValue()).toBe('');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      textField = new TextField({ fieldLabel: 'Name', name: 'name' });
      textField.render();
    });

    test('should set aria-invalid when validation fails', async () => {
      textField = new TextField({ 
        allowBlank: false,
        validators: [{ type: 'required', message: 'Required field' }]
      });
      textField.render();
      
      textField.setValue('');
      textField.validate();
      
      expect(textField.inputEl.getAttribute('aria-invalid')).toBe('true');
    });

    test('should remove aria-invalid when validation passes', async () => {
      textField = new TextField({ 
        allowBlank: false,
        validators: [{ type: 'required', message: 'Required field' }]
      });
      textField.render();
      
      textField.setValue('');
      textField.validate();
      expect(textField.inputEl.getAttribute('aria-invalid')).toBe('true');
      
      textField.setValue('Valid input');
      textField.validate();
      expect(textField.inputEl.hasAttribute('aria-invalid')).toBe(false);
    });

    test('should associate error messages with aria-describedby', async () => {
      textField = new TextField({ 
        allowBlank: false,
        validators: [{ type: 'required', message: 'This field is required' }]
      });
      textField.render();
      document.body.appendChild(textField.el);
      
      textField.setValue('');
      textField.validate();
      
      const ariaDescribedby = textField.inputEl.getAttribute('aria-describedby');
      expect(ariaDescribedby).toBeTruthy();
      
      const errorElement = document.getElementById(ariaDescribedby);
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toBe('This field is required');
    });

    test('should set aria-required for required fields', () => {
      textField = new TextField({ allowBlank: false });
      const el = textField.render();
      
      expect(textField.inputEl.getAttribute('aria-required')).toBe('true');
    });

    test('should not set aria-required for optional fields', () => {
      textField = new TextField({ allowBlank: true });
      const el = textField.render();
      
      expect(textField.inputEl.hasAttribute('aria-required')).toBe(false);
    });

    test('should associate label with input using for attribute', () => {
      const el = textField.render();
      const label = el.querySelector('label');
      const input = el.querySelector('input');
      
      expect(label.getAttribute('for')).toBe(input.id);
    });

    test('should be focusable by default', () => {
      const el = textField.render();
      expect(textField.inputEl.tabIndex).not.toBe(-1);
    });

    test('should announce live validation errors', async () => {
      textField = new TextField({ 
        allowBlank: false,
        validators: [{ type: 'required', message: 'Required field' }]
      });
      textField.render();
      
      textField.setValue('');
      textField.validate();
      
      const liveRegion = textField.el.querySelector('[aria-live]');
      if (liveRegion) {
        expect(liveRegion.getAttribute('aria-live')).toBe('polite');
      }
    });
  });
});