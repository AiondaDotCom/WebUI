/**
 * Unit tests for Radio component
 * Tests individual radio button functionality and behavior
 */

import { Radio } from '../src/components/Radio.js';

describe('Radio', () => {
  let radio;

  beforeEach(() => {
    radio = null;
  });

  afterEach(() => {
    if (radio && !radio.destroyed) {
      radio.destroy();
    }
    radio = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create radio with default config', () => {
      radio = new Radio();

      expect(radio.checked).toBe(false);
      expect(radio.boxLabel).toBe('');
      expect(radio.name).toBe(radio.id);
      expect(radio.inputValue).toBe('on');
      expect(radio.uncheckedValue).toBe('');
      expect(radio.size).toBe('md');
      expect(radio.readOnly).toBe(false);
      expect(radio.allowBlank).toBe(true);
    });

    test('should create radio with custom config', () => {
      const config = {
        name: 'gender',
        boxLabel: 'Male',
        checked: true,
        inputValue: 'male',
        uncheckedValue: 'none',
        size: 'lg',
        readOnly: true,
        allowBlank: false
      };

      radio = new Radio(config);

      expect(radio.name).toBe('gender');
      expect(radio.boxLabel).toBe('Male');
      expect(radio.checked).toBe(true);
      expect(radio.inputValue).toBe('male');
      expect(radio.uncheckedValue).toBe('none');
      expect(radio.size).toBe('lg');
      expect(radio.readOnly).toBe(true);
      expect(radio.allowBlank).toBe(false);
    });

    test('should handle null config', () => {
      expect(() => new Radio(null)).not.toThrow();
    });
  });

  describe('rendering', () => {
    test('should render radio button', () => {
      radio = new Radio({
        boxLabel: 'Select me',
        checked: true
      });
      const el = radio.render();

      expect(el).toHaveClass('aionda-radio');
      
      const input = el.querySelector('input[type="radio"]');
      expect(input).not.toBeNull();
      expect(input.checked).toBe(true);
      
      const label = el.querySelector('label');
      expect(label.textContent).toContain('Select me');
    });

    test('should render with field label', () => {
      radio = new Radio({
        fieldLabel: 'Gender',
        boxLabel: 'Female'
      });
      const el = radio.render();

      const fieldLabel = el.querySelector('.aionda-field-label');
      expect(fieldLabel.textContent).toContain('Gender');
      
      const boxLabel = el.querySelector('.aionda-radio-label');
      expect(boxLabel.textContent).toContain('Female');
    });

    test('should render different sizes', () => {
      const sizes = ['sm', 'md', 'lg'];
      
      sizes.forEach(size => {
        const testRadio = new Radio({ size });
        const el = testRadio.render();
        
        expect(el).toHaveClass(`aionda-radio-${size}`);
        
        testRadio.destroy();
      });
    });

    test('should apply custom CSS classes', () => {
      radio = new Radio({
        radioCls: 'custom-radio-class',
        cls: 'custom-component-class'
      });
      const el = radio.render();

      expect(el).toHaveClass('custom-component-class');
      const input = el.querySelector('input[type="radio"]');
      expect(input).toHaveClass('custom-radio-class');
    });

    test('should render with correct name attribute', () => {
      radio = new Radio({
        name: 'choice-group',
        inputValue: 'option1'
      });
      const el = radio.render();

      const input = el.querySelector('input[type="radio"]');
      expect(input.name).toBe('choice-group');
      expect(input.value).toBe('option1');
    });
  });

  describe('value management', () => {
    beforeEach(() => {
      radio = new Radio({
        inputValue: 'test-value',
        uncheckedValue: 'none',
        checked: false
      });
      radio.render();
    });

    test('should get checked state', () => {
      expect(radio.isChecked()).toBe(false);
    });

    test('should get value when checked', () => {
      radio.setChecked(true);
      expect(radio.getValue()).toBe('test-value');
    });

    test('should get unchecked value when not checked', () => {
      radio.setChecked(false);
      expect(radio.getValue()).toBe('none');
    });

    test('should set checked state', () => {
      radio.setChecked(true);

      expect(radio.isChecked()).toBe(true);
      expect(radio.inputEl.checked).toBe(true);
    });

    test('should set value by comparison', () => {
      radio.setValue('test-value');
      expect(radio.isChecked()).toBe(true);

      radio.setValue('other-value');
      expect(radio.isChecked()).toBe(false);
    });

    test('should handle boolean values', () => {
      radio.setValue(true);
      expect(radio.isChecked()).toBe(true);

      radio.setValue(false);
      expect(radio.isChecked()).toBe(false);
    });
  });

  describe('interaction', () => {
    beforeEach(() => {
      radio = new Radio({ 
        name: 'test-radio',
        boxLabel: 'Click me',
        inputValue: 'clicked'
      });
      radio.render();
    });

    test('should check on input click', () => {
      expect(radio.isChecked()).toBe(false);

      testUtils.fireClickEvent(radio.inputEl);

      expect(radio.isChecked()).toBe(true);
    });

    test('should check on label click', () => {
      const label = radio.el.querySelector('.aionda-radio-label');
      
      expect(radio.isChecked()).toBe(false);

      testUtils.fireClickEvent(label);

      expect(radio.isChecked()).toBe(true);
    });

    test('should emit change event', () => {
      const changeSpy = jest.fn();
      radio.on('change', changeSpy);

      radio.setChecked(true);

      expect(changeSpy).toHaveBeenCalledWith({
        field: radio.name,
        checked: true,
        value: 'clicked'
      });
    });

    test('should not uncheck when clicked again', () => {
      radio.setChecked(true);
      
      testUtils.fireClickEvent(radio.inputEl);
      
      expect(radio.isChecked()).toBe(true);
    });

    test('should not check when disabled', () => {
      radio.disable();

      testUtils.fireClickEvent(radio.inputEl);

      expect(radio.isChecked()).toBe(false);
    });

    test('should not check when readonly', () => {
      radio.setReadOnly(true);

      testUtils.fireClickEvent(radio.inputEl);

      expect(radio.isChecked()).toBe(false);
    });
  });

  describe('keyboard interaction', () => {
    beforeEach(() => {
      radio = new Radio({
        name: 'keyboard-test',
        inputValue: 'key-value'
      });
      radio.renderTo(testUtils.createContainer());
    });

    test('should check on space key', () => {
      expect(radio.isChecked()).toBe(false);

      testUtils.fireKeyEvent(radio.inputEl, ' ', 'keydown');

      expect(radio.isChecked()).toBe(true);
    });

    test('should check on enter key', () => {
      expect(radio.isChecked()).toBe(false);

      testUtils.fireKeyEvent(radio.inputEl, 'Enter', 'keydown');

      expect(radio.isChecked()).toBe(true);
    });

    test('should emit keydown events', () => {
      const keydownSpy = jest.fn();
      radio.on('keydown', keydownSpy);

      testUtils.fireKeyEvent(radio.inputEl, 'Tab', 'keydown');

      expect(keydownSpy).toHaveBeenCalledWith({
        key: 'Tab',
        event: expect.any(Object),
        field: radio
      });
    });

    test('should handle arrow key navigation', () => {
      const arrowSpy = jest.fn();
      radio.on('keydown', arrowSpy);

      testUtils.fireKeyEvent(radio.inputEl, 'ArrowDown', 'keydown');

      expect(arrowSpy).toHaveBeenCalledWith(expect.objectContaining({
        key: 'ArrowDown'
      }));
    });
  });

  describe('validation', () => {
    test('should validate required radio', () => {
      radio = new Radio({
        allowBlank: false,
        validators: [{ type: 'required', message: 'Must be selected' }]
      });
      radio.render();

      radio.setChecked(false);
      expect(radio.validate()).toBe(false);
      expect(radio.errorMessage).toBe('Must be selected');

      radio.setChecked(true);
      expect(radio.validate()).toBe(true);
    });

    test('should validate optional radio', () => {
      radio = new Radio({
        allowBlank: true
      });
      radio.render();

      expect(radio.validate()).toBe(true);
    });

    test('should emit validation events', () => {
      const validSpy = jest.fn();
      const invalidSpy = jest.fn();
      
      radio = new Radio({
        validators: [{ type: 'required' }]
      });
      radio.render();
      
      radio.on('valid', validSpy);
      radio.on('invalid', invalidSpy);

      radio.setChecked(false);
      radio.validate();
      expect(invalidSpy).toHaveBeenCalled();

      radio.setChecked(true);
      radio.validate();
      expect(validSpy).toHaveBeenCalled();
    });

    test('should show validation error message', () => {
      radio = new Radio({
        allowBlank: false
      });
      radio.render();

      radio.validate();
      
      const errorEl = radio.el.querySelector('.aionda-radio-error');
      expect(errorEl).not.toBeNull();
      expect(errorEl.classList.contains('hidden')).toBe(false);
    });

    test('should clear validation errors', () => {
      radio = new Radio({
        allowBlank: false
      });
      radio.render();

      radio.validate(); // Creates error
      radio.setChecked(true);
      radio.validate();
      
      const errorEl = radio.el.querySelector('.aionda-radio-error');
      expect(errorEl.classList.contains('hidden')).toBe(true);
    });
  });

  describe('focus management', () => {
    beforeEach(() => {
      radio = new Radio();
      radio.renderTo(testUtils.createContainer());
    });

    test('should focus input', () => {
      const focusSpy = jest.spyOn(radio.inputEl, 'focus');

      radio.focus();

      expect(focusSpy).toHaveBeenCalled();
    });

    test('should blur input', () => {
      const blurSpy = jest.spyOn(radio.inputEl, 'blur');

      radio.blur();

      expect(blurSpy).toHaveBeenCalled();
    });

    test('should emit focus events', () => {
      const focusSpy = jest.fn();
      radio.on('focus', focusSpy);

      testUtils.fireEvent(radio.inputEl, 'focus');

      expect(focusSpy).toHaveBeenCalled();
    });

    test('should emit blur events', () => {
      const blurSpy = jest.fn();
      radio.on('blur', blurSpy);

      testUtils.fireEvent(radio.inputEl, 'blur');

      expect(blurSpy).toHaveBeenCalled();
    });

    test('should track focus state', () => {
      expect(radio.hasFocus).toBe(false);

      testUtils.fireEvent(radio.inputEl, 'focus');
      expect(radio.hasFocus).toBe(true);

      testUtils.fireEvent(radio.inputEl, 'blur');
      expect(radio.hasFocus).toBe(false);
    });
  });

  describe('accessibility', () => {
    test('should have proper ARIA attributes', () => {
      radio = new Radio({
        boxLabel: 'Accessible radio',
        checked: true
      });
      const el = radio.render();
      const input = el.querySelector('input');

      expect(input.getAttribute('role')).toBe('radio');
      expect(input.getAttribute('aria-checked')).toBe('true');
    });

    test('should associate label with input', () => {
      radio = new Radio({ boxLabel: 'Test label' });
      const el = radio.render();
      
      const input = el.querySelector('input');
      const label = el.querySelector('label');

      expect(label.getAttribute('for')).toBe(input.id);
    });

    test('should update aria-checked on state change', () => {
      radio = new Radio();
      const el = radio.render();
      const input = el.querySelector('input');

      radio.setChecked(true);
      expect(input.getAttribute('aria-checked')).toBe('true');

      radio.setChecked(false);
      expect(input.getAttribute('aria-checked')).toBe('false');
    });

    test('should support aria-label', () => {
      radio = new Radio({
        boxLabel: 'Choice Option',
        ariaLabel: 'Custom aria label'
      });
      const el = radio.render();
      const input = el.querySelector('input');

      expect(input.getAttribute('aria-label')).toBe('Custom aria label');
    });
  });

  describe('state management', () => {
    test('should track original value', () => {
      radio = new Radio({
        checked: true,
        inputValue: 'original'
      });
      radio.render();

      expect(radio.originalValue).toBe(true);
    });

    test('should reset to original state', () => {
      radio = new Radio({
        checked: false,
        inputValue: 'test'
      });
      radio.render();

      radio.setChecked(true);
      radio.reset();

      expect(radio.isChecked()).toBe(false);
    });

    test('should track dirty state', () => {
      radio = new Radio({
        checked: false
      });
      radio.render();

      expect(radio.isDirty()).toBe(false);

      radio.setChecked(true);
      expect(radio.isDirty()).toBe(true);

      radio.reset();
      expect(radio.isDirty()).toBe(false);
    });

    test('should maintain last value', () => {
      radio = new Radio();
      radio.render();

      radio.setChecked(true);
      expect(radio.lastValue).toBe(true);

      radio.setChecked(false);
      expect(radio.lastValue).toBe(false);
    });
  });

  describe('disabled and readonly states', () => {
    test('should disable radio button', () => {
      radio = new Radio();
      radio.render();

      radio.disable();

      expect(radio.disabled).toBe(true);
      expect(radio.inputEl.disabled).toBe(true);
    });

    test('should enable radio button', () => {
      radio = new Radio({ disabled: true });
      radio.render();

      radio.enable();

      expect(radio.disabled).toBe(false);
      expect(radio.inputEl.disabled).toBe(false);
    });

    test('should set readonly state', () => {
      radio = new Radio();
      radio.render();

      radio.setReadOnly(true);

      expect(radio.readOnly).toBe(true);
      expect(radio.inputEl.getAttribute('readonly')).toBe('');
    });

    test('should remove readonly state', () => {
      radio = new Radio({ readOnly: true });
      radio.render();

      radio.setReadOnly(false);

      expect(radio.readOnly).toBe(false);
      expect(radio.inputEl.hasAttribute('readonly')).toBe(false);
    });

    test('should apply disabled styling', () => {
      radio = new Radio({ disabled: true });
      const el = radio.render();

      expect(el).toHaveClass('aionda-field-disabled');
    });

    test('should apply readonly styling', () => {
      radio = new Radio({ readOnly: true });
      const el = radio.render();

      expect(el).toHaveClass('aionda-field-readonly');
    });
  });

  describe('group behavior', () => {
    test('should work within radio group', () => {
      const radio1 = new Radio({
        name: 'group1',
        inputValue: 'option1',
        boxLabel: 'Option 1'
      });
      
      const radio2 = new Radio({
        name: 'group1',
        inputValue: 'option2', 
        boxLabel: 'Option 2'
      });

      radio1.renderTo(testUtils.createContainer());
      radio2.renderTo(testUtils.createContainer());

      radio1.setChecked(true);
      radio2.setChecked(true);

      // In a real radio group, only one should be checked
      // This test verifies the individual radio behavior
      expect(radio1.isChecked()).toBe(true);
      expect(radio2.isChecked()).toBe(true);

      radio1.destroy();
      radio2.destroy();
    });

    test('should emit group change events', () => {
      const groupChangeSpy = jest.fn();
      
      radio = new Radio({
        name: 'test-group',
        inputValue: 'test',
        radioGroup: { emit: groupChangeSpy }
      });
      radio.render();

      radio.setChecked(true);

      expect(groupChangeSpy).toHaveBeenCalledWith('change', {
        field: 'test-group',
        value: 'test',
        oldValue: ''
      });
    });
  });

  describe('label positioning', () => {
    test('should position label after radio (default)', () => {
      radio = new Radio({
        boxLabel: 'After Label',
        boxLabelAlign: 'after'
      });
      const el = radio.render();

      const wrapper = el.querySelector('.aionda-radio-wrap');
      expect(wrapper).not.toHaveClass('flex-row-reverse');
    });

    test('should position label before radio', () => {
      radio = new Radio({
        boxLabel: 'Before Label',
        boxLabelAlign: 'before'
      });
      const el = radio.render();

      const wrapper = el.querySelector('.aionda-radio-wrap');
      expect(wrapper).toHaveClass('flex-row-reverse');
    });

    test('should handle label width configuration', () => {
      radio = new Radio({
        fieldLabel: 'Field Label',
        labelWidth: 200,
        labelAlign: 'left'
      });
      const el = radio.render();

      const fieldLabel = el.querySelector('.aionda-field-label');
      expect(fieldLabel.style.width).toBe('200px');
    });
  });

  describe('styling and theming', () => {
    test('should apply size-specific classes', () => {
      radio = new Radio({ size: 'lg' });
      const el = radio.render();

      expect(el).toHaveClass('aionda-radio-lg');
      const input = el.querySelector('input');
      expect(input).toHaveClass('h-6', 'w-6');
    });

    test('should apply focus classes', () => {
      radio = new Radio({
        focusCls: 'ring-4 ring-red-500'
      });
      radio.render();

      testUtils.fireEvent(radio.inputEl, 'focus');

      expect(radio.inputEl).toHaveClass('ring-4', 'ring-red-500');
    });

    test('should apply custom radio classes', () => {
      radio = new Radio({
        radioCls: 'custom-radio border-blue-500'
      });
      const el = radio.render();

      const input = el.querySelector('input');
      expect(input).toHaveClass('custom-radio', 'border-blue-500');
    });

    test('should handle invalid state styling', () => {
      radio = new Radio({
        allowBlank: false
      });
      radio.render();

      radio.validate();

      expect(radio.el).toHaveClass('aionda-field-invalid');
    });
  });

  describe('edge cases', () => {
    test('should handle missing box label', () => {
      radio = new Radio({ boxLabel: '' });
      const el = radio.render();

      expect(el.querySelector('.aionda-radio-label')).toBeNull();
    });

    test('should handle both field label and box label', () => {
      radio = new Radio({
        fieldLabel: 'Field Label',
        boxLabel: 'Box Label'
      });
      const el = radio.render();

      expect(el.textContent).toContain('Field Label');
      expect(el.textContent).toContain('Box Label');
    });

    test('should handle missing input element gracefully', () => {
      radio = new Radio();
      
      expect(() => {
        radio.focus();
        radio.blur();
        radio.setChecked(true);
      }).not.toThrow();
    });

    test('should handle setValue before rendering', () => {
      radio = new Radio({
        inputValue: 'test'
      });
      
      expect(() => radio.setValue('test')).not.toThrow();
      expect(radio.checked).toBe(true);
    });

    test('should handle complex input values', () => {
      radio = new Radio({
        inputValue: { complex: 'object' }
      });
      
      expect(() => radio.render()).not.toThrow();
    });

    test('should handle numeric input values', () => {
      radio = new Radio({
        inputValue: 42
      });
      const el = radio.render();

      const input = el.querySelector('input');
      expect(input.value).toBe('42');
    });
  });

  describe('method chaining', () => {
    test('should support method chaining', () => {
      radio = new Radio();
      radio.render();

      const result = radio
        .setChecked(true)
        .focus()
        .blur()
        .setReadOnly(true)
        .setReadOnly(false)
        .disable()
        .enable()
        .reset();

      expect(result).toBe(radio);
    });

    test('should chain validation methods', () => {
      radio = new Radio({
        allowBlank: false
      });
      radio.render();

      const isValid = radio.validate();
      expect(isValid).toBe(false);
      
      const result = radio
        .markInvalid('Custom error')
        .clearInvalid();

      expect(result).toBe(radio);
    });
  });

  describe('memory management', () => {
    test('should clean up event listeners on destroy', () => {
      radio = new Radio();
      radio.render();

      const removeEventListenerSpy = jest.spyOn(radio.inputEl, 'removeEventListener');
      
      radio.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    test('should nullify DOM references on destroy', () => {
      radio = new Radio();
      radio.render();

      radio.destroy();

      expect(radio.inputEl).toBeNull();
      expect(radio.labelEl).toBeNull();
      expect(radio.boxLabelEl).toBeNull();
      expect(radio.errorEl).toBeNull();
    });
  });
});