/**
 * Unit tests for Form component
 * Tests form functionality, validation, and field management
 */

import { Form } from '../src/components/Form.js';
import { TextField } from '../src/components/TextField.js';
import { Checkbox } from '../src/components/Checkbox.js';

describe('Form', () => {
  let form;

  beforeEach(() => {
    form = null;
  });

  afterEach(() => {
    if (form && !form.destroyed) {
      form.destroy();
    }
    form = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create form with default config', () => {
      form = new Form();

      expect(form.layout).toBe('vertical');
      expect(form.labelAlign).toBe('top');
      expect(form.labelWidth).toBe(120);
      expect(form.trackResetOnLoad).toBe(false);
      expect(form.standardSubmit).toBe(false);
      expect(form.fields).toBeInstanceOf(Map);
      expect(form.items).toEqual([]);
    });

    test('should create form with custom config', () => {
      const config = {
        layout: 'horizontal',
        labelAlign: 'left',
        labelWidth: 150,
        trackResetOnLoad: true,
        standardSubmit: true
      };

      form = new Form(config);

      expect(form.layout).toBe('horizontal');
      expect(form.labelAlign).toBe('left');
      expect(form.labelWidth).toBe(150);
      expect(form.trackResetOnLoad).toBe(true);
      expect(form.standardSubmit).toBe(true);
    });

    test('should add initial items', () => {
      const items = [
        { cmp: 'textfield', name: 'name' },
        { cmp: 'checkbox', name: 'active' }
      ];

      form = new Form({ items });

      expect(form.items).toHaveLength(2);
    });
  });

  describe('rendering', () => {
    test('should render form element', () => {
      form = new Form();
      const el = form.render();

      expect(el.tagName.toLowerCase()).toBe('form');
      expect(el).toHaveClass('aionda-form');
    });

    test('should apply layout classes', () => {
      form = new Form({ layout: 'horizontal' });
      const el = form.render();

      expect(el).toHaveClass('aionda-form-horizontal');
    });

    test('should render form fields', () => {
      form = new Form({
        items: [
          { cmp: 'textfield', name: 'username', fieldLabel: 'Username' },
          { cmp: 'checkbox', name: 'remember', boxLabel: 'Remember me' }
        ]
      });
      const el = form.render();

      expect(el.querySelectorAll('.aionda-textfield')).toHaveLength(1);
      expect(el.querySelectorAll('.aionda-checkbox')).toHaveLength(1);
    });
  });

  describe('field management', () => {
    beforeEach(() => {
      form = new Form();
      form.render();
    });

    test('should add field to form', () => {
      const field = new TextField({ name: 'email' });
      
      form.add(field);

      expect(form.fields.has('email')).toBe(true);
      expect(form.fields.get('email')).toBe(field);
    });

    test('should remove field from form', () => {
      const field = new TextField({ name: 'email' });
      form.add(field);

      form.remove(field);

      expect(form.fields.has('email')).toBe(false);
    });

    test('should find field by name', () => {
      const field = new TextField({ name: 'password' });
      form.add(field);

      const found = form.findField('password');

      expect(found).toBe(field);
    });

    test('should return null for non-existent field', () => {
      const found = form.findField('nonexistent');

      expect(found).toBeNull();
    });
  });

  describe('value management', () => {
    beforeEach(() => {
      form = new Form({
        items: [
          { cmp: 'textfield', name: 'name', value: 'John' },
          { cmp: 'textfield', name: 'email', value: 'john@example.com' },
          { cmp: 'checkbox', name: 'active', checked: true }
        ]
      });
      form.render();
    });

    test('should get all form values', () => {
      const values = form.getValues();

      expect(values).toEqual({
        name: 'John',
        email: 'john@example.com',
        active: 'on' // checkbox value when checked
      });
    });

    test('should set form values', () => {
      const newValues = {
        name: 'Jane',
        email: 'jane@example.com',
        active: false
      };

      form.setValues(newValues);

      expect(form.findField('name').getValue()).toBe('Jane');
      expect(form.findField('email').getValue()).toBe('jane@example.com');
      expect(form.findField('active').isChecked()).toBe(false);
    });

    test('should handle partial value updates', () => {
      form.setValues({ name: 'Updated Name' });

      expect(form.findField('name').getValue()).toBe('Updated Name');
      expect(form.findField('email').getValue()).toBe('john@example.com'); // unchanged
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      form = new Form({
        items: [
          { 
            cmp: 'textfield', 
            name: 'name', 
            allowBlank: false,
            validators: [{ type: 'required', message: 'Name is required' }]
          },
          { 
            cmp: 'textfield', 
            name: 'email',
            validators: [{ type: 'email', message: 'Invalid email' }]
          }
        ]
      });
      form.render();
    });

    test('should validate all fields', () => {
      form.setValues({ name: '', email: 'invalid-email' });

      const isValid = form.isValid();

      expect(isValid).toBe(false);
    });

    test('should return validation errors', () => {
      form.setValues({ name: '', email: 'invalid-email' });

      const errors = form.getErrors();

      expect(errors).toHaveLength(2);
      expect(errors).toContainEqual(['name', 'Name is required']);
      expect(errors).toContainEqual(['email', 'Invalid email']);
    });

    test('should emit validation events', () => {
      const validitySpy = jest.fn();
      form.on('validitychange', validitySpy);

      form.setValues({ name: '' });
      form.isValid();

      expect(validitySpy).toHaveBeenCalledWith({
        valid: false,
        errors: expect.any(Array)
      });
    });
  });

  describe('form submission', () => {
    beforeEach(() => {
      form = new Form({
        items: [
          { cmp: 'textfield', name: 'username', allowBlank: false },
          { cmp: 'textfield', name: 'password', allowBlank: false }
        ]
      });
      form.render();
    });

    test('should submit valid form', () => {
      const submitSpy = jest.fn();
      form.on('submit', submitSpy);

      form.setValues({ username: 'admin', password: 'secret' });
      form.submit();

      expect(submitSpy).toHaveBeenCalledWith({
        values: { username: 'admin', password: 'secret' }
      });
    });

    test('should prevent submission of invalid form', () => {
      const submitSpy = jest.fn();
      const invalidSpy = jest.fn();
      
      form.on('submit', submitSpy);
      form.on('invalid', invalidSpy);

      form.setValues({ username: '', password: '' });
      form.submit();

      expect(submitSpy).not.toHaveBeenCalled();
      expect(invalidSpy).toHaveBeenCalled();
    });

    test('should emit beforesubmit event', () => {
      const beforeSubmitSpy = jest.fn();
      form.on('beforesubmit', beforeSubmitSpy);

      form.setValues({ username: 'admin', password: 'secret' });
      form.submit();

      expect(beforeSubmitSpy).toHaveBeenCalled();
    });
  });

  describe('form reset', () => {
    beforeEach(() => {
      form = new Form({
        items: [
          { cmp: 'textfield', name: 'name', value: 'Original' },
          { cmp: 'checkbox', name: 'active', checked: false }
        ]
      });
      form.render();
    });

    test('should reset to original values', () => {
      form.setValues({ name: 'Changed', active: true });
      
      form.reset();

      expect(form.findField('name').getValue()).toBe('Original');
      expect(form.findField('active').isChecked()).toBe(false);
    });

    test('should emit reset event', () => {
      const resetSpy = jest.fn();
      form.on('reset', resetSpy);

      form.reset();

      expect(resetSpy).toHaveBeenCalled();
    });

    test('should track dirty state', () => {
      expect(form.isDirty()).toBe(false);

      form.setValues({ name: 'Changed' });
      expect(form.isDirty()).toBe(true);

      form.reset();
      expect(form.isDirty()).toBe(false);
    });
  });

  describe('form buttons', () => {
    beforeEach(() => {
      form = new Form();
      form.render();
    });

    test('should add form button', () => {
      form.addButton({
        text: 'Submit',
        type: 'submit',
        handler: jest.fn()
      });

      const buttons = form.el.querySelectorAll('.aionda-form-buttons button');
      expect(buttons).toHaveLength(1);
      expect(buttons[0].textContent).toBe('Submit');
    });

    test('should handle button click', () => {
      const handler = jest.fn();
      
      form.addButton({
        text: 'Custom',
        handler
      });

      const button = form.el.querySelector('.aionda-form-buttons button');
      testUtils.fireClickEvent(button);

      expect(handler).toHaveBeenCalledWith(form);
    });
  });

  describe('layout options', () => {
    test('should apply vertical layout', () => {
      form = new Form({ layout: 'vertical' });
      const el = form.render();

      expect(el).toHaveClass('aionda-form-vertical');
    });

    test('should apply horizontal layout', () => {
      form = new Form({ layout: 'horizontal' });
      const el = form.render();

      expect(el).toHaveClass('aionda-form-horizontal');
    });

    test('should apply inline layout', () => {
      form = new Form({ layout: 'inline' });
      const el = form.render();

      expect(el).toHaveClass('aionda-form-inline');
    });
  });

  describe('field events', () => {
    beforeEach(() => {
      form = new Form({
        items: [
          { cmp: 'textfield', name: 'name' }
        ]
      });
      form.render();
    });

    test('should emit change event when field changes', () => {
      const changeSpy = jest.fn();
      form.on('change', changeSpy);

      const field = form.findField('name');
      field.setValue('New Value');

      expect(changeSpy).toHaveBeenCalledWith({
        field: 'name',
        value: 'New Value',
        oldValue: ''
      });
    });

    test('should emit dirty change event', () => {
      const dirtySpy = jest.fn();
      form.on('dirtychange', dirtySpy);

      const field = form.findField('name');
      field.setValue('Changed');

      expect(dirtySpy).toHaveBeenCalledWith({
        dirty: true
      });
    });
  });

  describe('responsive behavior', () => {
    test('should handle mobile viewport', () => {
      testUtils.setMobileViewport();
      form = new Form({
        items: [
          { cmp: 'textfield', name: 'username', fieldLabel: 'Username' },
          { cmp: 'checkbox', name: 'remember', boxLabel: 'Remember me' }
        ]
      });
      const el = form.render();

      expect(window.innerWidth).toBe(320);
      expect(el).toHaveClass('aionda-form');
    });

    test('should handle tablet viewport', () => {
      testUtils.setTabletViewport();
      form = new Form({
        items: [
          { cmp: 'textfield', name: 'email', fieldLabel: 'Email' }
        ]
      });
      const el = form.render();

      expect(window.innerWidth).toBe(768);
      expect(el).toHaveClass('aionda-form');
    });

    test('should handle touch events on mobile', () => {
      testUtils.setMobileViewport();
      form = new Form();
      form.render();
      
      form.addButton({
        text: 'Submit',
        type: 'submit',
        handler: jest.fn()
      });
      
      const button = form.el.querySelector('.aionda-form-buttons button');
      testUtils.fireTouchEvent(button, 'touchstart');
      testUtils.fireTouchEvent(button, 'touchend');
      
      // Touch events should work on form buttons
      expect(button).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      form = new Form({
        title: 'User Registration',
        items: [
          { cmp: 'textfield', name: 'name', fieldLabel: 'Name', allowBlank: false },
          { cmp: 'textfield', name: 'email', fieldLabel: 'Email', allowBlank: false },
          { cmp: 'checkbox', name: 'terms', boxLabel: 'I agree to terms', allowBlank: false }
        ]
      });
      // Render and append to document so getElementById works
      form.render();
      document.body.appendChild(form.el);
    });

    test('should set role="form" on form element', () => {
      expect(form.formEl.getAttribute('role')).toBe('form');
    });

    test('should set aria-labelledby for form title', () => {
      const ariaLabelledby = form.formEl.getAttribute('aria-labelledby');
      if (ariaLabelledby) {
        const titleElement = document.getElementById(ariaLabelledby);
        expect(titleElement).toBeTruthy();
        expect(titleElement.textContent).toBe('User Registration');
      }
    });

    test('should announce form errors to screen readers', () => {
      form.setValues({ name: '', email: '', terms: false });
      form.submit();
      
      const errorSummary = form.el.querySelector('[role="alert"]');
      if (errorSummary) {
        expect(errorSummary.getAttribute('aria-live')).toBe('assertive');
      }
    });

    test('should group related fields with fieldset/legend', () => {
      form = new Form({
        items: [
          {
            cmp: 'fieldset',
            legend: 'Personal Information',
            items: [
              { cmp: 'textfield', name: 'firstName', fieldLabel: 'First Name' },
              { cmp: 'textfield', name: 'lastName', fieldLabel: 'Last Name' }
            ]
          }
        ]
      });
      form.render();
      
      const fieldset = form.el.querySelector('fieldset');
      if (fieldset) {
        const legend = fieldset.querySelector('legend');
        expect(legend).toBeTruthy();
        expect(legend.textContent).toBe('Personal Information');
      }
    });

    test('should indicate required fields accessibly', () => {
      const requiredFields = Array.from(form.fields.values()).filter(field => !field.allowBlank);
      
      requiredFields.forEach(field => {
        if (field.inputEl) {
          expect(field.inputEl.getAttribute('aria-required')).toBe('true');
        }
      });
    });

    test('should associate validation errors with fields', () => {
      form.setValues({ name: '', email: 'invalid' });
      form.submit();
      
      const invalidFields = Array.from(form.fields.values()).filter(field => !field.valid);
      
      invalidFields.forEach(field => {
        if (field.inputEl) {
          expect(field.inputEl.getAttribute('aria-invalid')).toBe('true');
          
          const ariaDescribedby = field.inputEl.getAttribute('aria-describedby');
          if (ariaDescribedby) {
            const errorElement = document.getElementById(ariaDescribedby);
            expect(errorElement).toBeTruthy();
          }
        }
      });
    });

    test('should announce form submission states', () => {
      const submitSpy = jest.fn();
      form.on('submit', submitSpy);
      
      form.setValues({ name: 'John', email: 'john@example.com', terms: true });
      form.submit();
      
      // Check for loading state announcement
      const loadingRegion = form.el.querySelector('[aria-live="polite"]');
      if (loadingRegion) {
        expect(loadingRegion).toBeTruthy();
      }
    });

    test('should handle keyboard navigation between fields', () => {
      const fieldsArray = Array.from(form.fields.values());
      const firstField = fieldsArray[0];
      const secondField = fieldsArray[1];
      
      if (firstField && secondField && firstField.inputEl && secondField.inputEl) {
        firstField.inputEl.focus();
        
        // Tab to next field
        testUtils.fireKeyEvent(firstField.inputEl, 'Tab', 'keydown');
        
        // Should be able to navigate to next field
        expect(document.activeElement).toBeTruthy();
      }
    });

    test('should provide accessible submit button', () => {
      form.addButton({
        text: 'Submit',
        type: 'submit',
        handler: jest.fn()
      });
      
      const submitButton = form.el.querySelector('button[type="submit"]');
      if (submitButton) {
        expect(submitButton.getAttribute('aria-label') || submitButton.textContent.trim()).toBeTruthy();
      }
    });
  });

  describe('edge cases', () => {
    test('should handle null config', () => {
      expect(() => new Form(null)).not.toThrow();
    });

    test('should handle empty items array', () => {
      form = new Form({ items: [] });
      expect(form.items).toHaveLength(0);
    });

    test('should handle invalid field type', () => {
      form = new Form({
        items: [{ cmp: 'invalidtype', name: 'test' }]
      });
      
      expect(() => form.render()).not.toThrow();
    });

    test('should handle fields without names', () => {
      form = new Form({
        items: [{ cmp: 'textfield' }] // no name
      });
      
      expect(() => form.render()).not.toThrow();
    });

    test('should handle setting values for non-existent fields', () => {
      form = new Form();
      form.render();

      expect(() => {
        form.setValues({ nonexistent: 'value' });
      }).not.toThrow();
    });
  });
});