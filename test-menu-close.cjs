const { chromium } = require('playwright');

async function testMenuClose() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Testing menu auto-close functionality...');
    
    page.on('console', msg => console.log(`BROWSER:`, msg.text()));
    
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
    
    // Create window
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(3000);
    
    // Test 1: Open File menu
    console.log('1. Opening File menu...');
    await page.click('.aionda-window .aionda-menubar-item:nth-child(1)');
    await page.waitForTimeout(1000);
    
    let menuCount = await page.evaluate(() => document.querySelectorAll('.aionda-menu').length);
    console.log(`File menu opened, menus count: ${menuCount}`);
    
    // Test 2: Click Edit menu (should close File and open Edit)
    console.log('2. Clicking Edit menu...');
    await page.click('.aionda-window .aionda-menubar-item:nth-child(2)');
    await page.waitForTimeout(1000);
    
    menuCount = await page.evaluate(() => document.querySelectorAll('.aionda-menu').length);
    console.log(`After Edit click, menus count: ${menuCount}`);
    
    // Test 3: Click outside to close all menus
    console.log('3. Clicking outside to close menus...');
    await page.click('.aionda-window h3'); // Click on window content
    await page.waitForTimeout(1000);
    
    menuCount = await page.evaluate(() => document.querySelectorAll('.aionda-menu').length);
    console.log(`After outside click, menus count: ${menuCount}`);
    
    // Test 4: Check if menus are actually hidden (not just existing)
    const visibleMenus = await page.evaluate(() => {
      const menus = document.querySelectorAll('.aionda-menu');
      return Array.from(menus).filter(menu => {
        const rect = menu.getBoundingClientRect();
        const styles = window.getComputedStyle(menu);
        return rect.width > 0 && rect.height > 0 && 
               styles.display !== 'none' && 
               styles.visibility !== 'hidden' &&
               styles.opacity !== '0';
      }).length;
    });
    
    console.log(`Visible menus after outside click: ${visibleMenus}`);
    
    if (visibleMenus === 0) {
      console.log('✅ SUCCESS: Menus close properly');
    } else {
      console.log('❌ PROBLEM: Menus are still visible');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'menu-close-test.png', fullPage: true });
    console.log('📸 Screenshot saved');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Menu close test failed:', error);
  } finally {
    await browser.close();
  }
}

testMenuClose();