/**
 * Unit tests for Checkbox component
 * Tests checkbox functionality, variants, and states
 */

import { Checkbox } from '../src/components/Checkbox.js';

describe('Checkbox', () => {
  let checkbox;

  beforeEach(() => {
    checkbox = null;
  });

  afterEach(() => {
    if (checkbox && !checkbox.destroyed) {
      checkbox.destroy();
    }
    checkbox = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create checkbox with default config', () => {
      checkbox = new Checkbox();

      expect(checkbox.checked).toBe(false);
      expect(checkbox.boxLabel).toBe('');
      expect(checkbox.variant).toBe('checkbox');
      expect(checkbox.size).toBe('md');
      expect(checkbox.name).toBe(checkbox.id);
      expect(checkbox.value).toBe('on');
      expect(checkbox.indeterminate).toBe(false);
    });

    test('should create checkbox with custom config', () => {
      const config = {
        name: 'agreement',
        boxLabel: 'I agree to terms',
        checked: true,
        variant: 'switch',
        size: 'lg',
        value: 'yes',
        indeterminate: true
      };

      checkbox = new Checkbox(config);

      expect(checkbox.name).toBe('agreement');
      expect(checkbox.boxLabel).toBe('I agree to terms');
      expect(checkbox.checked).toBe(true);
      expect(checkbox.variant).toBe('switch');
      expect(checkbox.size).toBe('lg');
      expect(checkbox.value).toBe('yes');
      expect(checkbox.indeterminate).toBe(true);
    });
  });

  describe('rendering', () => {
    test('should render standard checkbox', () => {
      checkbox = new Checkbox({
        boxLabel: 'Check me',
        checked: true
      });
      const el = checkbox.render();

      expect(el).toHaveClass('aionda-checkbox');
      
      const input = el.querySelector('input[type="checkbox"]');
      expect(input).not.toBeNull();
      expect(input.checked).toBe(true);
      
      const label = el.querySelector('label');
      expect(label.textContent).toContain('Check me');
    });

    test('should render switch variant', () => {
      checkbox = new Checkbox({
        variant: 'switch',
        boxLabel: 'Toggle me'
      });
      const el = checkbox.render();

      expect(el).toHaveClass('aionda-checkbox-switch');
      expect(el.textContent).toContain('Toggle me');
    });

    test('should render different sizes', () => {
      const sizes = ['sm', 'md', 'lg'];
      
      sizes.forEach(size => {
        const testCheckbox = new Checkbox({ size });
        const el = testCheckbox.render();
        
        expect(el).toHaveClass(`aionda-checkbox-${size}`);
        
        testCheckbox.destroy();
      });
    });

    test('should render with field label', () => {
      checkbox = new Checkbox({
        fieldLabel: 'Options',
        boxLabel: 'Enable feature'
      });
      const el = checkbox.render();

      const fieldLabel = el.querySelector('.aionda-field-label');
      expect(fieldLabel.textContent).toContain('Options');
      
      const boxLabel = el.querySelector('.aionda-checkbox-label');
      expect(boxLabel.textContent).toContain('Enable feature');
    });
  });

  describe('value management', () => {
    beforeEach(async () => {
      checkbox = new Checkbox({
        value: 'test-value',
        checked: false
      });
      checkbox.render();
      await testUtils.waitForDOMUpdate();
    });

    test('should get checked state', () => {
      expect(checkbox.isChecked()).toBe(false);
    });

    test('should get value when checked', async () => {
      checkbox.setChecked(true);
      await testUtils.waitForDOMUpdate();
      expect(checkbox.getValue()).toBe('test-value');
    });

    test('should get empty value when unchecked', async () => {
      checkbox.setChecked(false);
      await testUtils.waitForDOMUpdate();
      expect(checkbox.getValue()).toBe('');
    });

    test('should set checked state', async () => {
      checkbox.setChecked(true);
      await testUtils.waitForDOMUpdate();

      expect(checkbox.isChecked()).toBe(true);
      expect(checkbox.inputEl.checked).toBe(true);
    });

    test('should toggle checked state', async () => {
      expect(checkbox.isChecked()).toBe(false);

      checkbox.toggle();
      await testUtils.waitForDOMUpdate();
      expect(checkbox.isChecked()).toBe(true);

      checkbox.toggle();
      await testUtils.waitForDOMUpdate();
      expect(checkbox.isChecked()).toBe(false);
    });
  });

  describe('indeterminate state', () => {
    test('should set indeterminate state', async () => {
      checkbox = new Checkbox();
      checkbox.render();
      await testUtils.waitForDOMUpdate();

      checkbox.setIndeterminate(true);
      await testUtils.waitForDOMUpdate();

      expect(checkbox.indeterminate).toBe(true);
      expect(checkbox.inputEl.indeterminate).toBe(true);
    });

    test('should clear indeterminate on check/uncheck', async () => {
      checkbox = new Checkbox({ indeterminate: true });
      checkbox.render();
      await testUtils.waitForDOMUpdate();

      checkbox.setChecked(true);
      await testUtils.waitForDOMUpdate();

      expect(checkbox.indeterminate).toBe(false);
      expect(checkbox.inputEl.indeterminate).toBe(false);
    });
  });

  describe('interaction', () => {
    beforeEach(async () => {
      checkbox = new Checkbox({ boxLabel: 'Click me' });
      checkbox.render();
      await testUtils.waitForDOMUpdate();
    });

    test('should toggle on input click', async () => {
      expect(checkbox.isChecked()).toBe(false);

      await testUtils.fireClickEvent(checkbox.inputEl);

      expect(checkbox.isChecked()).toBe(true);
    });

    test('should toggle on label click', async () => {
      const label = checkbox.el.querySelector('.aionda-checkbox-label');
      
      expect(checkbox.isChecked()).toBe(false);

      await testUtils.fireClickEvent(label);

      expect(checkbox.isChecked()).toBe(true);
    });

    test('should emit change event', async () => {
      const changeSpy = jest.fn();
      checkbox.on('change', changeSpy);

      checkbox.setChecked(true);
      await testUtils.waitForDOMUpdate();

      expect(changeSpy).toHaveBeenCalledWith({
        field: checkbox.name,
        checked: true,
        value: 'on'
      });
    });

    test('should not toggle when disabled', async () => {
      checkbox.disable();
      await testUtils.waitForDOMUpdate();

      await testUtils.fireClickEvent(checkbox.inputEl);

      expect(checkbox.isChecked()).toBe(false);
    });
  });

  describe('validation', () => {
    test('should validate required checkbox', async () => {
      checkbox = new Checkbox({
        allowBlank: false,
        validators: [{ type: 'required', message: 'Must be checked' }]
      });
      checkbox.render();
      await testUtils.waitForDOMUpdate();

      checkbox.setChecked(false);
      await testUtils.waitForDOMUpdate();
      expect(checkbox.validate()).toBe(false);
      expect(checkbox.errorMessage).toBe('Must be checked');

      checkbox.setChecked(true);
      await testUtils.waitForDOMUpdate();
      expect(checkbox.validate()).toBe(true);
    });

    test('should emit validation events', async () => {
      const validSpy = jest.fn();
      const invalidSpy = jest.fn();
      
      checkbox = new Checkbox({
        validators: [{ type: 'required' }]
      });
      checkbox.render();
      await testUtils.waitForDOMUpdate();
      
      checkbox.on('valid', validSpy);
      checkbox.on('invalid', invalidSpy);

      checkbox.setChecked(false);
      await testUtils.waitForDOMUpdate();
      checkbox.validate();
      expect(invalidSpy).toHaveBeenCalled();

      checkbox.setChecked(true);
      await testUtils.waitForDOMUpdate();
      checkbox.validate();
      expect(validSpy).toHaveBeenCalled();
    });
  });

  describe('focus management', () => {
    beforeEach(async () => {
      checkbox = new Checkbox();
      await testUtils.renderComponent(checkbox, testUtils.createContainer());
    });

    test('should focus input', async () => {
      const focusSpy = jest.spyOn(checkbox.inputEl, 'focus');

      checkbox.focus();
      await testUtils.waitForDOMUpdate();

      expect(focusSpy).toHaveBeenCalled();
    });

    test('should blur input', async () => {
      const blurSpy = jest.spyOn(checkbox.inputEl, 'blur');

      checkbox.blur();
      await testUtils.waitForDOMUpdate();

      expect(blurSpy).toHaveBeenCalled();
    });

    test('should emit focus events', async () => {
      const focusSpy = jest.fn();
      checkbox.on('focus', focusSpy);

      testUtils.fireEvent(checkbox.inputEl, 'focus');
      await testUtils.waitForDOMUpdate();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('keyboard interaction', () => {
    beforeEach(async () => {
      checkbox = new Checkbox();
      await testUtils.renderComponent(checkbox, testUtils.createContainer());
    });

    test('should toggle on space key', async () => {
      expect(checkbox.isChecked()).toBe(false);

      await testUtils.fireKeyEvent(checkbox.inputEl, ' ', 'keydown');

      expect(checkbox.isChecked()).toBe(true);
    });

    test('should toggle on enter key', async () => {
      expect(checkbox.isChecked()).toBe(false);

      await testUtils.fireKeyEvent(checkbox.inputEl, 'Enter', 'keydown');

      expect(checkbox.isChecked()).toBe(true);
    });
  });

  describe('styling variants', () => {
    test('should apply correct classes for checkbox variant', () => {
      checkbox = new Checkbox({ variant: 'checkbox' });
      const el = checkbox.render();

      expect(el).toHaveClass('aionda-checkbox');
      expect(el).not.toHaveClass('aionda-checkbox-switch');
    });

    test('should apply correct classes for switch variant', () => {
      checkbox = new Checkbox({ variant: 'switch' });
      const el = checkbox.render();

      expect(el).toHaveClass('aionda-checkbox-switch');
    });

    test('should apply size classes', () => {
      checkbox = new Checkbox({ size: 'lg' });
      const el = checkbox.render();

      expect(el).toHaveClass('aionda-checkbox-lg');
    });
  });

  describe('accessibility', () => {
    test('should have proper ARIA attributes', () => {
      checkbox = new Checkbox({
        boxLabel: 'Accessible checkbox',
        checked: true
      });
      const el = checkbox.render();
      const input = el.querySelector('input');

      expect(input.getAttribute('role')).toBe('checkbox');
      expect(input.getAttribute('aria-checked')).toBe('true');
    });

    test('should associate label with input', () => {
      checkbox = new Checkbox({ boxLabel: 'Test label' });
      const el = checkbox.render();
      
      const input = el.querySelector('input');
      const label = el.querySelector('label');

      expect(label.getAttribute('for')).toBe(input.id);
    });
  });

  describe('method chaining', () => {
    test('should support method chaining', async () => {
      checkbox = new Checkbox();
      checkbox.render();
      await testUtils.waitForDOMUpdate();

      const result = checkbox
        .setChecked(true)
        .setIndeterminate(false)
        .focus()
        .blur()
        .toggle();
        
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(checkbox);
      expect(checkbox.isChecked()).toBe(false); // toggled back
    });
  });

  describe('responsive behavior', () => {
    test('should handle mobile viewport', () => {
      testUtils.setMobileViewport();
      checkbox = new Checkbox({ boxLabel: 'Mobile Checkbox' });
      const el = checkbox.render();

      expect(window.innerWidth).toBe(320);
      expect(el).toHaveClass('aionda-checkbox');
    });

    test('should handle tablet viewport', () => {
      testUtils.setTabletViewport();
      checkbox = new Checkbox({ boxLabel: 'Tablet Checkbox' });
      const el = checkbox.render();

      expect(window.innerWidth).toBe(768);
      expect(el).toHaveClass('aionda-checkbox');
    });

    test('should handle touch events on mobile', async () => {
      testUtils.setMobileViewport();
      checkbox = new Checkbox({ boxLabel: 'Touch Checkbox' });
      const el = checkbox.render();
      await testUtils.waitForDOMUpdate();
      
      const input = el.querySelector('input[type="checkbox"]');
      // Simulate touch by triggering click event (which is what touch events typically do)
      await testUtils.fireClickEvent(input);
      
      await testUtils.waitForDOMUpdate();
      expect(checkbox.isChecked()).toBe(true);
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      checkbox = new Checkbox({ 
        boxLabel: 'Enable feature',
        name: 'feature',
        allowBlank: false
      });
      checkbox.render();
    });

    test('should set aria-checked="mixed" for indeterminate state', async () => {
      checkbox.setIndeterminate(true);
      await testUtils.waitForDOMUpdate();
      
      expect(checkbox.inputEl.getAttribute('aria-checked')).toBe('mixed');
    });

    test('should set aria-checked="true" when checked', async () => {
      checkbox.setChecked(true);
      await testUtils.waitForDOMUpdate();
      
      expect(checkbox.inputEl.getAttribute('aria-checked')).toBe('true');
    });

    test('should set aria-checked="false" when unchecked', async () => {
      checkbox.setChecked(false);
      await testUtils.waitForDOMUpdate();
      
      expect(checkbox.inputEl.getAttribute('aria-checked')).toBe('false');
    });

    test('should set aria-required for required checkboxes', () => {
      expect(checkbox.inputEl.getAttribute('aria-required')).toBe('true');
    });

    test('should not set aria-required for optional checkboxes', () => {
      checkbox = new Checkbox({ allowBlank: true });
      const el = checkbox.render();
      
      expect(checkbox.inputEl.hasAttribute('aria-required')).toBe(false);
    });

    test('should set aria-invalid when validation fails', async () => {
      checkbox = new Checkbox({
        allowBlank: false,
        validators: [{ type: 'required', message: 'Must be checked' }]
      });
      checkbox.render();
      
      checkbox.setChecked(false);
      checkbox.validate();
      
      expect(checkbox.inputEl.getAttribute('aria-invalid')).toBe('true');
    });

    test('should remove aria-invalid when validation passes', async () => {
      checkbox = new Checkbox({
        allowBlank: false,
        validators: [{ type: 'required', message: 'Must be checked' }]
      });
      checkbox.render();
      
      checkbox.setChecked(false);
      checkbox.validate();
      expect(checkbox.inputEl.getAttribute('aria-invalid')).toBe('true');
      
      checkbox.setChecked(true);
      checkbox.validate();
      expect(checkbox.inputEl.hasAttribute('aria-invalid')).toBe(false);
    });

    test('should associate error messages with aria-describedby', async () => {
      checkbox = new Checkbox({
        allowBlank: false,
        validators: [{ type: 'required', message: 'This checkbox is required' }]
      });
      checkbox.renderTo(testUtils.createContainer());
      
      checkbox.setChecked(false);
      checkbox.validate();
      
      const ariaDescribedby = checkbox.inputEl.getAttribute('aria-describedby');
      if (ariaDescribedby) {
        const errorElement = document.getElementById(ariaDescribedby);
        expect(errorElement).toBeTruthy();
        expect(errorElement.textContent).toBe('This checkbox is required');
      }
    });

    test('should have proper role for checkbox variant', () => {
      expect(checkbox.inputEl.getAttribute('role')).toBe('checkbox');
    });

    test('should have proper role for switch variant', () => {
      checkbox = new Checkbox({ variant: 'switch' });
      const el = checkbox.render();
      
      expect(checkbox.inputEl.getAttribute('role')).toBe('switch');
    });

    test('should associate label with input using for attribute', () => {
      const label = checkbox.el.querySelector('label');
      const input = checkbox.el.querySelector('input');
      
      expect(label.getAttribute('for')).toBe(input.id);
    });

    test('should be focusable by default', () => {
      expect(checkbox.inputEl.tabIndex).not.toBe(-1);
    });

    test('should support keyboard navigation in groups', async () => {
      // Test that individual checkboxes support Space/Enter
      await testUtils.fireKeyEvent(checkbox.inputEl, ' ', 'keydown');
      expect(checkbox.isChecked()).toBe(true);
      
      await testUtils.fireKeyEvent(checkbox.inputEl, 'Enter', 'keydown');
      expect(checkbox.isChecked()).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle null config', () => {
      expect(() => new Checkbox(null)).not.toThrow();
    });

    test('should handle empty box label', () => {
      checkbox = new Checkbox({ boxLabel: '' });
      const el = checkbox.render();

      expect(el.querySelector('.aionda-checkbox-label')).toBeNull();
    });

    test('should handle both field label and box label', () => {
      checkbox = new Checkbox({
        fieldLabel: 'Field Label',
        boxLabel: 'Box Label'
      });
      const el = checkbox.render();

      expect(el.textContent).toContain('Field Label');
      expect(el.textContent).toContain('Box Label');
    });

    test('should handle invalid variant gracefully', () => {
      checkbox = new Checkbox({ variant: 'invalid' });
      
      expect(() => checkbox.render()).not.toThrow();
    });

    test('should handle missing input element gracefully', () => {
      checkbox = new Checkbox();
      
      expect(() => {
        checkbox.focus();
        checkbox.blur();
        checkbox.setChecked(true);
      }).not.toThrow();
    });
  });
});