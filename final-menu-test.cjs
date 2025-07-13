const { chromium } = require('playwright');

async function finalMenuTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Final menu test with delayed screenshot...');
    
    page.on('console', msg => console.log(`BROWSER:`, msg.text()));
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Switch to window tab manually
    await page.evaluate(() => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('[data-tab="window"]').classList.add('active');
      document.querySelector('#window').classList.add('active');
    });
    
    await page.waitForTimeout(1000);
    
    // Click MenuBar Window button
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(4000);
    
    // Click File menu
    console.log('Clicking File menu...');
    const fileMenu = page.locator('.aionda-window .aionda-menubar-item').first();
    await fileMenu.click();
    
    // Wait longer before taking screenshot
    console.log('Waiting for menu to appear...');
    await page.waitForTimeout(3000);
    
    // Check menu count
    const menuCount = await page.evaluate(() => {
      return document.querySelectorAll('.aionda-menu').length;
    });
    console.log(`Found ${menuCount} menus`);
    
    // Take screenshot immediately after click
    await page.screenshot({ path: 'final-menu-immediate.png', fullPage: true });
    console.log('📸 Immediate screenshot taken');
    
    if (menuCount > 0) {
      console.log('✅ SUCCESS: Menu(s) exist!');
      
      // Test clicking a menu item
      const newDocItem = page.locator('.aionda-menu .aionda-menu-item').first();
      const itemExists = await newDocItem.isVisible().catch(() => false);
      console.log(`First menu item visible: ${itemExists}`);
      
      if (itemExists) {
        console.log('Clicking first menu item...');
        await newDocItem.click();
        await page.waitForTimeout(1000);
        console.log('✅ Menu item clicked successfully');
      }
    } else {
      console.log('❌ No menus found');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Final test failed:', error);
  } finally {
    await browser.close();
  }
}

finalMenuTest();