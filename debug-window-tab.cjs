const { chromium } = require('playwright');

async function debugWindowTab() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Debugging window tab...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click Window tab
    await page.click('[data-tab="window"]');
    await page.waitForTimeout(1000);
    
    // Debug what's in the window tab
    const windowTabContent = await page.evaluate(() => {
      const windowTab = document.querySelector('#window');
      if (windowTab) {
        return {
          exists: true,
          visible: windowTab.style.display !== 'none',
          hasClass: windowTab.className,
          innerHTML: windowTab.innerHTML.substring(0, 500)
        };
      }
      return { exists: false };
    });
    
    console.log('Window tab content:', windowTabContent);
    
    // Look for the button specifically
    const buttonInfo = await page.evaluate(() => {
      const btn = document.querySelector('#menubar-window-btn');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        return {
          exists: true,
          visible: rect.width > 0 && rect.height > 0,
          display: getComputedStyle(btn).display,
          visibility: getComputedStyle(btn).visibility,
          innerHTML: btn.innerHTML,
          rect: rect
        };
      }
      return { exists: false };
    });
    
    console.log('Button info:', buttonInfo);
    
    // Take screenshot of whole page
    await page.screenshot({ path: 'debug-window-tab-full.png' });
    console.log('📸 Full page screenshot saved');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugWindowTab();