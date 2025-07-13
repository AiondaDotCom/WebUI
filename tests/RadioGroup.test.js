/**
 * Unit tests for RadioGroup component
 * Tests radio group functionality, selection, validation, and Form integration
 */

import { RadioGroup } from '../src/components/RadioGroup.js';
import { Radio } from '../src/components/Radio.js';

describe('RadioGroup', () => {
  let radioGroup;

  beforeEach(() => {
    radioGroup = null;
  });

  afterEach(() => {
    if (radioGroup && !radioGroup.destroyed) {
      radioGroup.destroy();
    }
    radioGroup = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create radio group with default config', () => {
      radioGroup = new RadioGroup();

      expect(radioGroup.name).toBe(radioGroup.id);
      expect(radioGroup.columns).toBe(1);
      expect(radioGroup.layout).toBe('vertical');
      expect(radioGroup.value).toBe('');
      expect(radioGroup.allowBlank).toBe(true);
      expect(radioGroup.items).toEqual([]);
      expect(radioGroup.radios).toBeInstanceOf(Map);
    });

    test('should create radio group with custom config', () => {
      const items = [
        { boxLabel: 'Option 1', inputValue: 'opt1' },
        { boxLabel: 'Option 2', inputValue: 'opt2' }
      ];

      const config = {
        name: 'preference',
        fieldLabel: 'Choose Option',
        columns: 2,
        layout: 'horizontal',
        value: 'opt1',
        allowBlank: false,
        items
      };

      radioGroup = new RadioGroup(config);

      expect(radioGroup.name).toBe('preference');
      expect(radioGroup.fieldLabel).toBe('Choose Option');
      expect(radioGroup.columns).toBe(2);
      expect(radioGroup.layout).toBe('horizontal');
      expect(radioGroup.value).toBe('opt1');
      expect(radioGroup.allowBlank).toBe(false);
      expect(radioGroup.items).toEqual(items);
    });

    test('should handle null config', () => {
      expect(() => new RadioGroup(null)).not.toThrow();
    });
  });

  describe('rendering', () => {
    test('should render radio group container', () => {
      radioGroup = new RadioGroup({
        fieldLabel: 'Select Option',
        items: [
          { boxLabel: 'Option A', inputValue: 'a' },
          { boxLabel: 'Option B', inputValue: 'b' }
        ]
      });
      const el = radioGroup.render();

      expect(el).toHaveClass('aionda-radiogroup');
      expect(el).toHaveClass('aionda-field');
      
      const label = el.querySelector('.aionda-field-label');
      expect(label.textContent).toContain('Select Option');
    });

    test('should render radio buttons from items', () => {
      radioGroup = new RadioGroup({
        items: [
          { boxLabel: 'First', inputValue: 'first' },
          { boxLabel: 'Second', inputValue: 'second' },
          { boxLabel: 'Third', inputValue: 'third' }
        ]
      });
      const el = radioGroup.render();

      const radios = el.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(3);
      
      const labels = el.querySelectorAll('.aionda-radio-label');
      expect(labels).toHaveLength(3);
      expect(labels[0].textContent).toContain('First');
      expect(labels[1].textContent).toContain('Second');
      expect(labels[2].textContent).toContain('Third');
    });

    test('should apply layout classes', () => {
      radioGroup = new RadioGroup({
        layout: 'horizontal',
        items: [{ boxLabel: 'Test', inputValue: 'test' }]
      });
      const el = radioGroup.render();

      expect(el).toHaveClass('aionda-radiogroup-horizontal');
    });

    test('should apply column layout', () => {
      radioGroup = new RadioGroup({
        columns: 3,
        items: [
          { boxLabel: 'A', inputValue: 'a' },
          { boxLabel: 'B', inputValue: 'b' },
          { boxLabel: 'C', inputValue: 'c' }
        ]
      });
      const el = radioGroup.render();

      expect(el).toHaveClass('aionda-radiogroup-columns-3');
    });

    test('should render with initial value selected', () => {
      radioGroup = new RadioGroup({
        value: 'selected',
        items: [
          { boxLabel: 'Option 1', inputValue: 'opt1' },
          { boxLabel: 'Option 2', inputValue: 'selected' }
        ]
      });
      const el = radioGroup.render();

      const selectedRadio = el.querySelector('input[value="selected"]');
      expect(selectedRadio.checked).toBe(true);
    });
  });

  describe('value management', () => {
    beforeEach(() => {
      radioGroup = new RadioGroup({
        name: 'test-group',
        items: [
          { boxLabel: 'Alpha', inputValue: 'alpha' },
          { boxLabel: 'Beta', inputValue: 'beta' },
          { boxLabel: 'Gamma', inputValue: 'gamma' }
        ]
      });
      radioGroup.render();
    });

    test('should get current value', () => {
      expect(radioGroup.getValue()).toBe('');
    });

    test('should set value', () => {
      radioGroup.setValue('beta');
      
      expect(radioGroup.getValue()).toBe('beta');
      const betaRadio = radioGroup.el.querySelector('input[value="beta"]');
      expect(betaRadio.checked).toBe(true);
    });

    test('should clear previous selection when setting new value', () => {
      radioGroup.setValue('alpha');
      radioGroup.setValue('gamma');
      
      const alphaRadio = radioGroup.el.querySelector('input[value="alpha"]');
      const gammaRadio = radioGroup.el.querySelector('input[value="gamma"]');
      
      expect(alphaRadio.checked).toBe(false);
      expect(gammaRadio.checked).toBe(true);
      expect(radioGroup.getValue()).toBe('gamma');
    });

    test('should handle invalid value gracefully', () => {
      radioGroup.setValue('nonexistent');
      
      expect(radioGroup.getValue()).toBe('');
      const radios = radioGroup.el.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        expect(radio.checked).toBe(false);
      });
    });

    test('should reset to original value', () => {
      radioGroup.originalValue = 'beta';
      radioGroup.setValue('gamma');
      
      radioGroup.reset();
      
      expect(radioGroup.getValue()).toBe('beta');
    });
  });

  describe('radio selection', () => {
    beforeEach(() => {
      radioGroup = new RadioGroup({
        items: [
          { boxLabel: 'Red', inputValue: 'red' },
          { boxLabel: 'Green', inputValue: 'green' },
          { boxLabel: 'Blue', inputValue: 'blue' }
        ]
      });
      radioGroup.render();
    });

    test('should select radio on click', () => {
      const greenRadio = radioGroup.el.querySelector('input[value="green"]');
      
      testUtils.fireClickEvent(greenRadio);
      
      expect(radioGroup.getValue()).toBe('green');
      expect(greenRadio.checked).toBe(true);
    });

    test('should emit change event on selection', () => {
      const changeSpy = jest.fn();
      radioGroup.on('change', changeSpy);
      
      const blueRadio = radioGroup.el.querySelector('input[value="blue"]');
      testUtils.fireClickEvent(blueRadio);
      
      expect(changeSpy).toHaveBeenCalledWith({
        field: radioGroup.name,
        value: 'blue',
        oldValue: ''
      });
    });

    test('should only allow single selection', () => {
      const redRadio = radioGroup.el.querySelector('input[value="red"]');
      const blueRadio = radioGroup.el.querySelector('input[value="blue"]');
      
      testUtils.fireClickEvent(redRadio);
      testUtils.fireClickEvent(blueRadio);
      
      expect(redRadio.checked).toBe(false);
      expect(blueRadio.checked).toBe(true);
      expect(radioGroup.getValue()).toBe('blue');
    });

    test('should handle label clicks', () => {
      const greenLabel = radioGroup.el.querySelector('label[for*="green"]');
      
      testUtils.fireClickEvent(greenLabel);
      
      expect(radioGroup.getValue()).toBe('green');
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      radioGroup = new RadioGroup({
        items: [
          { boxLabel: 'First', inputValue: 'first' },
          { boxLabel: 'Second', inputValue: 'second' },
          { boxLabel: 'Third', inputValue: 'third' }
        ]
      });
      radioGroup.renderTo(testUtils.createContainer());
    });

    test('should navigate with arrow keys', () => {
      const firstRadio = radioGroup.el.querySelector('input[value="first"]');
      firstRadio.focus();
      
      testUtils.fireKeyEvent(firstRadio, 'ArrowDown', 'keydown');
      
      expect(radioGroup.getValue()).toBe('second');
      expect(document.activeElement.value).toBe('second');
    });

    test('should wrap around with arrow navigation', () => {
      const thirdRadio = radioGroup.el.querySelector('input[value="third"]');
      radioGroup.setValue('third');
      thirdRadio.focus();
      
      testUtils.fireKeyEvent(thirdRadio, 'ArrowDown', 'keydown');
      
      expect(radioGroup.getValue()).toBe('first');
    });

    test('should navigate backwards with up arrow', () => {
      const secondRadio = radioGroup.el.querySelector('input[value="second"]');
      radioGroup.setValue('second');
      secondRadio.focus();
      
      testUtils.fireKeyEvent(secondRadio, 'ArrowUp', 'keydown');
      
      expect(radioGroup.getValue()).toBe('first');
    });

    test('should handle space key selection', () => {
      const firstRadio = radioGroup.el.querySelector('input[value="first"]');
      firstRadio.focus();
      
      testUtils.fireKeyEvent(firstRadio, ' ', 'keydown');
      
      expect(radioGroup.getValue()).toBe('first');
    });
  });

  describe('validation', () => {
    test('should validate required radio group', () => {
      radioGroup = new RadioGroup({
        allowBlank: false,
        validators: [{ type: 'required', message: 'Please select an option' }],
        items: [
          { boxLabel: 'Yes', inputValue: 'yes' },
          { boxLabel: 'No', inputValue: 'no' }
        ]
      });
      radioGroup.render();

      expect(radioGroup.validate()).toBe(false);
      expect(radioGroup.errorMessage).toBe('Please select an option');

      radioGroup.setValue('yes');
      expect(radioGroup.validate()).toBe(true);
    });

    test('should validate optional radio group', () => {
      radioGroup = new RadioGroup({
        allowBlank: true,
        items: [{ boxLabel: 'Optional', inputValue: 'opt' }]
      });
      radioGroup.render();

      expect(radioGroup.validate()).toBe(true);
    });

    test('should emit validation events', () => {
      const validSpy = jest.fn();
      const invalidSpy = jest.fn();
      
      radioGroup = new RadioGroup({
        allowBlank: false,
        items: [{ boxLabel: 'Required', inputValue: 'req' }]
      });
      radioGroup.render();
      
      radioGroup.on('valid', validSpy);
      radioGroup.on('invalid', invalidSpy);

      radioGroup.validate();
      expect(invalidSpy).toHaveBeenCalled();

      radioGroup.setValue('req');
      radioGroup.validate();
      expect(validSpy).toHaveBeenCalled();
    });

    test('should show validation error message', () => {
      radioGroup = new RadioGroup({
        allowBlank: false,
        items: [{ boxLabel: 'Test', inputValue: 'test' }]
      });
      radioGroup.render();

      radioGroup.validate();
      
      const errorEl = radioGroup.el.querySelector('.aionda-radiogroup-error');
      expect(errorEl).not.toBeNull();
      expect(errorEl.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Form integration', () => {
    test('should register with form', () => {
      const form = { 
        fields: new Map(),
        add: jest.fn(),
        emit: jest.fn()
      };
      
      radioGroup = new RadioGroup({
        name: 'category',
        form,
        items: [{ boxLabel: 'Category A', inputValue: 'a' }]
      });
      
      radioGroup.render();
      
      expect(radioGroup.form).toBe(form);
    });

    test('should emit form change events', () => {
      const form = { emit: jest.fn() };
      
      radioGroup = new RadioGroup({
        name: 'priority',
        form,
        items: [
          { boxLabel: 'Low', inputValue: 'low' },
          { boxLabel: 'High', inputValue: 'high' }
        ]
      });
      radioGroup.render();
      
      radioGroup.setValue('high');
      
      expect(form.emit).toHaveBeenCalledWith('change', {
        field: 'priority',
        value: 'high',
        oldValue: ''
      });
    });

    test('should participate in form validation', () => {
      radioGroup = new RadioGroup({
        name: 'agreement',
        allowBlank: false,
        items: [{ boxLabel: 'I agree', inputValue: 'agree' }]
      });
      radioGroup.render();

      expect(radioGroup.isValid()).toBe(false);
      
      radioGroup.setValue('agree');
      expect(radioGroup.isValid()).toBe(true);
    });
  });

  describe('layout options', () => {
    test('should render vertical layout', () => {
      radioGroup = new RadioGroup({
        layout: 'vertical',
        items: [
          { boxLabel: 'Item 1', inputValue: '1' },
          { boxLabel: 'Item 2', inputValue: '2' }
        ]
      });
      const el = radioGroup.render();

      expect(el).toHaveClass('aionda-radiogroup-vertical');
    });

    test('should render horizontal layout', () => {
      radioGroup = new RadioGroup({
        layout: 'horizontal',
        items: [
          { boxLabel: 'Item 1', inputValue: '1' },
          { boxLabel: 'Item 2', inputValue: '2' }
        ]
      });
      const el = radioGroup.render();

      expect(el).toHaveClass('aionda-radiogroup-horizontal');
    });

    test('should render multi-column layout', () => {
      radioGroup = new RadioGroup({
        columns: 2,
        items: [
          { boxLabel: 'A', inputValue: 'a' },
          { boxLabel: 'B', inputValue: 'b' },
          { boxLabel: 'C', inputValue: 'c' },
          { boxLabel: 'D', inputValue: 'd' }
        ]
      });
      const el = radioGroup.render();

      expect(el).toHaveClass('aionda-radiogroup-columns-2');
      const columns = el.querySelectorAll('.aionda-radiogroup-column');
      expect(columns).toHaveLength(2);
    });

    test('should distribute items evenly across columns', () => {
      radioGroup = new RadioGroup({
        columns: 3,
        items: [
          { boxLabel: '1', inputValue: '1' },
          { boxLabel: '2', inputValue: '2' },
          { boxLabel: '3', inputValue: '3' },
          { boxLabel: '4', inputValue: '4' },
          { boxLabel: '5', inputValue: '5' }
        ]
      });
      const el = radioGroup.render();

      const columns = el.querySelectorAll('.aionda-radiogroup-column');
      expect(columns[0].querySelectorAll('input')).toHaveLength(2); // 1, 2
      expect(columns[1].querySelectorAll('input')).toHaveLength(2); // 3, 4
      expect(columns[2].querySelectorAll('input')).toHaveLength(1); // 5
    });
  });

  describe('accessibility', () => {
    test('should have proper ARIA attributes', () => {
      radioGroup = new RadioGroup({
        fieldLabel: 'Choose Color',
        items: [
          { boxLabel: 'Red', inputValue: 'red' },
          { boxLabel: 'Blue', inputValue: 'blue' }
        ]
      });
      const el = radioGroup.render();

      const radioGroupEl = el.querySelector('.aionda-radiogroup-items');
      expect(radioGroupEl.getAttribute('role')).toBe('radiogroup');
      expect(radioGroupEl.getAttribute('aria-labelledby')).toBe(`${radioGroup.id}-label`);

      const radios = el.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        expect(radio.getAttribute('role')).toBe('radio');
        expect(radio.name).toBe(radioGroup.name);
      });
    });

    test('should associate field label with group', () => {
      radioGroup = new RadioGroup({
        fieldLabel: 'Options',
        items: [{ boxLabel: 'Option', inputValue: 'opt' }]
      });
      const el = radioGroup.render();
      
      const label = el.querySelector('.aionda-field-label');
      const groupEl = el.querySelector('.aionda-radiogroup-items');
      
      expect(label.id).toBe(`${radioGroup.id}-label`);
      expect(groupEl.getAttribute('aria-labelledby')).toBe(label.id);
    });

    test('should support screen reader navigation', () => {
      radioGroup = new RadioGroup({
        items: [
          { boxLabel: 'First Option', inputValue: 'first' },
          { boxLabel: 'Second Option', inputValue: 'second' }
        ]
      });
      const el = radioGroup.render();

      const radios = el.querySelectorAll('input[type="radio"]');
      radios.forEach((radio, index) => {
        expect(radio.getAttribute('aria-label')).toBe(radioGroup.items[index].boxLabel);
      });
    });
  });

  describe('disabled state', () => {
    test('should disable all radio buttons', () => {
      radioGroup = new RadioGroup({
        disabled: true,
        items: [
          { boxLabel: 'Option 1', inputValue: '1' },
          { boxLabel: 'Option 2', inputValue: '2' }
        ]
      });
      const el = radioGroup.render();

      const radios = el.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        expect(radio.disabled).toBe(true);
      });
    });

    test('should prevent selection when disabled', () => {
      radioGroup = new RadioGroup({
        items: [{ boxLabel: 'Test', inputValue: 'test' }]
      });
      radioGroup.render();
      
      radioGroup.disable();
      
      const radio = radioGroup.el.querySelector('input[type="radio"]');
      testUtils.fireClickEvent(radio);
      
      expect(radioGroup.getValue()).toBe('');
    });

    test('should enable/disable dynamically', () => {
      radioGroup = new RadioGroup({
        items: [{ boxLabel: 'Test', inputValue: 'test' }]
      });
      radioGroup.render();
      
      radioGroup.disable();
      expect(radioGroup.disabled).toBe(true);
      
      radioGroup.enable();
      expect(radioGroup.disabled).toBe(false);
    });
  });

  describe('readonly state', () => {
    test('should prevent changes when readonly', () => {
      radioGroup = new RadioGroup({
        readOnly: true,
        items: [{ boxLabel: 'Read Only', inputValue: 'ro' }]
      });
      radioGroup.render();
      
      const radio = radioGroup.el.querySelector('input[type="radio"]');
      testUtils.fireClickEvent(radio);
      
      expect(radioGroup.getValue()).toBe('');
    });

    test('should toggle readonly state', () => {
      radioGroup = new RadioGroup({
        items: [{ boxLabel: 'Test', inputValue: 'test' }]
      });
      radioGroup.render();
      
      radioGroup.setReadOnly(true);
      expect(radioGroup.readOnly).toBe(true);
      
      radioGroup.setReadOnly(false);
      expect(radioGroup.readOnly).toBe(false);
    });
  });

  describe('dynamic item management', () => {
    test('should add items dynamically', () => {
      radioGroup = new RadioGroup({
        items: [{ boxLabel: 'Initial', inputValue: 'init' }]
      });
      radioGroup.render();
      
      radioGroup.addItem({ boxLabel: 'Dynamic', inputValue: 'dyn' });
      
      expect(radioGroup.items).toHaveLength(2);
      const radios = radioGroup.el.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(2);
    });

    test('should remove items dynamically', () => {
      radioGroup = new RadioGroup({
        items: [
          { boxLabel: 'Keep', inputValue: 'keep' },
          { boxLabel: 'Remove', inputValue: 'remove' }
        ]
      });
      radioGroup.render();
      
      radioGroup.removeItem('remove');
      
      expect(radioGroup.items).toHaveLength(1);
      const radios = radioGroup.el.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(1);
    });

    test('should clear all items', () => {
      radioGroup = new RadioGroup({
        items: [
          { boxLabel: 'A', inputValue: 'a' },
          { boxLabel: 'B', inputValue: 'b' }
        ]
      });
      radioGroup.render();
      
      radioGroup.clearItems();
      
      expect(radioGroup.items).toHaveLength(0);
      const radios = radioGroup.el.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(0);
    });
  });

  describe('focus management', () => {
    beforeEach(() => {
      radioGroup = new RadioGroup({
        items: [
          { boxLabel: 'Focus Test 1', inputValue: 'ft1' },
          { boxLabel: 'Focus Test 2', inputValue: 'ft2' }
        ]
      });
      radioGroup.renderTo(testUtils.createContainer());
    });

    test('should focus first radio button', () => {
      radioGroup.focus();
      
      const firstRadio = radioGroup.el.querySelector('input[type="radio"]');
      expect(document.activeElement).toBe(firstRadio);
    });

    test('should focus selected radio button', () => {
      radioGroup.setValue('ft2');
      radioGroup.focus();
      
      const secondRadio = radioGroup.el.querySelector('input[value="ft2"]');
      expect(document.activeElement).toBe(secondRadio);
    });

    test('should emit focus events', () => {
      const focusSpy = jest.fn();
      radioGroup.on('focus', focusSpy);
      
      const firstRadio = radioGroup.el.querySelector('input[type="radio"]');
      testUtils.fireEvent(firstRadio, 'focus');
      
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    test('should handle empty items array', () => {
      radioGroup = new RadioGroup({ items: [] });
      
      expect(() => radioGroup.render()).not.toThrow();
      expect(radioGroup.el.querySelectorAll('input')).toHaveLength(0);
    });

    test('should handle items without inputValue', () => {
      radioGroup = new RadioGroup({
        items: [{ boxLabel: 'No Value' }]
      });
      
      expect(() => radioGroup.render()).not.toThrow();
    });

    test('should handle duplicate inputValues', () => {
      radioGroup = new RadioGroup({
        items: [
          { boxLabel: 'First', inputValue: 'same' },
          { boxLabel: 'Second', inputValue: 'same' }
        ]
      });
      
      expect(() => radioGroup.render()).not.toThrow();
    });

    test('should handle null items', () => {
      radioGroup = new RadioGroup({
        items: [null, { boxLabel: 'Valid', inputValue: 'valid' }]
      });
      
      expect(() => radioGroup.render()).not.toThrow();
    });

    test('should handle value change before rendering', () => {
      radioGroup = new RadioGroup({
        items: [{ boxLabel: 'Test', inputValue: 'test' }]
      });
      
      expect(() => radioGroup.setValue('test')).not.toThrow();
      expect(radioGroup.value).toBe('test');
    });

    test('should handle missing radiogroup container', () => {
      radioGroup = new RadioGroup({
        items: [{ boxLabel: 'Test', inputValue: 'test' }]
      });
      radioGroup.render();
      
      // Remove container to simulate error condition
      radioGroup.el.querySelector('.aionda-radiogroup-items').remove();
      
      expect(() => radioGroup.setValue('test')).not.toThrow();
    });
  });

  describe('method chaining', () => {
    test('should support method chaining', () => {
      radioGroup = new RadioGroup({
        items: [{ boxLabel: 'Chain Test', inputValue: 'chain' }]
      });
      radioGroup.render();
      
      const result = radioGroup
        .setValue('chain')
        .focus()
        .blur()
        .reset();
      
      expect(result).toBe(radioGroup);
    });
  });
});