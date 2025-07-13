#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Add JSDoc to core components
 */

const coreComponents = [
  {
    file: 'src/core/Component.js',
    header: `/**
 * @component Component
 * @extends EventEmitter
 * @description Base component class providing rendering, lifecycle management, and common functionality
 * @category Core Components
 * @since 1.0.0
 * @example
 * // Extending the base component
 * class MyComponent extends Component {
 *   createTemplate() {
 *     return '<div class="my-component">Hello World</div>';
 *   }
 * }
 * const comp = new MyComponent();
 * comp.renderTo('#container');
 */`,
    config: `/**
   * @config
   * @property {string} [id] - Unique component identifier (auto-generated if not provided)
   * @property {string} [cls=''] - Additional CSS classes
   * @property {number|string} [width] - Component width
   * @property {number|string} [height] - Component height
   * @property {boolean} [hidden=false] - Whether component is initially hidden
   * @property {boolean} [disabled=false] - Whether component is disabled
   * @property {boolean} [responsive=true] - Whether component is responsive
   * @property {Object} [style={}] - Inline CSS styles
   * @property {string} [locale] - Component locale for internationalization
   * @property {string|Element} [renderTo] - Target element for automatic rendering
   */`
  },
  {
    file: 'src/core/EventEmitter.js',
    header: `/**
 * @component EventEmitter
 * @description Event system providing observer pattern functionality with debugging and validation
 * @category Core Components
 * @since 1.0.0
 * @example
 * // Using EventEmitter
 * const emitter = new EventEmitter();
 * emitter.on('dataChange', (data) => console.log(data));
 * emitter.emit('dataChange', { value: 'new data' });
 */`
  },
  {
    file: 'src/core/Store.js',
    header: `/**
 * @component Store
 * @extends EventEmitter
 * @description Data management class with filtering, sorting, and remote loading capabilities
 * @category Core Components
 * @since 1.0.0
 * @example
 * // Creating a data store
 * const store = new Store({
 *   data: [
 *     { id: 1, name: 'John', age: 30 },
 *     { id: 2, name: 'Jane', age: 25 }
 *   ],
 *   sorters: [{ property: 'name', direction: 'ASC' }]
 * });
 */`,
    config: `/**
   * @config
   * @property {Array} [data=[]] - Initial data array
   * @property {Object} [proxy] - Remote data proxy configuration
   * @property {boolean} [autoLoad=false] - Whether to load data automatically
   * @property {Array} [sorters=[]] - Initial sorting configuration
   * @property {Array} [filters=[]] - Initial filtering configuration
   */`
  },
  {
    file: 'src/core/I18n.js',
    header: `/**
 * @component I18n
 * @extends EventEmitter
 * @description Internationalization class providing translation, formatting, and locale management
 * @category Core Components
 * @since 1.0.0
 * @example
 * // Using I18n for translations
 * const i18n = I18n.getInstance();
 * i18n.setLocale('de');
 * const message = i18n.t('common.save'); // Returns translated text
 */`,
    config: `/**
   * @config
   * @property {string} [locale] - Initial locale (auto-detected if not provided)
   * @property {string} [fallbackLocale='en'] - Fallback locale for missing translations
   */`
  },
  {
    file: 'src/core/SecurityUtils.js',
    header: `/**
 * @component SecurityUtils
 * @description Security utilities for input sanitization, XSS prevention, and safe operations
 * @category Core Components
 * @since 1.0.0
 * @example
 * // Sanitizing user input
 * const safe = SecurityUtils.escapeHtml(userInput);
 * const cleanHtml = SecurityUtils.sanitizeHtml(htmlContent);
 */`
  },
  {
    file: 'src/utils/ThemeManager.js',
    header: `/**
 * @component ThemeManager
 * @description Theme management system for handling light/dark mode and custom themes
 * @category Core Components
 * @since 1.0.0
 * @example
 * // Managing themes
 * const themeManager = ThemeManager.getInstance();
 * themeManager.setTheme('dark');
 * themeManager.toggleTheme();
 */`
  }
];

async function addJSDocToFile(filePath, header, config = null) {
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
      // For classes, find the class declaration
      const classMatch = content.match(/(\/\*\*[\s\S]*?\*\/\s*)?(export\s+)?class\s+(\w+)/);
      if (classMatch) {
        const exportKeyword = classMatch[2] || '';
        const className = classMatch[3];
        const replacement = `${header}\n${exportKeyword}class ${className}`;
        content = content.replace(classMatch[0], replacement);
        
        // Add config if provided
        if (config) {
          const constructorMatch = content.match(/(class \w+[^{]*\{[\s\n]*)(constructor\()/);
          if (constructorMatch) {
            const beforeConstructor = constructorMatch[1];
            const constructorStart = constructorMatch[2];
            
            const replacement = `${beforeConstructor}  ${config}\n  ${constructorStart}`;
            content = content.replace(constructorMatch[0], replacement);
          }
        }
      }
    }
    
    await fs.writeFile(filePath, content);
    console.log(`   ✅ Updated ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`   ❌ Error processing ${filePath}:`, error.message);
  }
}

async function processCoreComponents() {
  console.log('🚀 Adding JSDoc to core components...\n');
  
  for (const component of coreComponents) {
    await addJSDocToFile(component.file, component.header, component.config);
  }
  
  console.log('\n✅ JSDoc addition for core components completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processCoreComponents().catch(console.error);
}

export default processCoreComponents;