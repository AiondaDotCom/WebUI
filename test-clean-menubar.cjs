const { chromium } = require('playwright');

async function testCleanMenuBar() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Testing clean MenuBar with component fixes...');
    
    page.on('console', msg => console.log(`BROWSER:`, msg.text()));
    page.on('pageerror', error => console.log('ERROR:', error.message));
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Switch to window tab
    await page.evaluate(() => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('[data-tab="window"]').classList.add('active');
      document.querySelector('#window').classList.add('active');
    });
    
    await page.waitForTimeout(1000);
    
    // Click MenuBar Window button
    console.log('Creating MenuBar window...');
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(3000);
    
    // Click File menu using standard MenuBar functionality
    console.log('Clicking File menu...');
    const fileMenu = page.locator('.aionda-window .aionda-menubar-item').first();
    await fileMenu.click();
    
    await page.waitForTimeout(2000);
    
    // Check if dropdown appeared
    const dropdownExists = await page.locator('.aionda-menu').isVisible().catch(() => false);
    console.log(`Dropdown visible: ${dropdownExists}`);
    
    if (dropdownExists) {
      console.log('✅ SUCCESS: MenuBar dropdown works with component fix!');
      
      // Try clicking a menu item
      const newDocItem = page.locator('.aionda-menu .aionda-menu-item').first();
      const itemClickable = await newDocItem.isVisible().catch(() => false);
      console.log(`Menu item clickable: ${itemClickable}`);
      
      if (itemClickable) {
        console.log('Clicking New Document...');
        await newDocItem.click();
        await page.waitForTimeout(1000);
        console.log('✅ Menu item clicked successfully!');
      }
    } else {
      console.log('❌ Dropdown not visible - component fix might need adjustment');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'clean-menubar-test.png', fullPage: true });
    console.log('📸 Screenshot saved');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Clean test failed:', error);
  } finally {
    await browser.close();
  }
}

testCleanMenuBar();