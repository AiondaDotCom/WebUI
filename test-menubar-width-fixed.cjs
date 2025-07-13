const { chromium } = require('playwright');

async function testMenuBarWidth() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📏 Testing MenuBar width (fixed)...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Click Window tab
    await page.click('[data-tab="window"]');
    await page.waitForTimeout(500);
    
    // Click MenuBar Window button
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(3000);
    
    // Measure MenuBar vs window inner content area
    const measurement = await page.evaluate(() => {
      const window = document.querySelector('.aionda-window');
      const menuBar = window.querySelector('.aionda-menubar');
      const menuBarContainer = window.querySelector('#window-menubar-container');
      const windowInner = window.querySelector('div.flex.flex-col.h-full'); // The main content div
      
      if (!window || !menuBar || !menuBarContainer || !windowInner) {
        return { error: 'Missing elements' };
      }
      
      const windowRect = window.getBoundingClientRect();
      const windowInnerRect = windowInner.getBoundingClientRect();
      const menuBarRect = menuBar.getBoundingClientRect();
      const containerRect = menuBarContainer.getBoundingClientRect();
      
      return {
        window: {
          width: Math.round(windowRect.width),
          left: Math.round(windowRect.left),
          right: Math.round(windowRect.right)
        },
        windowInner: {
          width: Math.round(windowInnerRect.width),
          left: Math.round(windowInnerRect.left),
          right: Math.round(windowInnerRect.right)
        },
        menuBar: {
          width: Math.round(menuBarRect.width),
          left: Math.round(menuBarRect.left),
          right: Math.round(menuBarRect.right)
        },
        container: {
          width: Math.round(containerRect.width),
          left: Math.round(containerRect.left),
          right: Math.round(containerRect.right)
        }
      };
    });
    
    console.log('Width measurements:', measurement);
    
    if (!measurement.error) {
      // Check width alignment
      const menuBarSpansFullWidth = Math.abs(measurement.menuBar.width - measurement.windowInner.width) <= 2;
      const menuBarLeftAligned = Math.abs(measurement.menuBar.left - measurement.windowInner.left) <= 2;
      const menuBarRightAligned = Math.abs(measurement.menuBar.right - measurement.windowInner.right) <= 2;
      
      console.log('\n📊 Analysis:');
      console.log(`Window inner width: ${measurement.windowInner.width}px`);
      console.log(`MenuBar width: ${measurement.menuBar.width}px`);
      console.log(`Container width: ${measurement.container.width}px`);
      
      console.log('\n🎯 Alignment:');
      console.log(`MenuBar left: ${measurement.menuBar.left}px vs Window inner left: ${measurement.windowInner.left}px`);
      console.log(`MenuBar right: ${measurement.menuBar.right}px vs Window inner right: ${measurement.windowInner.right}px`);
      
      if (menuBarSpansFullWidth && menuBarLeftAligned && menuBarRightAligned) {
        console.log('\n✅ PERFECT: MenuBar spans full width and is perfectly aligned!');
      } else if (menuBarSpansFullWidth) {
        console.log('\n✅ GOOD: MenuBar spans full width');
        if (!menuBarLeftAligned) console.log('⚠️ Left alignment issue');
        if (!menuBarRightAligned) console.log('⚠️ Right alignment issue');
      } else {
        const widthGap = measurement.windowInner.width - measurement.menuBar.width;
        console.log(`\n⚠️ WIDTH ISSUE: MenuBar is ${widthGap}px short of full width`);
      }
    } else {
      console.log('❌ Could not measure - missing elements');
    }
    
    // Take final screenshot
    const windowElement = page.locator('.aionda-window').last();
    await windowElement.screenshot({ path: 'menubar-final-width-test.png' });
    console.log('\n📸 Screenshot saved: menubar-final-width-test.png');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testMenuBarWidth();