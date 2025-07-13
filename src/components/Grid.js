import { Component } from '../core/Component.js';
import { Menu } from './Menu.js';
import { BrowserDetect, EventCompat, DOMCompat } from '../utils/BrowserCompat.js';

/**
 * Excel-like Grid Component - Pure ES6
 * Features: sorting, filtering, cell editing, selection, resizing
 * 
 * @class Grid
 * @extends Component
 * @description A comprehensive data grid component with Excel-like features including sorting, filtering, editing, and column management
 * @example
 * const grid = new Grid({
 *   store: myDataStore,
 *   columns: [
 *     {text: 'Name', dataIndex: 'name', sortable: true, filterable: true},
 *     {text: 'Age', dataIndex: 'age', sortable: true, editor: 'numberfield'},
 *     {text: 'Email', dataIndex: 'email', filterable: true}
 *   ],
 *   selectionMode: 'multi',
 *   editable: true,
 *   resizable: true
 * });
 */
export class Grid extends Component {
  constructor(config = {}) {
    super(config);
    config = config || {};
    
    // Grid-specific version tracking
    this.version = '1.1.0'; // Updated with performance optimizations
    this.apiVersion = '1.0';
    
    this.store = config.store;
    this.columns = config.columns || [];
    
    // Normalize columns: map dataIndex to field for backwards compatibility
    this.columns.forEach(col => {
      if (col.dataIndex && !col.field) {
        col.field = col.dataIndex;
      }
      if (!col.dataIndex && col.field) {
        col.dataIndex = col.field;
      }
    });
    
    this.selectionMode = config.selectionMode || 'single'; // single, multi, cell
    this.editable = config.editable === true;
    this.sortable = config.sortable === true;
    this.filterable = config.filterable === true;
    this.resizable = config.resizable === true;
    this.striped = config.striped !== false;
    this.hover = config.hover !== false;
    this.rowNumbers = config.rowNumbers !== false;
    this.pageSize = config.pageSize || 50;
    this.virtualScrolling = config.virtualScrolling !== false;
    this.itemHeight = config.itemHeight || 32;
    this.visibleRows = config.visibleRows || 20;
    this.bufferSize = config.bufferSize || 5;
    
    // Performance optimizations
    this.filterDebounceMs = config.filterDebounceMs || 300;
    this.filterDebounceTimer = null;
    this.cachedFilteredRecords = null;
    this.cacheInvalidated = true;
    
    // Virtual scrolling state
    this.scrollTop = 0;
    this.startIndex = 0;
    this.endIndex = 0;
    this.totalHeight = 0;
    
    // Internal state
    this.selectedRows = new Set();
    this.selectedCells = new Set();
    this.editingCell = null;
    this.sortState = new Map(); // column -> {direction: 'ASC'|'DESC'}
    this.filters = new Map(); // column -> filterValue
    this.columnWidths = new Map(); // column -> width
    this.columnOrder = this.columns.map(col => col.field); // Track column order
    this.columnVisibility = new Map(); // column -> boolean (visible/hidden)
    this.dragging = null; // For column dragging
    this.showColumnDialog = false; // Column selector dialog state
    this.contextMenu = null; // Context menu instance
    this.contextTargetColumn = null; // Column for context menu
    
    // DOM elements
    this.headerEl = null;
    this.bodyEl = null;
    this.footerEl = null;
    
    // Initialize column widths and visibility
    this.columns.forEach(col => {
      if (col.width) {
        this.columnWidths.set(col.field, col.width);
      } else if (col.flex) {
        this.columnWidths.set(col.field, 'flex');
      } else {
        this.columnWidths.set(col.field, 120);
      }
      
      // Initialize visibility (default to visible unless explicitly hidden)
      this.columnVisibility.set(col.field, col.hidden !== true);
    });

    // Bind event handlers for proper cleanup
    this.boundInvalidateCache = () => this.invalidateCache();
    this.boundHandleStoreRemove = () => this.handleStoreRemove();
    this.boundHandleStoreClear = () => this.handleStoreClear();

    // Listen to store events
    if (this.store) {
      this.store.on('load', this.boundInvalidateCache);
      this.store.on('add', this.boundInvalidateCache);
      this.store.on('remove', this.boundHandleStoreRemove);
      this.store.on('update', this.boundInvalidateCache);
      this.store.on('recordupdate', this.boundInvalidateCache);
      this.store.on('clear', this.boundHandleStoreClear);
      this.store.on('sort', this.boundInvalidateCache);
      this.store.on('filter', this.boundInvalidateCache);
    }
  }

  createTemplate() {
    return `
      <div class="${this.getGridClasses().join(' ')}">
        <div class="aionda-grid-toolbar flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
          <div class="flex items-center space-x-2">
            <button class="aionda-column-selector-btn px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100" title="Show/Hide Columns">
              <span class="mr-1">☰</span>${this.t('grid.columns')}
            </button>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            <span class="aionda-visible-columns-count">${this.getVisibleColumns().length}</span> ${this.t('grid.of')} ${this.columns.length} ${this.t('grid.columnsVisible')}
          </div>
        </div>
        <table class="w-full" role="grid" aria-label="Data grid">
          <thead class="aionda-grid-header">
            ${this.createHeaderTemplate()}
          </thead>
          <tbody class="aionda-grid-body">
            ${this.createBodyTemplate()}
          </tbody>
        </table>
        <div id="${this.id}-status" class="sr-only" aria-live="polite" aria-atomic="true">
          <!-- Grid status announcements for screen readers -->
        </div>
        <div class="aionda-grid-footer">
          ${this.createFooterTemplate()}
        </div>
        ${this.createColumnSelectorDialog()}
      </div>
    `;
  }

  createHeaderTemplate() {
    let html = '<tr class="aionda-grid-header-row border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 font-semibold">';
    
    // Row numbers column
    if (this.rowNumbers) {
      html += '<th class="aionda-grid-cell aionda-grid-row-number-header w-12 px-2 py-2 text-center text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600">#</th>';
    }
    
    // Data columns in correct order (only visible columns)
    this.getVisibleOrderedColumns().forEach((col, index) => {
      const rawWidth = this.columnWidths.get(col.field);
      const width = this.getColumnWidth(col.field);
      const sortDirection = this.sortState.get(col.field);
      const sortIcon = sortDirection ? (sortDirection.direction === 'ASC' ? '↑' : '↓') : '';
      const sortClass = sortDirection ? (sortDirection.direction === 'ASC' ? 'sort-asc' : 'sort-desc') : '';
      const sortableClass = (this.sortable && col.sortable !== false) ? 'sortable cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : '';
      
      const styleStr = rawWidth !== 'flex' ? `width: ${width}px; min-width: ${width}px;` : `flex-grow: ${col.flex || 1};`;
      
      // Fix ARIA sort state - only add aria-sort if column is sortable, and don't set to "none" when sorted
      let ariaSortAttr = '';
      if (this.sortable && col.sortable !== false) {
        if (sortDirection) {
          ariaSortAttr = `aria-sort="${sortDirection.direction === 'ASC' ? 'ascending' : 'descending'}"`;
        }
        // Don't add aria-sort="none" - just omit the attribute when not sorted
      }
      
      html += `
        <th class="aionda-grid-cell aionda-grid-header-cell relative border-r border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 ${sortableClass} ${sortClass} text-gray-900 dark:text-gray-100" 
            data-field="${col.field}" 
            data-column-index="${index}"
            data-sort-field="${col.field}"
            draggable="true"
            scope="col"
            ${ariaSortAttr}
            style="${styleStr}">
          <div class="flex items-center justify-between px-3 py-2">
            <span class="aionda-grid-header-text">
              <span class="aionda-grid-drag-handle cursor-grab mr-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">⋮⋮</span>
              ${col.text || col.field} ${sortIcon}
            </span>
            ${this.resizable ? `<div class="aionda-grid-resizer absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 dark:hover:bg-blue-400" 
                                     data-resize-field="${col.field}"></div>` : ''}
          </div>
          ${this.filterable ? this.createFilterTemplate(col) : ''}
        </th>
      `;
    });
    
    html += '</tr>';
    return html;
  }

  createFilterTemplate(col) {
    const filterValue = this.filters.get(col.field) || '';
    const hasFilter = filterValue.trim().length > 0;
    const placeholder = this.getFilterPlaceholder(col);
    
    return `
      <div class="aionda-grid-filter px-2 pb-2">
        <div class="relative">
          <input type="text" 
                 class="aionda-grid-filter-input w-full px-2 py-1 pr-6 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${hasFilter ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}"
                 placeholder="${placeholder}"
                 value="${filterValue}"
                 data-filter-field="${col.field}"
                 data-filter-type="${col.type || 'text'}">
          ${hasFilter ? `
            <button class="aionda-filter-clear absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center rounded text-xs"
                    data-clear-filter="${col.field}"
                    title="Clear filter">×</button>
          ` : `
            <div class="aionda-filter-icon absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600 flex items-center justify-center text-xs">🔍</div>
          `}
        </div>
        ${hasFilter ? `<div class="aionda-filter-matches text-xs text-blue-600 dark:text-blue-400 mt-1 px-1">${this.getFilterMatches(col.field)} matches</div>` : ''}
      </div>
    `;
  }

  createBodyTemplate() {
    if (!this.store || this.store.getCount() === 0) {
      return '<tr><td colspan="100%" class="aionda-grid-empty p-8 text-center text-gray-500 dark:text-gray-400">No data to display</td></tr>';
    }

    let html = '';
    
    const records = this.getFilteredAndSortedRecords();
    records.forEach((record, rowIndex) => {
      const isSelected = this.selectedRows.has(rowIndex);
      const rowClass = [
        'aionda-grid-row border-b border-gray-200 dark:border-gray-700 cursor-pointer',
        isSelected ? 'selected bg-blue-100 dark:bg-blue-900' : '',
        this.hover ? 'hover:bg-blue-50 dark:hover:bg-blue-900/50' : '',
        this.striped && rowIndex % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800' : ''
      ].filter(Boolean).join(' ');

      html += `<tr class="${rowClass}" data-row-index="${rowIndex}" aria-rowindex="${rowIndex + 1}" ${isSelected ? 'aria-selected="true"' : ''}>`;
      
      // Row number
      if (this.rowNumbers) {
        html += `<td class="aionda-grid-cell aionda-grid-rownumber w-12 px-2 py-2 text-center text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" aria-colindex="1">${rowIndex + 1}</td>`;
      }
      
      // Data cells in correct order (only visible columns)
      this.getVisibleOrderedColumns().forEach(col => {
        const rawWidth = this.columnWidths.get(col.field);
        const width = this.getColumnWidth(col.field);
        const value = this.getCellValue(record, col);
        const cellKey = `${rowIndex}-${col.field}`;
        const isEditing = this.editingCell === cellKey;
        
        html += `
          <td class="aionda-grid-cell aionda-grid-data-cell border-r border-gray-200 dark:border-gray-700 relative text-gray-900 dark:text-gray-100" 
              data-row="${rowIndex}" 
              data-field="${col.field}"
              aria-colindex="${this.showRowNumbers ? this.getVisibleOrderedColumns().indexOf(col) + 2 : this.getVisibleOrderedColumns().indexOf(col) + 1}"
              style="${rawWidth !== 'flex' ? `width: ${width}px; min-width: ${width}px;` : `flex-grow: ${col.flex || 1};`}">
            <div class="px-3 py-2">
              ${isEditing ? this.createCellEditor(value, col) : this.formatCellValue(value, col)}
            </div>
          </td>
        `;
      });
      
      html += '</tr>';
    });
    
    return html;
  }

  createCellEditor(value, col) {
    const inputType = col.type === 'number' ? 'number' : 'text';
    return `
      <input type="${inputType}" 
             class="aionda-grid-cell-editor"
             value="${value || ''}"
             data-edit-row="${this.editingCell ? this.editingCell.split('-')[0] : ''}"
             data-edit-field="${this.editingCell ? this.editingCell.split('-')[1] : ''}"
             autofocus>
    `;
  }

  formatCellValue(value, col) {
    if (value == null) return '';
    
    if (col.renderer && typeof col.renderer === 'function') {
      return col.renderer(value);
    }
    
    let formattedValue = '';
    
    if (col.type === 'number' && typeof value === 'number') {
      formattedValue = value.toLocaleString();
    } else if (col.type === 'date' && value instanceof Date) {
      formattedValue = value.toLocaleDateString();
    } else if (col.type === 'boolean') {
      formattedValue = (value === true || value === 'true') ? '✓' : '✗';
    } else {
      formattedValue = String(value);
    }
    
    // Apply filter highlighting
    const filterValue = this.filters.get(col.field);
    if (filterValue && filterValue.trim()) {
      formattedValue = this.highlightFilterMatch(formattedValue, filterValue);
    }
    
    return formattedValue;
  }

  createFooterTemplate() {
    if (!this.store) return '';
    
    const totalRecords = this.store.getCount();
    const filteredCount = this.getFilteredAndSortedRecords().length;
    
    return `
      <div class="aionda-grid-footer-row flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300">
        <div class="aionda-grid-info">
          ${filteredCount !== totalRecords ? `${filteredCount} of ` : ''}${totalRecords} records
        </div>
        <div class="aionda-grid-selection">
          ${this.selectedRows.size > 0 ? `${this.selectedRows.size} selected` : ''}
        </div>
      </div>
    `;
  }

  getGridClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-grid',
      'border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900',
      'text-sm select-none'
    ];
    
    if (this.striped) {
      classes.push('aionda-grid-striped');
    }
    
    if (this.hover) {
      classes.push('aionda-grid-hover');
    }
    
    return classes;
  }

  setupEventListeners() {
    super.setupEventListeners();
    
    this.el.gridComponent = this; // Make component accessible from DOM events
    this.headerEl = this.el.querySelector('.aionda-grid-header');
    this.bodyEl = this.el.querySelector('.aionda-grid-body');
    this.footerEl = this.el.querySelector('.aionda-grid-footer');
    
    // Apply browser-specific fixes for events
    if (BrowserDetect.isIE() || BrowserDetect.isOldEdge()) {
      this.setupIEEventFixes();
    }
    
    // Unified click event handler with proper priority and delegation
    this.el.addEventListener('click', (e) => {
      // Check for various clickable elements in priority order
      const resizer = e.target.closest('.aionda-grid-resizer');
      const dragHandle = e.target.closest('.aionda-grid-drag-handle');
      const filterClear = e.target.closest('.aionda-filter-clear');
      const columnSelector = e.target.closest('.aionda-column-selector-btn');
      const dialogBtn = e.target.closest('.aionda-close-dialog, .aionda-show-all-columns, .aionda-hide-all-columns, .aionda-save-column-config');
      const headerCell = e.target.closest('.aionda-grid-header-cell');
      const row = e.target.closest('.aionda-grid-row');
      
      // Handle resizers (highest priority)
      if (resizer) {
        e.preventDefault();
        e.stopPropagation();
        return; // Resizing is handled in mousedown
      }
      
      // Handle drag handles
      if (dragHandle) {
        e.preventDefault();
        e.stopPropagation();
        return; // Dragging is handled in dragstart
      }
      
      // Handle filter clear buttons
      if (filterClear && filterClear.dataset.clearFilter) {
        e.preventDefault();
        e.stopPropagation();
        this.clearFilter(filterClear.dataset.clearFilter);
        return;
      }
      
      // Handle column selector button
      if (columnSelector) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleColumnSelector();
        return;
      }
      
      // Handle dialog buttons
      if (dialogBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.handleDialogButton(dialogBtn);
        return;
      }
      
      // Handle header cell sorting (but not if we're interacting with child elements)
      if (headerCell && headerCell.dataset.sortField && this.sortable) {
        // Only sort if we didn't click on a resizer, drag handle, or filter input
        const filterInput = e.target.closest('.aionda-grid-filter-input');
        if (!filterInput) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleSort(headerCell.dataset.sortField);
          return;
        }
      }
      
      // Handle row selection (lowest priority)
      if (row && row.dataset.rowIndex !== undefined) {
        // Only select if we didn't click on a cell editor or other interactive element
        const cellEditor = e.target.closest('.aionda-grid-cell-editor');
        if (!cellEditor) {
          e.preventDefault();
          e.stopPropagation();
          const rowIndex = parseInt(row.dataset.rowIndex);
          this.selectRow(rowIndex, e);
          return;
        }
      }
    });
    
    // Cell double-click events (editing)
    if (this.editable) {
      this.el.addEventListener('dblclick', (e) => {
        const cell = e.target.closest('.aionda-grid-data-cell');
        if (cell && cell.dataset.row !== undefined && cell.dataset.field) {
          e.preventDefault();
          e.stopPropagation();
          const rowIndex = parseInt(cell.dataset.row);
          const field = cell.dataset.field;
          this.startEdit(rowIndex, field);
        }
      });
    }
    
    // Filter input events
    if (this.filterable) {
      this.el.addEventListener('input', (e) => {
        const filterInput = e.target.closest('.aionda-grid-filter-input');
        if (filterInput && filterInput.dataset.filterField) {
          this.applyFilter(filterInput.dataset.filterField, filterInput.value);
        }
      });
    }
    
    // Cell editor events
    this.el.addEventListener('blur', (e) => {
      const editor = e.target.closest('.aionda-grid-cell-editor');
      if (editor) {
        this.finishEdit(editor);
      }
    }, true);
    
    this.el.addEventListener('keydown', (e) => {
      const editor = e.target.closest('.aionda-grid-cell-editor');
      if (editor) {
        this.handleEditKeydown(e, editor);
      }
    });
    
    // Resizer events
    if (this.resizable) {
      this.el.addEventListener('mousedown', (e) => {
        const resizer = e.target.closest('.aionda-grid-resizer');
        if (resizer && resizer.dataset.resizeField) {
          this.startResize(e, resizer.dataset.resizeField);
        }
      });
    }
    
    // Global mouse events for resizing
    document.addEventListener('mousemove', (e) => this.handleResize(e));
    document.addEventListener('mouseup', (e) => this.stopResize(e));
    
    // Column drag & drop events
    this.el.addEventListener('dragstart', (e) => {
      const headerCell = e.target.closest('.aionda-grid-header-cell');
      if (headerCell && headerCell.dataset.field) {
        this.startColumnDrag(e, headerCell.dataset.field);
      }
    });
    
    this.el.addEventListener('dragover', (e) => {
      e.preventDefault();
      const headerCell = e.target.closest('.aionda-grid-header-cell');
      if (headerCell && this.dragging) {
        this.handleColumnDragOver(e, headerCell);
      }
    });
    
    this.el.addEventListener('drop', (e) => {
      e.preventDefault();
      const headerCell = e.target.closest('.aionda-grid-header-cell');
      if (headerCell && this.dragging) {
        this.handleColumnDrop(e, headerCell.dataset.field);
      }
    });
    
    this.el.addEventListener('dragend', (e) => {
      this.endColumnDrag();
    });
    
    // Context menu events
    this.setupContextMenu();
    
    // Column dialog checkbox events
    this.el.addEventListener('change', (e) => {
      const checkbox = e.target.closest('.aionda-column-checkbox');
      if (checkbox && checkbox.dataset.columnField) {
        this.toggleColumnVisibility(checkbox.dataset.columnField, checkbox.checked);
      }
    });
    
    // Close column dialog on outside click (with proper isolation)
    this.boundDocumentClick = (e) => {
      if (this.showColumnDialog && !this.el.contains(e.target)) {
        // Check if click is on a menu component to avoid conflicts
        const isMenuClick = e.target.closest('.aionda-menu, .aionda-menu-item');
        if (!isMenuClick) {
          this.hideColumnSelector();
        }
      }
    };
    document.addEventListener('click', this.boundDocumentClick);
    
    // Close column dialog with escape key (with proper isolation)
    this.boundDocumentKeydown = (e) => {
      if (e.key === 'Escape' && this.showColumnDialog) {
        // Only close if no menu is currently visible
        const visibleMenus = document.querySelectorAll('.aionda-menu:not(.hidden)');
        if (visibleMenus.length === 0) {
          this.hideColumnSelector();
        }
      }
    };
    document.addEventListener('keydown', this.boundDocumentKeydown);

    // Keyboard navigation for selections
    this.setupKeyboardNavigation();
  }

  setupIEEventFixes() {
    // Fix event delegation issues in IE
    if (this.el) {
      // Add mouseover/mouseout for hover effects since IE has issues with CSS :hover
      this.el.addEventListener('mouseover', (e) => {
        const row = e.target.closest('.aionda-grid-row');
        if (row && this.hover) {
          row.classList.add('hover:bg-blue-50', 'dark:hover:bg-blue-900/50');
        }
      });
      
      this.el.addEventListener('mouseout', (e) => {
        const row = e.target.closest('.aionda-grid-row');
        if (row && this.hover) {
          row.classList.remove('hover:bg-blue-50', 'dark:hover:bg-blue-900/50');
        }
      });
      
      // Fix drag and drop for IE
      if (BrowserDetect.isIE()) {
        this.el.addEventListener('selectstart', (e) => {
          // Prevent text selection during drag operations
          if (e.target.closest('.aionda-grid-header-cell[draggable="true"]')) {
            e.preventDefault();
          }
        });
      }
    }
  }

  handleDialogButton(btn) {
    if (btn.classList.contains('aionda-close-dialog')) {
      this.hideColumnSelector();
    } else if (btn.classList.contains('aionda-show-all-columns')) {
      this.showAllColumns();
      this.updateDialogCheckboxes();
    } else if (btn.classList.contains('aionda-hide-all-columns')) {
      this.hideAllColumns();
      this.updateDialogCheckboxes();
    } else if (btn.classList.contains('aionda-save-column-config')) {
      this.saveColumnConfiguration();
      this.hideColumnSelector();
    }
  }

  setupKeyboardNavigation() {
    // Grid-specific keyboard navigation for accessibility
    this.el.addEventListener('keydown', (e) => {
      // Only handle if grid has focus and no active inputs
      const activeElement = document.activeElement;
      const isFilterInput = activeElement && activeElement.closest('.aionda-grid-filter-input');
      const isCellEditor = activeElement && activeElement.closest('.aionda-grid-cell-editor');
      
      if (isFilterInput || isCellEditor) {
        return; // Let inputs handle their own keyboard events
      }
      
      const gridFocused = this.el.contains(activeElement) || activeElement === this.el;
      if (!gridFocused) return;
      
      switch (e.key) {
        case 'Escape':
          if (this.editingCell) {
            this.editingCell = null;
            this.refresh();
            e.preventDefault();
          }
          break;
        case 'Delete':
          if (this.selectedRows.size > 0) {
            this.emit('deleteRequest', { selections: this.getSelections() });
            e.preventDefault();
          }
          break;
      }
    });
    
    // Also listen for delete key on the grid element itself for better event handling
    this.el.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' && this.selectedRows.size > 0) {
        // Check if we're not in an input or editor
        const activeElement = document.activeElement;
        const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
        const isEditor = activeElement && activeElement.closest('.aionda-grid-cell-editor');
        
        if (!isInput && !isEditor) {
          this.emit('deleteRequest', { selections: this.getSelections() });
          e.preventDefault();
        }
      }
    }, true); // Use capture to ensure we get the event
  }

  // Column width management
  getColumnWidth(field) {
    const width = this.columnWidths.get(field);
    return width === 'flex' ? 150 : width; // Default flex width
  }

  startResize(event, field) {
    event.stopPropagation();
    this.resizing = {
      field,
      startX: event.clientX,
      startWidth: this.getColumnWidth(field)
    };
    document.body.style.cursor = 'col-resize';
  }

  handleResize(event) {
    if (!this.resizing) return;
    
    const deltaX = event.clientX - this.resizing.startX;
    const newWidth = Math.max(50, this.resizing.startWidth + deltaX);
    
    this.columnWidths.set(this.resizing.field, newWidth);
    this.updateColumnWidths();
  }

  stopResize() {
    if (this.resizing) {
      this.resizing = null;
      document.body.style.cursor = '';
    }
  }

  updateColumnWidths() {
    if (!this.rendered) return;
    
    this.columns.forEach(col => {
      const width = this.getColumnWidth(col.field);
      const headerCell = this.el.querySelector(`[data-field="${col.field}"]`);
      const bodyCells = this.el.querySelectorAll(`[data-field="${col.field}"]`);
      
      if (headerCell) {
        headerCell.style.width = `${width}px`;
        headerCell.style.minWidth = `${width}px`;
      }
      
      bodyCells.forEach(cell => {
        cell.style.width = `${width}px`;
        cell.style.minWidth = `${width}px`;
      });
    });
  }

  // Sorting
  toggleSort(field) {
    const current = this.sortState.get(field);
    let newDirection;
    
    if (!current) {
      newDirection = 'ASC';
    } else if (current.direction === 'ASC') {
      newDirection = 'DESC';
    } else {
      this.sortState.delete(field);
      this.updateSortIndicators();
      this.refreshBody(); // Only refresh body, keep header
      return;
    }
    
    this.sortState.clear(); // Single column sort for now
    this.sortState.set(field, { direction: newDirection });
    this.updateSortIndicators();
    this.refreshBody(); // Only refresh body, keep header
  }

  updateSortIndicators() {
    if (!this.rendered) return;

    // Update all header cells
    this.columns.forEach(col => {
      const headerCell = this.el.querySelector(`th[data-sort-field="${col.field}"]`);
      if (headerCell && this.sortable && col.sortable !== false) {
        const sortDirection = this.sortState.get(col.field);
        
        // Remove old sort classes
        headerCell.classList.remove('sort-asc', 'sort-desc');
        
        if (sortDirection) {
          // Add new sort class and aria-sort
          const sortClass = sortDirection.direction === 'ASC' ? 'sort-asc' : 'sort-desc';
          headerCell.classList.add(sortClass);
          headerCell.setAttribute('aria-sort', sortDirection.direction === 'ASC' ? 'ascending' : 'descending');
          
          // Update sort icon in the header text
          const headerText = headerCell.querySelector('.aionda-grid-header-text');
          if (headerText) {
            const sortIcon = sortDirection.direction === 'ASC' ? '↑' : '↓';
            const text = (col.text || col.field) + ' ' + sortIcon;
            // Update only the text content, preserve the drag handle
            const dragHandle = headerText.querySelector('.aionda-grid-drag-handle');
            headerText.innerHTML = '';
            if (dragHandle) {
              headerText.appendChild(dragHandle);
            } else {
              headerText.innerHTML += '<span class="aionda-grid-drag-handle cursor-grab mr-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">⋮⋮</span>';
            }
            headerText.innerHTML += (col.text || col.field) + ' ' + sortIcon;
          }
        } else {
          // Remove aria-sort when not sorted
          headerCell.removeAttribute('aria-sort');
          
          // Remove sort icon
          const headerText = headerCell.querySelector('.aionda-grid-header-text');
          if (headerText) {
            const dragHandle = headerText.querySelector('.aionda-grid-drag-handle');
            headerText.innerHTML = '';
            if (dragHandle) {
              headerText.appendChild(dragHandle);
            } else {
              headerText.innerHTML += '<span class="aionda-grid-drag-handle cursor-grab mr-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">⋮⋮</span>';
            }
            headerText.innerHTML += (col.text || col.field);
          }
        }
      }
    });
  }

  // Filtering
  applyFilter(field, value) {
    if (value.trim()) {
      this.filters.set(field, value.trim());
    } else {
      this.filters.delete(field);
    }
    this.refreshBody();
  }

  clearFilter(field) {
    this.filters.delete(field);
    this.refresh();
  }

  getFilterPlaceholder(col) {
    switch (col.type) {
      case 'number':
        return 'e.g. >1000, <5000';
      case 'date':
        return 'e.g. 2024, Jan';
      case 'boolean':
        return 'true/false';
      default:
        return `Search ${col.text || col.field}...`;
    }
  }

  getFilterMatches(field) {
    const records = this.store ? this.store.getRecords() : [];
    const filterValue = this.filters.get(field);
    if (!filterValue) return 0;

    return records.filter(record => {
      const cellValue = this.getCellValue(record, { field });
      return this.matchesFilter(cellValue, filterValue);
    }).length;
  }

  matchesFilter(cellValue, filterValue) {
    const cellStr = String(cellValue).toLowerCase();
    const filterStr = filterValue.toLowerCase();

    // Support for operators
    if (filterStr.startsWith('>')) {
      const num = parseFloat(filterStr.substring(1));
      return !isNaN(num) && parseFloat(cellValue) > num;
    }
    if (filterStr.startsWith('<')) {
      const num = parseFloat(filterStr.substring(1));
      return !isNaN(num) && parseFloat(cellValue) < num;
    }
    if (filterStr.startsWith('=')) {
      return cellStr === filterStr.substring(1);
    }

    // Default: contains search
    return cellStr.includes(filterStr);
  }

  highlightFilterMatch(text, filterValue) {
    if (!filterValue || !text) return text;

    // Skip highlighting for operators
    if (filterValue.startsWith('>') || filterValue.startsWith('<') || filterValue.startsWith('=')) {
      return text;
    }

    const regex = new RegExp(`(${this.escapeRegex(filterValue)})`, 'gi');
    return text.replace(regex, '<mark class="aionda-filter-highlight">$1</mark>');
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getFilteredAndSortedRecords() {
    if (!this.store) return [];
    
    let records = this.store.getRecords();
    
    // Apply filters
    if (this.filters.size > 0) {
      records = records.filter(record => {
        return Array.from(this.filters.entries()).every(([field, filterValue]) => {
          const cellValue = this.getCellValue(record, { field });
          return this.matchesFilter(cellValue, filterValue);
        });
      });
    }
    
    // Apply sorting
    if (this.sortState.size > 0) {
      const [field, sortInfo] = Array.from(this.sortState.entries())[0];
      records.sort((a, b) => {
        const aVal = this.getCellValue(a, { field });
        const bVal = this.getCellValue(b, { field });
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;
        
        return sortInfo.direction === 'DESC' ? -comparison : comparison;
      });
    }
    
    return records;
  }

  getCellValue(record, col) {
    if (col.dataIndex) {
      return record[col.dataIndex];
    }
    return record[col.field];
  }

  // Row selection
  selectRow(rowIndex, event) {
    if (this.selectionMode === 'none') return;
    
    if (this.selectionMode === 'single') {
      this.selectedRows.clear();
      this.selectedRows.add(rowIndex);
    } else if (this.selectionMode === 'multi') {
      if (event.ctrlKey || event.metaKey) {
        if (this.selectedRows.has(rowIndex)) {
          this.selectedRows.delete(rowIndex);
        } else {
          this.selectedRows.add(rowIndex);
        }
      } else if (event.shiftKey && this.selectedRows.size > 0) {
        // Range selection
        const lastSelected = Math.max(...this.selectedRows);
        const start = Math.min(rowIndex, lastSelected);
        const end = Math.max(rowIndex, lastSelected);
        
        this.selectedRows.clear();
        for (let i = start; i <= end; i++) {
          this.selectedRows.add(i);
        }
      } else {
        this.selectedRows.clear();
        this.selectedRows.add(rowIndex);
      }
    }
    
    this.updateRowSelection();
    const records = this.getFilteredAndSortedRecords();
    const selectedRecords = Array.from(this.selectedRows).map(index => records[index]).filter(Boolean);
    this.emit('selectionchange', { 
      selections: selectedRecords,
      record: selectedRecords.length === 1 ? selectedRecords[0] : null
    });
  }

  updateRowSelection() {
    if (!this.rendered) return;
    
    const rows = this.el.querySelectorAll('.aionda-grid-row');
    rows.forEach((row, index) => {
      if (this.selectedRows.has(index)) {
        row.classList.add('selected', 'bg-blue-100', 'dark:bg-blue-900');
        row.setAttribute('aria-selected', 'true');
        if (this.hover) {
          row.classList.remove('hover:bg-blue-50', 'dark:hover:bg-blue-900/50');
        }
      } else {
        row.classList.remove('selected', 'bg-blue-100', 'dark:bg-blue-900');
        row.removeAttribute('aria-selected');
        if (this.hover) {
          row.classList.add('hover:bg-blue-50', 'dark:hover:bg-blue-900/50');
        }
      }
    });
    
    this.updateFooter();
  }

  // Cell editing
  startEdit(rowIndex, field) {
    if (!this.editable) return;
    
    const newEditingCell = `${rowIndex}-${field}`;
    
    // If already editing the same cell, do nothing
    if (this.editingCell === newEditingCell) {
      return;
    }
    
    // If already editing another cell, finish that edit first without refresh
    if (this.editingCell && this.editingCell !== newEditingCell) {
      const existingEditor = this.el.querySelector('.aionda-grid-cell-editor');
      if (existingEditor) {
        this.finishEditInPlace(existingEditor);
      }
    }
    
    // Set the new editing cell
    this.editingCell = newEditingCell;
    
    // Convert the target cell to an editor in-place
    this.convertCellToEditor(rowIndex, field);
  }

  convertCellToEditor(rowIndex, field) {
    const cell = this.el.querySelector(`.aionda-grid-data-cell[data-row="${rowIndex}"][data-field="${field}"]`);
    if (!cell) return;

    const cellDiv = cell.querySelector('div');
    if (!cellDiv) return;

    const col = this.columns.find(c => c.field === field);
    const records = this.getFilteredAndSortedRecords();
    const record = records[rowIndex];
    
    if (record) {
      const value = this.getCellValue(record, col);
      const inputType = col.type === 'number' ? 'number' : 'text';
      
      cellDiv.innerHTML = `
        <input type="${inputType}" 
               class="aionda-grid-cell-editor"
               value="${value || ''}"
               data-edit-row="${rowIndex}"
               data-edit-field="${field}"
               autofocus>
      `;
      
      const editor = cellDiv.querySelector('.aionda-grid-cell-editor');
      if (editor) {
        editor.focus();
        editor.select();
        
        // Add event listeners for this editor
        editor.addEventListener('blur', (e) => this.finishEdit(editor));
        editor.addEventListener('keydown', (e) => this.handleEditKeydown(e, editor));
      }
    }
  }

  finishEditInPlace(inputEl) {
    if (!this.editingCell) return;
    
    const [rowIndex, field] = this.editingCell.split('-');
    const newValue = inputEl.value;
    
    // Update the record
    const records = this.getFilteredAndSortedRecords();
    const record = records[parseInt(rowIndex)];
    
    if (record) {
      const col = this.columns.find(c => c.field === field);
      const oldValue = record[field];
      let finalValue = newValue;
      
      if (col && col.type === 'number') {
        finalValue = parseFloat(newValue) || 0;
      }
      
      // Update the record directly
      record[field] = finalValue;
      
      // If we have a store, also notify it of the update
      if (this.store) {
        const storeIndex = this.store.data.indexOf(record);
        if (storeIndex !== -1) {
          this.store.emit('recordupdate', { 
            record, 
            index: storeIndex, 
            changes: { [field]: finalValue },
            oldValue,
            newValue: finalValue
          });
          this.store.emit('update');
        }
      }
      
      this.emit('cellchange', { record, field, value: finalValue, rowIndex: parseInt(rowIndex), oldValue });
      
      // Convert editor back to display cell in-place
      const cell = this.el.querySelector(`.aionda-grid-data-cell[data-row="${rowIndex}"][data-field="${field}"]`);
      if (cell) {
        const cellDiv = cell.querySelector('div');
        if (cellDiv) {
          cellDiv.innerHTML = this.formatCellValue(finalValue, col);
        }
      }
    }
  }

  finishEdit(inputEl) {
    if (!this.editingCell) return;
    
    const [rowIndex, field] = this.editingCell.split('-');
    const newValue = inputEl.value;
    
    // Update the record
    const records = this.getFilteredAndSortedRecords();
    const record = records[parseInt(rowIndex)];
    
    if (record) {
      const col = this.columns.find(c => c.field === field);
      const oldValue = record[field];
      let finalValue = newValue;
      
      if (col && col.type === 'number') {
        finalValue = parseFloat(newValue) || 0;
      }
      
      // Update the record directly
      record[field] = finalValue;
      
      // If we have a store, also notify it of the update
      if (this.store) {
        const storeIndex = this.store.data.indexOf(record);
        if (storeIndex !== -1) {
          this.store.emit('recordupdate', { 
            record, 
            index: storeIndex, 
            changes: { [field]: finalValue },
            oldValue,
            newValue: finalValue
          });
          this.store.emit('update');
        }
      }
      
      this.emit('cellchange', { record, field, value: finalValue, rowIndex: parseInt(rowIndex), oldValue });
      
      // Convert editor back to display cell in-place
      const cell = this.el.querySelector(`.aionda-grid-data-cell[data-row="${rowIndex}"][data-field="${field}"]`);
      if (cell) {
        const cellDiv = cell.querySelector('div');
        if (cellDiv) {
          cellDiv.innerHTML = this.formatCellValue(finalValue, col);
        }
      }
    }
    
    this.editingCell = null;
  }

  handleEditKeydown(event, inputEl) {
    if (event.key === 'Enter') {
      this.finishEdit(inputEl);
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  cancelEdit() {
    if (!this.editingCell) return;
    
    const [rowIndex, field] = this.editingCell.split('-');
    
    // Restore original cell content without saving changes
    const cell = this.el.querySelector(`.aionda-grid-data-cell[data-row="${rowIndex}"][data-field="${field}"]`);
    if (cell) {
      const cellDiv = cell.querySelector('div');
      if (cellDiv) {
        const records = this.getFilteredAndSortedRecords();
        const record = records[parseInt(rowIndex)];
        const col = this.columns.find(c => c.field === field);
        
        if (record && col) {
          const originalValue = this.getCellValue(record, col);
          cellDiv.innerHTML = this.formatCellValue(originalValue, col);
        }
      }
    }
    
    this.editingCell = null;
  }

  // Column reordering methods
  getOrderedColumns() {
    return this.columnOrder.map(field => 
      this.columns.find(col => col.field === field)
    ).filter(Boolean);
  }

  getVisibleColumns() {
    return this.columns.filter(col => this.columnVisibility.get(col.field) === true);
  }

  getVisibleOrderedColumns() {
    return this.columnOrder.map(field => 
      this.columns.find(col => col.field === field)
    ).filter(col => col && this.columnVisibility.get(col.field) === true);
  }

  startColumnDrag(event, field) {
    this.dragging = {
      field,
      startIndex: this.columnOrder.indexOf(field)
    };
    
    const headerCell = event.target.closest('.aionda-grid-header-cell');
    headerCell.style.opacity = '0.5';
    headerCell.classList.add('cursor-grabbing');
    
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', field);
  }

  handleColumnDragOver(event, headerCell) {
    const rect = headerCell.getBoundingClientRect();
    const midPoint = rect.left + rect.width / 2;
    
    // Remove existing drop indicators
    this.el.querySelectorAll('.aionda-drop-indicator').forEach(el => el.remove());
    
    // Add drop indicator
    const indicator = document.createElement('div');
    indicator.className = 'aionda-drop-indicator absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20';
    
    if (event.clientX < midPoint) {
      indicator.style.left = '0px';
      headerCell.style.position = 'relative';
      headerCell.appendChild(indicator);
    } else {
      indicator.style.right = '0px';
      headerCell.style.position = 'relative';
      headerCell.appendChild(indicator);
    }
  }

  handleColumnDrop(event, targetField) {
    if (!this.dragging || this.dragging.field === targetField) {
      this.endColumnDrag();
      return;
    }

    const sourceField = this.dragging.field;
    const sourceIndex = this.columnOrder.indexOf(sourceField);
    const targetIndex = this.columnOrder.indexOf(targetField);
    
    // Determine if we're dropping before or after target
    const headerCell = event.target.closest('.aionda-grid-header-cell');
    const rect = headerCell.getBoundingClientRect();
    const midPoint = rect.left + rect.width / 2;
    const dropBefore = event.clientX < midPoint;
    
    // Remove source from array
    this.columnOrder.splice(sourceIndex, 1);
    
    // Insert at new position
    let newIndex = targetIndex;
    if (sourceIndex < targetIndex && !dropBefore) {
      newIndex = targetIndex;
    } else if (sourceIndex < targetIndex && dropBefore) {
      newIndex = targetIndex - 1;
    } else if (sourceIndex > targetIndex && dropBefore) {
      newIndex = targetIndex;
    } else if (sourceIndex > targetIndex && !dropBefore) {
      newIndex = targetIndex + 1;
    }
    
    this.columnOrder.splice(newIndex, 0, sourceField);
    
    this.endColumnDrag();
    this.refresh();
    
    this.emit('columnreorder', {
      field: sourceField,
      oldIndex: sourceIndex,
      newIndex: newIndex,
      newOrder: [...this.columnOrder]
    });
  }

  endColumnDrag() {
    // Remove drop indicators
    this.el.querySelectorAll('.aionda-drop-indicator').forEach(el => el.remove());
    
    // Reset dragged column styling
    if (this.dragging) {
      const draggedCell = this.el.querySelector(`[data-field="${this.dragging.field}"]`);
      if (draggedCell) {
        draggedCell.style.opacity = '';
        draggedCell.classList.remove('cursor-grabbing');
      }
    }
    
    this.dragging = null;
  }

  // Public methods
  refresh() {
    if (!this.rendered) return;
    
    // Handle dialog state changes - check if dialog needs to be added or removed
    const currentDialogHTML = this.createColumnSelectorDialog();
    const existingDialog = this.el.querySelector('.aionda-column-dialog');
    
    if ((currentDialogHTML && !existingDialog) || (!currentDialogHTML && existingDialog)) {
      // Dialog state changed - remove existing and add new if needed
      if (existingDialog) {
        existingDialog.remove();
      }
      
      if (currentDialogHTML) {
        this.el.insertAdjacentHTML('beforeend', currentDialogHTML);
      }
    }
    
    // Re-render header, body and footer to reflect column order changes
    this.headerEl.innerHTML = this.createHeaderTemplate();
    this.bodyEl.innerHTML = this.createBodyTemplate();
    this.footerEl.innerHTML = this.createFooterTemplate();
    
    // Update toolbar column count
    this.updateVisibleColumnCount();
    
    this.updateColumnWidths();
    this.updateRowSelection();
  }

  refreshBody() {
    if (!this.rendered) return;
    
    // Only re-render body and footer, keep header intact to preserve filter inputs
    this.bodyEl.innerHTML = this.createBodyTemplate();
    this.footerEl.innerHTML = this.createFooterTemplate();
    
    this.updateRowSelection();
    this.updateFilterMatches();
  }

  updateFooter() {
    if (!this.footerEl) return;
    this.footerEl.innerHTML = this.createFooterTemplate();
  }

  updateFilterMatches() {
    if (!this.rendered) return;
    
    // Update filter match counts and clear buttons without re-rendering header
    this.columns.forEach(col => {
      const filterValue = this.filters.get(col.field) || '';
      const hasFilter = filterValue.trim().length > 0;
      const filterContainer = this.el.querySelector(`[data-filter-field="${col.field}"]`)?.closest('.aionda-grid-filter');
      
      if (filterContainer) {
        // Update input styling
        const input = filterContainer.querySelector('.aionda-grid-filter-input');
        if (input) {
          if (hasFilter) {
            input.classList.add('border-blue-400', 'dark:border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
          } else {
            input.classList.remove('border-blue-400', 'dark:border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
          }
        }
        
        // Update clear button / search icon
        const existingButton = filterContainer.querySelector('.aionda-filter-clear, .aionda-filter-icon');
        if (existingButton) {
          existingButton.remove();
        }
        
        const inputContainer = filterContainer.querySelector('.relative');
        if (hasFilter) {
          const clearBtn = document.createElement('button');
          clearBtn.className = 'aionda-filter-clear absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center rounded text-xs';
          clearBtn.setAttribute('data-clear-filter', col.field);
          clearBtn.setAttribute('title', 'Clear filter');
          clearBtn.textContent = '×';
          inputContainer.appendChild(clearBtn);
        } else {
          const icon = document.createElement('div');
          icon.className = 'aionda-filter-icon absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600 flex items-center justify-center text-xs';
          icon.textContent = '🔍';
          inputContainer.appendChild(icon);
        }
        
        // Update matches count
        const existingMatches = filterContainer.querySelector('.aionda-filter-matches');
        if (existingMatches) {
          existingMatches.remove();
        }
        
        if (hasFilter) {
          const matchesDiv = document.createElement('div');
          matchesDiv.className = 'aionda-filter-matches text-xs text-blue-600 dark:text-blue-400 mt-1 px-1';
          matchesDiv.textContent = `${this.getFilterMatches(col.field)} matches`;
          filterContainer.appendChild(matchesDiv);
        }
      }
    });
  }

  getStore() {
    return this.store;
  }

  getSelections() {
    const records = this.getFilteredAndSortedRecords();
    return Array.from(this.selectedRows).map(index => records[index]).filter(Boolean);
  }

  getSelectedRecords() {
    return this.getSelections();
  }

  getSelection() {
    return this.getSelections();
  }

  clearSelections() {
    this.selectedRows.clear();
    this.updateRowSelection();
  }

  clearSelection() {
    this.selectedRows.clear();
    this.updateRowSelection();
    this.emit('selectionchange', { 
      selections: [],
      record: null
    });
  }

  clearFilters() {
    this.filters.clear();
    
    // Clear all filter inputs
    if (this.rendered) {
      const filterInputs = this.el.querySelectorAll('.aionda-grid-filter-input');
      filterInputs.forEach(input => {
        input.value = '';
      });
    }
    
    this.refresh();
  }

  selectAll() {
    if (this.selectionMode === 'multi') {
      const recordCount = this.getFilteredAndSortedRecords().length;
      this.selectedRows.clear();
      for (let i = 0; i < recordCount; i++) {
        this.selectedRows.add(i);
      }
      this.updateRowSelection();
      const records = this.getFilteredAndSortedRecords();
      const selectedRecords = Array.from(this.selectedRows).map(index => records[index]).filter(Boolean);
      this.emit('selectionchange', { 
        selections: selectedRecords,
        record: selectedRecords.length === 1 ? selectedRecords[0] : null
      });
    }
  }

  // Column visibility management
  toggleColumnVisibility(field, visible) {
    this.columnVisibility.set(field, visible);
    this.refresh();
    this.updateVisibleColumnCount();
    this.emit('columnvisibilitychange', { 
      field, 
      visible, 
      visibleColumns: this.getVisibleColumns().map(col => col.field) 
    });
  }

  showColumn(field) {
    this.toggleColumnVisibility(field, true);
  }

  hideColumn(field) {
    this.toggleColumnVisibility(field, false);
  }

  showAllColumns() {
    this.columns.forEach(col => {
      this.columnVisibility.set(col.field, true);
    });
    this.refresh();
    this.updateVisibleColumnCount();
    this.emit('columnvisibilitychange', { 
      action: 'showAll',
      visibleColumns: this.getVisibleColumns().map(col => col.field) 
    });
  }

  hideAllColumns() {
    this.columns.forEach(col => {
      this.columnVisibility.set(col.field, false);
    });
    this.refresh();
    this.updateVisibleColumnCount();
    this.emit('columnvisibilitychange', { 
      action: 'hideAll',
      visibleColumns: [] 
    });
  }

  toggleColumnSelector() {
    this.showColumnDialog = !this.showColumnDialog;
    this.refresh();
  }

  showColumnSelector() {
    this.showColumnDialog = true;
    this.refresh();
  }

  hideColumnSelector() {
    this.showColumnDialog = false;
    this.refresh();
  }

  createColumnSelectorDialog() {
    if (!this.showColumnDialog) return '';
    
    return `
      <div class="aionda-column-dialog fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-96 max-h-96 overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Show/Hide Columns</h3>
            <button class="aionda-close-dialog text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-4 max-h-64 overflow-y-auto">
            <div class="space-y-2">
              ${this.columns.map(col => `
                <label class="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                  <input type="checkbox" 
                         class="aionda-column-checkbox mr-3" 
                         data-column-field="${col.field}"
                         ${this.columnVisibility.get(col.field) ? 'checked' : ''}>
                  <span class="text-sm text-gray-700 dark:text-gray-300">${col.text || col.field}</span>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <div class="flex space-x-2">
              <button class="aionda-show-all-columns px-3 py-1 text-xs bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600">Show All</button>
              <button class="aionda-hide-all-columns px-3 py-1 text-xs bg-gray-600 dark:bg-gray-500 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-400">Hide All</button>
            </div>
            <div class="flex space-x-2">
              <button class="aionda-save-column-config px-3 py-1 text-xs bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-600">Save Config</button>
              <button class="aionda-close-dialog px-3 py-1 text-xs bg-gray-400 dark:bg-gray-600 text-white rounded hover:bg-gray-500 dark:hover:bg-gray-500">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  updateVisibleColumnCount() {
    if (!this.rendered) return;
    const countEl = this.el.querySelector('.aionda-visible-columns-count');
    if (countEl) {
      countEl.textContent = this.getVisibleColumns().length;
    }
  }

  updateDialogCheckboxes() {
    if (!this.rendered || !this.showColumnDialog) return;
    
    this.columns.forEach(col => {
      const checkbox = this.el.querySelector(`[data-column-field="${col.field}"]`);
      if (checkbox) {
        checkbox.checked = this.columnVisibility.get(col.field);
      }
    });
  }

  // Column configuration save/restore
  getColumnConfiguration() {
    return {
      visibility: Object.fromEntries(this.columnVisibility),
      order: [...this.columnOrder],
      widths: Object.fromEntries(this.columnWidths)
    };
  }

  setColumnConfiguration(config) {
    if (config.visibility) {
      this.columnVisibility = new Map(Object.entries(config.visibility));
    }
    if (config.order) {
      this.columnOrder = [...config.order];
    }
    if (config.widths) {
      this.columnWidths = new Map(Object.entries(config.widths));
    }
    this.refresh();
    this.updateVisibleColumnCount();
  }

  saveColumnConfiguration(key = 'aionda-grid-columns') {
    const config = this.getColumnConfiguration();
    try {
      localStorage.setItem(key, JSON.stringify(config));
      return true;
    } catch (e) {
      console.warn('Failed to save column configuration:', e);
      return false;
    }
  }

  loadColumnConfiguration(key = 'aionda-grid-columns') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const config = JSON.parse(saved);
        this.setColumnConfiguration(config);
        return true;
      }
    } catch (e) {
      console.warn('Failed to load column configuration:', e);
    }
    return false;
  }

  setupContextMenu() {
    this.el.addEventListener('contextmenu', (e) => {
      const headerCell = e.target.closest('.aionda-grid-header-cell');
      const dataRow = e.target.closest('.aionda-grid-row');
      
      if (headerCell && headerCell.dataset.field) {
        e.preventDefault();
        this.showContextMenu(e, headerCell.dataset.field);
      } else if (dataRow && dataRow.dataset.rowIndex !== undefined) {
        e.preventDefault();
        const rowIndex = parseInt(dataRow.dataset.rowIndex);
        this.showRowContextMenu(e, rowIndex);
      }
    });
  }

  showContextMenu(event, field) {
    if (this.contextMenu) {
      this.contextMenu.destroy();
    }

    const isVisible = this.columnVisibility.get(field);
    const menuItems = [
      {
        text: isVisible ? 'Hide Column' : 'Show Column',
        handler: () => this.toggleColumnVisibility(field, !isVisible)
      },
      { separator: true },
      {
        text: 'Show All Columns',
        handler: () => this.showAllColumns()
      },
      {
        text: 'Hide All Other Columns',
        handler: () => {
          this.hideAllColumns();
          this.showColumn(field);
        }
      },
      { separator: true },
      {
        text: 'Column Settings...',
        handler: () => this.showColumnSelector()
      }
    ];

    this.contextMenu = new Menu({
      items: menuItems,
      contextMenu: true,
      floating: true
    });

    this.contextMenu.showAt({ x: event.clientX, y: event.clientY });
  }

  showRowContextMenu(event, rowIndex) {
    if (this.contextMenu) {
      this.contextMenu.destroy();
    }

    // Ensure the right-clicked row is selected
    if (!this.selectedRows.has(rowIndex)) {
      this.selectedRows.clear();
      this.selectedRows.add(rowIndex);
      this.updateRowSelection();
    }

    const records = this.getFilteredAndSortedRecords();
    const selectedRecord = records[rowIndex];
    const selectedCount = this.selectedRows.size;

    const menuItems = [
      {
        text: selectedCount > 1 ? `Select All ${selectedCount} Rows` : 'Select Row',
        handler: () => {
          if (selectedCount === 1 && this.selectionMode === 'multi') {
            this.selectAll();
          }
        },
        disabled: selectedCount > 1
      },
      {
        text: 'Deselect All',
        handler: () => this.clearSelection(),
        disabled: selectedCount === 0
      },
      { separator: true },
      {
        text: selectedCount > 1 ? `Copy ${selectedCount} Rows` : 'Copy Row',
        handler: () => this.copyRowsToClipboard()
      },
      {
        text: selectedCount > 1 ? `Delete ${selectedCount} Rows` : 'Delete Row',
        handler: () => this.deleteSelectedRows(),
        cssClass: 'text-red-600 dark:text-red-400'
      },
      { separator: true },
      {
        text: 'Edit Cell...',
        handler: () => this.showCellEditDialog(rowIndex),
        disabled: !this.editable
      },
      {
        text: 'Row Details...',
        handler: () => this.showRowDetails(selectedRecord)
      }
    ];

    this.contextMenu = new Menu({
      items: menuItems,
      contextMenu: true,
      floating: true
    });

    this.contextMenu.showAt({ x: event.clientX, y: event.clientY });
  }

  copyRowsToClipboard() {
    const records = this.getFilteredAndSortedRecords();
    const selectedRecords = Array.from(this.selectedRows).map(index => records[index]).filter(Boolean);
    
    if (selectedRecords.length === 0) return;

    // Create CSV format
    const visibleColumns = this.getVisibleOrderedColumns();
    const headers = visibleColumns.map(col => col.text || col.field);
    const csvData = [headers.join('\t')];
    
    selectedRecords.forEach(record => {
      const row = visibleColumns.map(col => {
        const value = this.getCellValue(record, col);
        return value != null ? String(value) : '';
      });
      csvData.push(row.join('\t'));
    });

    const csvText = csvData.join('\n');
    
    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(csvText).then(() => {
        this.emit('rowsCopied', { count: selectedRecords.length, data: csvText });
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = csvText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.emit('rowsCopied', { count: selectedRecords.length, data: csvText });
    }
  }

  deleteSelectedRows() {
    const records = this.getFilteredAndSortedRecords();
    const selectedRecords = Array.from(this.selectedRows).map(index => records[index]).filter(Boolean);
    
    if (selectedRecords.length === 0) return;

    // Emit delete request event - let the application handle the actual deletion
    this.emit('deleteRequest', { 
      selections: selectedRecords,
      indices: Array.from(this.selectedRows)
    });
  }

  showCellEditDialog(rowIndex) {
    // This could be enhanced to show a dialog for editing multiple cells
    const visibleColumns = this.getVisibleOrderedColumns();
    if (visibleColumns.length > 0) {
      this.startEdit(rowIndex, visibleColumns[0].field);
    }
  }

  showRowDetails(record) {
    // Emit event for row details - let the application handle the display
    this.emit('rowDetails', { record });
  }

  invalidateCache() {
    this.cacheInvalidated = true;
    this.cachedFilteredRecords = null;
    this.refresh();
  }

  handleStoreRemove() {
    // When records are removed, we need to update selections
    // since row indices change
    const hadSelections = this.selectedRows.size > 0;
    
    // Clear selections and refresh, then emit selectionchange if we had selections before
    this.selectedRows.clear();
    this.invalidateCache();
    
    if (hadSelections) {
      // Emit selectionchange to notify that selection is now empty
      this.emit('selectionchange', { 
        selections: [],
        record: null
      });
    }
  }

  handleStoreClear() {
    // When store is cleared, clear all selections
    const hadSelections = this.selectedRows.size > 0;
    this.selectedRows.clear();
    this.invalidateCache();
    
    if (hadSelections) {
      // Emit selectionchange to notify that selection is now empty
      this.emit('selectionchange', { 
        selections: [],
        record: null
      });
    }
  }

  destroy() {
    // Clean up event listeners to prevent conflicts
    if (this.boundDocumentClick) {
      document.removeEventListener('click', this.boundDocumentClick);
      this.boundDocumentClick = null;
    }
    
    if (this.boundDocumentKeydown) {
      document.removeEventListener('keydown', this.boundDocumentKeydown);
      this.boundDocumentKeydown = null;
    }
    
    // Clean up global mouse events
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.stopResize);
    
    // Clean up context menu
    if (this.contextMenu) {
      this.contextMenu.destroy();
      this.contextMenu = null;
    }
    
    // Clean up filter debounce timer
    if (this.filterDebounceTimer) {
      clearTimeout(this.filterDebounceTimer);
      this.filterDebounceTimer = null;
    }
    
    // Clean up store event listeners
    if (this.store) {
      this.store.off('load', this.boundInvalidateCache);
      this.store.off('add', this.boundInvalidateCache);
      this.store.off('remove', this.boundHandleStoreRemove);
      this.store.off('update', this.boundInvalidateCache);
      this.store.off('recordupdate', this.boundInvalidateCache);
      this.store.off('clear', this.boundHandleStoreClear);
      this.store.off('sort', this.boundInvalidateCache);
      this.store.off('filter', this.boundInvalidateCache);
    }
    
    // Clear component state
    this.selectedRows.clear();
    this.selectedCells.clear();
    this.filters.clear();
    this.sortState.clear();
    this.columnWidths.clear();
    this.columnVisibility.clear();
    
    // Call parent destroy
    super.destroy();
  }
}