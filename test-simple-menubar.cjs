const { chromium } = require('playwright');

async function testSimpleMenuBar() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Simple MenuBar test...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check if Window tab exists and click it
    const windowTab = page.locator('[data-tab="window"]');
    const windowTabExists = await windowTab.isVisible();
    console.log(`Window tab exists: ${windowTabExists}`);
    
    if (windowTabExists) {
      await windowTab.click();
      await page.waitForTimeout(1000);
      
      // Check if MenuBar Window button exists
      const menuBarBtn = page.locator('#menubar-window-btn');
      const menuBarBtnExists = await menuBarBtn.isVisible();
      console.log(`MenuBar button exists: ${menuBarBtnExists}`);
      
      if (menuBarBtnExists) {
        // Click the button
        await menuBarBtn.click();
        await page.waitForTimeout(4000);
        
        // Check if window appeared
        const window = page.locator('.aionda-window');
        const windowExists = await window.isVisible();
        console.log(`Window appeared: ${windowExists}`);
        
        if (windowExists) {
          // Take screenshot
          await window.screenshot({ path: 'menubar-simple-test.png' });
          console.log('📸 Screenshot saved');
          
          // Test menu click
          const fileMenu = page.locator('.aionda-window .aionda-menubar-item').first();
          const fileMenuExists = await fileMenu.isVisible();
          console.log(`File menu exists: ${fileMenuExists}`);
          
          if (fileMenuExists) {
            await fileMenu.click();
            await page.waitForTimeout(2000);
            
            const dropdown = page.locator('.aionda-menu');
            const dropdownVisible = await dropdown.isVisible().catch(() => false);
            console.log(`Dropdown visible: ${dropdownVisible}`);
          }
        }
      }
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Simple test failed:', error);
  } finally {
    await browser.close();
  }
}

testSimpleMenuBar();