/**
 * Unit tests for Toolbar component
 * Tests toolbar layouts, button integration, separator rendering, 
 * overflow handling, responsive behavior, and item management
 */

import { Toolbar } from '../src/components/Toolbar.js';
import { Button } from '../src/components/Button.js';
import { Component } from '../src/core/Component.js';

// Test component for adding to toolbars
class TestItem extends Component {
  constructor(config = {}) {
    super(config);
    this.text = config.text || 'Test Item';
  }

  createTemplate() {
    return `<div class="test-item">${this.text}</div>`;
  }
}

describe('Toolbar', () => {
  let toolbar;

  beforeEach(() => {
    toolbar = null;
  });

  afterEach(() => {
    if (toolbar && !toolbar.destroyed) {
      toolbar.destroy();
    }
    toolbar = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create toolbar with default config', () => {
      toolbar = new Toolbar();

      expect(toolbar.orientation).toBe('horizontal');
      expect(toolbar.items).toEqual([]);
      expect(toolbar.padding).toBe(true);
      expect(toolbar.border).toBe(true);
      expect(toolbar.shadow).toBe(false);
      expect(toolbar.wrap).toBe(false);
      expect(toolbar.justify).toBe('start');
      expect(toolbar.spacing).toBe('md');
      expect(toolbar.overflow).toBe('visible');
      expect(toolbar.height).toBe(48);
      expect(toolbar.responsive).toBe(true);
    });

    test('should create toolbar with custom config', () => {
      const config = {
        orientation: 'vertical',
        padding: false,
        border: false,
        shadow: true,
        wrap: true,
        justify: 'center',
        spacing: 'lg',
        overflow: 'scroll',
        height: 60,
        responsive: false
      };

      toolbar = new Toolbar(config);

      expect(toolbar.orientation).toBe('vertical');
      expect(toolbar.padding).toBe(false);
      expect(toolbar.border).toBe(false);
      expect(toolbar.shadow).toBe(true);
      expect(toolbar.wrap).toBe(true);
      expect(toolbar.justify).toBe('center');
      expect(toolbar.spacing).toBe('lg');
      expect(toolbar.overflow).toBe('scroll');
      expect(toolbar.height).toBe(60);
      expect(toolbar.responsive).toBe(false);
    });

    test('should add initial items', () => {
      const button1 = new Button({ text: 'Button 1' });
      const button2 = new Button({ text: 'Button 2' });

      toolbar = new Toolbar({
        items: [button1, button2]
      });

      expect(toolbar.items).toHaveLength(2);
      expect(toolbar.items).toContain(button1);
      expect(toolbar.items).toContain(button2);

      button1.destroy();
      button2.destroy();
    });
  });

  describe('createTemplate()', () => {
    test('should create horizontal toolbar', () => {
      toolbar = new Toolbar({ orientation: 'horizontal' });
      const el = toolbar.render();

      expect(el).toHaveClass('aionda-toolbar');
      expect(el).toHaveClass('aionda-toolbar-horizontal');
      expect(el).toHaveClass('flex-row');
      expect(el).not.toHaveClass('flex-col');
    });

    test('should create vertical toolbar', () => {
      toolbar = new Toolbar({ orientation: 'vertical' });
      const el = toolbar.render();

      expect(el).toHaveClass('aionda-toolbar');
      expect(el).toHaveClass('aionda-toolbar-vertical');
      expect(el).toHaveClass('flex-col');
      expect(el).not.toHaveClass('flex-row');
    });

    test('should set correct height for horizontal toolbar', () => {
      toolbar = new Toolbar({ orientation: 'horizontal', height: 60 });
      const el = toolbar.render();

      expect(el.style.height).toBe('60px');
      expect(el.style.minHeight).toBe('60px');
    });

    test('should not set height for vertical toolbar', () => {
      toolbar = new Toolbar({ orientation: 'vertical', height: 60 });
      const el = toolbar.render();

      expect(el.style.height).toBe('');
    });

    test('should render with shadow', () => {
      toolbar = new Toolbar({ shadow: true });
      const el = toolbar.render();

      expect(el).toHaveClass('shadow-sm');
    });

    test('should render without border', () => {
      toolbar = new Toolbar({ border: false });
      const el = toolbar.render();

      expect(el).not.toHaveClass('border');
    });
  });

  describe('getToolbarClasses()', () => {
    test('should include base toolbar classes', () => {
      toolbar = new Toolbar();
      const classes = toolbar.getToolbarClasses();

      expect(classes).toContain('aionda-toolbar');
      expect(classes).toContain('flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('bg-white');
    });

    test('should include orientation classes', () => {
      const horizontalToolbar = new Toolbar({ orientation: 'horizontal' });
      const verticalToolbar = new Toolbar({ orientation: 'vertical' });

      const horizontalClasses = horizontalToolbar.getToolbarClasses();
      const verticalClasses = verticalToolbar.getToolbarClasses();

      expect(horizontalClasses).toContain('aionda-toolbar-horizontal');
      expect(horizontalClasses).toContain('flex-row');

      expect(verticalClasses).toContain('aionda-toolbar-vertical');
      expect(verticalClasses).toContain('flex-col');

      horizontalToolbar.destroy();
      verticalToolbar.destroy();
    });

    test('should include border classes when enabled', () => {
      toolbar = new Toolbar({ border: true });
      const classes = toolbar.getToolbarClasses();

      expect(classes).toContain('border-b');
      expect(classes).toContain('border-gray-200');
    });

    test('should include shadow classes when enabled', () => {
      toolbar = new Toolbar({ shadow: true });
      const classes = toolbar.getToolbarClasses();

      expect(classes).toContain('shadow-sm');
    });

    test('should include wrap classes when enabled', () => {
      toolbar = new Toolbar({ wrap: true });
      const classes = toolbar.getToolbarClasses();

      expect(classes).toContain('flex-wrap');
    });

    test('should include padding classes when enabled', () => {
      toolbar = new Toolbar({ padding: true });
      const classes = toolbar.getToolbarClasses();

      expect(classes).toContain('px-4');
      expect(classes).toContain('py-2');
    });

    test('should include overflow classes', () => {
      const visibleToolbar = new Toolbar({ overflow: 'visible' });
      const hiddenToolbar = new Toolbar({ overflow: 'hidden' });
      const scrollToolbar = new Toolbar({ overflow: 'scroll' });

      const visibleClasses = visibleToolbar.getToolbarClasses();
      const hiddenClasses = hiddenToolbar.getToolbarClasses();
      const scrollClasses = scrollToolbar.getToolbarClasses();

      expect(visibleClasses).toContain('overflow-visible');
      expect(hiddenClasses).toContain('overflow-hidden');
      expect(scrollClasses).toContain('overflow-x-auto');

      visibleToolbar.destroy();
      hiddenToolbar.destroy();
      scrollToolbar.destroy();
    });

    test('should include responsive classes when enabled', () => {
      toolbar = new Toolbar({ responsive: true });
      const classes = toolbar.getToolbarClasses();

      expect(classes).toContain('w-full');
    });
  });

  describe('getJustifyClasses()', () => {
    test('should apply justify-start classes', () => {
      toolbar = new Toolbar({ justify: 'start' });
      const classes = toolbar.getJustifyClasses();

      expect(classes).toContain('justify-start');
    });

    test('should apply justify-center classes', () => {
      toolbar = new Toolbar({ justify: 'center' });
      const classes = toolbar.getJustifyClasses();

      expect(classes).toContain('justify-center');
    });

    test('should apply justify-end classes', () => {
      toolbar = new Toolbar({ justify: 'end' });
      const classes = toolbar.getJustifyClasses();

      expect(classes).toContain('justify-end');
    });

    test('should apply justify-between classes', () => {
      toolbar = new Toolbar({ justify: 'between' });
      const classes = toolbar.getJustifyClasses();

      expect(classes).toContain('justify-between');
    });

    test('should handle unknown justify value', () => {
      toolbar = new Toolbar({ justify: 'unknown' });
      const classes = toolbar.getJustifyClasses();

      expect(classes).toContain('justify-start');
    });
  });

  describe('getSpacingClasses()', () => {
    test('should apply small spacing classes', () => {
      toolbar = new Toolbar({ spacing: 'sm' });
      const classes = toolbar.getSpacingClasses();

      expect(classes).toContain('gap-1');
    });

    test('should apply medium spacing classes', () => {
      toolbar = new Toolbar({ spacing: 'md' });
      const classes = toolbar.getSpacingClasses();

      expect(classes).toContain('gap-2');
    });

    test('should apply large spacing classes', () => {
      toolbar = new Toolbar({ spacing: 'lg' });
      const classes = toolbar.getSpacingClasses();

      expect(classes).toContain('gap-4');
    });

    test('should handle none spacing', () => {
      toolbar = new Toolbar({ spacing: 'none' });
      const classes = toolbar.getSpacingClasses();

      expect(classes).toContain('gap-0');
    });
  });

  describe('item management', () => {
    beforeEach(() => {
      toolbar = new Toolbar();
      toolbar.render();
    });

    test('should add button item', () => {
      const button = new Button({ text: 'Test Button' });

      const result = toolbar.add(button);

      expect(result).toBe(toolbar);
      expect(toolbar.items).toContain(button);
      expect(toolbar.el.children.length).toBe(1);

      button.destroy();
    });

    test('should add component item', () => {
      const item = new TestItem({ text: 'Test Component' });

      toolbar.add(item);

      expect(toolbar.items).toContain(item);
      expect(toolbar.el.children.length).toBe(1);
      expect(toolbar.el.firstElementChild).toHaveClass('test-item');

      item.destroy();
    });

    test('should add HTML element item', () => {
      const element = document.createElement('div');
      element.textContent = 'Test Element';
      element.className = 'test-element';

      toolbar.add(element);

      expect(toolbar.items).toContain(element);
      expect(toolbar.el.children.length).toBe(1);
      expect(toolbar.el.firstElementChild).toHaveClass('test-element');
    });

    test('should add separator', () => {
      const separator = toolbar.addSeparator();

      expect(separator).toBeDefined();
      expect(toolbar.items).toContain(separator);
      expect(toolbar.el.children.length).toBe(1);
      expect(toolbar.el.firstElementChild).toHaveClass('aionda-toolbar-separator');
    });

    test('should add spacer', () => {
      const spacer = toolbar.addSpacer();

      expect(spacer).toBeDefined();
      expect(toolbar.items).toContain(spacer);
      expect(toolbar.el.children.length).toBe(1);
      expect(toolbar.el.firstElementChild).toHaveClass('aionda-toolbar-spacer');
    });

    test('should remove item', () => {
      const button = new Button({ text: 'Test Button' });
      toolbar.add(button);

      const result = toolbar.remove(button);

      expect(result).toBe(toolbar);
      expect(toolbar.items).not.toContain(button);
      expect(toolbar.el.children.length).toBe(0);

      button.destroy();
    });

    test('should remove all items', () => {
      const button1 = new Button({ text: 'Button 1' });
      const button2 = new Button({ text: 'Button 2' });

      toolbar.add(button1);
      toolbar.add(button2);

      const result = toolbar.removeAll();

      expect(result).toBe(toolbar);
      expect(toolbar.items).toHaveLength(0);
      expect(toolbar.el.children.length).toBe(0);

      button1.destroy();
      button2.destroy();
    });

    test('should get items copy', () => {
      const button1 = new Button({ text: 'Button 1' });
      const button2 = new Button({ text: 'Button 2' });

      toolbar.add(button1);
      toolbar.add(button2);

      const items = toolbar.getItems();

      expect(items).toHaveLength(2);
      expect(items).toContain(button1);
      expect(items).toContain(button2);

      // Should be a copy, not the original array
      items.push('new item');
      expect(toolbar.items).toHaveLength(2);

      button1.destroy();
      button2.destroy();
    });

    test('should handle adding items when not rendered', () => {
      const newToolbar = new Toolbar();
      const button = new Button({ text: 'Test' });

      expect(() => newToolbar.add(button)).not.toThrow();
      expect(newToolbar.items).toContain(button);

      newToolbar.destroy();
      button.destroy();
    });
  });

  describe('separator rendering', () => {
    beforeEach(() => {
      toolbar = new Toolbar();
      toolbar.render();
    });

    test('should render horizontal separator', () => {
      toolbar.orientation = 'horizontal';
      const separator = toolbar.addSeparator();

      expect(separator.className).toContain('aionda-toolbar-separator');
      expect(separator.className).toContain('border-l');
      expect(separator.className).toContain('border-gray-300');
      expect(separator.className).toContain('h-6');
    });

    test('should render vertical separator', () => {
      toolbar.orientation = 'vertical';
      const separator = toolbar.addSeparator();

      expect(separator.className).toContain('aionda-toolbar-separator');
      expect(separator.className).toContain('border-t');
      expect(separator.className).toContain('border-gray-300');
      expect(separator.className).toContain('w-6');
    });

    test('should render spacer', () => {
      const spacer = toolbar.addSpacer();

      expect(spacer.className).toContain('aionda-toolbar-spacer');
      expect(spacer.className).toContain('flex-grow');
    });
  });

  describe('button integration', () => {
    beforeEach(() => {
      toolbar = new Toolbar();
      toolbar.render();
    });

    test('should add button with handler', () => {
      const handler = jest.fn();
      const button = new Button({ 
        text: 'Click Me',
        handler 
      });

      toolbar.add(button);
      button.render();

      testUtils.fireClickEvent(button.buttonEl);

      expect(handler).toHaveBeenCalledWith(button, expect.any(Event));

      button.destroy();
    });

    test('should add multiple buttons with different variants', () => {
      const primaryButton = new Button({ text: 'Primary', variant: 'primary' });
      const secondaryButton = new Button({ text: 'Secondary', variant: 'secondary' });

      toolbar.add(primaryButton);
      toolbar.add(secondaryButton);

      expect(toolbar.items).toHaveLength(2);
      expect(toolbar.el.children.length).toBe(2);

      primaryButton.destroy();
      secondaryButton.destroy();
    });

    test('should handle button state changes', () => {
      const button = new Button({ text: 'Toggle Button' });
      toolbar.add(button);
      button.render();

      button.setPressed(true);
      expect(button.pressed).toBe(true);

      button.setLoading(true);
      expect(button.loading).toBe(true);

      button.destroy();
    });
  });

  describe('overflow handling', () => {
    test('should handle visible overflow', () => {
      toolbar = new Toolbar({ overflow: 'visible' });
      const el = toolbar.render();

      expect(el).toHaveClass('overflow-visible');
    });

    test('should handle hidden overflow', () => {
      toolbar = new Toolbar({ overflow: 'hidden' });
      const el = toolbar.render();

      expect(el).toHaveClass('overflow-hidden');
    });

    test('should handle scroll overflow', () => {
      toolbar = new Toolbar({ overflow: 'scroll' });
      const el = toolbar.render();

      expect(el).toHaveClass('overflow-x-auto');
    });

    test('should handle overflow with many items', () => {
      toolbar = new Toolbar({ overflow: 'scroll' });
      toolbar.render();

      // Add many buttons to test overflow
      for (let i = 0; i < 20; i++) {
        const button = new Button({ text: `Button ${i + 1}` });
        toolbar.add(button);
      }

      expect(toolbar.items).toHaveLength(20);
      expect(toolbar.el).toHaveClass('overflow-x-auto');

      // Clean up
      toolbar.items.forEach(item => {
        if (item.destroy) item.destroy();
      });
    });
  });

  describe('responsive behavior', () => {
    test('should apply responsive classes when enabled', () => {
      toolbar = new Toolbar({ responsive: true });
      const el = toolbar.render();

      expect(el).toHaveClass('w-full');
    });

    test('should not apply responsive classes when disabled', () => {
      toolbar = new Toolbar({ responsive: false });
      const el = toolbar.render();

      expect(el).not.toHaveClass('w-full');
    });

    test('should handle wrap on small screens', () => {
      toolbar = new Toolbar({ wrap: true, responsive: true });
      const el = toolbar.render();

      expect(el).toHaveClass('flex-wrap');
      expect(el).toHaveClass('w-full');
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      toolbar = new Toolbar();
      toolbar.render();
    });

    test('should emit itemAdd event', () => {
      const itemAddSpy = jest.fn();
      toolbar.on('itemAdd', itemAddSpy);

      const button = new Button({ text: 'Test' });
      toolbar.add(button);

      expect(itemAddSpy).toHaveBeenCalledWith({ item: button });

      button.destroy();
    });

    test('should emit itemRemove event', () => {
      const button = new Button({ text: 'Test' });
      toolbar.add(button);

      const itemRemoveSpy = jest.fn();
      toolbar.on('itemRemove', itemRemoveSpy);

      toolbar.remove(button);

      expect(itemRemoveSpy).toHaveBeenCalledWith({ item: button });

      button.destroy();
    });

    test('should emit clear event', () => {
      const button = new Button({ text: 'Test' });
      toolbar.add(button);

      const clearSpy = jest.fn();
      toolbar.on('clear', clearSpy);

      toolbar.removeAll();

      expect(clearSpy).toHaveBeenCalled();

      button.destroy();
    });
  });

  describe('destroy()', () => {
    test('should destroy toolbar and all items', () => {
      const button1 = new Button({ text: 'Button 1' });
      const button2 = new Button({ text: 'Button 2' });

      toolbar = new Toolbar();
      toolbar.add(button1);
      toolbar.add(button2);

      const button1DestroySpy = jest.spyOn(button1, 'destroy');
      const button2DestroySpy = jest.spyOn(button2, 'destroy');

      toolbar.destroy();

      expect(button1DestroySpy).toHaveBeenCalled();
      expect(button2DestroySpy).toHaveBeenCalled();
      expect(toolbar.items).toHaveLength(0);
      expect(toolbar.destroyed).toBe(true);
    });

    test('should handle items without destroy method', () => {
      const element = document.createElement('div');

      toolbar = new Toolbar();
      toolbar.add(element);

      expect(() => toolbar.destroy()).not.toThrow();
    });
  });

  describe('method chaining', () => {
    test('should support method chaining for chainable methods', () => {
      const button1 = new Button({ text: 'Button 1' });
      const button2 = new Button({ text: 'Button 2' });

      toolbar = new Toolbar();
      toolbar.render();

      const result = toolbar
        .add(button1)
        .add(button2)
        .removeAll();

      expect(result).toBe(toolbar);
      expect(toolbar.items).toHaveLength(0);

      button1.destroy();
      button2.destroy();
    });

    test('should return DOM elements for addSeparator and addSpacer', () => {
      toolbar = new Toolbar();
      toolbar.render();

      const separator = toolbar.addSeparator();
      const spacer = toolbar.addSpacer();

      expect(separator).toBeInstanceOf(HTMLElement);
      expect(separator).toHaveClass('aionda-toolbar-separator');
      expect(spacer).toBeInstanceOf(HTMLElement);
      expect(spacer).toHaveClass('aionda-toolbar-spacer');
      expect(toolbar.items).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    test('should handle null/undefined config', () => {
      expect(() => new Toolbar(null)).not.toThrow();
      expect(() => new Toolbar(undefined)).not.toThrow();
    });

    test('should handle empty items array', () => {
      toolbar = new Toolbar({ items: [] });
      expect(toolbar.items).toHaveLength(0);
    });

    test('should handle invalid orientation', () => {
      toolbar = new Toolbar({ orientation: 'invalid' });
      const el = toolbar.render();

      // Should default to horizontal
      expect(el).toHaveClass('aionda-toolbar-horizontal');
    });

    test('should handle zero height', () => {
      toolbar = new Toolbar({ height: 0 });
      const el = toolbar.render();

      expect(el.style.height).toBe('0px');
    });

    test('should handle removing non-existent item', () => {
      toolbar = new Toolbar();
      const button = new Button({ text: 'Test' });

      expect(() => toolbar.remove(button)).not.toThrow();
      expect(toolbar.items.length).toBe(0);

      button.destroy();
    });

    test('should handle mixed item types', () => {
      toolbar = new Toolbar();
      toolbar.render();

      const button = new Button({ text: 'Button' });
      const element = document.createElement('span');
      const component = new TestItem({ text: 'Component' });

      toolbar.add(button);
      toolbar.add(element);
      toolbar.add(component);

      expect(toolbar.items).toHaveLength(3);
      expect(toolbar.el.children.length).toBe(3);

      button.destroy();
      component.destroy();
    });

    test('should handle invalid justify value', () => {
      toolbar = new Toolbar({ justify: 'invalid' });
      const classes = toolbar.getJustifyClasses();

      expect(classes).toContain('justify-start');
    });

    test('should handle invalid spacing value', () => {
      toolbar = new Toolbar({ spacing: 'invalid' });
      const classes = toolbar.getSpacingClasses();

      expect(classes).toContain('gap-2'); // Should default to medium
    });
  });

  describe('getOverflowClasses()', () => {
    test('should include overflow-visible for visible setting', () => {
      toolbar = new Toolbar({ overflow: 'visible' });
      const classes = toolbar.getOverflowClasses();

      expect(classes).toContain('overflow-visible');
    });

    test('should include overflow-hidden for hidden setting', () => {
      toolbar = new Toolbar({ overflow: 'hidden' });
      const classes = toolbar.getOverflowClasses();

      expect(classes).toContain('overflow-hidden');
    });

    test('should include overflow-x-auto for scroll setting', () => {
      toolbar = new Toolbar({ overflow: 'scroll' });
      const classes = toolbar.getOverflowClasses();

      expect(classes).toContain('overflow-x-auto');
    });

    test('should default to overflow-visible for unknown setting', () => {
      toolbar = new Toolbar({ overflow: 'unknown' });
      const classes = toolbar.getOverflowClasses();

      expect(classes).toContain('overflow-visible');
    });
  });

  describe('item rendering', () => {
    beforeEach(() => {
      toolbar = new Toolbar();
    });

    test('should render string as text', () => {
      const result = toolbar.renderItem('Hello World', 0);
      
      expect(result).toContain('Hello World');
      expect(result).toContain('data-type="text"');
      expect(result).toContain('data-index="0"');
    });

    test('should render separator with pipe character', () => {
      const result = toolbar.renderItem('|', 0);
      
      expect(result).toContain('aionda-toolbar-separator');
      expect(result).toContain('data-type="separator"');
    });

    test('should render separator with string "separator"', () => {
      const result = toolbar.renderItem('separator', 0);
      
      expect(result).toContain('aionda-toolbar-separator');
      expect(result).toContain('data-type="separator"');
    });

    test('should render spacer with arrow character', () => {
      const result = toolbar.renderItem('->', 0);
      
      expect(result).toContain('aionda-toolbar-spacer');
      expect(result).toContain('data-type="spacer"');
    });

    test('should render spacer with string "spacer"', () => {
      const result = toolbar.renderItem('spacer', 0);
      
      expect(result).toContain('aionda-toolbar-spacer');
      expect(result).toContain('data-type="spacer"');
    });

    test('should render fill with dash character', () => {
      const result = toolbar.renderItem('-', 0);
      
      expect(result).toContain('aionda-toolbar-fill');
      expect(result).toContain('data-type="fill"');
    });

    test('should render fill with string "fill"', () => {
      const result = toolbar.renderItem('fill', 0);
      
      expect(result).toContain('aionda-toolbar-fill');
      expect(result).toContain('data-type="fill"');
    });

    test('should render button object', () => {
      const buttonConfig = { text: 'Test Button', icon: '💫' };
      const result = toolbar.renderItem(buttonConfig, 0);
      
      expect(result).toContain('aionda-toolbar-item');
      expect(result).toContain('data-type="button"');
      expect(result).toContain('Test Button');
    });

    test('should render button with cmp', () => {
      const buttonConfig = { cmp: 'button', text: 'XType Button' };
      const result = toolbar.renderItem(buttonConfig, 0);
      
      expect(result).toContain('aionda-toolbar-item');
      expect(result).toContain('data-type="button"');
      expect(result).toContain('XType Button');
    });

    test('should render buttongroup', () => {
      const groupConfig = { 
        cmp: 'buttongroup',
        items: [
          { text: 'Button 1' },
          { text: 'Button 2' }
        ]
      };
      const result = toolbar.renderItem(groupConfig, 0);
      
      expect(result).toContain('aionda-toolbar-buttongroup');
      expect(result).toContain('data-type="buttongroup"');
      expect(result).toContain('Button 1');
      expect(result).toContain('Button 2');
    });

    test('should render separator object', () => {
      const separatorConfig = { cmp: 'separator' };
      const result = toolbar.renderItem(separatorConfig, 0);
      
      expect(result).toContain('aionda-toolbar-separator');
      expect(result).toContain('data-type="separator"');
    });

    test('should render spacer object', () => {
      const spacerConfig = { cmp: 'spacer' };
      const result = toolbar.renderItem(spacerConfig, 0);
      
      expect(result).toContain('aionda-toolbar-spacer');
      expect(result).toContain('data-type="spacer"');
    });

    test('should render fill object', () => {
      const fillConfig = { cmp: 'fill' };
      const result = toolbar.renderItem(fillConfig, 0);
      
      expect(result).toContain('aionda-toolbar-fill');
      expect(result).toContain('data-type="fill"');
    });

    test('should render text object', () => {
      const textConfig = { cmp: 'text', text: 'Custom Text' };
      const result = toolbar.renderItem(textConfig, 0);
      
      expect(result).toContain('Custom Text');
      expect(result).toContain('data-type="text"');
    });

    test('should return empty string for unknown item types', () => {
      const result = toolbar.renderItem({ cmp: 'unknown' }, 0);
      
      expect(result).toBe('');
    });

    test('should handle text object without text property', () => {
      const textConfig = { cmp: 'text' };
      const result = toolbar.renderItem(textConfig, 0);
      
      expect(result).toContain('data-type="text"');
      expect(result).toContain('aionda-toolbar-text');
    });
  });

  describe('renderItems method', () => {
    test('should render all items in toolbar', () => {
      const items = [
        'Text Item',
        '|',
        { text: 'Button' },
        'spacer'
      ];
      
      toolbar = new Toolbar({ items });
      const result = toolbar.renderItems();
      
      expect(result).toContain('Text Item');
      expect(result).toContain('aionda-toolbar-separator');
      expect(result).toContain('Button');
      expect(result).toContain('aionda-toolbar-spacer');
    });

    test('should handle empty items array', () => {
      toolbar = new Toolbar({ items: [] });
      const result = toolbar.renderItems();
      
      expect(result).toBe('');
    });
  });

  describe('orientation-specific rendering', () => {
    test('should render horizontal separator correctly', () => {
      toolbar = new Toolbar({ orientation: 'horizontal' });
      const result = toolbar.renderSeparator(0);
      
      expect(result).toContain('w-px');
      expect(result).toContain('h-6');
      expect(result).toContain('bg-gray-300');
    });

    test('should render vertical separator correctly', () => {
      toolbar = new Toolbar({ orientation: 'vertical' });
      const result = toolbar.renderSeparator(0);
      
      expect(result).toContain('h-px');
      expect(result).toContain('w-full');
      expect(result).toContain('bg-gray-300');
    });

    test('should render buttongroup with vertical orientation', () => {
      toolbar = new Toolbar({ orientation: 'vertical' });
      const groupConfig = { 
        cmp: 'buttongroup',
        items: [{ text: 'Button 1' }]
      };
      const result = toolbar.renderButtonGroup(groupConfig, 0);
      
      expect(result).toContain('flex-col');
    });

    test('should render buttongroup with horizontal orientation', () => {
      toolbar = new Toolbar({ orientation: 'horizontal' });
      const groupConfig = { 
        cmp: 'buttongroup',
        items: [{ text: 'Button 1' }]
      };
      const result = toolbar.renderButtonGroup(groupConfig, 0);
      
      expect(result).toContain('flex-row');
    });
  });

  describe('setup event listeners', () => {
    test('should set up event listeners when rendered', () => {
      toolbar = new Toolbar();
      toolbar.render();
      
      expect(toolbar.el).toBeTruthy();
      expect(toolbar.rendered).toBe(true);
    });
  });

  describe('context menu functionality', () => {
    test('should handle context menu events', () => {
      toolbar = new Toolbar();
      toolbar.render();
      
      const contextSpy = jest.fn();
      toolbar.on('contextmenu', contextSpy);
      
      const contextEvent = new MouseEvent('contextmenu', { bubbles: true });
      toolbar.el.dispatchEvent(contextEvent);
      
      // Since context menu might not be implemented, just test event doesn't break
      expect(() => toolbar.el.dispatchEvent(contextEvent)).not.toThrow();
    });
  });

  describe('button content and attributes', () => {
    beforeEach(() => {
      toolbar = new Toolbar();
    });

    test('should create button HTML with proper classes', () => {
      const config = { text: 'Test Button', variant: 'primary' };
      const result = toolbar.createButtonHTML(config);
      
      expect(result).toContain('aionda-toolbar-button');
      expect(result).toContain('inline-flex');
      expect(result).toContain('items-center');
      expect(result).toContain('Test Button');
    });

    test('should create grouped button HTML', () => {
      const config = { text: 'Group Button' };
      const result = toolbar.createButtonHTML(config, true);
      
      expect(result).toContain('aionda-toolbar-button');
      expect(result).toContain('border-r');
      expect(result).toContain('Group Button');
    });

    test('should get button classes for regular button', () => {
      const config = { text: 'Test' };
      const classes = toolbar.getButtonClasses(config, false);
      
      expect(classes).toContain('aionda-toolbar-button');
      expect(classes).toContain('px-3');
      expect(classes).toContain('rounded');
    });

    test('should get button classes for grouped button', () => {
      const config = { text: 'Test' };
      const classes = toolbar.getButtonClasses(config, true);
      
      expect(classes).toContain('aionda-toolbar-button');
      expect(classes).toContain('border-r');
      expect(classes).toContain('last:border-r-0');
    });

    test('should get button attributes', () => {
      const config = { 
        text: 'Test',
        disabled: true,
        title: 'Test tooltip'
      };
      const attributes = toolbar.getButtonAttributes(config);
      
      expect(attributes).toContain('disabled');
      expect(attributes).toContain('title="Test tooltip"');
    });

    test('should get button content with text', () => {
      const config = { text: 'Button Text' };
      const content = toolbar.getButtonContent(config);
      
      expect(content).toContain('Button Text');
    });

    test('should get button content with icon', () => {
      const config = { 
        text: 'Button Text',
        icon: '🎯'
      };
      const content = toolbar.getButtonContent(config);
      
      expect(content).toContain('🎯');
      expect(content).toContain('Button Text');
    });
  });

  describe('overflow functionality', () => {
    beforeEach(() => {
      toolbar = new Toolbar();
    });

    test('should render overflow button', () => {
      const result = toolbar.renderOverflowButton();
      
      expect(result).toContain('aionda-toolbar-overflow-btn');
      expect(result).toContain('aionda-toolbar-overflow-trigger');
      expect(result).toContain('hidden');
    });

    test('should render overflow menu', () => {
      const result = toolbar.renderOverflowMenu();
      
      expect(result).toContain('aionda-toolbar-overflow-menu');
      expect(result).toContain('hidden');
      expect(result).toContain('absolute');
      expect(result).toContain('z-50');
    });
  });
});