const { chromium } = require('playwright');
const path = require('path');

async function createRichTextScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Creating RichTextField screenshots...');
    
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1200, height: 800 });
    
    await page.goto('file://' + __dirname + '/screenshot-richtext-demo.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Ensure everything is rendered
    
    console.log('✅ Page loaded');

    // Screenshot 1: Full page overview
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({ 
      path: 'screenshots/richtext-overview.png',
      fullPage: true
    });

    // Screenshot 2: Basic RichTextField with open colorpicker
    console.log('📸 Taking colorpicker demo screenshot...');
    
    // Open colorpicker dropdown
    const colorButton = page.locator('#basic-richtext .aionda-textcolor-btn').first();
    await colorButton.click();
    await page.waitForTimeout(300);
    
    // Take screenshot of just the basic richtext section
    const basicSection = page.locator('.bg-white.rounded-lg.shadow-lg.p-6').first();
    await basicSection.screenshot({ path: 'screenshots/richtext-colorpicker.png' });

    // Screenshot 3: Form integration
    console.log('📸 Taking form integration screenshot...');
    
    // Close colorpicker first
    await page.click('body', { position: { x: 10, y: 10 } });
    await page.waitForTimeout(200);
    
    const formSection = page.locator('.bg-white.rounded-lg.shadow-lg.p-6').nth(1);
    await formSection.screenshot({ path: 'screenshots/richtext-form.png' });

    // Screenshot 4: Custom toolbar
    console.log('📸 Taking custom toolbar screenshot...');
    
    const customSection = page.locator('.bg-white.rounded-lg.shadow-lg.p-6').nth(2);
    await customSection.screenshot({ path: 'screenshots/richtext-custom.png' });

    // Screenshot 5: Mobile view
    console.log('📸 Taking mobile screenshot...');
    
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'screenshots/richtext-mobile.png',
      fullPage: true
    });

    console.log('✅ All RichTextField screenshots created successfully!');
    console.log('📁 Screenshots saved in screenshots/ directory:');
    console.log('   - richtext-overview.png (Full page overview)');
    console.log('   - richtext-colorpicker.png (Colorpicker demo)');
    console.log('   - richtext-form.png (Form integration)');
    console.log('   - richtext-custom.png (Custom toolbar)');
    console.log('   - richtext-mobile.png (Mobile view)');
    
  } catch (error) {
    console.error('❌ Screenshot creation failed:', error);
  } finally {
    await browser.close();
  }
}

createRichTextScreenshots();