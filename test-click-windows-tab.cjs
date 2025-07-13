const { chromium } = require('playwright');

async function testClickWindowsTab() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Testing Windows tab click...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find and click the correct Windows tab
    await page.click('text=Windows');
    await page.waitForTimeout(2000);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'after-windows-tab-click.png' });
    console.log('📸 Screenshot after Windows tab click saved');
    
    // Check if MenuBar button is now visible
    const menuBarBtn = page.locator('#menubar-window-btn');
    const menuBarBtnVisible = await menuBarBtn.isVisible();
    console.log(`MenuBar button visible after tab click: ${menuBarBtnVisible}`);
    
    if (menuBarBtnVisible) {
      console.log('✅ SUCCESS: MenuBar button is now visible');
      
      // Try to click it
      await menuBarBtn.click();
      await page.waitForTimeout(4000);
      
      // Check if window appeared
      const window = page.locator('.aionda-window');
      const windowExists = await window.isVisible();
      console.log(`Window appeared: ${windowExists}`);
      
      if (windowExists) {
        // Test menu functionality
        const fileMenu = page.locator('.aionda-window .aionda-menubar-item').first();
        await fileMenu.click();
        await page.waitForTimeout(2000);
        
        const dropdown = page.locator('.aionda-menu');
        const dropdownVisible = await dropdown.isVisible().catch(() => false);
        console.log(`Dropdown visible: ${dropdownVisible}`);
        
        // Take final screenshot
        await window.screenshot({ path: 'final-menubar-test.png' });
        console.log('📸 Final screenshot saved');
        
        if (dropdownVisible) {
          console.log('🎉 COMPLETE SUCCESS: MenuBar dropdown working!');
        }
      }
    } else {
      console.log('❌ MenuBar button still not visible');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testClickWindowsTab();