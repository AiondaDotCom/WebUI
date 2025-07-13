const { chromium } = require('playwright');

async function testManualTab() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Manual tab test...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Manually execute tab switching
    await page.evaluate(() => {
      // Remove active from all
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Activate window tab
      const windowTab = document.querySelector('[data-tab="window"]');
      const windowContent = document.querySelector('#window');
      
      if (windowTab && windowContent) {
        windowTab.classList.add('active');
        windowContent.classList.add('active');
        console.log('Manual tab switch executed');
        return true;
      }
      return false;
    });
    
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ path: 'manual-tab-switch.png' });
    
    // Check if button is now visible
    const menuBarBtn = page.locator('#menubar-window-btn');
    const menuBarBtnVisible = await menuBarBtn.isVisible();
    console.log(`MenuBar button visible after manual tab switch: ${menuBarBtnVisible}`);
    
    if (menuBarBtnVisible) {
      console.log('✅ Tab switching worked!');
      
      // Click MenuBar Window button
      await menuBarBtn.click();
      await page.waitForTimeout(4000);
      
      // Check if window appeared
      const window = page.locator('.aionda-window');
      const windowExists = await window.isVisible();
      console.log(`Window appeared: ${windowExists}`);
      
      if (windowExists) {
        // Click File menu
        const fileMenu = page.locator('.aionda-window .aionda-menubar-item').first();
        await fileMenu.click();
        await page.waitForTimeout(2000);
        
        // Check dropdown
        const dropdown = page.locator('.aionda-menu');
        const dropdownVisible = await dropdown.isVisible().catch(() => false);
        console.log(`Dropdown visible: ${dropdownVisible}`);
        
        // Take final screenshot 
        await window.screenshot({ path: 'final-working-menubar.png' });
        console.log('📸 Final screenshot saved');
        
        if (dropdownVisible) {
          console.log('🎉 COMPLETE SUCCESS: MenuBar fully working!');
        } else {
          console.log('⚠️ Dropdown still not working');
        }
      }
    } else {
      console.log('❌ Button still not visible even after manual tab switch');
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Manual test failed:', error);
  } finally {
    await browser.close();
  }
}

testManualTab();