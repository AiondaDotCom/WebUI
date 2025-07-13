import fs from 'fs/promises';
import path from 'path';
import doctrine from 'doctrine';

/**
 * Component Parser for extracting documentation from source code
 */
export class ComponentParser {
  constructor() {
    this.components = new Map();
  }

  /**
   * Parse a JavaScript file for component documentation
   * @param {string} filePath - Path to the component file
   * @returns {Object|null} Component metadata or null if no component found
   */
  async parseFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath, '.js');
      
      console.log(`📄 Parsing ${fileName}...`);
      
      // Extract JSDoc comments
      const comments = this.extractJSDocComments(content);
      
      if (comments.length === 0) {
        console.log(`   ⚠️  No JSDoc comments found in ${fileName}`);
        return null;
      }
      
      // Parse component structure
      const component = this.parseComponent(comments, content, filePath);
      
      if (component) {
        console.log(`   ✅ Found component: ${component.name}`);
        return component;
      }
      
      console.log(`   ⚠️  No component documentation found in ${fileName}`);
      return null;
      
    } catch (error) {
      console.error(`   ❌ Error parsing ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Extract JSDoc comment blocks from source code
   * @param {string} content - File content
   * @returns {Array} Array of parsed JSDoc objects
   */
  extractJSDocComments(content) {
    const comments = [];
    const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g;
    let match;

    while ((match = jsdocRegex.exec(content)) !== null) {
      const commentText = match[1];
      
      try {
        const parsed = doctrine.parse(commentText, {
          unwrap: true,
          recoverable: true,
          sloppy: true
        });
        
        // Store original text for context
        parsed.originalText = match[0];
        parsed.startIndex = match.index;
        
        comments.push(parsed);
      } catch (error) {
        console.warn(`   ⚠️  Failed to parse JSDoc comment: ${error.message}`);
      }
    }

    return comments;
  }

  /**
   * Parse component from JSDoc comments and source code
   * @param {Array} comments - Parsed JSDoc comments
   * @param {string} content - Source code content
   * @param {string} filePath - File path for reference
   * @returns {Object|null} Component metadata
   */
  parseComponent(comments, content, filePath) {
    // Find component declaration comment
    const componentComment = comments.find(comment => 
      comment.tags.some(tag => tag.title === 'component')
    );

    if (!componentComment) {
      return null;
    }

    // Extract component metadata
    const component = {
      name: this.extractComponentName(componentComment, content),
      description: componentComment.description || '',
      category: this.extractTag(componentComment, 'category')?.description || 'Components',
      extends: this.extractTag(componentComment, 'extends')?.description || null,
      since: this.extractTag(componentComment, 'since')?.description || '1.0.0',
      filePath: filePath,
      examples: this.extractExamples(componentComment),
      config: this.extractConfig(comments),
      methods: this.extractMethods(comments),
      events: this.extractEvents(comments)
    };

    return component;
  }

  /**
   * Extract component name from JSDoc or class declaration
   * @param {Object} componentComment - Component JSDoc comment
   * @param {string} content - Source code content
   * @returns {string} Component name
   */
  extractComponentName(componentComment, content) {
    // Try to get from @component tag
    const componentTag = this.extractTag(componentComment, 'component');
    if (componentTag?.description) {
      return componentTag.description;
    }

    // Extract from class declaration
    const classMatch = content.match(/class\s+(\w+)\s+extends/);
    if (classMatch) {
      return classMatch[1];
    }

    // Extract from function/class name
    const nameMatch = content.match(/(?:class|function)\s+(\w+)/);
    return nameMatch ? nameMatch[1] : 'Unknown';
  }

  /**
   * Extract configuration properties from comments
   * @param {Array} comments - All JSDoc comments
   * @returns {Array} Configuration properties
   */
  extractConfig(comments) {
    const configProperties = [];

    comments.forEach(comment => {
      // Look for @config tag
      const configTag = comment.tags.find(tag => tag.title === 'config');
      if (!configTag) return;

      // Extract @property tags from the same comment
      const properties = comment.tags.filter(tag => tag.title === 'property');
      
      properties.forEach(prop => {
        const property = {
          name: prop.name || 'unknown',
          type: this.formatType(prop.type),
          description: prop.description || '',
          required: !this.isOptional(prop),
          default: this.extractDefault(prop)
        };

        configProperties.push(property);
      });
    });

    return configProperties;
  }

  /**
   * Extract method documentation
   * @param {Array} comments - All JSDoc comments
   * @returns {Array} Method documentation
   */
  extractMethods(comments) {
    const methods = [];

    comments.forEach(comment => {
      const methodTag = comment.tags.find(tag => tag.title === 'method');
      if (!methodTag) return;

      const method = {
        name: methodTag.description || methodTag.name || 'unknown',
        description: comment.description || '',
        parameters: this.extractParameters(comment),
        returns: this.extractReturns(comment),
        throws: this.extractThrows(comment),
        since: this.extractTag(comment, 'since')?.description || '',
        examples: this.extractExamples(comment),
        deprecated: this.extractTag(comment, 'deprecated') !== null
      };

      methods.push(method);
    });

    return methods;
  }

  /**
   * Extract event documentation
   * @param {Array} comments - All JSDoc comments
   * @returns {Array} Event documentation
   */
  extractEvents(comments) {
    const events = [];

    comments.forEach(comment => {
      const eventTag = comment.tags.find(tag => tag.title === 'event');
      if (!eventTag) return;

      const event = {
        name: eventTag.description || 'unknown',
        description: comment.description || '',
        parameters: this.extractParameters(comment),
        examples: this.extractExamples(comment),
        since: this.extractTag(comment, 'since')?.description || ''
      };

      events.push(event);
    });

    return events;
  }

  /**
   * Extract method parameters
   * @param {Object} comment - JSDoc comment
   * @returns {Array} Method parameters
   */
  extractParameters(comment) {
    return comment.tags
      .filter(tag => tag.title === 'param')
      .map(param => ({
        name: param.name || 'unknown',
        type: this.formatType(param.type),
        description: param.description || '',
        optional: this.isOptional(param),
        default: this.extractDefault(param)
      }));
  }

  /**
   * Extract return type information
   * @param {Object} comment - JSDoc comment
   * @returns {Object|null} Return information
   */
  extractReturns(comment) {
    const returnsTag = comment.tags.find(tag => tag.title === 'returns' || tag.title === 'return');
    if (!returnsTag) return null;

    return {
      type: this.formatType(returnsTag.type),
      description: returnsTag.description || ''
    };
  }

  /**
   * Extract throws information
   * @param {Object} comment - JSDoc comment
   * @returns {Array} Throws information
   */
  extractThrows(comment) {
    return comment.tags
      .filter(tag => tag.title === 'throws' || tag.title === 'throw')
      .map(throwTag => ({
        type: this.formatType(throwTag.type),
        description: throwTag.description || ''
      }));
  }

  /**
   * Extract examples from JSDoc comment
   * @param {Object} comment - JSDoc comment
   * @returns {Array} Examples
   */
  extractExamples(comment) {
    return comment.tags
      .filter(tag => tag.title === 'example')
      .map(example => ({
        title: this.extractExampleTitle(example.description),
        code: this.cleanExampleCode(example.description),
        description: ''
      }));
  }

  /**
   * Extract a specific tag from JSDoc comment
   * @param {Object} comment - JSDoc comment
   * @param {string} tagName - Tag name to find
   * @returns {Object|null} Tag object or null
   */
  extractTag(comment, tagName) {
    return comment.tags.find(tag => tag.title === tagName) || null;
  }

  /**
   * Format type information for display
   * @param {Object} type - Doctrine type object
   * @returns {string} Formatted type string
   */
  formatType(type) {
    if (!type) return 'any';
    
    if (type.type === 'UnionType') {
      return type.elements.map(el => this.formatType(el)).join(' | ');
    }
    
    if (type.type === 'ArrayType') {
      return `${this.formatType(type.elements[0])}[]`;
    }
    
    if (type.type === 'OptionalType') {
      return this.formatType(type.expression);
    }
    
    return type.name || type.type || 'any';
  }

  /**
   * Check if parameter/property is optional
   * @param {Object} param - Parameter object
   * @returns {boolean} True if optional
   */
  isOptional(param) {
    return param.type?.type === 'OptionalType' || 
           (param.name && param.name.startsWith('['));
  }

  /**
   * Extract default value from parameter
   * @param {Object} param - Parameter object
   * @returns {string|null} Default value
   */
  extractDefault(param) {
    if (!param.name) return null;
    
    // Extract default from [param=default] format
    const defaultMatch = param.name.match(/\[.*?=([^\]]+)\]/);
    return defaultMatch ? defaultMatch[1] : null;
  }

  /**
   * Extract title from example description
   * @param {string} description - Example description
   * @returns {string} Example title
   */
  extractExampleTitle(description) {
    const firstLine = description.split('\n')[0];
    if (firstLine.startsWith('//')) {
      return firstLine.replace('//', '').trim();
    }
    return 'Example';
  }

  /**
   * Clean example code by removing comment titles
   * @param {string} description - Example description
   * @returns {string} Cleaned code
   */
  cleanExampleCode(description) {
    const lines = description.split('\n');
    // Remove first line if it's a comment title
    if (lines[0].startsWith('//') && lines.length > 1) {
      return lines.slice(1).join('\n').trim();
    }
    return description.trim();
  }
}