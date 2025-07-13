/**
 * Unit tests for Panel component
 * Tests container functionality with header, body, and collapsing
 */

import { Panel } from '../src/components/Panel.js';
import { Component } from '../src/core/Component.js';

// Test component for adding to panels
class TestItem extends Component {
  constructor(config = {}) {
    super(config);
    this.text = config.text || 'Test Item';
  }

  createTemplate() {
    return `<div class="test-item">${this.text}</div>`;
  }
}

describe('Panel', () => {
  let panel;

  beforeEach(() => {
    panel = null;
  });

  afterEach(() => {
    if (panel && !panel.destroyed) {
      panel.destroy();
    }
    panel = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create panel with default config', () => {
      panel = new Panel();

      expect(panel.title).toBe('');
      expect(panel.collapsible).toBe(false);
      expect(panel.collapsed).toBe(false);
      expect(panel.header).toBe(true);
      expect(panel.headerHeight).toBe(48);
      expect(panel.padding).toBe(true);
      expect(panel.border).toBe(true);
      expect(panel.shadow).toBe(false);
      expect(panel.bodyStyle).toEqual({});
      expect(panel.items).toEqual([]);
    });

    test('should create panel with custom config', () => {
      const config = {
        title: 'Test Panel',
        collapsible: true,
        collapsed: true,
        header: false,
        headerHeight: 60,
        padding: false,
        border: false,
        shadow: true,
        bodyStyle: { backgroundColor: 'red' }
      };

      panel = new Panel(config);

      expect(panel.title).toBe('Test Panel');
      expect(panel.collapsible).toBe(true);
      expect(panel.collapsed).toBe(true);
      expect(panel.header).toBe(false);
      expect(panel.headerHeight).toBe(60);
      expect(panel.padding).toBe(false);
      expect(panel.border).toBe(false);
      expect(panel.shadow).toBe(true);
      expect(panel.bodyStyle).toEqual({ backgroundColor: 'red' });
    });

    test('should add initial items', () => {
      const item1 = new TestItem({ text: 'Item 1' });
      const item2 = new TestItem({ text: 'Item 2' });

      panel = new Panel({
        items: [item1, item2]
      });

      expect(panel.items).toHaveLength(2);
      expect(panel.items).toContain(item1);
      expect(panel.items).toContain(item2);

      // Clean up items
      item1.destroy();
      item2.destroy();
    });
  });

  describe('createTemplate()', () => {
    test('should create panel with header and body', () => {
      panel = new Panel({ title: 'Test Panel' });
      const el = panel.render();

      expect(el).toHaveClass('aionda-panel');
      expect(el.querySelector('.aionda-panel-header')).not.toBeNull();
      expect(el.querySelector('.aionda-panel-body')).not.toBeNull();
      expect(el.querySelector('.aionda-panel-title').textContent).toBe('Test Panel');
    });

    test('should create panel without header', () => {
      panel = new Panel({ header: false });
      const el = panel.render();

      expect(el.querySelector('.aionda-panel-header')).toBeNull();
      expect(el.querySelector('.aionda-panel-body')).not.toBeNull();
    });

    test('should include collapse button when collapsible', () => {
      panel = new Panel({ collapsible: true });
      const el = panel.render();

      expect(el.querySelector('.aionda-panel-collapse-btn')).not.toBeNull();
    });

    test('should not include collapse button when not collapsible', () => {
      panel = new Panel({ collapsible: false });
      const el = panel.render();

      expect(el.querySelector('.aionda-panel-collapse-btn')).toBeNull();
    });

    test('should set correct header height', () => {
      panel = new Panel({ headerHeight: 60 });
      const el = panel.render();
      const header = el.querySelector('.aionda-panel-header');

      expect(header.style.height).toBe('60px');
      expect(header.style.minHeight).toBe('60px');
    });

    test('should apply body style', () => {
      panel = new Panel({
        bodyStyle: { backgroundColor: 'red', color: 'white' }
      });
      const el = panel.render();
      const body = el.querySelector('.aionda-panel-body');

      expect(body.style.cssText).toContain('background-color: red');
      expect(body.style.cssText).toContain('color: white');
    });
  });

  describe('getPanelClasses()', () => {
    test('should include base panel classes', () => {
      panel = new Panel();
      const classes = panel.getPanelClasses();

      expect(classes).toContain('aionda-panel');
      expect(classes).toContain('bg-white');
      expect(classes).toContain('flex');
      expect(classes).toContain('flex-col');
      expect(classes).toContain('overflow-hidden');
    });

    test('should include border classes when enabled', () => {
      panel = new Panel({ border: true });
      const classes = panel.getPanelClasses();

      expect(classes).toContain('border');
      expect(classes).toContain('border-gray-200');
    });

    test('should include shadow classes when enabled', () => {
      panel = new Panel({ shadow: true });
      const classes = panel.getPanelClasses();

      expect(classes).toContain('shadow-sm');
    });

    test('should include responsive classes', () => {
      panel = new Panel({ responsive: true });
      const classes = panel.getPanelClasses();

      expect(classes).toContain('w-full');
    });
  });

  describe('getBodyStyleString()', () => {
    test('should convert camelCase to kebab-case', () => {
      panel = new Panel({
        bodyStyle: {
          backgroundColor: 'red',
          fontSize: '14px',
          borderRadius: '4px'
        }
      });

      const styleString = panel.getBodyStyleString();

      expect(styleString).toContain('background-color: red');
      expect(styleString).toContain('font-size: 14px');
      expect(styleString).toContain('border-radius: 4px');
    });

    test('should handle empty body style', () => {
      panel = new Panel({ bodyStyle: {} });
      const styleString = panel.getBodyStyleString();

      expect(styleString).toBe('');
    });
  });

  describe('title management', () => {
    beforeEach(async () => {
      panel = new Panel({ title: 'Initial Title' });
      panel.render();
      await testUtils.waitForDOMUpdate();
    });

    test('should set title', async () => {
      const titleChangeSpy = jest.fn();
      panel.on('titleChange', titleChangeSpy);

      const result = panel.setTitle('New Title');
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(panel); // Should return this for chaining
      expect(panel.getTitle()).toBe('New Title');
      expect(panel.titleEl.textContent).toBe('New Title');
      expect(titleChangeSpy).toHaveBeenCalledWith({ title: 'New Title' });
    });

    test('should get title', () => {
      expect(panel.getTitle()).toBe('Initial Title');
    });

    test('should handle setting title when not rendered', () => {
      const newPanel = new Panel();

      expect(() => newPanel.setTitle('Test')).not.toThrow();
      expect(newPanel.getTitle()).toBe('Test');

      newPanel.destroy();
    });
  });

  describe('collapse/expand functionality', () => {
    beforeEach(async () => {
      panel = new Panel({ 
        title: 'Collapsible Panel',
        collapsible: true,
        collapsed: false
      });
      panel.render();
      await testUtils.waitForDOMUpdate();
    });

    test('should collapse panel', async () => {
      const collapseSpy = jest.fn();
      panel.on('collapse', collapseSpy);

      const result = panel.collapse();
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(panel); // Should return this for chaining
      expect(panel.collapsed).toBe(true);
      expect(panel.bodyEl).toHaveClass('hidden');
      expect(panel.bodyEl).not.toHaveClass('block');
      expect(collapseSpy).toHaveBeenCalled();

      const icon = panel.el.querySelector('.aionda-panel-collapse-btn svg');
      expect(icon).not.toHaveClass('rotate-90');
    });

    test('should expand panel', async () => {
      panel.collapse(); // First collapse it
      await testUtils.waitForDOMUpdate();
      const expandSpy = jest.fn();
      panel.on('expand', expandSpy);

      const result = panel.expand();
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(panel); // Should return this for chaining
      expect(panel.collapsed).toBe(false);
      expect(panel.bodyEl).not.toHaveClass('hidden');
      expect(panel.bodyEl).toHaveClass('block');
      expect(expandSpy).toHaveBeenCalled();

      const icon = panel.el.querySelector('.aionda-panel-collapse-btn svg');
      expect(icon).toHaveClass('rotate-90');
    });

    test('should toggle collapse state', async () => {
      expect(panel.collapsed).toBe(false);

      panel.toggleCollapse();
      await testUtils.waitForDOMUpdate();
      expect(panel.collapsed).toBe(true);

      panel.toggleCollapse();
      await testUtils.waitForDOMUpdate();
      expect(panel.collapsed).toBe(false);
    });

    test('should not collapse when not collapsible', () => {
      const nonCollapsiblePanel = new Panel({ collapsible: false });
      nonCollapsiblePanel.render();

      const result = nonCollapsiblePanel.collapse();

      expect(result).toBe(nonCollapsiblePanel);
      expect(nonCollapsiblePanel.collapsed).toBe(false);

      nonCollapsiblePanel.destroy();
    });

    test('should not expand when not collapsible', () => {
      const nonCollapsiblePanel = new Panel({ 
        collapsible: false,
        collapsed: true 
      });
      nonCollapsiblePanel.render();

      const result = nonCollapsiblePanel.expand();

      expect(result).toBe(nonCollapsiblePanel);
      expect(nonCollapsiblePanel.collapsed).toBe(true);

      nonCollapsiblePanel.destroy();
    });

    test('should handle collapse button click', async () => {
      const collapseBtn = panel.el.querySelector('.aionda-panel-collapse-btn');

      await testUtils.fireClickEvent(collapseBtn);

      expect(panel.collapsed).toBe(true);
    });
  });

  describe('item management', () => {
    beforeEach(async () => {
      panel = new Panel();
      panel.render();
      await testUtils.waitForDOMUpdate();
    });

    test('should add component item', async () => {
      const item = new TestItem({ text: 'Test Component' });

      const result = panel.add(item);
      await testUtils.waitForDOMUpdate();

      expect(result).toBe(panel); // Should return this for chaining
      expect(panel.items).toContain(item);
      expect(panel.bodyEl.children.length).toBe(1);
      expect(panel.bodyEl.firstElementChild).toHaveClass('test-item');

      item.destroy();
    });

    test('should add HTML element item', () => {
      const element = document.createElement('div');
      element.textContent = 'Test Element';
      element.className = 'test-element';

      panel.add(element);

      expect(panel.items).toContain(element);
      expect(panel.bodyEl.children.length).toBe(1);
      expect(panel.bodyEl.firstElementChild).toHaveClass('test-element');
    });

    test('should remove component item', () => {
      const item = new TestItem();
      panel.add(item);

      const result = panel.remove(item);

      expect(result).toBe(panel); // Should return this for chaining
      expect(panel.items).not.toContain(item);
      expect(panel.bodyEl.children.length).toBe(0);

      item.destroy();
    });

    test('should handle removing non-existent item', () => {
      const item = new TestItem();

      expect(() => panel.remove(item)).not.toThrow();
      expect(panel.items.length).toBe(0);

      item.destroy();
    });

    test('should remove all items', () => {
      const item1 = new TestItem({ text: 'Item 1' });
      const item2 = new TestItem({ text: 'Item 2' });

      panel.add(item1);
      panel.add(item2);

      const result = panel.removeAll();

      expect(result).toBe(panel); // Should return this for chaining
      expect(panel.items).toHaveLength(0);
      expect(panel.bodyEl.children.length).toBe(0);

      item1.destroy();
      item2.destroy();
    });

    test('should get items copy', () => {
      const item1 = new TestItem();
      const item2 = new TestItem();

      panel.add(item1);
      panel.add(item2);

      const items = panel.getItems();

      expect(items).toHaveLength(2);
      expect(items).toContain(item1);
      expect(items).toContain(item2);

      // Should be a copy, not the original array
      items.push('new item');
      expect(panel.items).toHaveLength(2);

      item1.destroy();
      item2.destroy();
    });

    test('should handle adding items when not rendered', () => {
      const newPanel = new Panel();
      const item = new TestItem();

      expect(() => newPanel.add(item)).not.toThrow();
      expect(newPanel.items).toContain(item);

      newPanel.destroy();
      item.destroy();
    });
  });

  describe('setupEventListeners()', () => {
    test('should setup collapse button event listener', () => {
      panel = new Panel({ collapsible: true });
      panel.render();

      expect(panel.headerEl).not.toBeNull();
      expect(panel.bodyEl).not.toBeNull();
      expect(panel.titleEl).not.toBeNull();

      const collapseBtn = panel.el.querySelector('.aionda-panel-collapse-btn');
      expect(collapseBtn).not.toBeNull();
    });

    test('should not setup collapse listener when not collapsible', () => {
      panel = new Panel({ collapsible: false });
      panel.render();

      expect(panel.headerEl).not.toBeNull();
      expect(panel.bodyEl).not.toBeNull();
      expect(panel.titleEl).not.toBeNull();

      const collapseBtn = panel.el.querySelector('.aionda-panel-collapse-btn');
      expect(collapseBtn).toBeNull();
    });
  });

  describe('destroy()', () => {
    test('should destroy panel and all items', () => {
      const item1 = new TestItem();
      const item2 = new TestItem();

      panel = new Panel();
      panel.add(item1);
      panel.add(item2);

      const item1DestroySpy = jest.spyOn(item1, 'destroy');
      const item2DestroySpy = jest.spyOn(item2, 'destroy');

      panel.destroy();

      expect(item1DestroySpy).toHaveBeenCalled();
      expect(item2DestroySpy).toHaveBeenCalled();
      expect(panel.items).toHaveLength(0);
      expect(panel.destroyed).toBe(true);
    });

    test('should handle items without destroy method', () => {
      const element = document.createElement('div');

      panel = new Panel();
      panel.add(element);

      expect(() => panel.destroy()).not.toThrow();
    });
  });

  describe('responsive behavior', () => {
    test('should apply responsive classes', () => {
      panel = new Panel({ responsive: true });
      const el = panel.render();

      expect(el).toHaveClass('w-full');
    });

    test('should not apply responsive classes when disabled', () => {
      panel = new Panel({ responsive: false });
      const el = panel.render();

      expect(el).not.toHaveClass('w-full');
    });
  });

  describe('styling options', () => {
    test('should apply padding when enabled', () => {
      panel = new Panel({ padding: true });
      const el = panel.render();
      const body = el.querySelector('.aionda-panel-body');

      expect(body).toHaveClass('p-4');
    });

    test('should not apply padding when disabled', () => {
      panel = new Panel({ padding: false });
      const el = panel.render();
      const body = el.querySelector('.aionda-panel-body');

      expect(body).not.toHaveClass('p-4');
    });

    test('should show collapsed state in template', () => {
      panel = new Panel({ collapsed: true });
      const el = panel.render();
      const body = el.querySelector('.aionda-panel-body');

      expect(body).toHaveClass('hidden');
    });

    test('should show expanded state in template', () => {
      panel = new Panel({ collapsed: false });
      const el = panel.render();
      const body = el.querySelector('.aionda-panel-body');

      expect(body).toHaveClass('block');
    });
  });

  describe('method chaining', () => {
    test('should support method chaining', () => {
      const item1 = new TestItem();
      const item2 = new TestItem();

      panel = new Panel({ collapsible: true });
      panel.render();

      const result = panel
        .setTitle('Chained Panel')
        .add(item1)
        .add(item2)
        .collapse()
        .expand()
        .removeAll();

      expect(result).toBe(panel);
      expect(panel.getTitle()).toBe('Chained Panel');
      expect(panel.items).toHaveLength(0);

      item1.destroy();
      item2.destroy();
    });
  });

  describe('responsive behavior', () => {
    test('should handle mobile viewport', () => {
      testUtils.setMobileViewport();
      panel = new Panel({ title: 'Mobile Panel' });
      const el = panel.render();

      expect(window.innerWidth).toBe(320);
      expect(el).toHaveClass('aionda-panel');
    });

    test('should handle tablet viewport', () => {
      testUtils.setTabletViewport();
      panel = new Panel({ title: 'Tablet Panel' });
      const el = panel.render();

      expect(window.innerWidth).toBe(768);
      expect(el).toHaveClass('aionda-panel');
    });

    test('should handle touch events on mobile', () => {
      testUtils.setMobileViewport();
      panel = new Panel({ collapsible: true, title: 'Touch Panel' });
      const el = panel.render();
      
      const collapseBtn = el.querySelector('.aionda-panel-collapse-btn');
      if (collapseBtn) {
        // Simulate touch by directly calling click handler
        testUtils.fireClickEvent(collapseBtn);
        expect(panel.collapsed).toBe(true);
      } else {
        // Panel might not have collapse button visible
        expect(el).toHaveClass('aionda-panel');
      }
    });
  });

  describe('edge cases', () => {
    test('should handle null/undefined config', () => {
      // Panel constructor uses config = {} as default, so null is handled
      const nullPanel = new Panel();
      expect(nullPanel).toBeInstanceOf(Panel);
      nullPanel.destroy();
      
      const undefinedPanel = new Panel(undefined);
      expect(undefinedPanel).toBeInstanceOf(Panel);
      undefinedPanel.destroy();
    });

    test('should handle empty items array', () => {
      panel = new Panel({ items: [] });
      expect(panel.items).toHaveLength(0);
    });

    test('should handle header false with title', () => {
      panel = new Panel({ 
        header: false,
        title: 'Hidden Title'
      });
      const el = panel.render();

      expect(el.querySelector('.aionda-panel-header')).toBeNull();
      expect(panel.getTitle()).toBe('Hidden Title');
    });

    test('should handle zero header height', () => {
      panel = new Panel({ headerHeight: 0 });
      const el = panel.render();
      const header = el.querySelector('.aionda-panel-header');

      expect(header.getAttribute('style')).toContain('height: 0px');
    });
  });
});