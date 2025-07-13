const { chromium } = require('playwright');

async function testHoverBehavior() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Testing MenuBar hover behavior...');
    
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
    
    // Test 1: Click File menu to open it
    console.log('1. Clicking File menu...');
    await page.click('.aionda-window .aionda-menubar-item:nth-child(1)');
    await page.waitForTimeout(1000);
    
    let menuCount = await page.evaluate(() => document.querySelectorAll('.aionda-menu').length);
    console.log(`File menu opened, menus count: ${menuCount}`);
    
    // Test 2: Hover over Edit menu (should switch automatically)
    console.log('2. Hovering over Edit menu...');
    await page.hover('.aionda-window .aionda-menubar-item:nth-child(2)');
    await page.waitForTimeout(1000);
    
    menuCount = await page.evaluate(() => document.querySelectorAll('.aionda-menu').length);
    console.log(`After hover on Edit, menus count: ${menuCount}`);
    
    // Check which menu is visible
    const visibleMenus = await page.evaluate(() => {
      const menus = document.querySelectorAll('.aionda-menu');
      return Array.from(menus).map((menu, index) => {
        const rect = menu.getBoundingClientRect();
        const styles = window.getComputedStyle(menu);
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         styles.display !== 'none' && 
                         styles.visibility !== 'hidden' &&
                         styles.opacity !== '0';
        return {
          index,
          visible: isVisible,
          innerHTML: menu.innerHTML.substring(0, 50)
        };
      }).filter(m => m.visible);
    });
    
    console.log(`Visible menus:`, visibleMenus);
    
    // Test 3: Hover over View menu
    console.log('3. Hovering over View menu...');
    await page.hover('.aionda-window .aionda-menubar-item:nth-child(3)');
    await page.waitForTimeout(1000);
    
    const finalVisibleMenus = await page.evaluate(() => {
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
    
    console.log(`Final visible menus: ${finalVisibleMenus}`);
    
    if (finalVisibleMenus === 1) {
      console.log('✅ SUCCESS: Hover behavior works correctly - only one menu visible');
    } else {
      console.log('❌ PROBLEM: Multiple menus or no menus visible');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'hover-behavior-test.png', fullPage: true });
    console.log('📸 Screenshot saved');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Hover test failed:', error);
  } finally {
    await browser.close();
  }
}

testHoverBehavior();