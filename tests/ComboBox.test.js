/**
 * Unit tests for ComboBox component
 * Tests dropdown functionality, data handling, and search
 */

import { ComboBox } from '../src/components/ComboBox.js';

describe('ComboBox', () => {
  let comboBox;

  const testData = [
    { value: 'US', text: 'USA' },
    { value: 'ca', text: 'Canada' },
    { value: 'uk', text: 'United Kingdom' },
    { value: 'de', text: 'Germany' }
  ];

  beforeEach(() => {
    comboBox = null;
  });

  afterEach(() => {
    if (comboBox && !comboBox.destroyed) {
      comboBox.destroy();
    }
    comboBox = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create combobox with default config', () => {
      comboBox = new ComboBox();

      expect(comboBox.data).toEqual([]);
      expect(comboBox.displayField).toBe('text');
      expect(comboBox.valueField).toBe('value');
      expect(comboBox.editable).toBe(true);
      expect(comboBox.forceSelection).toBe(false);
      expect(comboBox.typeAhead).toBe(false);
      expect(comboBox.queryMode).toBe('local');
      expect(comboBox.emptyText).toBe('');
    });

    test('should create combobox with custom config', () => {
      const config = {
        data: testData,
        displayField: 'name',
        valueField: 'id',
        editable: false,
        forceSelection: true,
        typeAhead: true,
        emptyText: 'Select an option...'
      };

      comboBox = new ComboBox(config);

      expect(comboBox.data).toEqual(testData);
      expect(comboBox.displayField).toBe('name');
      expect(comboBox.valueField).toBe('id');
      expect(comboBox.editable).toBe(false);
      expect(comboBox.forceSelection).toBe(true);
      expect(comboBox.typeAhead).toBe(true);
      expect(comboBox.emptyText).toBe('Select an option...');
    });
  });

  describe('rendering', () => {
    test('should render combobox with trigger button', () => {
      comboBox = new ComboBox({
        fieldLabel: 'Country',
        data: testData
      });
      const el = comboBox.render();

      expect(el).toHaveClass('aionda-combobox');
      
      const input = el.querySelector('input');
      expect(input).not.toBeNull();
      
      const trigger = el.querySelector('.aionda-combobox-trigger');
      expect(trigger).not.toBeNull();
      
      const label = el.querySelector('label');
      expect(label.textContent).toContain('Country');
    });

    test('should render dropdown list when expanded', () => {
      comboBox = new ComboBox({ data: testData });
      const el = comboBox.render();
      document.body.appendChild(el);

      comboBox.expand();

      const dropdown = document.querySelector('.aionda-combobox-dropdown');
      expect(dropdown).not.toBeNull();
      
      const items = dropdown.querySelectorAll('.aionda-combobox-item');
      expect(items.length).toBe(testData.length);
    });
  });

  describe('value management', () => {
    beforeEach(() => {
      comboBox = new ComboBox({
        data: testData,
        value: 'ca'
      });
      comboBox.render();
    });

    test('should get selected value', () => {
      expect(comboBox.getValue()).toBe('ca');
    });

    test('should set value and update display', () => {
      comboBox.setValue('uk');

      expect(comboBox.getValue()).toBe('uk');
      expect(comboBox.getDisplayValue()).toBe('United Kingdom');
      expect(comboBox.inputEl.value).toBe('United Kingdom');
    });

    test('should get selected record', () => {
      const record = comboBox.getSelection();
      
      expect(record).toEqual({ value: 'ca', text: 'Canada' });
    });

    test('should clear selection', () => {
      comboBox.clearValue();

      expect(comboBox.getValue()).toBe('');
      expect(comboBox.inputEl.value).toBe('');
    });
  });

  describe('dropdown functionality', () => {
    beforeEach(() => {
      comboBox = new ComboBox({ data: testData });
      comboBox.render();
    });

    test('should expand dropdown on trigger click', () => {
      document.body.appendChild(comboBox.el);
      const trigger = comboBox.el.querySelector('.aionda-combobox-trigger');
      
      testUtils.fireClickEvent(trigger);

      expect(comboBox.isExpanded()).toBe(true);
      expect(document.querySelector('.aionda-combobox-dropdown')).not.toBeNull();
    });

    test('should collapse dropdown', () => {
      comboBox.expand();
      comboBox.collapse();

      expect(comboBox.isExpanded()).toBe(false);
      expect(document.querySelector('.aionda-combobox-dropdown')).toBeNull();
    });

    test('should select item on click', () => {
      document.body.appendChild(comboBox.el);
      comboBox.expand();

      const firstItem = document.querySelector('.aionda-combobox-item');
      testUtils.fireClickEvent(firstItem);

      expect(comboBox.getValue()).toBe('US');
      expect(comboBox.isExpanded()).toBe(false);
    });
  });

  describe('filtering and search', () => {
    beforeEach(() => {
      comboBox = new ComboBox({
        data: testData,
        editable: true
      });
      comboBox.render();
    });

    test('should filter items based on input', () => {
      comboBox.inputEl.value = 'United';
      comboBox.onInput();

      const filteredItems = comboBox.getFilteredData();
      expect(filteredItems.length).toBe(1); // Only UK contains 'United'
      expect(filteredItems[0].text).toBe('United Kingdom');
    });

    test('should show all items when input is empty', () => {
      comboBox.inputEl.value = '';
      comboBox.onInput();

      const filteredItems = comboBox.getFilteredData();
      expect(filteredItems.length).toBe(testData.length);
    });

    test('should handle case insensitive search', () => {
      comboBox.inputEl.value = 'canada';
      comboBox.onInput();

      const filteredItems = comboBox.getFilteredData();
      expect(filteredItems.length).toBe(1);
      expect(filteredItems[0].text).toBe('Canada');
    });
  });

  describe('validation', () => {
    test('should validate required selection', () => {
      comboBox = new ComboBox({
        data: testData,
        allowBlank: false,
        forceSelection: true
      });
      comboBox.render();

      comboBox.setValue('');
      expect(comboBox.validate()).toBe(false);

      comboBox.setValue('US');
      expect(comboBox.validate()).toBe(true);
    });

    test('should validate force selection', () => {
      comboBox = new ComboBox({
        data: testData,
        forceSelection: true,
        editable: true
      });
      comboBox.render();

      // Set invalid value not in data
      comboBox.inputEl.value = 'Invalid Country';
      comboBox.onBlur();

      expect(comboBox.validate()).toBe(false);
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      comboBox = new ComboBox({ data: testData });
      comboBox.renderTo(testUtils.createContainer());
    });

    test('should open dropdown on down arrow', () => {
      testUtils.fireKeyEvent(comboBox.inputEl, 'ArrowDown');

      expect(comboBox.isExpanded()).toBe(true);
    });

    test('should close dropdown on escape', () => {
      comboBox.expand();
      testUtils.fireKeyEvent(comboBox.inputEl, 'Escape');

      expect(comboBox.isExpanded()).toBe(false);
    });

    test('should navigate items with arrow keys', () => {
      comboBox.expand();
      
      testUtils.fireKeyEvent(comboBox.inputEl, 'ArrowDown');
      expect(comboBox.highlightedIndex).toBe(0);

      testUtils.fireKeyEvent(comboBox.inputEl, 'ArrowDown');
      expect(comboBox.highlightedIndex).toBe(1);

      testUtils.fireKeyEvent(comboBox.inputEl, 'ArrowUp');
      expect(comboBox.highlightedIndex).toBe(0);
    });

    test('should select highlighted item on enter', () => {
      comboBox.expand();
      comboBox.highlightedIndex = 1;

      testUtils.fireKeyEvent(comboBox.inputEl, 'Enter');

      expect(comboBox.getValue()).toBe('ca');
      expect(comboBox.isExpanded()).toBe(false);
    });
  });

  describe('events', () => {
    beforeEach(() => {
      comboBox = new ComboBox({ data: testData });
      comboBox.render();
    });

    test('should emit select event on selection', () => {
      const selectSpy = jest.fn();
      comboBox.on('select', selectSpy);

      comboBox.setValue('uk');

      expect(selectSpy).toHaveBeenCalledWith({
        combo: comboBox,
        record: { value: 'uk', text: 'United Kingdom' },
        index: 2
      });
    });

    test('should emit expand/collapse events', () => {
      const expandSpy = jest.fn();
      const collapseSpy = jest.fn();
      
      comboBox.on('expand', expandSpy);
      comboBox.on('collapse', collapseSpy);

      comboBox.expand();
      expect(expandSpy).toHaveBeenCalled();

      comboBox.collapse();
      expect(collapseSpy).toHaveBeenCalled();
    });
  });

  describe('templates', () => {
    test('should use custom item template', () => {
      const customData = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' }
      ];

      comboBox = new ComboBox({
        data: customData,
        displayField: 'name',
        valueField: 'id',
        tpl: (record) => `<div>${record.name} - ${record.email}</div>`
      });
      const el = comboBox.render();
      document.body.appendChild(el);
      comboBox.expand();

      const items = document.querySelectorAll('.aionda-combobox-item');
      expect(items[0].innerHTML).toContain('john@example.com');
    });
  });

  describe('responsive behavior', () => {
    test('should handle mobile viewport', () => {
      testUtils.setMobileViewport();
      comboBox = new ComboBox({ data: testData, fieldLabel: 'Country' });
      const el = comboBox.render();

      expect(window.innerWidth).toBe(320);
      expect(el).toHaveClass('aionda-combobox');
    });

    test('should handle tablet viewport', () => {
      testUtils.setTabletViewport();
      comboBox = new ComboBox({ data: testData, fieldLabel: 'Country' });
      const el = comboBox.render();

      expect(window.innerWidth).toBe(768);
      expect(el).toHaveClass('aionda-combobox');
    });

    test('should handle touch events on mobile', () => {
      testUtils.setMobileViewport();
      comboBox = new ComboBox({ data: testData });
      const el = comboBox.render();
      document.body.appendChild(el);
      
      const trigger = el.querySelector('.aionda-combobox-trigger');
      // Simulate touch by triggering click event (which is what touch events typically do)
      testUtils.fireClickEvent(trigger);
      
      expect(comboBox.isExpanded()).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('should handle null config', () => {
      expect(() => new ComboBox(null)).not.toThrow();
    });

    test('should handle empty data', () => {
      comboBox = new ComboBox({ data: [] });
      const el = comboBox.render();
      document.body.appendChild(el);

      comboBox.expand();
      const dropdown = document.querySelector('.aionda-combobox-dropdown');
      expect(dropdown.textContent).toContain('No items to display');
    });

    test('should handle missing display/value fields', () => {
      const badData = [{ id: 1, label: 'Test' }];
      
      comboBox = new ComboBox({
        data: badData,
        displayField: 'nonexistent',
        valueField: 'missing'
      });
      
      expect(() => comboBox.render()).not.toThrow();
    });

    test('should handle duplicate values', () => {
      const duplicateData = [
        { value: 'test', text: 'Test 1' },
        { value: 'test', text: 'Test 2' }
      ];

      comboBox = new ComboBox({ data: duplicateData });
      comboBox.render();

      comboBox.setValue('test');
      // Should select first matching item
      expect(comboBox.getDisplayValue()).toBe('Test 1');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      comboBox = new ComboBox({ 
        data: testData,
        fieldLabel: 'Country',
        name: 'country'
      });
      comboBox.render();
    });

    test('should set role="combobox" on input', () => {
      expect(comboBox.inputEl.getAttribute('role')).toBe('combobox');
    });

    test('should set aria-expanded when dropdown opens/closes', () => {
      expect(comboBox.inputEl.getAttribute('aria-expanded')).toBe('false');
      
      comboBox.expand();
      expect(comboBox.inputEl.getAttribute('aria-expanded')).toBe('true');
      
      comboBox.collapse();
      expect(comboBox.inputEl.getAttribute('aria-expanded')).toBe('false');
    });

    test('should set aria-controls pointing to dropdown', () => {
      document.body.appendChild(comboBox.el);
      comboBox.expand();
      const ariaControls = comboBox.inputEl.getAttribute('aria-controls');
      expect(ariaControls).toBeTruthy();
      
      const dropdown = document.getElementById(ariaControls);
      expect(dropdown).toBeTruthy();
      expect(dropdown).toHaveClass('aionda-combobox-dropdown');
    });

    test('should set aria-activedescendant to highlighted option', () => {
      document.body.appendChild(comboBox.el);
      comboBox.expand();
      
      testUtils.fireKeyEvent(comboBox.inputEl, 'ArrowDown', 'keydown');
      
      const activeDescendant = comboBox.inputEl.getAttribute('aria-activedescendant');
      expect(activeDescendant).toBeTruthy();
      
      const activeOption = document.getElementById(activeDescendant);
      expect(activeOption).toBeTruthy();
      expect(activeOption).toHaveClass('highlighted');
    });

    test('should have proper roles for dropdown elements', () => {
      document.body.appendChild(comboBox.el);
      comboBox.expand();
      
      const dropdown = comboBox.el.querySelector('.aionda-combobox-dropdown');
      expect(dropdown.getAttribute('role')).toBe('listbox');
      
      const options = dropdown.querySelectorAll('.aionda-combobox-item');
      options.forEach(option => {
        expect(option.getAttribute('role')).toBe('option');
      });
    });

    test('should set aria-autocomplete attribute', () => {
      const autocomplete = comboBox.inputEl.getAttribute('aria-autocomplete');
      expect(['list', 'both']).toContain(autocomplete);
    });

    test('should support keyboard navigation with screen reader announcements', () => {
      document.body.appendChild(comboBox.el);
      comboBox.expand();
      
      // Navigate down
      testUtils.fireKeyEvent(comboBox.inputEl, 'ArrowDown', 'keydown');
      let activeId = comboBox.inputEl.getAttribute('aria-activedescendant');
      let activeOption = document.getElementById(activeId);
      expect(activeOption.textContent).toBe('USA');
      
      // Navigate down again
      testUtils.fireKeyEvent(comboBox.inputEl, 'ArrowDown', 'keydown');
      activeId = comboBox.inputEl.getAttribute('aria-activedescendant');
      activeOption = document.getElementById(activeId);
      expect(activeOption.textContent).toBe('Canada');
    });

    test('should announce selection changes', () => {
      document.body.appendChild(comboBox.el);
      comboBox.expand();
      
      testUtils.fireKeyEvent(comboBox.inputEl, 'ArrowDown', 'keydown');
      testUtils.fireKeyEvent(comboBox.inputEl, 'Enter', 'keydown');
      
      expect(comboBox.getValue()).toBe('US');
      expect(comboBox.inputEl.value).toBe('USA');
    });

    test('should handle invalid aria-activedescendant gracefully', () => {
      comboBox.highlightedIndex = -1;
      comboBox.updateActiveDescendant();
      
      expect(comboBox.inputEl.hasAttribute('aria-activedescendant')).toBe(false);
    });

    test('should maintain focus on input during keyboard navigation', () => {
      document.body.appendChild(comboBox.el);
      comboBox.inputEl.focus();
      comboBox.expand();
      
      testUtils.fireKeyEvent(comboBox.inputEl, 'ArrowDown', 'keydown');
      testUtils.fireKeyEvent(comboBox.inputEl, 'ArrowDown', 'keydown');
      
      expect(document.activeElement).toBe(comboBox.inputEl);
    });
  });
});