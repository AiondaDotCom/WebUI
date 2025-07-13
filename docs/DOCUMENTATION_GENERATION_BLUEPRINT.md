# Documentation Generation Blueprint

## Overview

This document outlines the plan for creating an automated documentation generation system for Aionda WebUI. The system will parse component source code and generate comprehensive Markdown documentation.

## Goals

- **Automated Documentation**: Generate docs from source code comments and structure
- **Consistent Format**: Standardized documentation across all components
- **Live Examples**: Include working code examples in documentation
- **API Reference**: Complete method, property, and event documentation
- **Zero Maintenance**: Documentation updates automatically when code changes

## Architecture

### 1. Documentation Generator Script

**Location**: `scripts/generate-docs.js`

**Command**: `npm run docs:generate`

**Process Flow**:
```
Source Code → Parser → Template Engine → Markdown Files → Static Site
```

### 2. Required Source Code Annotations

Components must include structured JSDoc comments with custom tags:

```javascript
/**
 * @component Button
 * @description A versatile button component with multiple variants and states
 * @category Form Components
 * @example
 * const button = new Button({
 *   text: 'Click Me',
 *   variant: 'primary',
 *   handler: () => alert('Clicked!')
 * });
 * button.renderTo('#container');
 */
class Button extends Component {
  /**
   * @config
   * @property {string} text - Button text content
   * @property {string} variant - Button style variant (primary|secondary|success|warning|danger)
   * @property {boolean} disabled - Whether button is disabled
   * @property {Function} handler - Click event handler
   * @property {string} iconCls - CSS class for button icon
   * @property {number} width - Button width in pixels
   * @property {boolean} loading - Show loading state
   */
  constructor(config = {}) {
    // ...
  }

  /**
   * @method setText
   * @description Updates the button text
   * @param {string} text - New button text
   * @returns {Button} Returns this for method chaining
   * @example
   * button.setText('New Text');
   */
  setText(text) {
    // ...
  }

  /**
   * @event click
   * @description Fired when button is clicked
   * @param {Object} event - Event object
   * @param {Button} event.source - The button component
   * @param {Event} event.domEvent - Original DOM event
   */

  /**
   * @event disable
   * @description Fired when button is disabled
   * @param {Object} event - Event object
   * @param {Button} event.source - The button component
   */
}
```

### 3. Documentation Structure

**Generated Files**:
```
docs/
├── index.md                 # Main documentation homepage
├── getting-started.md       # Quick start guide
├── components/
│   ├── index.md            # Components overview
│   ├── button.md           # Individual component docs
│   ├── panel.md
│   ├── grid.md
│   └── ...
├── api/
│   ├── component.md        # Base Component API
│   ├── store.md            # Store API
│   └── eventemitter.md     # EventEmitter API
├── examples/
│   ├── basic-usage.md      # Basic examples
│   ├── advanced-usage.md   # Advanced examples
│   └── recipes.md          # Common patterns
└── guides/
    ├── theming.md          # Customization guide
    ├── responsive.md       # Responsive design
    └── accessibility.md    # A11y guidelines
```

## Parser Implementation

### 1. Component Discovery

```javascript
// Scan source files
const componentFiles = [
  'src/components/*.js',
  'src/core/*.js'
];

// Extract component metadata
const components = await Promise.all(
  componentFiles.map(parseComponentFile)
);
```

### 2. JSDoc Parsing

**Required Information to Extract**:

- **Component Metadata**:
  - Name, description, category
  - Inheritance hierarchy
  - File location
  - Examples

- **Configuration Properties**:
  - Property name, type, description
  - Default values
  - Required/optional status
  - Validation rules

- **Methods**:
  - Method name, parameters, return type
  - Description and examples
  - Public/private status
  - Deprecation status

- **Events**:
  - Event name, payload structure
  - When fired, conditions
  - Examples of usage

- **Examples**:
  - Working code snippets
  - Live demo references
  - Use case descriptions

### 3. Template Engine

**Handlebars Templates**:

```handlebars
{{!-- component.hbs --}}
# {{name}}

{{description}}

## Configuration

{{#each config}}
### {{name}}
- **Type**: `{{type}}`
- **Default**: `{{default}}`
- **Required**: {{required}}

{{description}}

{{#if example}}
```javascript
{{example}}
```
{{/if}}

{{/each}}

## Methods

{{#each methods}}
### {{name}}({{params}})

{{description}}

**Parameters**:
{{#each parameters}}
- `{{name}}` ({{type}}): {{description}}
{{/each}}

**Returns**: {{returns}}

{{#if example}}
**Example**:
```javascript
{{example}}
```
{{/if}}

{{/each}}

## Events

{{#each events}}
### {{name}}

{{description}}

**Payload**:
```javascript
{
{{#each payload}}
  {{name}}: {{type}} // {{description}}
{{/each}}
}
```

{{/each}}

## Examples

{{#each examples}}
### {{title}}

{{description}}

```javascript
{{code}}
```

{{#if demo}}
[Live Demo]({{demo}})
{{/if}}

{{/each}}
```

## Required Source Code Standards

### 1. JSDoc Comment Format

**Component Declaration**:
```javascript
/**
 * @component ComponentName
 * @extends BaseClass
 * @description Detailed component description
 * @category Component Category
 * @since 1.0.0
 * @example
 * // Basic usage example
 * const comp = new ComponentName({
 *   property: 'value'
 * });
 */
```

**Configuration Properties**:
```javascript
/**
 * @config
 * @property {string} text - Button text content
 * @property {string} [variant='primary'] - Style variant
 * @property {boolean} [disabled=false] - Disabled state
 * @property {Function} handler - Click handler
 * @property {Object} style - Custom CSS styles
 * @property {string} style.color - Text color
 * @property {string} style.backgroundColor - Background color
 */
```

**Methods**:
```javascript
/**
 * @method methodName
 * @description Method description
 * @param {string} param1 - Parameter description
 * @param {Object} [options] - Optional parameters
 * @param {boolean} [options.flag=true] - Option flag
 * @returns {ComponentName} Returns this for chaining
 * @throws {Error} When invalid parameter provided
 * @since 1.2.0
 * @example
 * component.methodName('value', { flag: false });
 */
```

**Events**:
```javascript
/**
 * @event eventName
 * @description When this event is fired
 * @param {Object} event - Event object
 * @param {ComponentName} event.source - Source component
 * @param {*} event.value - Event value
 * @example
 * component.on('eventName', (event) => {
 *   console.log('Event fired:', event.value);
 * });
 */
```

### 2. File Structure Requirements

**Component Files Must Include**:
1. Component class with JSDoc header
2. Constructor with `@config` documentation
3. All public methods with `@method` tags
4. Event documentation with `@event` tags
5. At least one `@example` per component

**Example File Header**:
```javascript
/**
 * @fileoverview Button component implementation
 * @author Aionda WebUI Team
 * @version 1.0.0
 */
```

## Generator Script Structure

### 1. Main Script (`scripts/generate-docs.js`)

```javascript
#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const doctrine = require('doctrine'); // JSDoc parser
const handlebars = require('handlebars');

class DocumentationGenerator {
  constructor(options = {}) {
    this.sourceDir = options.sourceDir || 'src';
    this.outputDir = options.outputDir || 'docs';
    this.templateDir = options.templateDir || 'scripts/templates';
    this.examplesDir = options.examplesDir || 'examples';
  }

  async generate() {
    console.log('🚀 Generating documentation...');
    
    // 1. Discover components
    const components = await this.discoverComponents();
    
    // 2. Parse each component
    const parsedComponents = await this.parseComponents(components);
    
    // 3. Generate documentation files
    await this.generateDocumentationFiles(parsedComponents);
    
    // 4. Generate index and navigation
    await this.generateIndex(parsedComponents);
    
    console.log('✅ Documentation generated successfully!');
  }

  async discoverComponents() {
    // Implementation
  }

  async parseComponents(componentFiles) {
    // Implementation
  }

  async generateDocumentationFiles(components) {
    // Implementation
  }
}

// CLI execution
if (require.main === module) {
  const generator = new DocumentationGenerator();
  generator.generate().catch(console.error);
}

module.exports = DocumentationGenerator;
```

### 2. Parser Module (`scripts/lib/parser.js`)

```javascript
class ComponentParser {
  parseFile(filePath) {
    // Read file content
    // Extract JSDoc comments
    // Parse component structure
    // Return component metadata
  }

  extractJSDocComments(content) {
    // Find /** ... */ comment blocks
    // Parse with doctrine library
    // Extract custom tags
  }

  parseComponent(comments, code) {
    // Extract component info
    // Parse configuration
    // Parse methods
    // Parse events
    // Parse examples
  }
}
```

### 3. Template System (`scripts/templates/`)

**Templates needed**:
- `component.hbs` - Individual component pages
- `index.hbs` - Main documentation index
- `api.hbs` - API reference pages
- `category.hbs` - Component category pages

## Package.json Scripts

```json
{
  "scripts": {
    "docs:generate": "node scripts/generate-docs.js",
    "docs:watch": "nodemon scripts/generate-docs.js --watch src --watch scripts",
    "docs:serve": "http-server docs -p 8080",
    "docs:build": "npm run docs:generate && npm run docs:serve"
  },
  "devDependencies": {
    "doctrine": "^3.0.0",
    "handlebars": "^4.7.8",
    "glob": "^8.1.0",
    "nodemon": "^3.0.0",
    "http-server": "^14.1.1"
  }
}
```

## Implementation Steps

### Phase 1: Basic Generator
1. Create parser for JSDoc comments
2. Build simple template system
3. Generate basic component documentation
4. Test with 2-3 components

### Phase 2: Enhanced Features
1. Add example extraction from demo files
2. Implement cross-referencing
3. Add search functionality
4. Generate API reference

### Phase 3: Advanced Features
1. Live code examples
2. Interactive component playground
3. Visual component gallery
4. Auto-deployment to GitHub Pages

## Quality Assurance

### 1. Validation Rules
- All public methods must have JSDoc
- All configuration properties must be documented
- Each component needs at least one example
- Links between components must be valid

### 2. Testing Strategy
- Unit tests for parser logic
- Integration tests for full generation
- Visual regression tests for generated docs
- CI/CD integration for automatic updates

## Benefits

1. **Always Up-to-Date**: Documentation reflects current code
2. **Consistent Quality**: Standardized format across all components
3. **Developer Friendly**: Easy to maintain with code changes
4. **User Friendly**: Searchable, cross-referenced, with examples
5. **Version Aware**: Can generate docs for different versions

## Future Enhancements

- TypeScript support for better type information
- Visual component browser with live examples
- Interactive API explorer
- Multi-language documentation support
- Integration with component playground
- Automated screenshot generation for visual components

---

**Next Steps**: Review this blueprint and begin implementation of Phase 1.