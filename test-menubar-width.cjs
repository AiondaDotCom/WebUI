const { chromium } = require('playwright');

async function testMenuBarWidth() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📏 Testing MenuBar width...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Click Window tab
    await page.click('[data-tab="window"]');
    await page.waitForTimeout(500);
    
    // Click MenuBar Window button
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(2000);
    
    // Take screenshot of the MenuBar
    const windowElement = page.locator('.aionda-window').last();
    await windowElement.screenshot({ path: 'menubar-width-test.png' });
    console.log('📸 Screenshot saved: menubar-width-test.png');
    
    // Measure the MenuBar width vs window width
    const widthMeasurement = await page.evaluate(() => {
      const window = document.querySelector('.aionda-window');
      const windowContent = window.querySelector('.aionda-window-content');
      const menuBar = window.querySelector('.aionda-menubar');
      const menuBarContainer = window.querySelector('#window-menubar-container');
      
      if (window && windowContent && menuBar && menuBarContainer) {
        const windowRect = window.getBoundingClientRect();
        const windowContentRect = windowContent.getBoundingClientRect();
        const menuBarRect = menuBar.getBoundingClientRect();
        const containerRect = menuBarContainer.getBoundingClientRect();
        
        return {
          windowWidth: Math.round(windowRect.width),
          windowContentWidth: Math.round(windowContentRect.width),
          menuBarWidth: Math.round(menuBarRect.width),
          containerWidth: Math.round(containerRect.width),
          menuBarLeft: Math.round(menuBarRect.left),
          menuBarRight: Math.round(menuBarRect.right),
          windowContentLeft: Math.round(windowContentRect.left),
          windowContentRight: Math.round(windowContentRect.right)
        };
      }
      return null;
    });
    
    console.log('Width measurement:', widthMeasurement);
    
    if (widthMeasurement) {
      const menuBarSpansFullWidth = Math.abs(widthMeasurement.menuBarWidth - widthMeasurement.windowContentWidth) <= 2;
      const menuBarAligned = Math.abs(widthMeasurement.menuBarLeft - widthMeasurement.windowContentLeft) <= 2 && 
                             Math.abs(widthMeasurement.menuBarRight - widthMeasurement.windowContentRight) <= 2;
      
      if (menuBarSpansFullWidth && menuBarAligned) {
        console.log('✅ PERFECT: MenuBar spans full width and is properly aligned!');
        console.log(`   MenuBar: ${widthMeasurement.menuBarWidth}px width`);
        console.log(`   Window content: ${widthMeasurement.windowContentWidth}px width`);
      } else if (menuBarSpansFullWidth) {
        console.log('✅ GOOD: MenuBar spans full width');
        console.log(`⚠️ ALIGNMENT: MenuBar alignment might be off`);
        console.log(`   MenuBar left: ${widthMeasurement.menuBarLeft}px, right: ${widthMeasurement.menuBarRight}px`);
        console.log(`   Window content left: ${widthMeasurement.windowContentLeft}px, right: ${widthMeasurement.windowContentRight}px`);
      } else {
        console.log(`⚠️ WIDTH ISSUE: MenuBar width is ${widthMeasurement.menuBarWidth}px but should be ${widthMeasurement.windowContentWidth}px`);
        console.log(`   Gap: ${widthMeasurement.windowContentWidth - widthMeasurement.menuBarWidth}px`);
      }
    } else {
      console.log('❌ Could not measure MenuBar width');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testMenuBarWidth();