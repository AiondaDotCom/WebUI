const { chromium } = require('playwright');

async function testTabSystem() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Testing tab system...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Debug tabs
    const tabs = await page.evaluate(() => {
      const tabElements = document.querySelectorAll('.nav-tab');
      return Array.from(tabElements).map(tab => ({
        text: tab.textContent.trim(),
        dataTab: tab.getAttribute('data-tab'),
        classes: tab.className
      }));
    });
    
    console.log('Available tabs:', tabs);
    
    // Click the window tab by data-tab attribute
    console.log('Clicking window tab...');
    await page.click('[data-tab="window"]');
    await page.waitForTimeout(1000);
    
    // Take screenshot after correct tab click
    await page.screenshot({ path: 'correct-window-tab.png' });
    
    // Check tab content
    const tabContent = await page.evaluate(() => {
      const windowTabContent = document.querySelector('#window');
      return {
        exists: !!windowTabContent,
        visible: windowTabContent ? !windowTabContent.classList.contains('tab-content') || windowTabContent.classList.contains('active') : false,
        classes: windowTabContent ? windowTabContent.className : 'not found'
      };
    });
    
    console.log('Tab content:', tabContent);
    
    // Now test the MenuBar button
    const menuBarBtn = page.locator('#menubar-window-btn');
    const menuBarBtnVisible = await menuBarBtn.isVisible();
    console.log(`MenuBar button visible: ${menuBarBtnVisible}`);
    
    if (menuBarBtnVisible) {
      await menuBarBtn.click();
      await page.waitForTimeout(4000);
      
      const window = page.locator('.aionda-window');
      const windowExists = await window.isVisible();
      console.log(`Window exists: ${windowExists}`);
      
      if (windowExists) {
        const fileMenu = page.locator('.aionda-window .aionda-menubar-item').first();
        await fileMenu.click();
        await page.waitForTimeout(2000);
        
        const dropdown = page.locator('.aionda-menu');
        const dropdownVisible = await dropdown.isVisible().catch(() => false);
        console.log(`Dropdown visible: ${dropdownVisible}`);
        
        if (dropdownVisible) {
          console.log('🎉 SUCCESS: Everything working!');
        }
      }
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testTabSystem();