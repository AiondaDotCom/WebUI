const { chromium } = require('playwright');

async function testMenuBarSpacing() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📏 Testing MenuBar spacing...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Click Window tab
    await page.click('[data-tab="window"]');
    await page.waitForTimeout(500);
    
    // Click MenuBar Window button
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(2000);
    
    // Take screenshot of the spacing
    const windowElement = page.locator('.aionda-window').last();
    await windowElement.screenshot({ path: 'menubar-spacing-test.png' });
    console.log('📸 Screenshot saved: menubar-spacing-test.png');
    
    // Measure the spacing
    const spacing = await page.evaluate(() => {
      const window = document.querySelector('.aionda-window');
      const header = window.querySelector('.aionda-window-header');
      const menuBar = window.querySelector('.aionda-menubar');
      
      if (header && menuBar) {
        const headerRect = header.getBoundingClientRect();
        const menuBarRect = menuBar.getBoundingClientRect();
        
        return {
          headerBottom: headerRect.bottom,
          menuBarTop: menuBarRect.top,
          gap: menuBarRect.top - headerRect.bottom
        };
      }
      return null;
    });
    
    console.log('Spacing measurement:', spacing);
    
    if (spacing && spacing.gap <= 1) {
      console.log('✅ GOOD: Spacing is minimal (≤1px)');
    } else if (spacing && spacing.gap > 1) {
      console.log(`⚠️ SPACING ISSUE: ${spacing.gap}px gap between header and menubar`);
    } else {
      console.log('❌ Could not measure spacing');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testMenuBarSpacing();