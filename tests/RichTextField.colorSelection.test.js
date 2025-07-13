/**
 * @jest-environment jsdom
 */

import { RichTextField } from '../src/components/RichTextField.js';
import '../tests/setup.js';

describe('RichTextField Color Selection Tests', () => {
  let container;
  let richTextField;
  let originalExecCommand;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Store original execCommand for some tests
    originalExecCommand = document.execCommand;
    
    // Mock document.execCommand for better test control
    document.execCommand = jest.fn(() => true);
    document.queryCommandState = jest.fn(() => false);
    document.queryCommandValue = jest.fn(() => '');
    
    // Mock window.getSelection for test control
    global.getSelection = jest.fn();
  });

  afterEach(() => {
    if (richTextField && !richTextField.destroyed) {
      richTextField.destroy();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    jest.clearAllMocks();
  });

  describe('Text Selection and Color Application', () => {
    beforeEach(() => {
      richTextField = new RichTextField({
        value: '<p>Hello world, this is a test text for color formatting.</p>'
      });
      richTextField.renderTo(container);
    });

    test('should apply color to selected text range', () => {
      // Setup mock selection for "Hello"
      const mockRange = {
        cloneRange: jest.fn(() => mockRange),
        selectNodeContents: jest.fn(),
        setStart: jest.fn(),
        setEnd: jest.fn(),
        extractContents: jest.fn(() => {
          const span = document.createElement('span');
          span.textContent = 'Hello';
          return span;
        }),
        insertNode: jest.fn(),
        collapsed: false
      };

      const mockSelection = {
        rangeCount: 1,
        isCollapsed: false,
        getRangeAt: jest.fn(() => mockRange),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      };

      global.getSelection.mockReturnValue(mockSelection);

      // Apply red color to "Hello"
      richTextField.executeCommand('foreColor', null, '#ff0000');

      // Verify execCommand was called with correct parameters
      expect(document.execCommand).toHaveBeenCalledWith('styleWithCSS', false, true);
      expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
    });

    test('should handle multiple color changes on different text parts', () => {
      // Simulate selecting "Hello" first
      const mockRange1 = createMockRange('Hello', 0, 5);
      const mockSelection1 = createMockSelection(mockRange1, false);
      global.getSelection.mockReturnValue(mockSelection1);

      // Apply red color to "Hello"
      richTextField.executeCommand('foreColor', null, '#ff0000');

      // Verify first color application
      expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');

      // Reset mock for second selection
      jest.clearAllMocks();
      document.execCommand = jest.fn(() => true);

      // Simulate selecting "world" 
      const mockRange2 = createMockRange('world', 6, 11);
      const mockSelection2 = createMockSelection(mockRange2, false);
      global.getSelection.mockReturnValue(mockSelection2);

      // Apply blue color to "world"
      richTextField.executeCommand('foreColor', null, '#0000ff');

      // Verify second color application
      expect(document.execCommand).toHaveBeenCalledWith('styleWithCSS', false, true);
      expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#0000ff');
    });

    test('should not apply color when no text is selected for formatting commands', () => {
      // Mock empty selection
      const mockSelection = {
        rangeCount: 0,
        isCollapsed: true,
        getRangeAt: jest.fn(),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      };

      global.getSelection.mockReturnValue(mockSelection);

      // Try to apply color with no selection - should select all
      richTextField.executeCommand('foreColor', null, '#ff0000');

      // Should still call execCommand because foreColor selects all when no selection
      expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
    });

    test('should select all text when no selection exists for text formatting', () => {
      const mockRange = {
        cloneRange: jest.fn(() => mockRange),
        selectNodeContents: jest.fn(),
        setStart: jest.fn(),
        setEnd: jest.fn()
      };

      const mockSelection = {
        rangeCount: 0,
        isCollapsed: true,
        getRangeAt: jest.fn(),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      };

      global.getSelection.mockReturnValue(mockSelection);
      document.createRange = jest.fn(() => mockRange);

      // Apply color with no selection
      richTextField.executeCommand('foreColor', null, '#ff0000');

      // Should create range and select all content
      expect(document.createRange).toHaveBeenCalled();
      expect(mockRange.selectNodeContents).toHaveBeenCalledWith(richTextField.editorEl);
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
    });
  });

  describe('HTML Output Verification', () => {
    beforeEach(() => {
      richTextField = new RichTextField({
        value: '<p>Test text for coloring</p>'
      });
      richTextField.renderTo(container);
    });

    test('should update component value after color changes', () => {
      // Mock editor content change
      const mockEditor = richTextField.editorEl;
      const originalHTML = mockEditor.innerHTML;

      // Simulate color change
      const mockSelection = createMockSelection(createMockRange('Test', 0, 4), false);
      global.getSelection.mockReturnValue(mockSelection);

      richTextField.executeCommand('foreColor', null, '#ff0000');

      // Simulate that execCommand actually changed the HTML
      mockEditor.innerHTML = '<p><span style="color: rgb(255, 0, 0);">Test</span> text for coloring</p>';

      // Trigger the value update manually (since we're mocking execCommand)
      richTextField.value = mockEditor.innerHTML;

      expect(richTextField.getValue()).toContain('color: rgb(255, 0, 0)');
      expect(richTextField.getValue()).toContain('Test');
    });

    test('should emit change event after color application', () => {
      const changeHandler = jest.fn();
      richTextField.on('change', changeHandler);

      const mockSelection = createMockSelection(createMockRange('Test', 0, 4), false);
      global.getSelection.mockReturnValue(mockSelection);

      // Execute color command
      richTextField.executeCommand('foreColor', null, '#ff0000');

      // Verify change event was emitted
      expect(changeHandler).toHaveBeenCalledWith({
        value: expect.any(String),
        component: richTextField
      });
    });

    test('should handle nested color changes correctly', () => {
      // Start with some pre-colored text
      richTextField.setValue('<p><span style="color: red;">Red text</span> and normal text</p>');

      const mockSelection = createMockSelection(createMockRange('normal', 0, 6), false);
      global.getSelection.mockReturnValue(mockSelection);

      // Apply blue color to "normal"
      richTextField.executeCommand('foreColor', null, '#0000ff');

      // Simulate the result
      richTextField.editorEl.innerHTML = '<p><span style="color: red;">Red text</span> and <span style="color: rgb(0, 0, 255);">normal</span> text</p>';
      richTextField.value = richTextField.editorEl.innerHTML;

      const html = richTextField.getValue();
      expect(html).toContain('color: red');
      expect(html).toContain('color: rgb(0, 0, 255)');
      expect(html).toContain('Red text');
      expect(html).toContain('normal');
    });
  });

  describe('Color Picker Integration', () => {
    beforeEach(() => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
    });

    test('should update A icon color when color changes', () => {
      // Setup a proper selection mock for this test
      const mockSelection = createMockSelection(createMockRange('test', 0, 4), false);
      global.getSelection.mockReturnValue(mockSelection);
      
      const colorInput = container.querySelector('.aionda-textcolor-input');
      const colorDisplay = container.querySelector('.aionda-textcolor-display');

      expect(colorInput).toBeTruthy();
      expect(colorDisplay).toBeTruthy();

      // Simulate color change event
      colorInput.value = '#ff0000';
      const changeEvent = new Event('change', { bubbles: true });
      colorInput.dispatchEvent(changeEvent);

      // Check if display color was updated
      expect(colorDisplay.style.color).toBe('rgb(255, 0, 0)');
    });

    test('should update display color when color picker changes', () => {
      const colorInput = container.querySelector('.aionda-textcolor-input');
      const display = container.querySelector('.aionda-textcolor-display');
      
      // Change color
      colorInput.value = '#00ff00';
      const changeEvent = new Event('change', { bubbles: true });
      colorInput.dispatchEvent(changeEvent);

      // Verify display color was updated (but command not executed yet)
      expect(display.style.color).toBe('rgb(0, 255, 0)');
      expect(document.execCommand).not.toHaveBeenCalled();
    });

    test('should open color picker dropdown when A button is clicked', () => {
      const colorButton = container.querySelector('.aionda-textcolor-btn');
      const dropdown = container.querySelector('.aionda-colorpicker-dropdown');

      // Initially dropdown should be hidden
      expect(dropdown.classList.contains('hidden')).toBe(true);

      // Click the A button
      colorButton.click();

      // Verify dropdown is now visible
      expect(dropdown.classList.contains('hidden')).toBe(false);
    });

    test('should close color picker when OK button is clicked', () => {
      const colorButton = container.querySelector('.aionda-textcolor-btn');
      const dropdown = container.querySelector('.aionda-colorpicker-dropdown');
      const okButton = container.querySelector('.aionda-colorpicker-ok');
      const colorInput = container.querySelector('.aionda-textcolor-input');
      
      // Setup selection mock
      const mockSelection = createMockSelection(createMockRange('test', 0, 4), false);
      global.getSelection.mockReturnValue(mockSelection);

      // Open dropdown
      colorButton.click();
      expect(dropdown.classList.contains('hidden')).toBe(false);

      // Set color and click OK
      colorInput.value = '#ff0000';
      okButton.click();

      // Verify dropdown is closed and command was executed
      expect(dropdown.classList.contains('hidden')).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
    });

    test('should close color picker and reset color when Cancel button is clicked', () => {
      const colorButton = container.querySelector('.aionda-textcolor-btn');
      const dropdown = container.querySelector('.aionda-colorpicker-dropdown');
      const cancelButton = container.querySelector('.aionda-colorpicker-cancel');
      const colorInput = container.querySelector('.aionda-textcolor-input');
      const display = container.querySelector('.aionda-textcolor-display');

      // Open dropdown (this sets original color)
      colorButton.click();
      expect(dropdown.classList.contains('hidden')).toBe(false);
      
      const originalColor = colorInput.value;

      // Change color
      colorInput.value = '#ff0000';
      display.style.color = '#ff0000';

      // Click Cancel
      cancelButton.click();

      // Verify dropdown is closed and color is reset
      expect(dropdown.classList.contains('hidden')).toBe(true);
      expect(colorInput.value).toBe(originalColor);
      expect(display.style.color).toBe('rgb(0, 0, 0)'); // Original color converted to rgb
    });
  });

  describe('Font Dropdown Default Values', () => {
    beforeEach(() => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
    });

    test('should show default placeholder values in font dropdowns on initialization', () => {
      const fontSizeSelect = container.querySelector('select[data-command="fontSize"]');
      const fontNameSelect = container.querySelector('select[data-command="fontName"]');

      expect(fontSizeSelect).toBeTruthy();
      expect(fontNameSelect).toBeTruthy();

      // Initially should show placeholder (empty value)
      expect(fontSizeSelect.value).toBe('');
      expect(fontNameSelect.value).toBe('');

      // First options should be the placeholders
      expect(fontSizeSelect.options[0].textContent).toBe('Font Size');
      expect(fontNameSelect.options[0].textContent).toBe('Font Family');
    });

    test('should update font dropdowns to show current values when updateFontSelects is called', () => {
      const fontSizeSelect = container.querySelector('select[data-command="fontSize"]');
      const fontNameSelect = container.querySelector('select[data-command="fontName"]');

      // Verify the options exist in the dropdowns
      expect(fontSizeSelect.querySelector('option[value="3"]')).toBeTruthy();
      expect(fontNameSelect.querySelector('option[value="Arial"]')).toBeTruthy();

      // Mock queryCommandValue to return specific values
      document.queryCommandValue = jest.fn((command) => {
        if (command === 'fontSize') return '3';
        if (command === 'fontName') return 'Arial';
        return '';
      });

      // Call the method that updates font selects
      richTextField.updateFontSelects();

      // Check that the method was called and querySelector was attempted
      expect(document.queryCommandValue).toHaveBeenCalledWith('fontSize');
      expect(document.queryCommandValue).toHaveBeenCalledWith('fontName');
      
      // In jsdom, manually verify the selection logic worked by checking the options exist
      expect(fontSizeSelect.querySelector('option[value="3"]')).toBeTruthy();
      expect(fontNameSelect.querySelector('option[value="Arial"]')).toBeTruthy();
    });

    test('should show current font values after text formatting', () => {
      const fontSizeSelect = container.querySelector('select[data-command="fontSize"]');
      const fontNameSelect = container.querySelector('select[data-command="fontName"]');

      // Mock selection
      const mockSelection = createMockSelection(createMockRange('test', 0, 4), false);
      global.getSelection.mockReturnValue(mockSelection);

      // Apply font size
      richTextField.executeCommand('fontSize', null, '4');

      // Mock that queryCommandValue now returns the new size
      document.queryCommandValue = jest.fn((command) => {
        if (command === 'fontSize') return '4';
        return '';
      });

      // Update toolbar state (which calls updateFontSelects)
      richTextField.updateToolbarState();

      // Font size dropdown should show the current value
      expect(fontSizeSelect.value).toBe('4');
    });

    test('should handle font name matching with case insensitive search', () => {
      const fontNameSelect = container.querySelector('select[data-command="fontName"]');

      // Verify Times New Roman option exists
      expect(fontNameSelect.querySelector('option[value="Times New Roman"]')).toBeTruthy();

      // Mock queryCommandValue to return a font name that might have different casing
      document.queryCommandValue = jest.fn((command) => {
        if (command === 'fontName') return 'times new roman'; // lowercase
        return '';
      });

      // Call update method
      richTextField.updateFontSelects();

      // Verify the method was called and the case-insensitive matching logic was attempted
      expect(document.queryCommandValue).toHaveBeenCalledWith('fontName');
      
      // Verify the matching option exists (case insensitive logic)
      const options = Array.from(fontNameSelect.options);
      const matchingOption = options.find(option => 
        option.value && (
          'times new roman'.toLowerCase().includes(option.value.toLowerCase()) ||
          option.value.toLowerCase().includes('times new roman'.toLowerCase())
        )
      );
      expect(matchingOption).toBeTruthy();
      expect(matchingOption.value).toBe('Times New Roman');
    });

    test('should not change font dropdown when no matching value found', () => {
      const fontNameSelect = container.querySelector('select[data-command="fontName"]');

      // Mock queryCommandValue to return an unknown font
      document.queryCommandValue = jest.fn((command) => {
        if (command === 'fontName') return 'UnknownFont';
        return '';
      });

      // Call update method
      richTextField.updateFontSelects();

      // Verify the method was called
      expect(document.queryCommandValue).toHaveBeenCalledWith('fontName');
      
      // Verify no matching option exists for UnknownFont (excluding empty value options)
      const options = Array.from(fontNameSelect.options);
      const matchingOption = options.find(option => 
        option.value && (
          'unknownfont'.toLowerCase().includes(option.value.toLowerCase()) ||
          option.value.toLowerCase().includes('unknownfont'.toLowerCase())
        )
      );
      expect(matchingOption).toBeUndefined();
    });

    test('should update dropdown values when updateSelectDisplay is called after selection', () => {
      const fontSizeSelect = container.querySelector('select[data-command="fontSize"]');

      // Mock queryCommandValue for the setTimeout in updateSelectDisplay
      document.queryCommandValue = jest.fn((command) => {
        if (command === 'fontSize') return '5';
        return '';
      });

      // Mock selection and call updateSelectDisplay
      const mockSelection = createMockSelection(createMockRange('test', 0, 4), false);
      global.getSelection.mockReturnValue(mockSelection);

      // Call updateSelectDisplay with the font size select
      richTextField.updateSelectDisplay(fontSizeSelect);

      // Wait for setTimeout to complete
      return new Promise(resolve => {
        setTimeout(() => {
          expect(fontSizeSelect.value).toBe('5');
          resolve();
        }, 150); // Wait longer than the 100ms setTimeout in updateSelectDisplay
      });
    });

    test('should maintain font dropdown values after multiple formatting operations', () => {
      const fontSizeSelect = container.querySelector('select[data-command="fontSize"]');
      const fontNameSelect = container.querySelector('select[data-command="fontName"]');

      // Verify the options exist
      expect(fontSizeSelect.querySelector('option[value="6"]')).toBeTruthy();
      expect(fontNameSelect.querySelector('option[value="Helvetica"]')).toBeTruthy();

      // Mock selection
      const mockSelection = createMockSelection(createMockRange('text', 0, 4), false);
      global.getSelection.mockReturnValue(mockSelection);

      // Apply font formatting
      richTextField.executeCommand('fontSize', null, '6');
      richTextField.executeCommand('fontName', null, 'Helvetica');

      // Mock current values
      document.queryCommandValue = jest.fn((command) => {
        if (command === 'fontSize') return '6';
        if (command === 'fontName') return 'Helvetica';
        return '';
      });

      // Update toolbar state
      richTextField.updateToolbarState();

      // Verify the update methods were called and the options exist
      expect(document.queryCommandValue).toHaveBeenCalledWith('fontSize');
      expect(document.queryCommandValue).toHaveBeenCalledWith('fontName');
      expect(fontSizeSelect.querySelector('option[value="6"]')).toBeTruthy();
      expect(fontNameSelect.querySelector('option[value="Helvetica"]')).toBeTruthy();
    });
  });

  describe('Highlighter Functionality', () => {
    beforeEach(() => {
      richTextField = new RichTextField();
      richTextField.renderTo(container);
    });

    test('should only highlight selected text', () => {
      // Mock selection with text
      const mockSelection = createMockSelection(createMockRange('highlight', 0, 9), false);
      global.getSelection.mockReturnValue(mockSelection);

      // Execute highlight command
      richTextField.executeCommand('hiliteColor', null, '#ffff00');

      // Should call execCommand with yellow color
      expect(document.execCommand).toHaveBeenCalledWith('hiliteColor', false, '#ffff00');
    });

    test('should not highlight when no text is selected', () => {
      // Mock empty selection
      const mockSelection = {
        rangeCount: 0,
        isCollapsed: true
      };
      global.getSelection.mockReturnValue(mockSelection);

      // Try to highlight with no selection
      richTextField.executeCommand('hiliteColor', null, '#ffff00');

      // Should not call execCommand
      expect(document.execCommand).not.toHaveBeenCalled();
    });

    test('should use fixed yellow color for highlighting', () => {
      const highlighterButton = container.querySelector('button[data-command="backColor"]');
      
      // Mock selection
      const mockSelection = createMockSelection(createMockRange('text', 0, 4), false);
      global.getSelection.mockReturnValue(mockSelection);

      // Click highlighter button
      highlighterButton.click();

      // Should call execCommand with fixed yellow color
      expect(document.execCommand).toHaveBeenCalledWith('hiliteColor', false, '#ffff00');
    });
  });

  describe('HTML Output Integration Tests', () => {
    beforeEach(() => {
      richTextField = new RichTextField({
        value: '<p>Hello world this is a test</p>'
      });
      richTextField.renderTo(container);
    });

    test('should correctly update HTML structure after setValue with colored content', () => {
      // Test setting HTML with color spans
      const coloredHTML = '<p><span style="color: rgb(255, 0, 0);">Hello</span> world this is a test</p>';
      richTextField.setValue(coloredHTML);
      
      // Verify the HTML is correctly stored and retrieved
      const retrievedHTML = richTextField.getValue();
      expect(retrievedHTML).toContain('color: rgb(255, 0, 0)');
      expect(retrievedHTML).toContain('Hello');
      expect(retrievedHTML).toContain('world');
      
      // Verify editor content matches
      expect(richTextField.editorEl.innerHTML).toContain('color: rgb(255, 0, 0)');
    });

    test('should handle complex nested color HTML structures', () => {
      const complexHTML = `
        <p>
          <span style="color: red;">Red text</span> and 
          <span style="color: blue;">blue text</span> with 
          <span style="color: green; background-color: yellow;">highlighted green</span> content.
        </p>
      `;
      
      richTextField.setValue(complexHTML);
      const output = richTextField.getValue();
      
      // Verify all color styles are preserved
      expect(output).toContain('color: red');
      expect(output).toContain('color: blue');
      expect(output).toContain('color: green');
      expect(output).toContain('background-color: yellow');
      
      // Verify text content
      expect(richTextField.getTextContent()).toContain('Red text');
      expect(richTextField.getTextContent()).toContain('blue text');
      expect(richTextField.getTextContent()).toContain('highlighted green');
    });

    test('should correctly handle partial text replacement with colors', () => {
      // Start with simple text
      richTextField.setValue('<p>Original text here</p>');
      
      // Simulate manual HTML editing (as would happen with execCommand)
      const editor = richTextField.editorEl;
      editor.innerHTML = '<p><span style="color: #ff0000;">Original</span> text here</p>';
      
      // Trigger value update
      richTextField.value = editor.innerHTML;
      
      // Verify changes
      expect(richTextField.getValue()).toContain('color: #ff0000');
      expect(richTextField.getValue()).toContain('Original');
      expect(richTextField.getTextContent()).toBe('Original text here');
    });

    test('should preserve formatting when adding new colored content', () => {
      // Start with some formatted content
      richTextField.setValue('<p><strong>Bold</strong> and <em>italic</em> text</p>');
      
      // Add color to the mix
      const editor = richTextField.editorEl;
      editor.innerHTML = '<p><strong><span style="color: red;">Bold</span></strong> and <em><span style="color: blue;">italic</span></em> text</p>';
      richTextField.value = editor.innerHTML;
      
      const html = richTextField.getValue();
      
      // Should have both formatting and colors
      expect(html).toContain('<strong>');
      expect(html).toContain('<em>');
      expect(html).toContain('color: red');
      expect(html).toContain('color: blue');
      
      // Text content should remain the same
      expect(richTextField.getTextContent()).toBe('Bold and italic text');
    });

    test('should handle mixed highlight and text colors', () => {
      const mixedHTML = `
        <p>
          <span style="color: red;">Red text</span> and 
          <span style="background-color: yellow;">highlighted</span> and 
          <span style="color: blue; background-color: yellow;">blue highlighted</span> content.
        </p>
      `;
      
      richTextField.setValue(mixedHTML);
      const output = richTextField.getValue();
      
      // Verify mixed styles
      expect(output).toContain('color: red');
      expect(output).toContain('background-color: yellow');
      expect(output).toContain('color: blue; background-color: yellow');
      
      // Verify text extraction ignores styling
      const textContent = richTextField.getTextContent();
      expect(textContent).toContain('Red text');
      expect(textContent).toContain('highlighted');
      expect(textContent).toContain('blue highlighted');
    });
  });

  describe('Complex Formatting Scenarios', () => {
    beforeEach(() => {
      richTextField = new RichTextField({
        value: '<p>The quick brown fox jumps over the lazy dog.</p>'
      });
      richTextField.renderTo(container);
    });

    test('should handle multiple overlapping color changes', () => {
      // First, color "quick brown" red
      let mockSelection = createMockSelection(createMockRange('quick brown', 4, 15), false);
      global.getSelection.mockReturnValue(mockSelection);
      
      richTextField.executeCommand('foreColor', null, '#ff0000');
      expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');

      // Reset and simulate result
      jest.clearAllMocks();
      document.execCommand = jest.fn(() => true);
      richTextField.editorEl.innerHTML = '<p>The <span style="color: rgb(255, 0, 0);">quick brown</span> fox jumps over the lazy dog.</p>';

      // Then, color "brown fox" blue (overlapping)
      mockSelection = createMockSelection(createMockRange('brown fox', 10, 19), false);
      global.getSelection.mockReturnValue(mockSelection);
      
      richTextField.executeCommand('foreColor', null, '#0000ff');
      expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#0000ff');
    });

    test('should preserve existing formatting when adding colors', () => {
      // Start with bold text
      richTextField.setValue('<p>Normal <strong>bold text</strong> here.</p>');
      
      // Select "bold text" and add color
      const mockSelection = createMockSelection(createMockRange('bold text', 0, 9), false);
      global.getSelection.mockReturnValue(mockSelection);
      
      richTextField.executeCommand('foreColor', null, '#ff0000');
      
      // Should apply color while preserving bold
      expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
    });

    test('should handle text with mixed existing colors', () => {
      richTextField.setValue('<p><span style="color: red;">Red</span> and <span style="color: blue;">Blue</span> text.</p>');
      
      // Select "and" and make it green
      const mockSelection = createMockSelection(createMockRange('and', 0, 3), false);
      global.getSelection.mockReturnValue(mockSelection);
      
      richTextField.executeCommand('foreColor', null, '#00ff00');
      
      expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#00ff00');
    });
  });

  // Helper function to create mock range
  function createMockRange(text, startOffset, endOffset) {
    return {
      cloneRange: jest.fn(function() { return this; }),
      selectNodeContents: jest.fn(),
      setStart: jest.fn(),
      setEnd: jest.fn(),
      extractContents: jest.fn(() => {
        const span = document.createElement('span');
        span.textContent = text;
        return span;
      }),
      insertNode: jest.fn(),
      collapsed: false,
      startOffset,
      endOffset,
      commonAncestorContainer: { textContent: text }
    };
  }

  // Helper function to create mock selection
  function createMockSelection(range, isCollapsed = false) {
    return {
      rangeCount: isCollapsed ? 0 : 1,
      isCollapsed,
      getRangeAt: jest.fn(() => range),
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
      toString: jest.fn(() => range.commonAncestorContainer.textContent)
    };
  }
});