#!/usr/bin/env node

/**
 * Simple build script to bundle Aionda WebUI for browser use
 * Takes ES6 modules and creates a single UMD bundle
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read all source files - dynamically include components that exist
const coreFiles = {
  'core/EventEmitter.js': fs.readFileSync(path.join(srcDir, 'core/EventEmitter.js'), 'utf8'),
  'core/SecurityUtils.js': fs.readFileSync(path.join(srcDir, 'core/SecurityUtils.js'), 'utf8'),
  'core/I18n.js': fs.readFileSync(path.join(srcDir, 'core/I18n.js'), 'utf8'),
  'core/Component.js': fs.readFileSync(path.join(srcDir, 'core/Component.js'), 'utf8'),
  'core/Store.js': fs.readFileSync(path.join(srcDir, 'core/Store.js'), 'utf8'),
  'core/ThemeManager.js': fs.readFileSync(path.join(srcDir, 'core/ThemeManager.js'), 'utf8'),
  'utils/BrowserCompat.js': fs.readFileSync(path.join(srcDir, 'utils/BrowserCompat.js'), 'utf8')
};

const componentFiles = {};
const componentNames = [
  'Panel', 'Button', 'Grid', 'Form', 'TextField', 'NumberField', 'ComboBox', 'Checkbox',
  'Tree', 'Menu', 'MenuItem', 'MenuBar', 'Toolbar', 'Window', 'MessageBox', 'Toast', 
  'DateField', 'TextArea', 'RadioGroup', 'Radio', 'ThemeToggle', 'RichTextField'
];

// Only include components that actually exist
componentNames.forEach(name => {
  const filePath = path.join(srcDir, 'components', `${name}.js`);
  if (fs.existsSync(filePath)) {
    componentFiles[`components/${name}.js`] = fs.readFileSync(filePath, 'utf8');
  }
});

const files = { ...coreFiles, ...componentFiles };

// Simple module bundler - removes imports/exports and wraps in IIFE
function bundleModules(files) {
  let bundle = `
/**
 * Aionda WebUI - A modern, mobile-first WebUI library
 * Version: 0.1.0
 * License: MIT
 * 
 * Simple <script> tag usage:
 * <script src="https://cdn.jsdelivr.net/npm/@aionda/webui@latest/dist/aionda-webui.js"></script>
 */

(function(global) {
  'use strict';

`;

  // Process each file
  Object.entries(files).forEach(([fileName, content]) => {
    console.log(`Processing ${fileName}...`);
    
    // Remove import statements and export statements
    let processedContent = content
      .replace(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/import\s+\w+\s+from\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/export\s+{[^}]+};\s*/g, '')
      .replace(/export\s+(class|function|const|let|var)\s+/g, '$1 ')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '');

    // Add comment header for each module
    bundle += `  // === ${fileName} ===\n`;
    bundle += processedContent + '\n\n';
  });

  // Generate dynamic exports based on available components
  const availableComponents = componentNames.filter(name => 
    fs.existsSync(path.join(srcDir, 'components', `${name}.js`))
  );
  
  const componentExports = availableComponents.map(name => `    ${name},`).join('\n');
  
  // Add the main export object
  bundle += `
  // Export to global namespace
  const AiondaWebUI = {
    // Core classes
    EventEmitter,
    Component,
    Store,
    ThemeManager,
    
    // Global theme manager instance
    themeManager,
    
    // Available Components
${componentExports}
    
    // Utilities
    version: '0.2.0',
    
    // Create method for convenience
    create(componentClass, config) {
      return new componentClass(config);
    }
  };

  // Make available globally
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AiondaWebUI;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return AiondaWebUI; });
  } else {
    global.AiondaWebUI = AiondaWebUI;
    // Backwards compatibility
    global.TypeUI = AiondaWebUI;
  }

})(typeof window !== 'undefined' ? window : this);
`;

  return bundle;
}

// Generate the bundle
console.log('Building Aionda WebUI...');
const bundledCode = bundleModules(files);

// Copy CSS file to dist
const cssSourcePath = path.join(srcDir, 'styles.css');
const cssOutputPath = path.join(distDir, 'aionda-webui.css');
if (fs.existsSync(cssSourcePath)) {
  fs.copyFileSync(cssSourcePath, cssOutputPath);
  console.log(`✅ CSS copied: ${cssOutputPath}`);
}

// Write to dist directory
const outputPath = path.join(distDir, 'aionda-webui.js');
fs.writeFileSync(outputPath, bundledCode);

console.log(`✅ Build complete! Generated: ${outputPath}`);
console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

// Create minified version (simple minification)
const minifiedCode = bundledCode
  .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
  .replace(/\/\/.*$/gm, '') // Remove line comments
  .replace(/\s+/g, ' ') // Collapse whitespace
  .replace(/;\s*}/g, ';}') // Remove unnecessary semicolons
  .trim();

const minOutputPath = path.join(distDir, 'aionda-webui.min.js');
fs.writeFileSync(minOutputPath, minifiedCode);

console.log(`✅ Minified version: ${minOutputPath}`);
console.log(`📦 Minified size: ${(fs.statSync(minOutputPath).size / 1024).toFixed(1)} KB`);

// Auto-copy to TrashMail static directory if it exists
const trashMailStaticDir = path.join(__dirname, '../../static/js/aionda-webui');
if (fs.existsSync(trashMailStaticDir)) {
  try {
    fs.copyFileSync(outputPath, path.join(trashMailStaticDir, 'aionda-webui.js'));
    fs.copyFileSync(minOutputPath, path.join(trashMailStaticDir, 'aionda-webui.min.js'));
    fs.copyFileSync(path.join(distDir, 'aionda-webui.css'), path.join(trashMailStaticDir, 'aionda-webui.css'));
    console.log(`✅ Auto-copied to TrashMail static directory: ${trashMailStaticDir}`);
  } catch (err) {
    console.warn(`⚠️  Could not auto-copy to static directory: ${err.message}`);
  }
}

console.log('\n🚀 Ready to use:');
console.log(`<script src="dist/aionda-webui.js"></script>`);
console.log(`<script src="dist/aionda-webui.min.js"></script>`);