const { chromium } = require('playwright');

async function testWindowError() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Testing window creation errors...');
    
    // Listen for console messages and errors
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Switch to window tab
    await page.evaluate(() => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('[data-tab=\"window\"]').classList.add('active');
      document.querySelector('#window').classList.add('active');
    });
    
    await page.waitForTimeout(1000);
    
    // Try to click MenuBar Window button with error handling
    console.log('Clicking MenuBar Window button...');
    await page.click('#menubar-window-btn');
    
    // Wait and check for any windows or errors
    await page.waitForTimeout(5000);
    
    // Check if any windows exist
    const windowCount = await page.evaluate(() => {
      return document.querySelectorAll('.aionda-window').length;
    });
    
    console.log(`Number of windows found: ${windowCount}`);
    
    if (windowCount > 0) {
      console.log('✅ Window was created');
      
      // Test MenuBar functionality
      const firstWindow = page.locator('.aionda-window').first();
      const menuItem = firstWindow.locator('.aionda-menubar-item').first();
      
      console.log('Clicking first menu item...');
      await menuItem.click();
      await page.waitForTimeout(3000);
      
      const dropdownExists = await page.locator('.aionda-menu').isVisible().catch(() => false);
      console.log(`Dropdown appeared: ${dropdownExists}`);
      
      if (dropdownExists) {
        console.log('🎉 SUCCESS: MenuBar dropdown working!');
      } else {
        console.log('❌ Dropdown not working');
      }
      
      // Take final screenshot
      await firstWindow.screenshot({ path: 'window-debug-final.png' });
      console.log('📸 Final window screenshot saved');
      
    } else {
      console.log('❌ No window was created');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testWindowError();