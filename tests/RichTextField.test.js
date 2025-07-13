/**
 * @jest-environment jsdom
 */

import { RichTextField } from '../src/components/RichTextField.js';
import '../tests/setup.js';

describe('RichTextField Component', () => {
  let container;
  let richTextField;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (richTextField && !richTextField.destroyed) {
      richTextField.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('Constructor and Configuration', () => {
    test('should create with default configuration', () => {
      richTextField = new RichTextField();
      
      expect(richTextField.fieldLabel).toBe('');
      expect(richTextField.value).toBe('');
      expect(richTextField.height).toBe(200);
      expect(richTextField.allowHtml).toBe(true);
      expect(richTextField.required).toBe(false);
      expect(richTextField.disabled).toBe(false);
      expect(richTextField.placeholder).toBe('Enter text...');
    });

    test('should create with custom configuration', () => {
      const config = {
        fieldLabel: 'Rich Editor',
        value: '<p>Initial content</p>',
        height: 300,
        required: true,
        disabled: true,
        placeholder: 'Custom placeholder',
        toolbar: ['bold', 'italic']
      };

      richTextField = new RichTextField(config);
      
      expect(richTextField.fieldLabel).toBe('Rich Editor');
      expect(richTextField.value).toBe('<p>Initial content</p>');
      expect(richTextField.height).toBe(300);
      expect(richTextField.required).toBe(true);
      expect(richTextField.disabled).toBe(true);
      expect(richTextField.placeholder).toBe('Custom placeholder');
      expect(richTextField.toolbar).toEqual(['bold', 'italic']);
    });

    test('should have default toolbar with all buttons', () => {
      richTextField = new RichTextField();
      
      expect(richTextField.toolbar).toContain('bold');
      expect(richTextField.toolbar).toContain('italic');
      expect(richTextField.toolbar).toContain('underline');
      expect(richTextField.toolbar).toContain('foreColor');
      expect(richTextField.toolbar).toContain('backColor');
      expect(richTextField.toolbar).toContain('fontSize');
      expect(richTextField.toolbar).toContain('fontName');
    });
  });

  describe('Rendering', () => {
    test('should render correctly with field label', () => {
      richTextField = new RichTextField({
        fieldLabel: 'Description',
        required: true
      });
      
      richTextField.renderTo(container);
      
      const label = container.querySelector('label');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Description *');
    });

    test('should render toolbar with buttons', () => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
      
      const toolbar = container.querySelector('.aionda-richtext-toolbar');
      expect(toolbar).toBeTruthy();
      
      const boldButton = container.querySelector('[data-command="bold"]');
      expect(boldButton).toBeTruthy();
      expect(boldButton.textContent.trim()).toBe('B');
    });

    test('should render editor area with correct height', () => {
      richTextField = new RichTextField({ height: 250 });
      richTextField.renderTo(container);
      
      const editor = container.querySelector('.aionda-richtext-editor');
      expect(editor).toBeTruthy();
      expect(editor.style.height).toBe('250px');
    });

    test('should render color picker buttons', () => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
      
      const textColorInput = container.querySelector('input[data-command="foreColor"]');
      const bgColorInput = container.querySelector('input[data-command="backColor"]');
      
      expect(textColorInput).toBeTruthy();
      expect(textColorInput.type).toBe('color');
      expect(bgColorInput).toBeTruthy();
      expect(bgColorInput.type).toBe('color');
    });

    test('should render select dropdowns for font controls', () => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
      
      const fontSizeSelect = container.querySelector('select[data-command="fontSize"]');
      const fontNameSelect = container.querySelector('select[data-command="fontName"]');
      
      expect(fontSizeSelect).toBeTruthy();
      expect(fontNameSelect).toBeTruthy();
      
      expect(fontSizeSelect.options.length).toBeGreaterThan(1);
      expect(fontNameSelect.options.length).toBeGreaterThan(1);
    });

    test('should render with disabled state', () => {
      richTextField = new RichTextField({ disabled: true });
      richTextField.renderTo(container);
      
      const editor = container.querySelector('.aionda-richtext-editor');
      expect(editor.getAttribute('contenteditable')).toBe('false');
    });
  });

  describe('Value Management', () => {
    beforeEach(() => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
    });

    test('should get and set HTML value', () => {
      const htmlContent = '<p><strong>Bold text</strong></p>';
      
      richTextField.setValue(htmlContent);
      expect(richTextField.getValue()).toBe(htmlContent);
    });

    test('should get text content without HTML', () => {
      richTextField.setValue('<p><strong>Bold text</strong></p>');
      expect(richTextField.getTextContent()).toBe('Bold text');
    });

    test('should clear content', () => {
      richTextField.setValue('<p>Some content</p>');
      richTextField.clear();
      expect(richTextField.getValue()).toBe('');
    });

    test('should focus editor', () => {
      const focusSpy = jest.spyOn(richTextField.editorEl, 'focus');
      richTextField.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    test('should count words correctly', () => {
      richTextField.setValue('<p>Hello world test</p>');
      expect(richTextField.getWordCount()).toBe(3);
    });

    test('should count characters correctly', () => {
      richTextField.setValue('<p>Hello</p>');
      expect(richTextField.getCharacterCount()).toBe(5);
    });

    test('should handle empty content word count', () => {
      richTextField.setValue('');
      expect(richTextField.getWordCount()).toBe(0);
    });
  });

  describe('Toolbar Functionality', () => {
    beforeEach(() => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
      
      // Mock document.execCommand
      document.execCommand = jest.fn(() => true);
      document.queryCommandState = jest.fn(() => false);
    });

    test('should execute bold command', () => {
      const boldButton = container.querySelector('[data-command="bold"]');
      boldButton.click();
      
      expect(document.execCommand).toHaveBeenCalledWith('bold', false, undefined);
    });

    test('should execute italic command', () => {
      const italicButton = container.querySelector('[data-command="italic"]');
      italicButton.click();
      
      expect(document.execCommand).toHaveBeenCalledWith('italic', false, undefined);
    });

    test('should handle color picker change', () => {
      const colorInput = container.querySelector('input[data-command="foreColor"]');
      colorInput.value = '#ff0000';
      
      const changeEvent = new Event('change', { bubbles: true });
      colorInput.dispatchEvent(changeEvent);
      
      expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
    });

    test('should handle font size selection', () => {
      const fontSizeSelect = container.querySelector('select[data-command="fontSize"]');
      fontSizeSelect.value = '4';
      
      const changeEvent = new Event('change', { bubbles: true });
      fontSizeSelect.dispatchEvent(changeEvent);
      
      expect(document.execCommand).toHaveBeenCalledWith('fontSize', false, '4');
      expect(fontSizeSelect.selectedIndex).toBe(0); // Should reset after selection
    });

    test('should handle font name selection', () => {
      const fontNameSelect = container.querySelector('select[data-command="fontName"]');
      fontNameSelect.value = 'Arial';
      
      const changeEvent = new Event('change', { bubbles: true });
      fontNameSelect.dispatchEvent(changeEvent);
      
      expect(document.execCommand).toHaveBeenCalledWith('fontName', false, 'Arial');
    });

    test('should handle create link command with prompt', () => {
      global.prompt = jest.fn(() => 'https://example.com');
      
      const linkButton = container.querySelector('[data-command="createLink"]');
      linkButton.click();
      
      expect(global.prompt).toHaveBeenCalledWith('Enter URL:');
      expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.com');
    });

    test('should not create link when prompt is cancelled', () => {
      global.prompt = jest.fn(() => null);
      
      const linkButton = container.querySelector('[data-command="createLink"]');
      linkButton.click();
      
      expect(global.prompt).toHaveBeenCalled();
      expect(document.execCommand).not.toHaveBeenCalledWith('createLink', expect.any(Boolean), expect.any(String));
    });
  });

  describe('Validation', () => {
    test('should validate required field with empty content', () => {
      richTextField = new RichTextField({ required: true });
      richTextField.renderTo(container);
      
      const isValid = richTextField.validate();
      expect(isValid).toBe(false);
      expect(richTextField.validationMessage).toBe('This field is required');
    });

    test('should validate required field with content', () => {
      richTextField = new RichTextField({ required: true });
      richTextField.renderTo(container);
      richTextField.setValue('<p>Some content</p>');
      
      const isValid = richTextField.validate();
      expect(isValid).toBe(true);
      expect(richTextField.validationMessage).toBe('');
    });

    test('should run custom validators', () => {
      const customValidator = jest.fn(() => 'Custom error message');
      
      richTextField = new RichTextField({
        validators: [customValidator]
      });
      richTextField.renderTo(container);
      richTextField.setValue('<p>Test content</p>');
      
      const isValid = richTextField.validate();
      
      expect(customValidator).toHaveBeenCalledWith('<p>Test content</p>', richTextField);
      expect(isValid).toBe(false);
      expect(richTextField.validationMessage).toBe('Custom error message');
    });

    test('should pass validation with valid custom validator', () => {
      const customValidator = jest.fn(() => true);
      
      richTextField = new RichTextField({
        validators: [customValidator]
      });
      richTextField.renderTo(container);
      richTextField.setValue('<p>Valid content</p>');
      
      const isValid = richTextField.validate();
      
      expect(customValidator).toHaveBeenCalled();
      expect(isValid).toBe(true);
    });

    test('should show validation error in UI', () => {
      richTextField = new RichTextField({ required: true });
      richTextField.renderTo(container);
      
      richTextField.validate();
      
      const validationEl = container.querySelector('.aionda-richtext-validation');
      expect(validationEl.classList.contains('hidden')).toBe(false);
      expect(validationEl.textContent).toBe('This field is required');
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
    });

    test('should emit change event on content change', () => {
      const changeHandler = jest.fn();
      richTextField.on('change', changeHandler);
      
      const editor = container.querySelector('.aionda-richtext-editor');
      editor.innerHTML = '<p>New content</p>';
      
      const inputEvent = new Event('input', { bubbles: true });
      editor.dispatchEvent(inputEvent);
      
      expect(changeHandler).toHaveBeenCalledWith({
        value: '<p>New content</p>',
        component: richTextField
      });
    });

    test('should emit focus event', () => {
      const focusHandler = jest.fn();
      richTextField.on('focus', focusHandler);
      
      const editor = container.querySelector('.aionda-richtext-editor');
      const focusEvent = new Event('focus', { bubbles: true });
      editor.dispatchEvent(focusEvent);
      
      expect(focusHandler).toHaveBeenCalledWith({ component: richTextField });
    });

    test('should emit blur event', () => {
      const blurHandler = jest.fn();
      richTextField.on('blur', blurHandler);
      
      const editor = container.querySelector('.aionda-richtext-editor');
      const blurEvent = new Event('blur', { bubbles: true });
      editor.dispatchEvent(blurEvent);
      
      expect(blurHandler).toHaveBeenCalledWith({ component: richTextField });
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
    });

    test('should set disabled state', () => {
      richTextField.setDisabled(true);
      
      const editor = container.querySelector('.aionda-richtext-editor');
      expect(editor.contentEditable).toBe('false');
      expect(richTextField.el.classList.contains('opacity-50')).toBe(true);
    });

    test('should disable toolbar buttons when disabled', () => {
      richTextField.setDisabled(true);
      
      const buttons = container.querySelectorAll('.aionda-richtext-toolbar button, .aionda-richtext-toolbar select, .aionda-richtext-toolbar input');
      buttons.forEach(btn => {
        expect(btn.disabled).toBe(true);
      });
    });

    test('should enable editor when disabled is false', () => {
      richTextField.setDisabled(true);
      richTextField.setDisabled(false);
      
      const editor = container.querySelector('.aionda-richtext-editor');
      expect(editor.contentEditable).toBe('true');
      expect(richTextField.el.classList.contains('opacity-50')).toBe(false);
    });
  });

  describe('HTML Insertion', () => {
    beforeEach(() => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
      
      // Mock document.execCommand for insertHTML
      document.execCommand = jest.fn(() => true);
    });

    test('should insert HTML content', () => {
      const htmlToInsert = '<span style="color: red;">Red text</span>';
      
      richTextField.insertHtml(htmlToInsert);
      
      expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, htmlToInsert);
    });

    test('should emit change event after HTML insertion', () => {
      const changeHandler = jest.fn();
      richTextField.on('change', changeHandler);
      
      richTextField.insertHtml('<strong>Bold</strong>');
      
      expect(changeHandler).toHaveBeenCalled();
    });
  });

  describe('Placeholder Handling', () => {
    test('should show placeholder when empty', () => {
      richTextField = new RichTextField({ placeholder: 'Enter text here...' });
      richTextField.renderTo(container);
      
      const editor = container.querySelector('.aionda-richtext-editor');
      expect(editor.classList.contains('empty')).toBe(true);
      expect(editor.getAttribute('data-placeholder')).toBe('Enter text here...');
    });

    test('should hide placeholder when content exists', () => {
      richTextField = new RichTextField({ placeholder: 'Enter text here...' });
      richTextField.renderTo(container);
      
      richTextField.setValue('<p>Some content</p>');
      
      const editor = container.querySelector('.aionda-richtext-editor');
      expect(editor.classList.contains('empty')).toBe(false);
    });
  });

  describe('Toolbar Button States', () => {
    beforeEach(() => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
      
      document.queryCommandState = jest.fn();
    });

    test('should update button active states', () => {
      document.queryCommandState.mockImplementation((command) => {
        return command === 'bold';
      });
      
      richTextField.updateToolbarState();
      
      const boldButton = container.querySelector('[data-command="bold"]');
      expect(boldButton.classList.contains('bg-blue-100')).toBe(true);
      expect(boldButton.classList.contains('text-blue-700')).toBe(true);
    });

    test('should remove active state for inactive commands', () => {
      document.queryCommandState.mockReturnValue(false);
      
      const boldButton = container.querySelector('[data-command="bold"]');
      boldButton.classList.add('bg-blue-100', 'text-blue-700');
      
      richTextField.updateToolbarState();
      
      expect(boldButton.classList.contains('bg-blue-100')).toBe(false);
      expect(boldButton.classList.contains('text-blue-700')).toBe(false);
    });
  });

  describe('Custom Toolbar Configuration', () => {
    test('should render only specified toolbar buttons', () => {
      richTextField = new RichTextField({
        toolbar: ['bold', 'italic', 'separator', 'foreColor']
      });
      richTextField.renderTo(container);
      
      const boldButton = container.querySelector('[data-command="bold"]');
      const italicButton = container.querySelector('[data-command="italic"]');
      const colorInput = container.querySelector('input[data-command="foreColor"]');
      const underlineButton = container.querySelector('[data-command="underline"]');
      const separator = container.querySelector('.w-px.h-6.bg-gray-300');
      
      expect(boldButton).toBeTruthy();
      expect(italicButton).toBeTruthy();
      expect(colorInput).toBeTruthy();
      expect(separator).toBeTruthy();
      expect(underlineButton).toBeFalsy(); // Should not be present
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
    });

    test('should handle execCommand errors gracefully', () => {
      document.execCommand = jest.fn(() => {
        throw new Error('Command failed');
      });
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      richTextField.executeCommand('bold');
      
      expect(consoleSpy).toHaveBeenCalledWith('RichTextField command failed:', 'bold', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    test('should handle insertHtml errors gracefully', () => {
      document.execCommand = jest.fn(() => {
        throw new Error('Insert failed');
      });
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      richTextField.insertHtml('<span>test</span>');
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to insert HTML:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});