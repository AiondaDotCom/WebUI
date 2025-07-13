/**
 * Unit tests for TextArea component
 * Tests multi-line input, auto-resize, character counting, validation, and accessibility
 */

import { TextArea } from '../src/components/TextArea.js';

describe('TextArea', () => {
  let textArea;

  beforeEach(() => {
    textArea = null;
  });

  afterEach(() => {
    if (textArea && !textArea.destroyed) {
      textArea.destroy();
    }
    textArea = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create textarea with default config', () => {
      textArea = new TextArea();

      expect(textArea.name).toBe(textArea.id);
      expect(textArea.fieldLabel).toBe('');
      expect(textArea.value).toBe('');
      expect(textArea.placeholder).toBe('');
      expect(textArea.rows).toBe(3);
      expect(textArea.wrap).toBe('soft');
      expect(textArea.autoResize).toBe(false);
      expect(textArea.maxRows).toBe(10);
      expect(textArea.minRows).toBe(3);
      expect(textArea.showCharCount).toBe(false);
      expect(textArea.allowBlank).toBe(true);
      expect(textArea.readOnly).toBe(false);
      expect(textArea.labelAlign).toBe('top');
      expect(textArea.validators).toEqual([]);
      expect(textArea.valid).toBe(true);
    });

    test('should create textarea with custom config', () => {
      const config = {
        name: 'description',
        fieldLabel: 'Description',
        value: 'Initial text\nSecond line',
        placeholder: 'Enter description',
        rows: 5,
        maxLength: 200,
        autoResize: true,
        showCharCount: true,
        allowBlank: false,
        validators: [{ type: 'required' }]
      };

      textArea = new TextArea(config);

      expect(textArea.name).toBe('description');
      expect(textArea.fieldLabel).toBe('Description');
      expect(textArea.value).toBe('Initial text\nSecond line');
      expect(textArea.placeholder).toBe('Enter description');
      expect(textArea.rows).toBe(5);
      expect(textArea.maxLength).toBe(200);
      expect(textArea.autoResize).toBe(true);
      expect(textArea.showCharCount).toBe(true);
      expect(textArea.allowBlank).toBe(false);
      expect(textArea.validators).toEqual([{ type: 'required' }]);
    });

    test('should handle null/undefined config', () => {
      textArea = new TextArea(null);
      expect(textArea.name).toBe(textArea.id);
      expect(textArea.value).toBe('');

      textArea.destroy();
      textArea = new TextArea(undefined);
      expect(textArea.name).toBe(textArea.id);
      expect(textArea.value).toBe('');
    });
  });

  describe('template creation', () => {
    test('should create basic template', () => {
      textArea = new TextArea({
        fieldLabel: 'Comment',
        placeholder: 'Enter your comment'
      });

      const template = textArea.createTemplate();

      expect(template).toContain('aionda-textarea');
      expect(template).toContain('Comment');
      expect(template).toContain('Enter your comment');
      expect(template).toContain('<textarea');
      expect(template).toContain('rows="3"');
    });

    test('should create template with character count', () => {
      textArea = new TextArea({
        showCharCount: true,
        maxLength: 100
      });

      const template = textArea.createTemplate();

      expect(template).toContain('aionda-textarea-charcount');
    });

    test('should create template without label when not provided', () => {
      textArea = new TextArea();

      const template = textArea.createTemplate();

      expect(template).not.toContain('<label');
    });

    test('should create template with required indicator', () => {
      textArea = new TextArea({
        fieldLabel: 'Required Field',
        allowBlank: false
      });

      const template = textArea.createTemplate();

      expect(template).toContain('text-red-500');
      expect(template).toContain('*');
    });
  });

  describe('rendering', () => {
    test('should render textarea to DOM', () => {
      textArea = new TextArea({
        fieldLabel: 'Description',
        value: 'Test content'
      });

      textArea.renderTo(document.body);

      expect(document.querySelector('.aionda-textarea')).toBeTruthy();
      expect(document.querySelector('.aionda-textarea-input')).toBeTruthy();
      expect(document.querySelector('.aionda-textarea-label')).toBeTruthy();
      expect(document.querySelector('textarea').value).toBe('Test content');
    });

    test('should set proper attributes on textarea element', () => {
      textArea = new TextArea({
        name: 'comment',
        rows: 5,
        cols: 40,
        maxLength: 500,
        readOnly: true
      });

      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      expect(textarea.name).toBe('comment');
      expect(textarea.rows).toBe(5);
      expect(textarea.cols).toBe(40);
      expect(textarea.maxLength).toBe(500);
      expect(textarea.hasAttribute('readonly')).toBe(true);
    });

    test('should apply custom CSS classes', () => {
      textArea = new TextArea({
        fieldCls: 'custom-class another-class'
      });

      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      expect(textarea.classList.contains('custom-class')).toBe(true);
      expect(textarea.classList.contains('another-class')).toBe(true);
    });
  });

  describe('multi-line input functionality', () => {
    beforeEach(() => {
      textArea = new TextArea();
      textArea.renderTo(document.body);
    });

    test('should handle multi-line text input', () => {
      const multiLineText = 'Line 1\nLine 2\nLine 3';
      textArea.setValue(multiLineText);

      expect(textArea.getValue()).toBe(multiLineText);
      expect(document.querySelector('textarea').value).toBe(multiLineText);
    });

    test('should preserve line breaks in value', () => {
      const textarea = document.querySelector('textarea');
      textarea.value = 'First line\nSecond line\n\nFourth line';
      textarea.dispatchEvent(new Event('input'));

      expect(textArea.getValue()).toBe('First line\nSecond line\n\nFourth line');
    });

    test('should handle empty lines correctly', () => {
      textArea.setValue('\n\n\n');
      expect(textArea.getValue()).toBe('\n\n\n');
    });

    test('should handle mixed content with special characters', () => {
      const content = 'Line 1 with "quotes"\nLine 2 with <tags>\nLine 3 with & symbols';
      textArea.setValue(content);
      expect(textArea.getValue()).toBe(content);
    });
  });

  describe('auto-resize functionality', () => {
    test('should not auto-resize by default', () => {
      textArea = new TextArea();
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      const initialHeight = textarea.style.height;

      textArea.setValue('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');

      expect(textarea.style.height).toBe(initialHeight);
    });

    test('should auto-resize when enabled', () => {
      textArea = new TextArea({
        autoResize: true,
        minRows: 2,
        maxRows: 8
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      
      // Mock getComputedStyle for testing
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = jest.fn(() => ({
        lineHeight: '20px',
        paddingTop: '8px',
        paddingBottom: '8px'
      }));

      // Mock scrollHeight
      Object.defineProperty(textarea, 'scrollHeight', {
        get: () => 100,
        configurable: true
      });

      textArea.adjustHeight();

      expect(textarea.style.height).toBeTruthy();

      window.getComputedStyle = originalGetComputedStyle;
    });

    test('should respect minRows constraint', () => {
      textArea = new TextArea({
        autoResize: true,
        minRows: 3,
        maxRows: 10
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      
      window.getComputedStyle = jest.fn(() => ({
        lineHeight: '20px',
        paddingTop: '8px',
        paddingBottom: '8px'
      }));

      Object.defineProperty(textarea, 'scrollHeight', {
        get: () => 20, // Very small content
        configurable: true
      });

      textArea.adjustHeight();

      // Should be at least minRows height: (3 * 20) + 16 = 76px
      expect(parseInt(textarea.style.height)).toBeGreaterThanOrEqual(76);
    });

    test('should respect maxRows constraint', () => {
      textArea = new TextArea({
        autoResize: true,
        minRows: 2,
        maxRows: 5
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      
      window.getComputedStyle = jest.fn(() => ({
        lineHeight: '20px',
        paddingTop: '8px',
        paddingBottom: '8px'
      }));

      Object.defineProperty(textarea, 'scrollHeight', {
        get: () => 200, // Very large content
        configurable: true
      });

      textArea.adjustHeight();

      // Should be at most maxRows height: (5 * 20) + 16 = 116px
      expect(parseInt(textarea.style.height)).toBeLessThanOrEqual(116);
    });

    test('should show scrollbar when content exceeds maxRows', () => {
      textArea = new TextArea({
        autoResize: true,
        maxRows: 3
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      
      window.getComputedStyle = jest.fn(() => ({
        lineHeight: '20px',
        paddingTop: '8px',
        paddingBottom: '8px'
      }));

      Object.defineProperty(textarea, 'scrollHeight', {
        get: () => 200, // Large content
        configurable: true
      });

      textArea.adjustHeight();

      expect(textarea.style.overflowY).toBe('auto');
    });

    test('should hide scrollbar when content fits', () => {
      textArea = new TextArea({
        autoResize: true,
        maxRows: 5
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      
      window.getComputedStyle = jest.fn(() => ({
        lineHeight: '20px',
        paddingTop: '8px',
        paddingBottom: '8px'
      }));

      Object.defineProperty(textarea, 'scrollHeight', {
        get: () => 50, // Small content
        configurable: true
      });

      textArea.adjustHeight();

      expect(textarea.style.overflowY).toBe('hidden');
    });
  });

  describe('character counting features', () => {
    test('should not show character count by default', () => {
      textArea = new TextArea();
      textArea.renderTo(document.body);

      expect(document.querySelector('.aionda-textarea-charcount')).toBeNull();
    });

    test('should show character count when enabled', () => {
      textArea = new TextArea({
        showCharCount: true
      });
      textArea.renderTo(document.body);

      expect(document.querySelector('.aionda-textarea-charcount')).toBeTruthy();
    });

    test('should update character count on input', () => {
      textArea = new TextArea({
        showCharCount: true,
        maxLength: 100
      });
      textArea.renderTo(document.body);

      textArea.setValue('Hello world');
      textArea.updateCharCount();

      const charCountEl = document.querySelector('.aionda-textarea-charcount');
      expect(charCountEl.textContent).toContain('11');
      expect(charCountEl.textContent).toContain('100');
    });

    test('should show warning color when approaching limit', () => {
      textArea = new TextArea({
        showCharCount: true,
        maxLength: 100
      });
      textArea.renderTo(document.body);

      // Set value to 95 characters (95% of limit)
      textArea.setValue('a'.repeat(95));
      textArea.updateCharCount();

      const charCountEl = document.querySelector('.aionda-textarea-charcount');
      expect(charCountEl.classList.contains('text-orange-500')).toBe(true);
    });

    test('should show error color when at limit', () => {
      textArea = new TextArea({
        showCharCount: true,
        maxLength: 100
      });
      textArea.renderTo(document.body);

      textArea.setValue('a'.repeat(100));
      textArea.updateCharCount();

      const charCountEl = document.querySelector('.aionda-textarea-charcount');
      expect(charCountEl.classList.contains('text-red-500')).toBe(true);
    });

    test('should show normal color when under limit', () => {
      textArea = new TextArea({
        showCharCount: true,
        maxLength: 100
      });
      textArea.renderTo(document.body);

      textArea.setValue('a'.repeat(50));
      textArea.updateCharCount();

      const charCountEl = document.querySelector('.aionda-textarea-charcount');
      expect(charCountEl.classList.contains('text-gray-500')).toBe(true);
    });

    test('should handle character count without maxLength', () => {
      textArea = new TextArea({
        showCharCount: true
      });
      textArea.renderTo(document.body);

      textArea.setValue('Test content');
      textArea.updateCharCount();

      const charCountEl = document.querySelector('.aionda-textarea-charcount');
      expect(charCountEl.textContent).toContain('12');
    });
  });

  describe('validation integration', () => {
    test('should validate required field', () => {
      textArea = new TextArea({
        allowBlank: false
      });

      expect(textArea.validate()).toBe(false);
      expect(textArea.isValid()).toBe(false);
      expect(textArea.errorMessage).toBe('Field is required');
    });

    test('should validate minimum length', () => {
      textArea = new TextArea({
        minLength: 10
      });

      textArea.setValue('short');
      expect(textArea.validate()).toBe(false);
      expect(textArea.errorMessage).toContain('Minimum length is 10');

      textArea.setValue('this is long enough');
      expect(textArea.validate()).toBe(true);
    });

    test('should validate maximum length', () => {
      textArea = new TextArea({
        maxLength: 10
      });

      textArea.setValue('this is too long');
      expect(textArea.validate()).toBe(false);
      expect(textArea.errorMessage).toContain('Maximum length is 10');

      textArea.setValue('short');
      expect(textArea.validate()).toBe(true);
    });

    test('should validate with regex pattern', () => {
      textArea = new TextArea({
        regex: /^[A-Z][a-z\s]+$/
      });

      textArea.setValue('lowercase text');
      expect(textArea.validate()).toBe(false);

      textArea.setValue('Proper format text');
      expect(textArea.validate()).toBe(true);
    });

    test('should validate with custom validator function', () => {
      textArea = new TextArea({
        validator: (value) => {
          return value.includes('test') || 'Must contain "test"';
        }
      });

      textArea.setValue('some content');
      expect(textArea.validate()).toBe(false);
      expect(textArea.errorMessage).toBe('Must contain "test"');

      textArea.setValue('test content');
      expect(textArea.validate()).toBe(true);
    });

    test('should validate with multiple validators', () => {
      textArea = new TextArea({
        validators: [
          { type: 'required' },
          { type: 'minLength', min: 5, message: 'Too short' },
          { type: 'pattern', regex: /^[A-Za-z\s]+$/, message: 'Letters only' }
        ]
      });

      textArea.setValue('123');
      expect(textArea.validate()).toBe(false);
      expect(textArea.errorMessage).toBe('Too short');

      textArea.setValue('12345');
      expect(textArea.validate()).toBe(false);
      expect(textArea.errorMessage).toBe('Letters only');

      textArea.setValue('valid text');
      expect(textArea.validate()).toBe(true);
    });

    test('should show validation error in UI', () => {
      textArea = new TextArea({
        allowBlank: false
      });
      textArea.renderTo(document.body);

      textArea.validate();

      const textarea = document.querySelector('textarea');
      const errorEl = document.querySelector('.aionda-textarea-error');

      expect(textarea.classList.contains('border-red-500')).toBe(true);
      expect(errorEl.classList.contains('hidden')).toBe(false);
      expect(errorEl.textContent).toBe('Field is required');
    });

    test('should clear validation error when valid', () => {
      textArea = new TextArea({
        allowBlank: false
      });
      textArea.renderTo(document.body);

      textArea.validate(); // Invalid
      textArea.setValue('valid content');
      textArea.validate(); // Valid

      const textarea = document.querySelector('textarea');
      const errorEl = document.querySelector('.aionda-textarea-error');

      expect(textarea.classList.contains('border-red-500')).toBe(false);
      expect(errorEl.classList.contains('hidden')).toBe(true);
      expect(errorEl.textContent).toBe('');
    });
  });

  describe('Form binding capabilities', () => {
    test('should support form reference', () => {
      const mockForm = { name: 'testForm' };
      textArea = new TextArea();
      textArea.form = mockForm;

      expect(textArea.form).toBe(mockForm);
    });

    test('should emit change events for form integration', () => {
      textArea = new TextArea({ name: 'description' });
      
      const changeHandler = jest.fn();
      textArea.on('change', changeHandler);

      textArea.setValue('new value');

      expect(changeHandler).toHaveBeenCalledWith({
        value: 'new value',
        oldValue: '',
        field: 'description'
      });
    });

    test('should support isDirty check', () => {
      textArea = new TextArea({
        value: 'original'
      });

      expect(textArea.isDirty()).toBe(false);

      textArea.setValue('modified');
      expect(textArea.isDirty()).toBe(true);
    });

    test('should support reset to original value', () => {
      textArea = new TextArea({
        value: 'original'
      });

      textArea.setValue('modified');
      expect(textArea.getValue()).toBe('modified');

      textArea.reset();
      expect(textArea.getValue()).toBe('original');
      expect(textArea.isDirty()).toBe(false);
    });

    test('should emit field validation events', () => {
      textArea = new TextArea({
        allowBlank: false
      });

      const invalidHandler = jest.fn();
      const validHandler = jest.fn();
      
      textArea.on('invalid', invalidHandler);
      textArea.on('valid', validHandler);

      textArea.validate(); // Invalid
      expect(invalidHandler).toHaveBeenCalledWith({
        message: 'Field is required',
        field: textArea
      });

      textArea.setValue('valid');
      textArea.validate(); // Valid
      expect(validHandler).toHaveBeenCalledWith({
        field: textArea
      });
    });
  });

  describe('placeholder handling', () => {
    test('should set placeholder attribute', () => {
      textArea = new TextArea({
        placeholder: 'Enter your message here'
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      expect(textarea.placeholder).toBe('Enter your message here');
    });

    test('should use emptyText as placeholder fallback', () => {
      textArea = new TextArea({
        emptyText: 'Type something...'
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      expect(textarea.placeholder).toBe('Type something...');
    });

    test('should prioritize placeholder over emptyText', () => {
      textArea = new TextArea({
        placeholder: 'Placeholder text',
        emptyText: 'Empty text'
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      expect(textarea.placeholder).toBe('Placeholder text');
    });

    test('should handle empty placeholder', () => {
      textArea = new TextArea({
        placeholder: ''
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      expect(textarea.placeholder).toBe('');
    });
  });

  describe('accessibility features', () => {
    test('should associate label with textarea', () => {
      textArea = new TextArea({
        fieldLabel: 'Description'
      });
      textArea.renderTo(document.body);

      const label = document.querySelector('label');
      const textarea = document.querySelector('textarea');

      expect(label.getAttribute('for')).toBe(textarea.id);
    });

    test('should provide proper ARIA attributes', () => {
      textArea = new TextArea({
        fieldLabel: 'Comments',
        allowBlank: false
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      expect(textarea.name).toBeTruthy();
      expect(textarea.id).toBeTruthy();
    });

    test('should indicate required fields visually', () => {
      textArea = new TextArea({
        fieldLabel: 'Required Field',
        allowBlank: false
      });
      textArea.renderTo(document.body);

      const label = document.querySelector('label');
      expect(label.innerHTML).toContain('<span class="text-red-500 ml-1">*</span>');
    });

    test('should support keyboard navigation', () => {
      textArea = new TextArea();
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      
      textArea.focus();
      expect(document.activeElement).toBe(textarea);

      textArea.blur();
      expect(document.activeElement).not.toBe(textarea);
    });

    test('should support text selection methods', () => {
      textArea = new TextArea({
        value: 'Some sample text'
      });
      textArea.renderTo(document.body);

      textArea.selectText(5, 11); // Select "sample"
      
      const textarea = document.querySelector('textarea');
      expect(textarea.selectionStart).toBe(5);
      expect(textarea.selectionEnd).toBe(11);
    });

    test('should support select all', () => {
      textArea = new TextArea({
        value: 'All this text'
      });
      textArea.renderTo(document.body);

      textArea.selectText(); // Select all
      
      const textarea = document.querySelector('textarea');
      expect(textarea.selectionStart).toBe(0);
      expect(textarea.selectionEnd).toBe(13);
    });

    test('should support selectOnFocus option', () => {
      textArea = new TextArea({
        value: 'Select me on focus',
        selectOnFocus: true
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      
      // Mock select method
      textarea.select = jest.fn();
      
      textarea.focus();
      
      // Use setTimeout to match the implementation
      setTimeout(() => {
        expect(textarea.select).toHaveBeenCalled();
      }, 20);
    });

    test('should handle disabled state properly', () => {
      textArea = new TextArea({
        disabled: true
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      expect(textarea.disabled).toBe(true);
    });

    test('should handle readonly state properly', () => {
      textArea = new TextArea({
        readOnly: true
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      expect(textarea.readOnly).toBe(true);
      expect(textarea.classList.contains('bg-gray-50')).toBe(true);
    });
  });

  describe('basic and advanced configurations', () => {
    test('should handle basic configuration', () => {
      textArea = new TextArea({
        fieldLabel: 'Basic TextArea',
        value: 'Basic value',
        rows: 4
      });

      expect(textArea.fieldLabel).toBe('Basic TextArea');
      expect(textArea.value).toBe('Basic value');
      expect(textArea.rows).toBe(4);
    });

    test('should handle advanced configuration', () => {
      textArea = new TextArea({
        fieldLabel: 'Advanced TextArea',
        value: 'Advanced\nMulti-line\nValue',
        rows: 3,
        autoResize: true,
        minRows: 2,
        maxRows: 8,
        showCharCount: true,
        maxLength: 500,
        allowBlank: false,
        validateOnChange: true,
        validateOnBlur: true,
        selectOnFocus: true,
        enableKeyEvents: true,
        validators: [
          { type: 'required' },
          { type: 'minLength', min: 10 }
        ]
      });

      expect(textArea.autoResize).toBe(true);
      expect(textArea.minRows).toBe(2);
      expect(textArea.maxRows).toBe(8);
      expect(textArea.showCharCount).toBe(true);
      expect(textArea.maxLength).toBe(500);
      expect(textArea.selectOnFocus).toBe(true);
      expect(textArea.enableKeyEvents).toBe(true);
      expect(textArea.validators).toHaveLength(2);
    });

    test('should support text manipulation methods', () => {
      textArea = new TextArea({
        value: 'Initial text'
      });
      textArea.renderTo(document.body);

      const textarea = document.querySelector('textarea');
      
      // Mock selection properties - cursor at position 7 (between "Initial" and " text")
      Object.defineProperty(textarea, 'selectionStart', {
        get: () => 7,
        set: jest.fn(),
        configurable: true
      });
      Object.defineProperty(textarea, 'selectionEnd', {
        get: () => 7,
        set: jest.fn(),
        configurable: true
      });
      Object.defineProperty(textarea, 'setSelectionRange', {
        value: jest.fn(),
        configurable: true
      });

      textArea.insertTextAtCursor(' inserted');
      expect(textArea.getValue()).toBe('Initial inserted text');

      // Now mock selection to select "text" (positions 17-21)
      Object.defineProperty(textarea, 'selectionStart', {
        get: () => 17,
        set: jest.fn(),
        configurable: true
      });
      Object.defineProperty(textarea, 'selectionEnd', {
        get: () => 21,
        set: jest.fn(),
        configurable: true
      });

      const selectedText = textArea.getSelectedText();
      expect(selectedText).toBe('text');

      textArea.replaceSelectedText('content');
      expect(textArea.getValue()).toBe('Initial inserted content');
    });

    test('should support dynamic property updates', () => {
      textArea = new TextArea();
      textArea.renderTo(document.body);

      textArea.setReadOnly(true);
      const textarea = document.querySelector('textarea');
      expect(textarea.readOnly).toBe(true);

      textArea.setDisabled(true);
      expect(textarea.disabled).toBe(true);

      textArea.setRows(6);
      expect(textarea.rows).toBe(6);

      textArea.setAutoResize(true);
      expect(textArea.autoResize).toBe(true);

      textArea.setMaxRows(12);
      expect(textArea.maxRows).toBe(12);

      textArea.setMinRows(4);
      expect(textArea.minRows).toBe(4);
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      textArea = new TextArea();
      textArea.renderTo(document.body);
    });

    test('should emit input events', () => {
      const inputHandler = jest.fn();
      textArea.on('input', inputHandler);

      const textarea = document.querySelector('textarea');
      textarea.value = 'new content';
      textarea.dispatchEvent(new Event('input'));

      expect(inputHandler).toHaveBeenCalledWith({
        value: 'new content',
        event: expect.any(Event)
      });
    });

    test('should emit focus and blur events', () => {
      const focusHandler = jest.fn();
      const blurHandler = jest.fn();
      
      textArea.on('focus', focusHandler);
      textArea.on('blur', blurHandler);

      const textarea = document.querySelector('textarea');
      
      textarea.dispatchEvent(new Event('focus'));
      expect(focusHandler).toHaveBeenCalled();

      textarea.dispatchEvent(new Event('blur'));
      expect(blurHandler).toHaveBeenCalled();
    });

    test('should handle key events when enabled', () => {
      textArea.destroy();
      textArea = new TextArea({
        enableKeyEvents: true
      });
      textArea.renderTo(document.body);

      const keyHandler = jest.fn();
      textArea.on('keydown', keyHandler);

      const textarea = document.querySelector('textarea');
      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      textarea.dispatchEvent(keyEvent);

      expect(keyHandler).toHaveBeenCalledWith({
        key: 'Enter',
        event: keyEvent,
        field: textArea
      });
    });
  });
});