#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Fix JSDoc examples to use correct AiondaWebUI namespace
 */

const componentFiles = [
  'src/components/Button.js',
  'src/components/Checkbox.js', 
  'src/components/ComboBox.js',
  'src/components/DateField.js',
  'src/components/Form.js',
  'src/components/Grid.js',
  'src/components/Menu.js',
  'src/components/MenuItem.js',
  'src/components/MessageBox.js',
  'src/components/NumberField.js',
  'src/components/Panel.js',
  'src/components/Radio.js',
  'src/components/RadioGroup.js',
  'src/components/TextArea.js',
  'src/components/TextField.js',
  'src/components/ThemeToggle.js',
  'src/components/Toast.js',
  'src/components/Toolbar.js',
  'src/components/Tree.js',
  'src/components/Window.js'
];

async function fixJSDocNamespace(filePath) {
  try {
    console.log(`📝 Processing ${path.basename(filePath)}...`);
    
    let content = await fs.readFile(filePath, 'utf-8');
    
    // Pattern to match JSDoc examples with component instantiation
    const componentName = path.basename(filePath, '.js');
    
    // Fix: new ComponentName( -> new AiondaWebUI.ComponentName(
    const regex = new RegExp(`(\\* .*?)new ${componentName}\\(`, 'g');
    content = content.replace(regex, `$1new AiondaWebUI.${componentName}(`);
    
    // Also fix other common component instantiation patterns in examples
    const commonComponents = [
      'Button', 'TextField', 'Panel', 'Grid', 'Form', 'Menu', 'Window', 
      'ComboBox', 'Checkbox', 'Radio', 'Toast', 'MessageBox', 'Tree',
      'NumberField', 'DateField', 'TextArea', 'Toolbar', 'MenuItem',
      'RadioGroup', 'ThemeToggle'
    ];
    
    commonComponents.forEach(comp => {
      if (comp !== componentName) {
        const compRegex = new RegExp(`(\\* .*?)new ${comp}\\(`, 'g');
        content = content.replace(compRegex, `$1new AiondaWebUI.${comp}(`);
      }
    });
    
    await fs.writeFile(filePath, content);
    console.log(`   ✅ Updated ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`   ❌ Error processing ${filePath}:`, error.message);
  }
}

async function fixAllComponents() {
  console.log('🚀 Fixing JSDoc namespace in component examples...\n');
  
  for (const file of componentFiles) {
    await fixJSDocNamespace(file);
  }
  
  console.log('\n✅ JSDoc namespace fixes completed!');
  console.log('\n📄 Regenerating documentation...');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAllComponents().catch(console.error);
}

export default fixAllComponents;