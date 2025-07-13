#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Add JSDoc to remaining components
 */

const components = [
  {
    file: 'src/components/Window.js',
    header: `/**
 * @component Window
 * @extends Panel
 * @description A draggable, resizable window component with minimize, maximize, and modal capabilities
 * @category Layout Components
 * @since 1.0.0
 * @example
 * // Modal window with content
 * const window = new Window({
 *   title: 'Settings',
 *   width: 400,
 *   height: 300,
 *   modal: true,
 *   closable: true,
 *   html: '<div class="p-4">Window content</div>'
 * });
 * window.show();
 */`,
    config: `/**
   * @config
   * @property {string} [title=''] - Window title text
   * @property {number} [width=400] - Window width in pixels
   * @property {number} [height=300] - Window height in pixels
   * @property {number} [x=50] - Window x position
   * @property {number} [y=50] - Window y position
   * @property {boolean} [modal=false] - Whether window is modal
   * @property {boolean} [draggable=true] - Whether window can be dragged
   * @property {boolean} [resizable=true] - Whether window can be resized
   * @property {boolean} [closable=true] - Whether window has close button
   * @property {boolean} [minimizable=false] - Whether window can be minimized
   * @property {boolean} [maximizable=false] - Whether window can be maximized
   * @property {boolean} [centered=false] - Whether to center window on screen
   * @property {boolean} [autoShow=true] - Whether to show window automatically
   * @property {string} [html] - HTML content for window body
   * @property {Array} [items=[]] - Child components to add to window
   */`
  },
  {
    file: 'src/components/Menu.js',
    header: `/**
 * @component Menu
 * @extends Component
 * @description A context menu or dropdown menu component with hierarchical items and keyboard navigation
 * @category Navigation Components
 * @since 1.0.0
 * @example
 * // Context menu with items
 * const menu = new Menu({
 *   items: [
 *     { text: 'New', iconCls: 'fas fa-plus', handler: createNew },
 *     { text: 'Open', iconCls: 'fas fa-folder-open', handler: openFile },
 *     '-', // separator
 *     { text: 'Exit', iconCls: 'fas fa-times', handler: exit }
 *   ]
 * });
 */`,
    config: `/**
   * @config
   * @property {Array} [items=[]] - Array of menu items or separators
   * @property {boolean} [floating=true] - Whether menu floats above other content
   * @property {boolean} [shadow=true] - Whether to show drop shadow
   * @property {string} [cls] - Additional CSS classes
   * @property {number} [minWidth=120] - Minimum menu width
   * @property {boolean} [allowOtherMenus=false] - Whether other menus can be open simultaneously
   */`
  },
  {
    file: 'src/components/MenuItem.js',
    header: `/**
 * @component MenuItem
 * @extends Component
 * @description An individual menu item with icon, text, keyboard shortcuts, and submenu support
 * @category Navigation Components
 * @since 1.0.0
 * @example
 * // Menu item with icon and handler
 * const menuItem = new MenuItem({
 *   text: 'Save',
 *   iconCls: 'fas fa-save',
 *   shortcut: 'Ctrl+S',
 *   handler: saveDocument
 * });
 */`,
    config: `/**
   * @config
   * @property {string} [text] - Menu item text
   * @property {string} [iconCls] - CSS class for menu item icon
   * @property {Function} [handler] - Click handler function
   * @property {string} [shortcut] - Keyboard shortcut text to display
   * @property {boolean} [disabled=false] - Whether menu item is disabled
   * @property {boolean} [checked=false] - Whether menu item is checked
   * @property {string} [group] - Group name for radio-style menu items
   * @property {Menu} [menu] - Submenu to show on hover
   * @property {string} [href] - URL for link-style menu items
   */`
  },
  {
    file: 'src/components/MessageBox.js',
    header: `/**
 * @component MessageBox
 * @extends Component
 * @description A modal dialog for displaying messages, confirmations, and prompts to users
 * @category Feedback Components
 * @since 1.0.0
 * @example
 * // Confirmation dialog
 * MessageBox.confirm({
 *   title: 'Confirm Delete',
 *   message: 'Are you sure you want to delete this item?',
 *   buttons: ['Yes', 'No'],
 *   fn: (result) => {
 *     if (result === 'yes') deleteItem();
 *   }
 * });
 */`,
    config: `/**
   * @config
   * @property {string} [title=''] - Dialog title
   * @property {string} [message=''] - Dialog message text
   * @property {Array} [buttons=['OK']] - Array of button labels
   * @property {string} [icon] - Icon to display ('info', 'warning', 'error', 'question')
   * @property {Function} [fn] - Callback function when dialog is closed
   * @property {Object} [scope] - Scope for callback function
   * @property {boolean} [modal=true] - Whether dialog is modal
   * @property {number} [width=300] - Dialog width
   * @property {number} [height] - Dialog height (auto if not specified)
   * @property {boolean} [closable=false] - Whether dialog has close button
   */`
  },
  {
    file: 'src/components/Toast.js',
    header: `/**
 * @component Toast
 * @extends Component
 * @description A non-intrusive notification component that appears temporarily to show status messages
 * @category Feedback Components
 * @since 1.0.0
 * @example
 * // Success notification
 * Toast.show({
 *   message: 'Data saved successfully!',
 *   type: 'success',
 *   duration: 3000,
 *   position: 'top-right'
 * });
 */`,
    config: `/**
   * @config
   * @property {string} message - Toast message text
   * @property {string} [type='info'] - Toast type ('info', 'success', 'warning', 'error')
   * @property {number} [duration=5000] - Duration in milliseconds (0 for permanent)
   * @property {string} [position='top-right'] - Toast position ('top-left', 'top-right', 'bottom-left', 'bottom-right')
   * @property {boolean} [closable=true] - Whether toast has close button
   * @property {string} [iconCls] - Custom icon CSS class
   * @property {Function} [onClick] - Click handler function
   * @property {boolean} [autoHide=true] - Whether toast auto-hides after duration
   */`
  },
  {
    file: 'src/components/Toolbar.js',
    header: `/**
 * @component Toolbar
 * @extends Component
 * @description A container for organizing buttons, separators, and other toolbar items
 * @category Navigation Components
 * @since 1.0.0
 * @example
 * // Toolbar with buttons
 * const toolbar = new Toolbar({
 *   items: [
 *     { text: 'New', iconCls: 'fas fa-plus' },
 *     { text: 'Save', iconCls: 'fas fa-save' },
 *     '-', // separator
 *     { text: 'Print', iconCls: 'fas fa-print' }
 *   ]
 * });
 * toolbar.renderTo('#toolbar');
 */`,
    config: `/**
   * @config
   * @property {Array} [items=[]] - Array of toolbar items (buttons, separators, components)
   * @property {string} [layout='hbox'] - Toolbar layout ('hbox', 'vbox')
   * @property {boolean} [enableOverflow=false] - Whether to handle overflow with menu
   * @property {string} [cls] - Additional CSS classes
   * @property {string} [defaultType='button'] - Default component type for items
   * @property {boolean} [vertical=false] - Whether toolbar is vertical
   */`
  },
  {
    file: 'src/components/Tree.js',
    header: `/**
 * @component Tree
 * @extends Component
 * @description A hierarchical tree component with expand/collapse, selection, and drag-drop capabilities
 * @category Data Components
 * @since 1.0.0
 * @example
 * // File tree with nodes
 * const tree = new Tree({
 *   store: treeStore,
 *   displayField: 'text',
 *   selectionMode: 'single',
 *   checkboxes: true,
 *   dragDrop: true
 * });
 * tree.renderTo('#tree');
 */`,
    config: `/**
   * @config
   * @property {Object} store - Tree data store
   * @property {string} [displayField='text'] - Field to display as node text
   * @property {string} [selectionMode='single'] - Selection mode ('single', 'multi', 'none')
   * @property {boolean} [checkboxes=false] - Whether to show checkboxes
   * @property {boolean} [dragDrop=false] - Whether to enable drag and drop
   * @property {boolean} [animate=true] - Whether to animate expand/collapse
   * @property {boolean} [rootVisible=false] - Whether root node is visible
   * @property {boolean} [lines=true] - Whether to show connecting lines
   * @property {Function} [nodeRenderer] - Custom node rendering function
   */`
  },
  {
    file: 'src/components/DateField.js',
    header: `/**
 * @component DateField
 * @extends Component
 * @description A date input field with calendar picker and date validation
 * @category Utility Components
 * @since 1.0.0
 * @example
 * // Date field with range validation
 * const dateField = new DateField({
 *   fieldLabel: 'Birth Date',
 *   format: 'Y-m-d',
 *   minValue: '1900-01-01',
 *   maxValue: new Date(),
 *   required: true
 * });
 * dateField.renderTo('#container');
 */`,
    config: `/**
   * @config
   * @property {string} [name] - Input name attribute
   * @property {string} [fieldLabel=''] - Label text displayed above field
   * @property {Date|string} [value] - Initial date value
   * @property {string} [format='Y-m-d'] - Date format string
   * @property {Date|string} [minValue] - Minimum allowed date
   * @property {Date|string} [maxValue] - Maximum allowed date
   * @property {boolean} [readOnly=false] - Whether field is read-only
   * @property {boolean} [required=false] - Whether field is required
   * @property {string} [emptyText] - Placeholder text
   * @property {Array} [disabledDays] - Array of disabled day numbers (0-6)
   * @property {Array} [disabledDates] - Array of disabled date strings
   */`
  },
  {
    file: 'src/components/Radio.js',
    header: `/**
 * @component Radio
 * @extends Component
 * @description A radio button component for single selection within a group
 * @category Form Components
 * @since 1.0.0
 * @example
 * // Radio button in a group
 * const radio = new Radio({
 *   fieldLabel: 'Size',
 *   boxLabel: 'Large',
 *   name: 'size',
 *   inputValue: 'large',
 *   checked: false
 * });
 * radio.renderTo('#container');
 */`,
    config: `/**
   * @config
   * @property {string} name - Input name attribute (required for grouping)
   * @property {string} [fieldLabel=''] - Label text displayed above radio
   * @property {string} [boxLabel=''] - Label text displayed next to radio
   * @property {string} inputValue - Value when radio is selected
   * @property {boolean} [checked=false] - Initial checked state
   * @property {boolean} [readOnly=false] - Whether radio is read-only
   * @property {boolean} [disabled=false] - Whether radio is disabled
   * @property {string} [size='md'] - Radio size ('sm', 'md', 'lg')
   */`
  },
  {
    file: 'src/components/RadioGroup.js',
    header: `/**
 * @component RadioGroup
 * @extends Component
 * @description A container for managing a group of radio buttons with single selection
 * @category Form Components
 * @since 1.0.0
 * @example
 * // Radio group with options
 * const radioGroup = new RadioGroup({
 *   fieldLabel: 'Preferred Contact',
 *   items: [
 *     { boxLabel: 'Email', inputValue: 'email' },
 *     { boxLabel: 'Phone', inputValue: 'phone' },
 *     { boxLabel: 'Mail', inputValue: 'mail' }
 *   ],
 *   value: 'email'
 * });
 * radioGroup.renderTo('#container');
 */`,
    config: `/**
   * @config
   * @property {string} [name] - Input name for all radio buttons in group
   * @property {string} [fieldLabel=''] - Label text displayed above group
   * @property {Array} [items=[]] - Array of radio button configurations
   * @property {string} [value] - Selected radio button value
   * @property {boolean} [readOnly=false] - Whether group is read-only
   * @property {boolean} [disabled=false] - Whether group is disabled
   * @property {string} [layout='vertical'] - Layout direction ('vertical', 'horizontal')
   * @property {boolean} [allowBlank=true] - Whether no selection is allowed
   */`
  },
  {
    file: 'src/components/ThemeToggle.js',
    header: `/**
 * @component ThemeToggle
 * @extends Component
 * @description A toggle button for switching between light and dark themes
 * @category Utility Components
 * @since 1.0.0
 * @example
 * // Theme toggle button
 * const themeToggle = new ThemeToggle({
 *   position: 'top-right',
 *   animated: true,
 *   showLabel: true
 * });
 * themeToggle.renderTo('#theme-toggle');
 */`,
    config: `/**
   * @config
   * @property {string} [position='top-right'] - Toggle position on screen
   * @property {boolean} [animated=true] - Whether to animate theme transitions
   * @property {boolean} [showLabel=false] - Whether to show text labels
   * @property {string} [lightIcon='fas fa-sun'] - Icon for light theme
   * @property {string} [darkIcon='fas fa-moon'] - Icon for dark theme
   * @property {string} [size='md'] - Toggle size ('sm', 'md', 'lg')
   * @property {Function} [onChange] - Callback when theme changes
   */`
  }
];

async function addJSDocToFile(filePath, header, config) {
  try {
    console.log(`📝 Processing ${path.basename(filePath)}...`);
    
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Check if file already has @component
    if (content.includes('@component')) {
      console.log(`   ⚠️  ${path.basename(filePath)} already has JSDoc, skipping...`);
      return;
    }
    
    // Add header
    if (header) {
      // Find export class and add header before it
      const classMatch = content.match(/(\/\*\*[\s\S]*?\*\/\s*)?export class (\w+)/);
      if (classMatch) {
        const className = classMatch[2];
        const replacement = `${header}\nexport class ${className}`;
        content = content.replace(classMatch[0], replacement);
      }
    }
    
    // Add config documentation
    if (config) {
      // Find constructor and add config before it
      const constructorMatch = content.match(/(export class \w+ extends \w+ \{[\s\n]*)(constructor\()/);
      if (constructorMatch) {
        const beforeConstructor = constructorMatch[1];
        const constructorStart = constructorMatch[2];
        
        const replacement = `${beforeConstructor}  ${config}\n  ${constructorStart}`;
        content = content.replace(constructorMatch[0], replacement);
      }
    }
    
    await fs.writeFile(filePath, content);
    console.log(`   ✅ Updated ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`   ❌ Error processing ${filePath}:`, error.message);
  }
}

async function processRemainingComponents() {
  console.log('🚀 Adding JSDoc to remaining components...\n');
  
  for (const component of components) {
    await addJSDocToFile(component.file, component.header, component.config);
  }
  
  console.log('\n✅ JSDoc addition for remaining components completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processRemainingComponents().catch(console.error);
}

export default processRemainingComponents;