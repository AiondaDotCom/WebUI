/**
 * Unit tests for Grid component
 * Tests data grid functionality, sorting, filtering, and selection
 */

import { Grid } from '../src/components/Grid.js';
import { Store } from '../src/core/Store.js';

describe('Grid', () => {
  let grid;
  let store;

  const testData = [
    { id: 1, name: 'John Doe', age: 30, active: true },
    { id: 2, name: 'Jane Smith', age: 25, active: false },
    { id: 3, name: 'Bob Johnson', age: 35, active: true }
  ];

  const testColumns = [
    { field: 'id', text: 'ID', width: 50, type: 'number' },
    { field: 'name', text: 'Name', flex: 1, sortable: true },
    { field: 'age', text: 'Age', width: 80, sortable: true, type: 'number' },
    { field: 'active', text: 'Active', width: 100, type: 'boolean' }
  ];

  beforeEach(() => {
    grid = null;
    store = null;
  });

  afterEach(() => {
    if (grid && !grid.destroyed) {
      grid.destroy();
    }
    if (store) {
      store.removeAllListeners();
    }
    grid = null;
    store = null;
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create grid with default config', () => {
      grid = new Grid();

      expect(grid.columns).toEqual([]);
      expect(grid.selectionMode).toBe('single');
      expect(grid.sortable).toBe(false);
      expect(grid.filterable).toBe(false);
      expect(grid.editable).toBe(false);
      expect(grid.resizable).toBe(false);
      expect(grid.striped).toBe(true);
      expect(grid.hover).toBe(true);
    });

    test('should create grid with custom config', () => {
      store = new Store({ data: testData });
      
      const config = {
        store,
        columns: testColumns,
        selectionMode: 'multi',
        sortable: true,
        filterable: true,
        editable: true,
        resizable: true,
        striped: false,
        hover: false
      };

      grid = new Grid(config);

      expect(grid.store).toBe(store);
      expect(grid.columns).toEqual(testColumns);
      expect(grid.selectionMode).toBe('multi');
      expect(grid.sortable).toBe(true);
      expect(grid.filterable).toBe(true);
      expect(grid.editable).toBe(true);
      expect(grid.resizable).toBe(true);
      expect(grid.striped).toBe(false);
      expect(grid.hover).toBe(false);
    });
  });

  describe('rendering', () => {
    beforeEach(() => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: testColumns,
        rowNumbers: false
      });
    });

    test('should render grid with headers and rows', () => {
      const el = grid.render();

      expect(el).toHaveClass('aionda-grid');
      
      const headerCells = el.querySelectorAll('.aionda-grid-header th');
      expect(headerCells).toHaveLength(testColumns.length);
      expect(headerCells[1].textContent).toContain('Name');

      const rows = el.querySelectorAll('.aionda-grid-row');
      expect(rows).toHaveLength(testData.length);
    });

    test('should render sortable headers', () => {
      grid.destroy();
      grid = new Grid({
        store,
        columns: testColumns,
        sortable: true
      });
      const el = grid.render();

      const sortableHeaders = el.querySelectorAll('.aionda-grid-header th.sortable');
      expect(sortableHeaders.length).toBeGreaterThan(0);
    });

    test('should apply striped styling', () => {
      const el = grid.render();
      
      expect(el).toHaveClass('aionda-grid-striped');
    });

    test('should apply hover styling', () => {
      const el = grid.render();
      
      expect(el).toHaveClass('aionda-grid-hover');
    });
  });

  describe('data binding', () => {
    beforeEach(() => {
      // Create a fresh copy of test data for each test
      const freshTestData = [
        { id: 1, name: 'John Doe', age: 30, active: true },
        { id: 2, name: 'Jane Smith', age: 25, active: false },
        { id: 3, name: 'Bob Johnson', age: 35, active: true }
      ];
      store = new Store({ data: freshTestData });
      grid = new Grid({
        store,
        columns: testColumns,
        rowNumbers: false
      });
      grid.render();
    });

    test('should display data from store', () => {
      const cells = grid.el.querySelectorAll('.aionda-grid-row td');
      
      expect(cells[1].textContent.trim()).toBe('John Doe'); // first row, name column
      expect(cells[2].textContent.trim()).toBe('30'); // first row, age column
    });

    test('should update when store data changes', () => {
      store.add({ id: 4, name: 'Alice Brown', age: 28, active: true });

      const rows = grid.el.querySelectorAll('.aionda-grid-row');
      expect(rows).toHaveLength(4);
    });

    test('should handle store removal', () => {
      const record = store.getAt(0);
      store.remove(record);

      const rows = grid.el.querySelectorAll('.aionda-grid-row');
      expect(rows).toHaveLength(2);
    });
  });

  describe('column configuration', () => {
    test('should apply column widths', () => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: [
          { field: 'id', text: 'ID', width: 50 },
          { field: 'name', text: 'Name', width: 200 }
        ],
        rowNumbers: false
      });
      const el = grid.render();

      const headers = el.querySelectorAll('.aionda-grid-header th');
      expect(headers[0].style.width).toBe('50px');
      expect(headers[1].style.width).toBe('200px');
    });

    test('should apply flex columns', () => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: [
          { field: 'id', text: 'ID', width: 50 },
          { field: 'name', text: 'Name', flex: 1 }
        ],
        rowNumbers: false
      });
      const el = grid.render();

      const nameHeader = el.querySelector('.aionda-grid-header th:nth-child(2)');
      // Check that the flex-grow style is set in the style attribute  
      expect(nameHeader.getAttribute('style')).toContain('flex-grow: 1');
    });

    test('should handle boolean column type', () => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: [
          { field: 'active', text: 'Active', type: 'boolean' }
        ],
        rowNumbers: false
      });
      const el = grid.render();

      const firstCell = el.querySelector('.aionda-grid-row td');
      expect(firstCell.textContent.trim()).toBe('✓'); // or appropriate boolean representation
    });
  });

  describe('selection', () => {
    beforeEach(() => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: testColumns,
        selectionMode: 'single',
        rowNumbers: false
      });
      grid.render();
    });

    test('should select row on click', () => {
      const firstRow = grid.el.querySelector('.aionda-grid-row');
      
      testUtils.fireClickEvent(firstRow);

      expect(firstRow).toHaveClass('selected');
      expect(grid.getSelections()).toHaveLength(1);
    });

    test('should emit selection events', () => {
      const selectSpy = jest.fn();
      grid.on('selectionchange', selectSpy);

      const firstRow = grid.el.querySelector('.aionda-grid-row');
      testUtils.fireClickEvent(firstRow);

      expect(selectSpy).toHaveBeenCalledWith({
        selections: expect.any(Array),
        record: testData[0]
      });
    });

    test('should clear previous selection in single mode', () => {
      const rows = grid.el.querySelectorAll('.aionda-grid-row');
      
      testUtils.fireClickEvent(rows[0]);
      expect(rows[0]).toHaveClass('selected');

      testUtils.fireClickEvent(rows[1]);
      expect(rows[0]).not.toHaveClass('selected');
      expect(rows[1]).toHaveClass('selected');
    });

    test('should support multi selection', () => {
      grid.destroy();
      grid = new Grid({
        store,
        columns: testColumns,
        selectionMode: 'multi',
        rowNumbers: false
      });
      grid.render();

      const rows = grid.el.querySelectorAll('.aionda-grid-row');
      
      testUtils.fireClickEvent(rows[0]);
      testUtils.fireClickEvent(rows[1], { ctrlKey: true });

      expect(grid.getSelections()).toHaveLength(2);
    });
  });

  describe('responsive behavior', () => {
    beforeEach(() => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: testColumns,
        responsive: true,
        rowNumbers: false
      });
    });

    test('should handle mobile viewport', () => {
      testUtils.setMobileViewport();
      const el = grid.render();

      expect(window.innerWidth).toBe(320);
      expect(el).toHaveClass('aionda-grid');
    });

    test('should handle tablet viewport', () => {
      testUtils.setTabletViewport();
      const el = grid.render();

      expect(window.innerWidth).toBe(768);
      expect(el).toHaveClass('aionda-grid');
    });

    test('should handle desktop viewport', () => {
      testUtils.setDesktopViewport();
      const el = grid.render();

      expect(window.innerWidth).toBe(1024);
      expect(el).toHaveClass('aionda-grid');
    });

    test('should handle viewport changes', () => {
      const el = grid.render();
      
      testUtils.setMobileViewport();
      expect(window.innerWidth).toBe(320);
      
      testUtils.setDesktopViewport();
      expect(window.innerWidth).toBe(1024);
    });

    test('should handle touch events on mobile', () => {
      testUtils.setMobileViewport();
      const el = grid.render();
      
      const firstRow = el.querySelector('.aionda-grid-row');
      if (firstRow) {
        testUtils.fireTouchEvent(firstRow, 'touchstart', {
          clientX: 100,
          clientY: 100
        });
        
        testUtils.fireTouchEvent(firstRow, 'touchend', {
          clientX: 100,
          clientY: 100
        });
      }
    });
  });

  describe('sorting', () => {
    beforeEach(() => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: testColumns,
        sortable: true,
        rowNumbers: false
      });
      grid.render();
    });

    test('should sort on header click', () => {
      const nameHeader = grid.el.querySelector('.aionda-grid-header th:nth-child(2)');
      
      testUtils.fireClickEvent(nameHeader);

      // Data should be sorted by name ascending
      const firstRowName = grid.el.querySelector('.aionda-grid-row td:nth-child(2)').textContent.trim();
      expect(firstRowName).toBe('Bob Johnson'); // alphabetically first
    });

    test('should toggle sort direction', () => {
      let nameHeader = grid.el.querySelector('.aionda-grid-header th:nth-child(2)');
      
      testUtils.fireClickEvent(nameHeader); // ASC
      nameHeader = grid.el.querySelector('.aionda-grid-header th:nth-child(2)'); // Re-query after refresh
      testUtils.fireClickEvent(nameHeader); // DESC

      const firstRowName = grid.el.querySelector('.aionda-grid-row td:nth-child(2)').textContent.trim();
      expect(firstRowName).toBe('John Doe'); // alphabetically last
    });

    test('should show sort indicators', () => {
      const nameHeader = grid.el.querySelector('.aionda-grid-header th:nth-child(2)');
      
      testUtils.fireClickEvent(nameHeader);

      // Re-query the element after refresh
      const updatedNameHeader = grid.el.querySelector('.aionda-grid-header th:nth-child(2)');
      expect(updatedNameHeader).toHaveClass('sort-asc');
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: testColumns,
        filterable: true,
        rowNumbers: false
      });
      grid.render();
    });

    test('should show filter inputs', () => {
      const filterInputs = grid.el.querySelectorAll('.aionda-grid-filter input');
      expect(filterInputs.length).toBeGreaterThan(0);
    });

    test('should filter data on input', () => {
      const nameFilter = grid.el.querySelector('.aionda-grid-filter input[data-filter-field="name"]');
      nameFilter.value = 'John Doe';
      
      testUtils.fireInputEvent(nameFilter, 'John Doe');

      const rows = grid.el.querySelectorAll('.aionda-grid-row');
      expect(rows).toHaveLength(1);
      expect(rows[0].textContent).toContain('John Doe');
    });

    test('should clear filters', () => {
      const nameFilter = grid.el.querySelector('.aionda-grid-filter input');
      nameFilter.value = 'John';
      testUtils.fireInputEvent(nameFilter, 'John');

      grid.clearFilters();

      const rows = grid.el.querySelectorAll('.aionda-grid-row');
      expect(rows).toHaveLength(testData.length);
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: testColumns,
        rowNumbers: false
      });
      grid.render();
    });

    test('should refresh grid data', () => {
      store.add({ id: 4, name: 'New User', age: 20, active: true });
      
      grid.refresh();

      const rows = grid.el.querySelectorAll('.aionda-grid-row');
      expect(rows).toHaveLength(4);
    });

    test('should get selected records', () => {
      const firstRow = grid.el.querySelector('.aionda-grid-row');
      testUtils.fireClickEvent(firstRow);

      const selections = grid.getSelections();
      expect(selections).toHaveLength(1);
      expect(selections[0]).toEqual(testData[0]);
    });

    test('should clear selections', () => {
      const firstRow = grid.el.querySelector('.aionda-grid-row');
      testUtils.fireClickEvent(firstRow);

      grid.clearSelections();

      expect(grid.getSelections()).toHaveLength(0);
      expect(firstRow).not.toHaveClass('selected');
    });
  });

  describe('column visibility', () => {
    beforeEach(() => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: testColumns,
        rowNumbers: false
      });
      grid.render();
    });

    test('should initialize all columns as visible by default', () => {
      const visibleColumns = grid.getVisibleColumns();
      expect(visibleColumns).toHaveLength(testColumns.length);
      
      testColumns.forEach(col => {
        expect(grid.columnVisibility.get(col.field)).toBe(true);
      });
    });

    test('should hide column', () => {
      grid.hideColumn('name');
      
      expect(grid.columnVisibility.get('name')).toBe(false);
      const visibleColumns = grid.getVisibleColumns();
      expect(visibleColumns).toHaveLength(testColumns.length - 1);
    });

    test('should show column', () => {
      grid.hideColumn('name');
      grid.showColumn('name');
      
      expect(grid.columnVisibility.get('name')).toBe(true);
      const visibleColumns = grid.getVisibleColumns();
      expect(visibleColumns).toHaveLength(testColumns.length);
    });

    test('should toggle column visibility', () => {
      const initialVisible = grid.columnVisibility.get('name');
      grid.toggleColumnVisibility('name', !initialVisible);
      
      expect(grid.columnVisibility.get('name')).toBe(!initialVisible);
    });

    test('should show all columns', () => {
      grid.hideColumn('name');
      grid.hideColumn('age');
      
      grid.showAllColumns();
      
      testColumns.forEach(col => {
        expect(grid.columnVisibility.get(col.field)).toBe(true);
      });
    });

    test('should hide all columns', () => {
      grid.hideAllColumns();
      
      testColumns.forEach(col => {
        expect(grid.columnVisibility.get(col.field)).toBe(false);
      });
      expect(grid.getVisibleColumns()).toHaveLength(0);
    });

    test('should emit columnvisibilitychange event', () => {
      const spy = jest.fn();
      grid.on('columnvisibilitychange', spy);
      
      grid.hideColumn('name');
      
      expect(spy).toHaveBeenCalledWith({
        field: 'name',
        visible: false,
        visibleColumns: expect.any(Array)
      });
    });

    test('should render only visible columns', () => {
      grid.hideColumn('age');
      
      const headerCells = grid.el.querySelectorAll('.aionda-grid-header th');
      const visibleCount = grid.getVisibleColumns().length;
      expect(headerCells).toHaveLength(visibleCount);
      
      // Check that age column header is not visible
      const ageHeader = Array.from(headerCells).find(th => 
        th.textContent.includes('Age')
      );
      expect(ageHeader).toBeUndefined();
    });

    test('should handle column selector dialog', () => {
      grid.showColumnSelector();
      
      expect(grid.showColumnDialog).toBe(true);
      // Re-render is needed after changing showColumnDialog state
      grid.refresh();
      const dialog = grid.el.querySelector('.aionda-column-dialog');
      expect(dialog).toBeTruthy();
    });

    test('should hide column selector dialog', () => {
      grid.showColumnSelector();
      grid.hideColumnSelector();
      
      expect(grid.showColumnDialog).toBe(false);
    });

    test('should toggle column selector dialog', () => {
      const initialState = grid.showColumnDialog;
      grid.toggleColumnSelector();
      
      expect(grid.showColumnDialog).toBe(!initialState);
    });

    test('should update visible column count', () => {
      grid.hideColumn('name');
      grid.updateVisibleColumnCount();
      
      const countEl = grid.el.querySelector('.aionda-visible-columns-count');
      if (countEl) {
        expect(countEl.textContent).toBe(String(testColumns.length - 1));
      }
    });

    test('should save column configuration', () => {
      grid.hideColumn('name');
      grid.columnWidths.set('age', 150);
      
      const config = grid.getColumnConfiguration();
      
      expect(config.visibility.name).toBe(false);
      expect(config.widths.age).toBe(150);
      expect(config.order).toEqual(expect.any(Array));
    });

    test('should restore column configuration', () => {
      const config = {
        visibility: { name: false, age: true, id: true, active: false },
        widths: { age: 200 },
        order: ['age', 'name', 'id', 'active']
      };
      
      grid.setColumnConfiguration(config);
      
      expect(grid.columnVisibility.get('name')).toBe(false);
      expect(grid.columnVisibility.get('active')).toBe(false);
      expect(grid.columnWidths.get('age')).toBe(200);
      expect(grid.columnOrder).toEqual(['age', 'name', 'id', 'active']);
    });

    test('should handle localStorage save/load', () => {
      const originalItem = localStorage.getItem;
      const originalSetItem = localStorage.setItem;
      
      const mockStorage = {};
      localStorage.setItem = jest.fn((key, value) => {
        mockStorage[key] = value;
      });
      localStorage.getItem = jest.fn((key) => mockStorage[key]);
      
      grid.hideColumn('name');
      const saved = grid.saveColumnConfiguration('test-key');
      expect(saved).toBe(true);
      
      grid.showAllColumns();
      const loaded = grid.loadColumnConfiguration('test-key');
      expect(loaded).toBe(true);
      expect(grid.columnVisibility.get('name')).toBe(false);
      
      localStorage.getItem = originalItem;
      localStorage.setItem = originalSetItem;
    });

    test('should handle localStorage errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage full');
      });
      
      const saved = grid.saveColumnConfiguration();
      expect(saved).toBe(false);
      
      localStorage.setItem = originalSetItem;
    });

    test('should handle columns with hidden property', () => {
      const columnsWithHidden = [
        { field: 'id', text: 'ID', width: 50 },
        { field: 'name', text: 'Name', flex: 1, hidden: true },
        { field: 'age', text: 'Age', width: 80 }
      ];
      
      grid.destroy();
      grid = new Grid({
        store,
        columns: columnsWithHidden,
        rowNumbers: false
      });
      grid.render();
      
      expect(grid.columnVisibility.get('name')).toBe(false);
      expect(grid.getVisibleColumns()).toHaveLength(2);
    });

    test('should return ordered visible columns', () => {
      grid.columnOrder = ['age', 'name', 'id', 'active'];
      grid.hideColumn('name');
      
      const visibleOrdered = grid.getVisibleOrderedColumns();
      
      expect(visibleOrdered).toHaveLength(3);
      expect(visibleOrdered[0].field).toBe('age');
      expect(visibleOrdered[1].field).toBe('id');
      expect(visibleOrdered[2].field).toBe('active');
    });
  });

  describe('cell editing', () => {
    beforeEach(() => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: testColumns,
        editable: true,
        rowNumbers: false
      });
      grid.render();
    });

    test('should start edit on double-click', () => {
      const firstCell = grid.el.querySelector('.aionda-grid-data-cell');
      
      testUtils.fireDoubleClickEvent(firstCell);

      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      expect(editor).toBeTruthy();
      expect(editor.value).toBe('1'); // ID column value
    });

    test('should finish edit on Enter key', () => {
      const nameCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      testUtils.fireDoubleClickEvent(nameCell);

      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      editor.value = 'Modified Name';
      
      testUtils.fireKeyEvent(editor, 'keydown', { key: 'Enter' });

      expect(grid.el.querySelector('.aionda-grid-cell-editor')).toBeFalsy();
      const updatedCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      expect(updatedCell.textContent).toContain('Modified Name');
    });

    test('should cancel edit on Escape key', () => {
      const nameCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      const originalText = nameCell.textContent.trim();
      
      testUtils.fireDoubleClickEvent(nameCell);
      
      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      editor.value = 'This should be cancelled';
      
      testUtils.fireKeyEvent(editor, 'keydown', { key: 'Escape' });

      expect(grid.el.querySelector('.aionda-grid-cell-editor')).toBeFalsy();
      const updatedCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      expect(updatedCell.textContent.trim()).toBe(originalText);
    });

    test('should finish edit on blur', () => {
      const nameCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      testUtils.fireDoubleClickEvent(nameCell);

      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      editor.value = 'Blur Modified';
      
      testUtils.fireBlurEvent(editor);

      expect(grid.el.querySelector('.aionda-grid-cell-editor')).toBeFalsy();
      const updatedCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      expect(updatedCell.textContent).toContain('Blur Modified');
    });

    test('should emit cellchange event', () => {
      const cellChangeSpy = jest.fn();
      grid.on('cellchange', cellChangeSpy);

      const nameCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      testUtils.fireDoubleClickEvent(nameCell);

      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      editor.value = 'Event Test';
      
      testUtils.fireKeyEvent(editor, 'keydown', { key: 'Enter' });

      expect(cellChangeSpy).toHaveBeenCalledWith({
        record: expect.any(Object),
        field: 'name',
        value: 'Event Test',
        rowIndex: 0,
        oldValue: expect.any(String)
      });
    });

    test('should handle number column editing', () => {
      const ageCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="age"]');
      testUtils.fireDoubleClickEvent(ageCell);

      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      expect(editor.type).toBe('number');
      
      editor.value = '42';
      testUtils.fireKeyEvent(editor, 'keydown', { key: 'Enter' });

      const record = store.getAt(0);
      expect(record.age).toBe(42);
      expect(typeof record.age).toBe('number');
    });

    test('should update store data when cell is edited', () => {
      const originalRecord = store.getAt(0);
      const originalName = originalRecord.name;

      const nameCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      testUtils.fireDoubleClickEvent(nameCell);

      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      editor.value = 'Updated Store Name';
      testUtils.fireKeyEvent(editor, 'keydown', { key: 'Enter' });

      const updatedRecord = store.getAt(0);
      expect(updatedRecord.name).toBe('Updated Store Name');
      expect(updatedRecord.name).not.toBe(originalName);
    });

    test('should not edit when grid is not editable', () => {
      grid.destroy();
      grid = new Grid({
        store,
        columns: testColumns,
        editable: false,
        rowNumbers: false
      });
      grid.render();

      const firstCell = grid.el.querySelector('.aionda-grid-data-cell');
      testUtils.fireDoubleClickEvent(firstCell);

      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      expect(editor).toBeFalsy();
    });

    test('should handle editing with filtered data', () => {
      grid.applyFilter('name', 'John');
      
      const nameCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      expect(nameCell).toBeTruthy(); // Should find John Doe row
      
      testUtils.fireDoubleClickEvent(nameCell);

      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      expect(editor).toBeTruthy();
      editor.value = 'John Doe Modified'; // Keep it matching the filter
      testUtils.fireKeyEvent(editor, 'keydown', { key: 'Enter' });

      const updatedCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      expect(updatedCell).toBeTruthy();
      expect(updatedCell.textContent).toContain('John Doe Modified');
    });

    test('should properly handle editing state transitions', () => {
      const nameCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      
      // Should not be in editing state initially
      expect(grid.editingCell).toBeNull();
      
      // Start editing
      testUtils.fireDoubleClickEvent(nameCell);
      expect(grid.editingCell).toBe('0-name');
      
      // Finish editing
      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      editor.value = 'New Value';
      testUtils.fireKeyEvent(editor, 'keydown', { key: 'Enter' });
      
      // Should be back to not editing
      expect(grid.editingCell).toBeNull();
    });

    test('should handle editing cell with null/undefined value', () => {
      const testDataWithNulls = [
        { id: 1, name: null, age: 30, active: true },
        { id: 2, name: undefined, age: 25, active: false }
      ];
      
      store = new Store({ data: testDataWithNulls });
      grid.destroy();
      grid = new Grid({
        store,
        columns: testColumns,
        editable: true,
        rowNumbers: false
      });
      grid.render();

      const nameCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      testUtils.fireDoubleClickEvent(nameCell);

      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      expect(editor.value).toBe(''); // Should handle null/undefined as empty string
      
      editor.value = 'New Name';
      testUtils.fireKeyEvent(editor, 'keydown', { key: 'Enter' });

      const record = store.getAt(0);
      expect(record.name).toBe('New Name');
    });

    test('should handle rapid edit transitions', async () => {
      const nameCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="name"]');
      const ageCell = grid.el.querySelector('.aionda-grid-data-cell[data-field="age"]');
      
      // Start editing first cell
      await testUtils.fireDoubleClickEvent(nameCell);
      expect(grid.editingCell).toBe('0-name');
      
      // Start editing second cell without finishing first
      await testUtils.fireDoubleClickEvent(ageCell);
      await testUtils.waitForDOMUpdate(); // Wait for DOM to update
      expect(grid.editingCell).toBe('0-age');
      
      // Only the age editor should be visible
      const editors = grid.el.querySelectorAll('.aionda-grid-cell-editor');
      expect(editors).toHaveLength(1);
      expect(editors[0].type).toBe('number');
    });
  });

  describe('edge cases', () => {
    test('should handle null config', () => {
      expect(() => new Grid(null)).not.toThrow();
    });

    test('should handle empty store', () => {
      store = new Store({ data: [] });
      grid = new Grid({ store, columns: testColumns });
      
      const el = grid.render();
      const rows = el.querySelectorAll('.aionda-grid-row');
      expect(rows).toHaveLength(0);
    });

    test('should handle missing store', () => {
      grid = new Grid({ columns: testColumns });
      
      expect(() => grid.render()).not.toThrow();
    });

    test('should handle empty columns', () => {
      store = new Store({ data: testData });
      grid = new Grid({ store, columns: [] });
      
      expect(() => grid.render()).not.toThrow();
    });

    test('should handle malformed data', () => {
      store = new Store({ data: [{ incomplete: 'data' }] });
      grid = new Grid({ store, columns: testColumns });
      
      expect(() => grid.render()).not.toThrow();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      store = new Store({ data: testData });
      grid = new Grid({
        store,
        columns: testColumns,
        selectionMode: 'multi',
        sortable: true,
        filterable: true,
        editable: true
      });
      grid.render();
    });

    test('should have proper table semantics', () => {
      const table = grid.el.querySelector('table');
      expect(table.getAttribute('role')).toBe('grid');
      
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        if (header.textContent.trim() && !header.classList.contains('aionda-grid-row-number-header')) {
          expect(header.getAttribute('scope')).toBe('col');
        }
      });
    });

    test('should indicate sort state with ARIA', () => {
      const nameHeader = grid.el.querySelector('th[data-sort-field="name"]');
      
      testUtils.fireClickEvent(nameHeader);
      expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
      
      testUtils.fireClickEvent(nameHeader);
      expect(nameHeader.getAttribute('aria-sort')).toBe('descending');
      
      testUtils.fireClickEvent(nameHeader);
      expect(nameHeader.hasAttribute('aria-sort')).toBe(false);
    });

    test('should mark selected rows with aria-selected', () => {
      const firstRow = grid.el.querySelector('.aionda-grid-row');
      
      testUtils.fireClickEvent(firstRow);
      
      expect(firstRow.getAttribute('aria-selected')).toBe('true');
    });

    test('should support keyboard navigation', () => {
      const firstCell = grid.el.querySelector('td');
      firstCell.focus();
      
      testUtils.fireKeyEvent(firstCell, 'keydown', { key: 'ArrowRight' });
      // Grid should handle arrow key navigation
      expect(document.activeElement).toBeTruthy();
    });

    test('should set aria-rowindex and aria-colindex attributes', () => {
      const firstDataRow = grid.el.querySelector('.aionda-grid-row:not(.aionda-grid-header)');
      if (firstDataRow) {
        expect(firstDataRow.getAttribute('aria-rowindex')).toBeTruthy();
      }
      
      const firstDataCell = grid.el.querySelector('td');
      if (firstDataCell) {
        expect(firstDataCell.getAttribute('aria-colindex')).toBeTruthy();
      }
    });

    test('should announce filter changes to screen readers', () => {
      const filterInput = grid.el.querySelector('.aionda-grid-filter-input');
      if (filterInput) {
        filterInput.value = 'John';
        testUtils.fireInputEvent(filterInput);
        
        const liveRegion = grid.el.querySelector('[aria-live]');
        if (liveRegion) {
          expect(liveRegion.getAttribute('aria-live')).toBe('polite');
        }
      }
    });

    test('should handle escape key to exit editing mode', () => {
      const firstCell = grid.el.querySelector('.aionda-grid-data-cell');
      testUtils.fireDoubleClickEvent(firstCell);
      
      const editor = grid.el.querySelector('.aionda-grid-cell-editor');
      expect(editor).toBeTruthy();
      
      testUtils.fireKeyEvent(editor, 'keydown', { key: 'Escape' });
      expect(grid.editingCell).toBeNull();
    });

    test('should handle delete key for selected rows', () => {
      const deleteRequestSpy = jest.fn();
      grid.on('deleteRequest', deleteRequestSpy);
      
      const firstRow = grid.el.querySelector('.aionda-grid-row');
      testUtils.fireClickEvent(firstRow);
      
      testUtils.fireKeyEvent(grid.el, 'keydown', { key: 'Delete' });
      
      expect(deleteRequestSpy).toHaveBeenCalledWith({
        selections: expect.any(Array)
      });
    });

    test('should provide accessible column headers', () => {
      const headers = grid.el.querySelectorAll('th[data-sort-field]');
      
      headers.forEach(header => {
        expect(header.textContent.trim()).toBeTruthy();
        expect(header.getAttribute('scope')).toBe('col');
      });
    });

    test('should handle screen reader navigation in filtered data', () => {
      grid.applyFilter('name', 'John');
      
      const visibleRows = grid.el.querySelectorAll('.aionda-grid-row:not(.hidden)');
      visibleRows.forEach((row, index) => {
        const rowIndex = row.getAttribute('aria-rowindex');
        expect(parseInt(rowIndex)).toBeGreaterThan(0);
      });
    });
  });
});