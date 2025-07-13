const { chromium } = require('playwright');

async function testSpacingIsolated() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Testing isolated spacing fix...');
    
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('ERROR:', error.message));
    
    await page.goto('file://' + __dirname + '/spacing-test.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click test button
    await page.click('#test-btn');
    await page.waitForTimeout(4000);
    
    // Check if window exists
    const windowExists = await page.locator('.aionda-window').isVisible();
    console.log(`Window exists: ${windowExists}`);
    
    if (windowExists) {
      // Test menu functionality
      const fileMenu = page.locator('.aionda-menubar-item').first();
      await fileMenu.click();
      await page.waitForTimeout(2000);
      
      const dropdownExists = await page.locator('.aionda-menu').isVisible().catch(() => false);
      console.log(`Dropdown exists: ${dropdownExists}`);
      
      if (dropdownExists) {
        console.log('✅ Menu functionality working');
      }
      
      // Take screenshot for visual verification
      const windowElement = page.locator('.aionda-window').last();
      await windowElement.screenshot({ path: 'spacing-test-result.png' });
      console.log('📸 Screenshot saved: spacing-test-result.png');
      
      // Measure final spacing
      const finalSpacing = await page.evaluate(() => {
        const window = document.querySelector('.aionda-window');
        const windowTitle = window.querySelector('.aionda-window-title');
        const menuBar = window.querySelector('.aionda-menubar');
        
        if (windowTitle && menuBar) {
          const titleRect = windowTitle.getBoundingClientRect();
          const menuBarRect = menuBar.getBoundingClientRect();
          return {
            gap: menuBarRect.top - titleRect.bottom,
            titleBottom: titleRect.bottom,
            menuBarTop: menuBarRect.top
          };
        }
        return null;
      });
      
      if (finalSpacing) {
        console.log(`Final spacing: ${finalSpacing.gap}px`);
        if (Math.abs(finalSpacing.gap) <= 2) {
          console.log('✅ SUCCESS: Spacing is perfect!');
        } else {
          console.log(`⚠️ Spacing issue remains: ${finalSpacing.gap}px gap`);
        }
      }
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSpacingIsolated();