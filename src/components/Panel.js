import { Component } from '../core/Component.js';

/**
 * @component Panel
 * @extends Component
 * @description A flexible container component with header, body, collapsible functionality, and child item management
 * @category Layout Components
 * @since 1.0.0
 * @example
 * // Basic panel with items
 * const panel = new AiondaWebUI.Panel({
 *   title: 'My Panel',
 *   collapsible: true,
 *   items: [button1, button2]
 * });
 * panel.renderTo('#container');
 */
export class Panel extends Component {
  /**
   * @config
   * @property {string} [title=''] - Panel title text
   * @property {boolean} [collapsible=false] - Whether panel can be collapsed
   * @property {boolean} [collapsed=false] - Initial collapsed state
   * @property {boolean} [header=true] - Whether to show header
   * @property {number} [headerHeight=48] - Header height in pixels
   * @property {boolean} [padding=true] - Whether to add padding to body
   * @property {boolean} [border=true] - Whether to show border
   * @property {boolean} [shadow=false] - Whether to show shadow
   * @property {Object} [bodyStyle={}] - Additional styles for body element
   * @property {Object} [menu=null] - Menu configuration
   * @property {Object} [contextMenu=null] - Context menu configuration
   * @property {Array} [items=[]] - Child components to add to panel
   */
  constructor(config = {}) {
    super(config);
    
    /**
     * Panel-specific version
     * @type {string}
     * @readonly
     */
    this.version = '1.0.1';
    
    /**
     * API version for compatibility
     * @type {string}
     * @readonly
     */
    this.apiVersion = '1.0';
    
    /**
     * Array of child components
     * @type {Array<Component>}
     */
    this.items = [];
    
    /**
     * Header DOM element
     * @type {Element|null}
     */
    this.headerEl = null;
    
    /**
     * Body DOM element
     * @type {Element|null}
     */
    this.bodyEl = null;
    
    /**
     * Title DOM element
     * @type {Element|null}
     */
    this.titleEl = null;
    
    /**
     * Menu configuration
     * @type {Object|null}
     */
    this.menu = config.menu || null;
    
    /**
     * Context menu configuration
     * @type {Object|null}
     */
    this.contextMenu = config.contextMenu || null;
    
    if (config && config.items) {
      config.items.forEach(item => this.add(item));
    }
  }

  /**
   * Returns the default configuration for Panel
   * @returns {Object} Default configuration object
   * @protected
   */
  getDefaultConfig() {
    return {
      ...super.getDefaultConfig(),
      title: '',
      collapsible: false,
      collapsed: false,
      header: true,
      headerHeight: 48,
      padding: true,
      border: true,
      shadow: false,
      bodyStyle: {},
      menu: null,
      contextMenu: null
    };
  }

  createTemplate() {
    const headerTemplate = this.header ? this.createHeaderTemplate() : '';
    const bodyTemplate = this.createBodyTemplate();

    return `
      <div class="aionda-panel bg-white dark:bg-gray-800 flex flex-col overflow-hidden ${this.getAdditionalPanelClasses().join(' ')}"
           role="region"
           aria-labelledby="${this.id}-header">
        ${headerTemplate}
        ${bodyTemplate}
      </div>
    `;
  }

  createHeaderTemplate() {
    if (!this.header) return '';

    const collapseButton = this.collapsible ? `
      <button class="aionda-panel-collapse-btn p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" 
              type="button"
              aria-expanded="${!this.collapsed}"
              aria-controls="${this.id}-body"
              aria-label="${this.collapsed ? 'Expand panel' : 'Collapse panel'}">
        <svg class="w-4 h-4 transform transition-transform ${this.collapsed ? '' : 'rotate-90'}" 
             fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    ` : '';

    return `
      <div class="aionda-panel-header flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
           style="height: ${this.headerHeight}px; min-height: ${this.headerHeight}px;"
           id="${this.id}-header">
        <div class="flex items-center gap-2">
          ${collapseButton}
          <h3 class="aionda-panel-title font-medium text-gray-900 dark:text-gray-100">${this.title}</h3>
        </div>
        <div class="aionda-panel-tools flex items-center gap-1">
          <!-- Tools slot -->
        </div>
      </div>
    `;
  }

  createBodyTemplate() {
    const bodyClasses = [
      'aionda-panel-body',
      'transition-all duration-200',
      this.padding ? 'p-4' : '',
      this.collapsed ? 'hidden' : 'block'
    ].filter(Boolean);

    return `
      <div class="${bodyClasses.join(' ')}" 
           style="${this.getBodyStyleString()}"
           id="${this.id}-body"
           aria-hidden="${this.collapsed}">
        <!-- Content will be inserted here -->
      </div>
    `;
  }

  getPanelClasses() {
    const classes = [
      ...this.getBaseClasses(),
      'aionda-panel',
      'bg-white',
      'dark:bg-gray-800',
      'flex',
      'flex-col',
      'overflow-hidden'
    ];

    if (this.border) classes.push('border', 'border-gray-200', 'dark:border-gray-600');
    if (this.shadow) classes.push('shadow-sm');
    if (this.responsive) classes.push('w-full');

    return classes;
  }

  getAdditionalPanelClasses() {
    const classes = [];

    if (this.border) classes.push('border', 'border-gray-200', 'dark:border-gray-600');
    if (this.shadow) classes.push('shadow-sm');
    if (this.responsive) classes.push('w-full');

    return classes;
  }

  getBodyStyleString() {
    return Object.entries(this.bodyStyle)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
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
    
    // Apply styles from Component base class
    if (this.width !== undefined) {
      this.el.style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    }
    
    if (this.height !== undefined) {
      this.el.style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
    }

    Object.assign(this.el.style, this.style);
    
    this.setupEventListeners();

    this.rendered = true;
    this.emit('render');

    return this.el;
  }

  setupEventListeners() {
    super.setupEventListeners();

    this.headerEl = this.el.querySelector('.aionda-panel-header');
    this.bodyEl = this.el.querySelector('.aionda-panel-body');
    this.titleEl = this.el.querySelector('.aionda-panel-title');

    // Add standard component events
    this.el.addEventListener('click', (e) => this.onClick(e));
    this.el.addEventListener('focus', (e) => this.onFocus(e));
    this.el.addEventListener('blur', (e) => this.onBlur(e));

    if (this.collapsible) {
      const collapseEl = this.el.querySelector('.aionda-panel-collapse-btn');
      if (collapseEl) {
        collapseEl.addEventListener('click', () => this.toggleCollapse());
      }
    }

    // Add any initial items to DOM after bodyEl is set
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

    // Initialize menu integration
    if (this.menu) {
      this.setMenu(this.menu);
    }
    if (this.contextMenu) {
      this.setContextMenu(this.contextMenu);
    }
  }

  setTitle(title) {
    this.title = title;
    if (this.titleEl) {
      this.titleEl.textContent = title;
    }
    this.emit('titleChange', { title });
    return this;
  }

  getTitle() {
    return this.title;
  }

  collapse() {
    if (!this.collapsible) return this;
    if (this.collapsed) return this;

    this.collapsed = true;
    
    if (this.bodyEl) {
      this.bodyEl.classList.add('hidden');
      this.bodyEl.classList.remove('block');
      this.bodyEl.setAttribute('aria-hidden', 'true');
    }

    const button = this.el && this.el.querySelector('.aionda-panel-collapse-btn');
    if (button) {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Expand panel');
      
      const icon = button.querySelector('svg');
      if (icon) {
        icon.classList.remove('rotate-90');
      }
    }

    this.emit('collapse');
    return this;
  }

  expand() {
    if (!this.collapsible) return this;
    if (!this.collapsed) return this;

    this.collapsed = false;
    
    if (this.bodyEl) {
      this.bodyEl.classList.remove('hidden');
      this.bodyEl.classList.add('block');
      this.bodyEl.setAttribute('aria-hidden', 'false');
    }

    const button = this.el && this.el.querySelector('.aionda-panel-collapse-btn');
    if (button) {
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Collapse panel');
      
      const icon = button.querySelector('svg');
      if (icon) {
        icon.classList.add('rotate-90');
      }
    }

    this.emit('expand');
    return this;
  }

  toggleCollapse() {
    return this.collapsed ? this.expand() : this.collapse();
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

  setMenu(menu) {
    this.menu = menu;
    if (menu && this.headerEl) {
      const toolsEl = this.headerEl.querySelector('.aionda-panel-tools');
      if (toolsEl && menu.render) {
        const menuEl = menu.render();
        toolsEl.appendChild(menuEl);
      }
    }
    return this;
  }

  getMenu() {
    return this.menu;
  }

  setContextMenu(menu) {
    this.contextMenu = menu;
    if (this.el && menu) {
      this.el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (menu.showAtEvent) {
          menu.showAtEvent(e, this.el);
        }
      });
    }
    return this;
  }

  getContextMenu() {
    return this.contextMenu;
  }

  // Standard event handlers
  onClick(event) {
    this.emit('click', { panel: this, event });
  }

  onFocus(event) {
    this.emit('focus', { panel: this, event });
  }

  onBlur(event) {
    this.emit('blur', { panel: this, event });
  }

  destroy() {
    if (this.menu && this.menu.destroy) {
      this.menu.destroy();
    }
    if (this.contextMenu && this.contextMenu.destroy) {
      this.contextMenu.destroy();
    }
    
    this.items.forEach(item => {
      if (item.destroy && typeof item.destroy === 'function') {
        item.destroy();
      }
    });
    this.items = [];
    super.destroy();
  }
}