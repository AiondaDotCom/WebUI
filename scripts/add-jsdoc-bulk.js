#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Bulk JSDoc Addition Script
 * Adds missing JSDoc comments to all components
 */

const components = [
  {
    file: 'src/components/ComboBox.js',
    config: `/**
   * @config
   * @property {string} [name] - Input name attribute
   * @property {string} [fieldLabel=''] - Label text displayed above field
   * @property {Object} [store] - Data store for dropdown options
   * @property {string} [displayField='text'] - Field to display in dropdown
   * @property {string} [valueField='value'] - Field to use as value
   * @property {string} [value] - Initial selected value
   * @property {boolean} [typeAhead=false] - Enable type-ahead functionality
   * @property {boolean} [forceSelection=false] - Force user to select from list
   * @property {string} [queryMode='local'] - Query mode ('local' or 'remote')
   * @property {number} [queryDelay=500] - Delay before triggering remote query
   * @property {number} [minChars=1] - Minimum characters to trigger query
   * @property {string} [emptyText='Select...'] - Placeholder text
   * @property {string} [loadingText='Loading...'] - Loading indicator text
   * @property {Function} [tpl] - Custom template function for dropdown items
   */`
  },
  {
    file: 'src/components/NumberField.js',
    header: `/**
 * @component NumberField
 * @extends Component
 * @description A numeric input field with validation, formatting, and spinner controls
 * @category Form Components
 * @since 1.0.0
 * @example
 * // Number field with validation
 * const numberField = new NumberField({
 *   fieldLabel: 'Age',
 *   value: 25,
 *   minValue: 0,
 *   maxValue: 120,
 *   allowDecimals: false
 * });
 * numberField.renderTo('#container');
 */`,
    config: `/**
   * @config
   * @property {string} [name] - Input name attribute
   * @property {string} [fieldLabel=''] - Label text displayed above field
   * @property {number} [value] - Initial numeric value
   * @property {number} [minValue] - Minimum allowed value
   * @property {number} [maxValue] - Maximum allowed value
   * @property {boolean} [allowDecimals=true] - Whether to allow decimal values
   * @property {boolean} [allowNegative=true] - Whether to allow negative values
   * @property {number} [decimalPrecision=2] - Number of decimal places
   * @property {string} [decimalSeparator='.'] - Character used for decimal separation
   * @property {string} [thousandSeparator=','] - Character used for thousand separation
   * @property {number} [step=1] - Step increment for spinner buttons
   * @property {boolean} [hideTrigger=false] - Whether to hide spinner buttons
   * @property {string} [emptyText] - Placeholder text
   */`
  },
  {
    file: 'src/components/TextArea.js',
    header: `/**
 * @component TextArea
 * @extends Component
 * @description A multi-line text input component with auto-resize and validation capabilities
 * @category Form Components
 * @since 1.0.0
 * @example
 * // Auto-resizing text area
 * const textArea = new TextArea({
 *   fieldLabel: 'Comments',
 *   placeholder: 'Enter your comments...',
 *   autoResize: true,
 *   maxLength: 500
 * });
 * textArea.renderTo('#container');
 */`,
    config: `/**
   * @config
   * @property {string} [name] - Input name attribute
   * @property {string} [fieldLabel=''] - Label text displayed above field
   * @property {string} [value=''] - Initial text value
   * @property {string} [placeholder] - Placeholder text
   * @property {number} [rows=3] - Number of visible rows
   * @property {number} [cols] - Number of visible columns
   * @property {number} [maxLength] - Maximum number of characters
   * @property {boolean} [autoResize=false] - Whether to auto-resize height
   * @property {boolean} [readOnly=false] - Whether field is read-only
   * @property {boolean} [required=false] - Whether field is required
   * @property {string} [resize='vertical'] - Resize behavior ('none', 'both', 'horizontal', 'vertical')
   */`
  },
  {
    file: 'src/components/TextField.js',
    header: `/**
 * @component TextField
 * @extends Component
 * @description A single-line text input field with validation, formatting, and various input types
 * @category Form Components
 * @since 1.0.0
 * @example
 * // Text field with validation
 * const textField = new TextField({
 *   fieldLabel: 'Email',
 *   inputType: 'email',
 *   required: true,
 *   vtype: 'email'
 * });
 * textField.renderTo('#container');
 */`,
    config: `/**
   * @config
   * @property {string} [name] - Input name attribute
   * @property {string} [fieldLabel=''] - Label text displayed above field
   * @property {string} [value=''] - Initial text value
   * @property {string} [inputType='text'] - HTML input type
   * @property {string} [placeholder] - Placeholder text
   * @property {number} [maxLength] - Maximum number of characters
   * @property {number} [minLength] - Minimum number of characters
   * @property {boolean} [readOnly=false] - Whether field is read-only
   * @property {boolean} [required=false] - Whether field is required
   * @property {string} [vtype] - Validation type ('email', 'url', 'alpha', 'alphanum')
   * @property {RegExp} [maskRe] - Regular expression for input masking
   * @property {boolean} [selectOnFocus=false] - Whether to select text on focus
   */`
  },
  {
    file: 'src/components/Grid.js',
    header: `/**
 * @component Grid
 * @extends Component
 * @description An advanced data grid with sorting, filtering, editing, and Excel-like features
 * @category Data Components
 * @since 1.0.0
 * @example
 * // Data grid with features
 * const grid = new Grid({
 *   store: dataStore,
 *   columns: [
 *     { field: 'name', text: 'Name', sortable: true },
 *     { field: 'email', text: 'Email', filterable: true }
 *   ],
 *   selectionMode: 'multi',
 *   editable: true
 * });
 * grid.renderTo('#container');
 */`,
    config: `/**
   * @config
   * @property {Object} store - Data store containing grid data
   * @property {Array} columns - Column configuration array
   * @property {string} [selectionMode='single'] - Selection mode ('single', 'multi', 'none')
   * @property {boolean} [sortable=true] - Whether columns are sortable
   * @property {boolean} [filterable=false] - Whether columns are filterable
   * @property {boolean} [editable=false] - Whether cells are editable
   * @property {boolean} [resizable=true] - Whether columns are resizable
   * @property {boolean} [reorderable=false] - Whether columns can be reordered
   * @property {boolean} [showRowNumbers=false] - Whether to show row numbers
   * @property {number} [pageSize] - Number of rows per page
   * @property {boolean} [autoLoad=true] - Whether to load data automatically
   */`
  },
  {
    file: 'src/components/Form.js',
    header: `/**
 * @component Form
 * @extends Component
 * @description A form container with validation, layout management, and submission handling
 * @category Data Components
 * @since 1.0.0
 * @example
 * // Form with validation
 * const form = new Form({
 *   title: 'User Registration',
 *   layout: 'vertical',
 *   items: [textField, emailField, submitButton],
 *   url: '/api/register'
 * });
 * form.renderTo('#container');
 */`,
    config: `/**
   * @config
   * @property {string} [title] - Form title
   * @property {string} [layout='vertical'] - Form layout ('vertical', 'horizontal', 'inline')
   * @property {Array} [items=[]] - Array of form fields and components
   * @property {string} [url] - Form submission URL
   * @property {string} [method='POST'] - HTTP method for submission
   * @property {Object} [baseParams] - Base parameters to include with submission
   * @property {number} [timeout=30000] - Request timeout in milliseconds
   * @property {boolean} [trackResetOnLoad=false] - Whether to track initial values for reset
   * @property {boolean} [monitorValid=true] - Whether to monitor form validity
   * @property {string} [labelAlign='top'] - Default label alignment for fields
   * @property {number} [labelWidth=120] - Default label width in pixels
   */`
  }
];

async function addJSDocToComponent(componentInfo) {
  try {
    const filePath = componentInfo.file;
    console.log(`📝 Processing ${path.basename(filePath)}...`);
    
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Add header if provided and not already present
    if (componentInfo.header && !content.includes('@component')) {
      // Find the existing class comment or class declaration
      const classMatch = content.match(/(\/\*\*[\s\S]*?\*\/\s*)?export class (\w+)/);
      if (classMatch) {
        const existingComment = classMatch[1] || '';
        const className = classMatch[2];
        
        // Replace existing comment or add before class
        const replacement = `${componentInfo.header}\nexport class ${className}`;
        content = content.replace(classMatch[0], replacement);
      }
    }
    
    // Add config documentation if provided
    if (componentInfo.config) {
      // Find constructor and add config before it
      const constructorMatch = content.match(/(export class \w+ extends \w+ \{[\s\n]*)(constructor\()/);
      if (constructorMatch) {
        const beforeConstructor = constructorMatch[1];
        const constructorStart = constructorMatch[2];
        
        const replacement = `${beforeConstructor}  ${componentInfo.config}\n  ${constructorStart}`;
        content = content.replace(constructorMatch[0], replacement);
      }
    }
    
    await fs.writeFile(filePath, content);
    console.log(`   ✅ Updated ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`   ❌ Error processing ${componentInfo.file}:`, error.message);
  }
}

async function processAllComponents() {
  console.log('🚀 Adding JSDoc to all components...\n');
  
  for (const component of components) {
    await addJSDocToComponent(component);
  }
  
  console.log('\n✅ JSDoc addition completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  processAllComponents().catch(console.error);
}

export default processAllComponents;