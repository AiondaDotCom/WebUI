#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXAMPLES_DIR = path.join(__dirname, '../examples');
const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const EXAMPLE_CONFIGS = [
    {
        path: 'excel-grid/index.html',
        name: 'excel-grid',
        title: 'Excel-like Grid with Advanced Features',
        description: 'Interactive data grid with sorting, filtering, cell editing, column resizing, and row selection',
        viewport: { width: 1200, height: 800 },
        waitFor: 2000
    },
    {
        path: 'form-demo/index.html',
        name: 'form-demo',
        title: 'Comprehensive Form System',
        description: 'Complete form with validation, multiple field types, and real-time event logging',
        viewport: { width: 1000, height: 800 },
        waitFor: 1500
    },
    {
        path: 'comprehensive-showcase/index.html',
        name: 'comprehensive-showcase',
        title: 'Component Showcase',
        description: 'Complete overview of all available UI components and their features',
        viewport: { width: 1200, height: 900 },
        waitFor: 2000
    },
    {
        path: 'dark-mode-demo/index.html',
        name: 'dark-mode-demo',
        title: 'Dark Mode Toggle',
        description: 'Theme switching demonstration with dark and light mode support',
        viewport: { width: 1000, height: 600 },
        waitFor: 1000
    },
    {
        path: 'toolbar-demo/index.html',
        name: 'toolbar-demo',
        title: 'Toolbar Components',
        description: 'Interactive toolbar with buttons, separators, and layout options',
        viewport: { width: 800, height: 400 },
        waitFor: 1000
    },
    {
        path: 'messagebox-toast-demo/index.html',
        name: 'messagebox-toast-demo',
        title: 'MessageBox and Toast Notifications',
        description: 'Modal dialogs and toast notifications with various styles and animations',
        viewport: { width: 1000, height: 600 },
        waitFor: 1000
    },
    {
        path: 'advanced-components/index.html',
        name: 'advanced-components',
        title: 'Advanced UI Components',
        description: 'Complex components including tree views, advanced grids, and specialized inputs',
        viewport: { width: 1200, height: 800 },
        waitFor: 2000
    },
    {
        path: 'basic/index.html',
        name: 'basic-components',
        title: 'Basic Components',
        description: 'Fundamental UI elements including buttons, panels, and basic form controls',
        viewport: { width: 800, height: 600 },
        waitFor: 1000
    }
];

async function generateScreenshots() {
    console.log('🚀 Starting screenshot generation...');
    
    const browser = await chromium.launch();
    const context = await browser.newContext();
    
    const results = [];
    
    for (const config of EXAMPLE_CONFIGS) {
        const htmlPath = path.join(EXAMPLES_DIR, config.path);
        
        // Check if the HTML file exists
        if (!fs.existsSync(htmlPath)) {
            console.log(`⚠️  Skipping ${config.name} - file not found: ${htmlPath}`);
            continue;
        }
        
        console.log(`📸 Capturing ${config.name}...`);
        
        try {
            const page = await context.newPage();
            await page.setViewportSize(config.viewport);
            
            // Load the HTML file
            await page.goto(`file://${htmlPath}`);
            
            // Wait for the page to load and components to render
            await page.waitForTimeout(config.waitFor);
            
            // Take screenshot
            const screenshotPath = path.join(SCREENSHOTS_DIR, `${config.name}.png`);
            await page.screenshot({ 
                path: screenshotPath,
                fullPage: false,
                clip: {
                    x: 0,
                    y: 0,
                    width: config.viewport.width,
                    height: config.viewport.height
                }
            });
            
            await page.close();
            
            results.push({
                ...config,
                screenshotPath: `screenshots/${config.name}.png`,
                screenshotRelativePath: `${config.name}.png`, // For readme-section.md
                success: true
            });
            
            console.log(`✅ ${config.name} screenshot saved`);
            
        } catch (error) {
            console.error(`❌ Failed to capture ${config.name}:`, error.message);
            results.push({
                ...config,
                success: false,
                error: error.message
            });
        }
    }
    
    await browser.close();
    
    // Generate markdown for README injection (uses screenshots/ prefix)
    const markdownSections = results
        .filter(r => r.success)
        .map(config => {
            return `### ${config.title}

![${config.title}](${config.screenshotPath})

${config.description}

**Demo:** [${config.path}](examples/${config.path})`;
        })
        .join('\n\n');
    
    const readmeSection = `## Live Examples

${markdownSections}`;
    
    // Generate markdown for readme-section.md (uses relative paths from screenshots/ dir)
    const readmeSectionMarkdown = results
        .filter(r => r.success)
        .map(config => {
            return `### ${config.title}

![${config.title}](${config.screenshotRelativePath})

${config.description}

**Demo:** [${config.path}](../examples/${config.path})`;
        })
        .join('\n\n');
    
    const readmeSectionContent = `## Live Examples

${readmeSectionMarkdown}`;
    
    // Save the markdown section to a file for manual inspection
    const markdownPath = path.join(__dirname, '../screenshots/readme-section.md');
    fs.writeFileSync(markdownPath, readmeSectionContent);
    
    console.log('\n📋 Summary:');
    console.log(`✅ Successfully captured: ${results.filter(r => r.success).length} screenshots`);
    console.log(`❌ Failed: ${results.filter(r => !r.success).length} screenshots`);
    console.log(`\n📝 README section generated: ${markdownPath}`);
    console.log('\n🔗 Next steps:');
    console.log('1. Review the generated screenshots in the screenshots/ directory');
    console.log('2. Screenshots are now committed to git and linked in README.md');
    console.log('3. Use "git add screenshots/" and commit to include images in repository');
    
    return results;
}

async function updateReadmeAutomatically(readmeSection) {
    const readmePath = path.join(__dirname, '../README.md');
    
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    const newSection = readmeSection; // Use the passed section instead of reading from file
    
    // Find the position to inject the examples section
    // Look for "## Quick Start" and inject before it
    const quickStartIndex = readmeContent.indexOf('## Quick Start');
    
    if (quickStartIndex === -1) {
        console.log('❌ Could not find insertion point in README.md');
        return;
    }
    
    // Check if examples section already exists
    const existingExamplesIndex = readmeContent.indexOf('## Live Examples');
    
    let updatedContent;
    if (existingExamplesIndex !== -1 && existingExamplesIndex < quickStartIndex) {
        // Replace existing section
        const nextSectionIndex = readmeContent.indexOf('\n## ', existingExamplesIndex + 1);
        const endIndex = nextSectionIndex !== -1 ? nextSectionIndex : quickStartIndex;
        
        updatedContent = readmeContent.substring(0, existingExamplesIndex) + 
                        newSection + '\n\n' + 
                        readmeContent.substring(endIndex);
    } else {
        // Insert new section before Quick Start
        updatedContent = readmeContent.substring(0, quickStartIndex) + 
                        newSection + '\n\n' + 
                        readmeContent.substring(quickStartIndex);
    }
    
    fs.writeFileSync(readmePath, updatedContent);
    console.log('✅ README.md updated with screenshots section');
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

if (command === 'update-readme') {
    console.log('❌ Command not supported without running screenshot generation first.');
} else {
    generateScreenshots().then((results) => {
        if (args.includes('--update-readme')) {
            // Generate the correct section for README
            const markdownSections = results
                .filter(r => r.success)
                .map(config => {
                    return `### ${config.title}

![${config.title}](${config.screenshotPath})

${config.description}

**Demo:** [${config.path}](examples/${config.path})`;
                })
                .join('\n\n');
            
            const readmeSection = `## Live Examples

${markdownSections}`;
            
            updateReadmeAutomatically(readmeSection);
        }
    });
}