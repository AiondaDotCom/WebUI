import { Panel } from './Panel.js';

let windowZIndex = 1000;
let activeWindows = [];

export class Window extends Panel {
  constructor(config = {}) {
    // Set up Panel config with Window-specific defaults
    const panelConfig = {
      ...config,
      title: config.title === null ? '' : (config.title || ''),
      header: config.header !== false,
      padding: config.padding !== false,
      border: config.border !== false,
      shadow: config.shadow !== false
    };
    
    super(panelConfig);
    
    config = config || {};
    
    // Window-specific properties
    this.modal = config.modal === true;
    this.draggable = config.draggable !== false;
    this.resizable = config.resizable !== false;
    this.closable = config.closable !== false;
    this.minimizable = config.minimizable === true;
    this.maximizable = config.maximizable === true;
    this.width = Math.max(config.width || 400, 50); // Minimum width of 50
    this.height = Math.max(config.height || 300, 50); // Minimum height of 50
    this.x = Math.max(config.x !== undefined ? config.x : 50, 0); // Minimum x of 0
    this.y = Math.max(config.y !== undefined ? config.y : 50, 0); // Minimum y of 0
    this.minWidth = Math.max(config.minWidth || 200, 50);
    this.minHeight = Math.max(config.minHeight || 150, 50);
    this.maxWidth = config.maxWidth;
    this.maxHeight = config.maxHeight;
    this.centered = config.centered === true;
    this.autoShow = config.autoShow !== false;
    this.cls = config.cls;
    this.html = config.html;
    
    // Window state
    this.minimized = false;
    this.maximized = false;
    this.visible = this.autoShow;
    this.previousGeometry = null;
    this.isDragging = false;
    this.isResizing = false;
    this.dragData = null;
    this.resizeData = null;
    
    // Additional elements (Panel already has headerEl, bodyEl)
    this.backdropEl = null;
    this.toolsEl = null;
    
    this.zIndex = ++windowZIndex;
  }

  createTemplate() {
    const headerTemplate = this.createHeaderTemplate();
    const bodyTemplate = this.createBodyTemplate();
    const resizeHandles = this.resizable ? this.createResizeHandlesTemplate() : '';
    
    return `
      <div class="aionda-window flex flex-col relative ${this.cls || ''}" style="${this.getWindowStyle()}">
        ${headerTemplate}
        ${bodyTemplate}
        ${resizeHandles}
      </div>
    `;
  }

  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      modal: false,
      draggable: true,
      resizable: true,
      closable: true,
      minimizable: false,
      maximizable: false,
      width: 400,
      height: 300,
      centered: false,
      autoShow: true
    };
  }

  getPanelClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-window',
      'flex',
      'flex-col'
    ];

    if (this.cls) {
      classes.push(this.cls);
    }

    if (!this.visible) {
      classes.push('hidden');
    }

    if (this.border) classes.push('border', 'border-gray-200', 'dark:border-gray-600');
    if (this.shadow) classes.push('shadow-lg');

    return classes;
  }

  createBackdrop() {
    if (!this.modal || this.backdropEl) return;
    
    this.backdropEl = document.createElement('div');
    this.backdropEl.className = 'aionda-backdrop fixed inset-0 bg-black bg-opacity-50 z-40';
    this.backdropEl.style.display = this.visible ? 'block' : 'none';
    
    if (this.closable) {
      this.backdropEl.addEventListener('click', () => this.close());
    }
    
    document.body.appendChild(this.backdropEl);
  }

  createHeaderTemplate() {
    if (!this.header) return '';

    const closeBtn = this.closable ? `
      <button class="aionda-window-close p-1 hover:bg-gray-200 rounded transition-colors" type="button" aria-label="Close">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    ` : '';

    const maximizeBtn = this.maximizable ? `
      <button class="aionda-window-maximize p-1 hover:bg-gray-200 rounded transition-colors" type="button" aria-label="Maximize">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4h16v4M4 16v4h16v-4"></path>
        </svg>
      </button>
    ` : '';

    const minimizeBtn = this.minimizable ? `
      <button class="aionda-window-minimize p-1 hover:bg-gray-200 rounded transition-colors" type="button" aria-label="Minimize">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
        </svg>
      </button>
    ` : '';

    // Use Panel's header structure but add Window controls
    return `
      <div class="aionda-panel-header aionda-window-header flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
           style="height: ${this.headerHeight}px; min-height: ${this.headerHeight}px; ${this.draggable && !this.isTouchDevice() ? 'cursor: move;' : ''}">
        <div class="flex items-center gap-2">
          <h3 class="aionda-panel-title aionda-window-title font-medium text-gray-900 dark:text-gray-100">${this.title}</h3>
        </div>
        <div class="aionda-panel-tools aionda-window-tools flex items-center gap-1">
          ${minimizeBtn}
          ${maximizeBtn}
          ${closeBtn}
        </div>
      </div>
    `;
  }

  createBodyTemplate() {
    const bodyClasses = [
      'aionda-panel-body',
      'aionda-window-body',
      'transition-all duration-200',
      'flex-1',
      'overflow-auto',
      this.padding ? 'p-4' : '',
      this.collapsed ? 'hidden' : 'block',
      'bg-white dark:bg-gray-800'
    ].filter(Boolean);

    return `
      <div class="${bodyClasses.join(' ')}" style="${this.getBodyStyleString()}">
        <!-- Content will be inserted here -->
      </div>
    `;
  }

  createResizeHandlesTemplate() {
    return `<div class="aionda-window-resizer absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"></div>`;
  }

  getWindowStyle() {
    const styles = ['position: fixed'];
    
    if (this.minimized || !this.visible) {
      styles.push('display: none');
      return styles.join('; ');
    }

    // Always set display for visible windows
    styles.push('display: flex');

    // Check for mobile screens (small viewport)
    const globalWindow = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' && global.window ? global.window : null);
    const screenWidth = globalWindow ? globalWindow.innerWidth : 1024;
    const screenHeight = globalWindow ? globalWindow.innerHeight : 768;
    const isMobile = screenWidth <= 480; // Mobile breakpoint for small screens

    if (this.maximized || isMobile) {
      styles.push('top: 0', 'left: 0', 'right: 0', 'bottom: 0', 'width: 100%', 'height: 100%');
    } else {
      const width = this.width || this.defaultWidth || 400;
      const height = this.height || this.defaultHeight || 300;
      
      styles.push(`width: ${typeof width === 'number' ? width + 'px' : width}`);
      styles.push(`height: ${typeof height === 'number' ? height + 'px' : height}`);
      
      if (this.centered) {
        const centerX = screenWidth / 2 - width / 2;
        const centerY = screenHeight / 2 - height / 2;
        styles.push(`left: ${centerX}px`, `top: ${centerY}px`);
      } else if (this.x !== undefined && this.y !== undefined) {
        styles.push(`left: ${this.x}px`, `top: ${this.y}px`);
      } else {
        styles.push('left: 10%', 'top: 10%');
      }
    }

    if (this.minWidth) styles.push(`min-width: ${this.minWidth}px`);
    if (this.minHeight) styles.push(`min-height: ${this.minHeight}px`);
    if (this.maxWidth) styles.push(`max-width: ${this.maxWidth}px`);
    if (this.maxHeight) styles.push(`max-height: ${this.maxHeight}px`);
    
    // Always set z-index
    styles.push(`z-index: ${this.zIndex}`);

    return styles.join('; ');
  }

  isTouchDevice() {
    // Check if touch events are supported
    const globalWindow = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' && global.window ? global.window : null);
    return globalWindow && ('ontouchstart' in globalWindow || navigator.maxTouchPoints > 0);
  }

  render() {
    if (this.destroyed) {
      throw new Error('Cannot render destroyed component');
    }

    if (this.rendered && this.el) {
      return this.el;
    }

    const template = this.createTemplate();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template.trim();
    this.el = wrapper.firstElementChild;

    if (!this.el) {
      throw new Error('Component template must return a valid HTML element');
    }

    this.el.id = this.id;
    this.el.className = this.getPanelClasses().join(' ');
    
    // Apply Window-specific styles
    this.updateWindowStyle();
    
    this.setupEventListeners();

    this.rendered = true;
    this.emit('render');

    return this.el;
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.headerEl = this.el.querySelector('.aionda-window-header');
    this.bodyEl = this.el.querySelector('.aionda-window-body');
    this.toolsEl = this.el.querySelector('.aionda-window-tools');
    
    // Create backdrop if modal
    if (this.modal) {
      this.createBackdrop();
    }

    if (this.closable) {
      // Use event delegation on the window element to handle close button clicks
      this.el.addEventListener('click', (e) => {
        if (e.target.closest('.aionda-window-close')) {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        }
      });
    }

    if (this.minimizable) {
      const minimizeBtn = this.el.querySelector('.aionda-window-minimize');
      if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => this.toggleMinimize());
      }
    }

    if (this.maximizable) {
      const maximizeBtn = this.el.querySelector('.aionda-window-maximize');
      if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => this.toggleMaximize());
      }
    }

    if (this.draggable && this.headerEl) {
      this.headerEl.addEventListener('mousedown', (e) => this.startDrag(e));
    }

    if (this.resizable) {
      const resizer = this.el.querySelector('.aionda-window-resizer');
      if (resizer) {
        resizer.addEventListener('mousedown', (e) => this.startResize(e));
      }
    }

    if (this.modal && this.backdropEl) {
      this.backdropEl.addEventListener('click', () => {
        if (this.closable) {
          this.close();
        }
      });
    }

    // Store keydown handler reference for cleanup
    this.keydownHandler = (e) => this.onKeyDown(e);
    document.addEventListener('keydown', this.keydownHandler);
    this.el.addEventListener('mousedown', () => this.focus());
    
    // Add touch event support for mobile interactions
    this.el.addEventListener('touchstart', (e) => {
      this.emit('touchstart', e);
      this.focus();
    });
    this.el.addEventListener('touchmove', (e) => this.emit('touchmove', e));
    this.el.addEventListener('touchend', (e) => this.emit('touchend', e));

    // Add HTML content if provided
    if (this.bodyEl && this.html) {
      this.bodyEl.innerHTML = this.html;
    }

    if (this.bodyEl && this.items.length > 0) {
      this.items.forEach(item => {
        if (item.render && typeof item.render === 'function') {
          const el = item.render();
          this.bodyEl.appendChild(el);
        } else if (item instanceof HTMLElement) {
          this.bodyEl.appendChild(item);
        }
      });
    }
  }

  onKeyDown(e) {
    if (!this.isVisible() || !this.isFocused()) return;

    if (e.key === 'Escape' && this.closable) {
      e.preventDefault();
      this.close();
    }
  }

  startDrag(e) {
    if (!this.draggable || this.maximized) return;
    
    e.preventDefault();
    this.isDragging = true;
    this.focus();

    const rect = this.el.getBoundingClientRect();
    
    // In test environment, use configured positions if rect returns 0
    const startLeft = rect.left || this.x || 0;
    const startTop = rect.top || this.y || 0;
    
    this.dragData = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: startLeft,
      startTop: startTop
    };

    this.emit('dragstart');
    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);
    document.body.style.userSelect = 'none';
  }

  onDragMove = (e) => {
    if (!this.isDragging || !this.dragData) return;

    const deltaX = e.clientX - this.dragData.startX;
    const deltaY = e.clientY - this.dragData.startY;
    
    let newLeft = this.dragData.startLeft + deltaX;
    let newTop = this.dragData.startTop + deltaY;

    if (this.constrainToViewport) {
      const windowRect = this.el.getBoundingClientRect();
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - windowRect.width));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - windowRect.height));
    }

    this.x = newLeft;
    this.y = newTop;
    
    this.el.style.left = `${newLeft}px`;
    this.el.style.top = `${newTop}px`;
    
    this.emit('drag');
  }

  onDragEnd = () => {
    this.isDragging = false;
    this.dragData = null;
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
    document.body.style.userSelect = '';
    this.emit('dragend');
  }

  startResize(e) {
    if (!this.resizable || this.maximized) return;
    
    e.preventDefault();
    e.stopPropagation();
    this.isResizing = true;
    this.focus();

    const rect = this.el.getBoundingClientRect();
    const handle = e.target;
    
    // In test environment, use configured dimensions if rect returns 0
    const startWidth = rect.width || this.width || 400;
    const startHeight = rect.height || this.height || 300;
    const startLeft = rect.left || this.x || 0;
    const startTop = rect.top || this.y || 0;
    
    this.resizeData = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: startWidth,
      startHeight: startHeight,
      startLeft: startLeft,
      startTop: startTop,
      direction: this.getResizeDirection(handle)
    };

    this.emit('resizestart');
    document.addEventListener('mousemove', this.onResizeMove);
    document.addEventListener('mouseup', this.onResizeEnd);
    document.body.style.userSelect = 'none';
  }

  getResizeDirection(handle) {
    return 'se';
  }

  onResizeMove = (e) => {
    if (!this.isResizing || !this.resizeData) return;

    const deltaX = e.clientX - this.resizeData.startX;
    const deltaY = e.clientY - this.resizeData.startY;
    const { direction } = this.resizeData;
    
    let newWidth = this.resizeData.startWidth;
    let newHeight = this.resizeData.startHeight;
    let newLeft = this.resizeData.startLeft;
    let newTop = this.resizeData.startTop;

    if (direction.includes('e')) newWidth += deltaX;
    if (direction.includes('w')) {
      newWidth -= deltaX;
      newLeft += deltaX;
    }
    if (direction.includes('s')) newHeight += deltaY;
    if (direction.includes('n')) {
      newHeight -= deltaY;
      newTop += deltaY;
    }

    newWidth = Math.max(this.minWidth, newWidth);
    newHeight = Math.max(this.minHeight, newHeight);
    
    if (this.maxWidth) newWidth = Math.min(this.maxWidth, newWidth);
    if (this.maxHeight) newHeight = Math.min(this.maxHeight, newHeight);

    if (direction.includes('w') && newWidth === this.minWidth) {
      newLeft = this.resizeData.startLeft + (this.resizeData.startWidth - this.minWidth);
    }
    if (direction.includes('n') && newHeight === this.minHeight) {
      newTop = this.resizeData.startTop + (this.resizeData.startHeight - this.minHeight);
    }

    this.width = newWidth;
    this.height = newHeight;
    this.x = newLeft;
    this.y = newTop;

    this.el.style.width = `${newWidth}px`;
    this.el.style.height = `${newHeight}px`;
    this.el.style.left = `${newLeft}px`;
    this.el.style.top = `${newTop}px`;
    
    this.emit('resize');
  }

  onResizeEnd = () => {
    this.isResizing = false;
    this.resizeData = null;
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);
    document.body.style.userSelect = '';
    this.emit('resizeend');
  }

  show() {
    if (this.visible) return this;

    activeWindows.push(this);
    this.visible = true;

    if (this.el) {
      this.el.classList.remove('hidden');
      this.updateWindowStyle(); // Update styles with new visibility
    }
    
    if (this.backdropEl) {
      this.backdropEl.style.display = 'block';
    }

    if (this.focusOnShow) {
      setTimeout(() => this.focus(), 0);
    }

    this.emit('show');
    return this;
  }

  hide() {
    if (!this.visible) return this;

    const index = activeWindows.indexOf(this);
    if (index > -1) {
      activeWindows.splice(index, 1);
    }

    this.visible = false;

    if (this.el) {
      this.el.classList.add('hidden');
      this.el.style.display = 'none';
    }
    
    if (this.backdropEl) {
      this.backdropEl.style.display = 'none';
    }

    this.emit('hide');
    return this;
  }

  close() {
    // Create a cancellable event object
    const closeEvent = { cancelled: false };
    
    // Check if there are any close event listeners
    const hasCloseListeners = this.listeners.has('close') && this.listeners.get('close').size > 0;
    if (hasCloseListeners) {
      // Emit the close event with the cancellable event object
      const eventListeners = this.listeners.get('close');
      eventListeners.forEach(listener => {
        try {
          const result = listener(closeEvent);
          // If any listener returns false, cancel the close
          if (result === false) {
            closeEvent.cancelled = true;
          }
        } catch (error) {
          console.error('Error in close event listener:', error);
        }
      });
      
      // If the event was cancelled, don't close
      if (closeEvent.cancelled) return this;
    }
    
    this.destroy();
    return this;
  }

  minimize() {
    if (this.minimized) return this;

    this.minimized = true;
    if (this.el) {
      this.el.classList.add('aionda-window-minimized');
    }

    this.emit('minimize');
    return this;
  }

  restore() {
    if (!this.minimized && !this.maximized) return this;

    if (this.minimized) {
      this.minimized = false;
      if (this.el) {
        this.el.classList.remove('aionda-window-minimized');
      }
    }

    if (this.maximized) {
      this.maximized = false;
      if (this.el) {
        this.el.classList.remove('aionda-window-maximized');
      }
      if (this.previousGeometry) {
        this.width = this.previousGeometry.width;
        this.height = this.previousGeometry.height;
        this.x = this.previousGeometry.x;
        this.y = this.previousGeometry.y;
        this.updateWindowStyle();
        this.previousGeometry = null;
      }
    }

    this.emit('restore');
    return this;
  }

  maximize() {
    if (this.maximized) return this;

    this.previousGeometry = {
      width: this.width,
      height: this.height,
      x: this.x,
      y: this.y
    };

    this.maximized = true;
    if (this.el) {
      this.el.classList.add('aionda-window-maximized');
    }
    this.updateWindowStyle();
    this.emit('maximize');
    return this;
  }

  toggleMaximize() {
    return this.maximized ? this.restore() : this.maximize();
  }

  toggleMinimize() {
    return this.minimized ? this.restore() : this.minimize();
  }

  blur() {
    this.emit('blur');
    return this;
  }

  updateWindowStyle() {
    if (this.el) {
      const style = this.getWindowStyle();
      this.el.style.cssText = style;
      
      // FORCE override Tailwind CSS conflicts
      this.el.style.setProperty('position', 'fixed', 'important');
      this.el.style.setProperty('display', 'flex', 'important');
      this.el.style.setProperty('flex-direction', 'column', 'important');
      this.el.style.setProperty('box-sizing', 'border-box', 'important');
    }
  }

  focus() {
    if (!this.visible) return this;

    this.zIndex = ++windowZIndex;
    if (this.el) {
      this.el.style.zIndex = this.zIndex;
    }

    const index = activeWindows.indexOf(this);
    if (index > -1) {
      activeWindows.splice(index, 1);
    }
    activeWindows.push(this);

    if (this.focusOnShow) {
      const focusable = this.el.querySelector('input, button, textarea, select, [tabindex]:not([tabindex="-1"])');
      if (focusable) {
        focusable.focus();
      }
    }

    this.emit('focus');
    return this;
  }

  isFocused() {
    return activeWindows[activeWindows.length - 1] === this;
  }

  isVisible() {
    return this.visible;
  }

  setTitle(title) {
    this.title = title;
    const titleEl = this.el.querySelector('.aionda-window-title');
    if (titleEl) {
      titleEl.textContent = title;
    }
    this.emit('titlechange', { title });
    return this;
  }

  getTitle() {
    return this.title;
  }

  center() {
    if (this.maximized) return this;

    const width = this.width || this.defaultWidth;
    const height = this.height || this.defaultHeight;
    
    this.x = Math.max(0, (window.innerWidth - width) / 2);
    this.y = Math.max(0, (window.innerHeight - height) / 2);
    
    this.updateWindowStyle();
    return this;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.updateWindowStyle();
    return this;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.updateWindowStyle();
    return this;
  }

  add(component) {
    this.items.push(component);
    
    if (this.bodyEl) {
      if (component.render && typeof component.render === 'function') {
        const el = component.render();
        this.bodyEl.appendChild(el);
      } else if (component instanceof HTMLElement) {
        this.bodyEl.appendChild(component);
      }
    }
    
    return this;
  }

  remove(component) {
    const index = this.items.indexOf(component);
    if (index !== -1) {
      this.items.splice(index, 1);
      
      if (this.bodyEl) {
        if (component.el && component.el.parentNode === this.bodyEl) {
          this.bodyEl.removeChild(component.el);
        } else if (component instanceof HTMLElement && component.parentNode === this.bodyEl) {
          this.bodyEl.removeChild(component);
        }
      }
    }
    
    return this;
  }

  removeAll() {
    if (this.bodyEl) {
      this.items.forEach(component => {
        if (component.el && component.el.parentNode === this.bodyEl) {
          this.bodyEl.removeChild(component.el);
        } else if (component instanceof HTMLElement && component.parentNode === this.bodyEl) {
          this.bodyEl.removeChild(component);
        }
      });
    }
    
    this.items = [];
    return this;
  }

  getItems() {
    return [...this.items];
  }

  destroy() {
    const index = activeWindows.indexOf(this);
    if (index > -1) {
      activeWindows.splice(index, 1);
    }

    // Clean up backdrop
    if (this.backdropEl && this.backdropEl.parentNode) {
      this.backdropEl.parentNode.removeChild(this.backdropEl);
      this.backdropEl = null;
    }

    this.items.forEach(item => {
      if (item.destroy && typeof item.destroy === 'function') {
        item.destroy();
      }
    });
    this.items = [];

    document.removeEventListener('keydown', this.keydownHandler);
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
    document.removeEventListener('mousemove', this.onResizeMove);
    document.removeEventListener('mouseup', this.onResizeEnd);

    super.destroy();
  }
}