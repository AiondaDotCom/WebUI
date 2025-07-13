#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import pkg from 'glob';
const { glob } = pkg;
import handlebars from 'handlebars';
import { ComponentParser } from './lib/parser.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Documentation Generator for Aionda WebUI
 */
class DocumentationGenerator {
  constructor(options = {}) {
    this.sourceDir = options.sourceDir || 'src';
    this.outputDir = options.outputDir || 'docs';
    this.templateDir = options.templateDir || 'scripts/templates';
    this.examplesDir = options.examplesDir || 'examples';
    this.parser = new ComponentParser();
    this.components = [];
    this.categories = new Map();
  }

  /**
   * Generate complete documentation
   */
  async generate() {
    console.log('🚀 Generating Aionda WebUI Documentation...\n');
    
    try {
      // 1. Discover and parse components
      console.log('📋 Discovering components...');
      await this.discoverComponents();
      
      // 2. Parse each component
      console.log('\n🔍 Parsing components...');
      await this.parseComponents();
      
      // 3. Prepare output directory
      console.log('\n📁 Preparing output directory...');
      await this.prepareOutputDirectory();
      
      // 4. Register Handlebars helpers
      this.registerHandlebarsHelpers();
      
      // 5. Generate documentation files
      console.log('\n📝 Generating documentation files...');
      await this.generateComponentDocs();
      
      // 6. Generate index files
      console.log('\n📄 Generating index files...');
      await this.generateIndexFiles();
      
      console.log('\n✅ Documentation generated successfully!');
      console.log(`📁 Output directory: ${this.outputDir}`);
      console.log(`📊 Generated docs for ${this.components.length} components`);
      console.log(`🏷️  Categories: ${Array.from(this.categories.keys()).join(', ')}`);
      
    } catch (error) {
      console.error('\n❌ Documentation generation failed:');
      console.error(error);
      process.exit(1);
    }
  }

  /**
   * Discover component files in source directory
   */
  async discoverComponents() {
    const patterns = [
      `${this.sourceDir}/components/*.js`,
      `${this.sourceDir}/core/*.js`
    ];
    
    this.componentFiles = [];
    
    for (const pattern of patterns) {
      const files = await new Promise((resolve, reject) => {
        glob(pattern, (err, matches) => {
          if (err) reject(err);
          else resolve(matches);
        });
      });
      this.componentFiles.push(...files);
    }
    
    console.log(`   Found ${this.componentFiles.length} potential component files`);
    
    // Filter out test files
    this.componentFiles = this.componentFiles.filter(file => 
      !file.includes('.test.') && !file.includes('.spec.')
    );
    
    console.log(`   ${this.componentFiles.length} files after filtering test files`);
  }

  /**
   * Parse all component files
   */
  async parseComponents() {
    for (const filePath of this.componentFiles) {
      const component = await this.parser.parseFile(filePath);
      
      if (component) {
        this.components.push(component);
        
        // Group by category
        if (!this.categories.has(component.category)) {
          this.categories.set(component.category, []);
        }
        this.categories.get(component.category).push(component);
      }
    }
    
    console.log(`   Successfully parsed ${this.components.length} components`);
    console.log(`   Categories found: ${Array.from(this.categories.keys()).join(', ')}`);
  }

  /**
   * Prepare output directory structure
   */
  async prepareOutputDirectory() {
    const dirs = [
      this.outputDir,
      path.join(this.outputDir, 'components'),
      path.join(this.outputDir, 'api'),
      path.join(this.outputDir, 'examples'),
      path.join(this.outputDir, 'guides')
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
    
    console.log(`   Created directory structure in ${this.outputDir}`);
  }

  /**
   * Register Handlebars helper functions
   */
  registerHandlebarsHelpers() {
    // Truncate text helper
    handlebars.registerHelper('truncate', (text, length) => {
      if (!text || text.length <= length) return text;
      return text.substring(0, length) + '...';
    });
    
    // Create anchor link helper
    handlebars.registerHelper('anchor', (text) => {
      if (!text || typeof text !== 'string') return '';
      return text.toLowerCase().replace(/[^a-z0-9]/g, '-');
    });
    
    // Format timestamp helper
    handlebars.registerHelper('timestamp', () => {
      return new Date().toISOString().split('T')[0];
    });
    
    // Conditional helper
    handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
      switch (operator) {
        case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=': return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==': return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        default: return options.inverse(this);
      }
    });
    
    // toLowerCase helper
    handlebars.registerHelper('toLowerCase', (text) => {
      if (!text || typeof text !== 'string') return '';
      return text.toLowerCase();
    });
  }

  /**
   * Generate individual component documentation files
   */
  async generateComponentDocs() {
    const templatePath = path.join(this.templateDir, 'component.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    
    for (const component of this.components) {
      const fileName = `${component.name.toLowerCase()}.md`;
      const outputPath = path.join(this.outputDir, 'components', fileName);
      
      // Generate relative file path for display
      const relativeFilePath = path.relative(process.cwd(), component.filePath);
      component.filePath = relativeFilePath;
      
      const markdown = template(component);
      await fs.writeFile(outputPath, markdown);
      
      console.log(`   Generated ${fileName}`);
    }
  }

  /**
   * Generate index and overview files
   */
  async generateIndexFiles() {
    await this.generateMainIndex();
    await this.generateComponentsIndex();
  }

  /**
   * Generate main documentation index
   */
  async generateMainIndex() {
    const templatePath = path.join(this.templateDir, 'index.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    
    // Prepare categories data
    const categoriesData = Array.from(this.categories.entries()).map(([name, components]) => ({
      name,
      components: components.map(comp => ({
        name: comp.name,
        description: comp.description
      })),
      anchor: name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }));
    
    const data = {
      categories: categoriesData,
      components: this.components,
      timestamp: new Date().toISOString().split('T')[0],
      version: await this.getVersion(),
      totalComponents: this.components.length
    };
    
    const markdown = template(data);
    const outputPath = path.join(this.outputDir, 'index.md');
    await fs.writeFile(outputPath, markdown);
    
    console.log('   Generated index.md');
  }

  /**
   * Generate components overview index
   */
  async generateComponentsIndex() {
    const templatePath = path.join(this.templateDir, 'components-index.hbs');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    
    // Prepare categories data
    const categoriesData = Array.from(this.categories.entries()).map(([name, components]) => ({
      name,
      components: components.map(comp => ({
        name: comp.name,
        description: comp.description
      }))
    }));
    
    // Create hierarchy data
    const hierarchy = this.components.map(comp => ({
      name: comp.name,
      extends: comp.extends
    }));
    
    const data = {
      components: this.components,
      categories: categoriesData,
      hierarchy
    };
    
    const markdown = template(data);
    const outputPath = path.join(this.outputDir, 'components', 'index.md');
    await fs.writeFile(outputPath, markdown);
    
    console.log('   Generated components/index.md');
  }

  /**
   * Get version from package.json
   */
  async getVersion() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageData = JSON.parse(packageContent);
      return packageData.version || '0.0.0';
    } catch (error) {
      return '0.0.0';
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new DocumentationGenerator();
  generator.generate().catch(console.error);
}

export default DocumentationGenerator;