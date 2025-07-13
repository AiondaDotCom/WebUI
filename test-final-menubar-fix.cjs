const { chromium } = require('playwright');

async function testFinalMenuBarFix() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Testing final MenuBar fix...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Click Window tab
    await page.click('[data-tab="window"]');
    await page.waitForTimeout(500);
    
    // Click MenuBar Window button
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(4000); // Wait longer for event rebinding
    
    console.log('🖱️ Testing dropdown functionality...');
    
    // Click File menu
    const fileMenuItem = page.locator('.aionda-window .aionda-menubar .aionda-menubar-item').first();
    await fileMenuItem.click();
    await page.waitForTimeout(2000);
    
    // Check if dropdown appeared
    const dropdown = page.locator('.aionda-menu').last();
    const dropdownVisible = await dropdown.isVisible().catch(() => false);
    
    console.log(`Dropdown visible: ${dropdownVisible}`);
    
    if (dropdownVisible) {
        console.log('✅ SUCCESS: Dropdown menu is working!');
        
        // Test clicking a menu item
        const newDocItem = page.locator('.aionda-menu .aionda-menu-item').first();
        await newDocItem.click();
        await page.waitForTimeout(1000);
        
        console.log('✅ Menu item click test completed');
    } else {
        console.log('❌ FAIL: Dropdown menu not appearing');
    }
    
    // Test spacing and width
    console.log('📏 Testing spacing and width...');
    const measurements = await page.evaluate(() => {
      const window = document.querySelector('.aionda-window');
      const windowTitle = window.querySelector('.aionda-window-title') || 
                         window.querySelector('[class*="title"]') ||
                         window.querySelector('*[class*="header"]');
      const menuBar = window.querySelector('.aionda-menubar');
      const windowInner = window.querySelector('div.flex.flex-col.h-full');
      
      let titleBottom = 0;
      if (windowTitle) {
        titleBottom = windowTitle.getBoundingClientRect().bottom;
      } else {
        // Look for title text
        const allElements = window.querySelectorAll('*');
        for (let el of allElements) {
          if (el.textContent && el.textContent.includes('Application Window with MenuBar')) {
            titleBottom = el.getBoundingClientRect().bottom;
            break;
          }
        }
      }
      
      const menuBarRect = menuBar.getBoundingClientRect();
      const windowInnerRect = windowInner.getBoundingClientRect();
      
      return {
        titleBottom,
        menuBarTop: menuBarRect.top,
        menuBarLeft: menuBarRect.left,
        menuBarRight: menuBarRect.right,
        menuBarWidth: menuBarRect.width,
        windowInnerLeft: windowInnerRect.left,
        windowInnerRight: windowInnerRect.right,
        windowInnerWidth: windowInnerRect.width,
        verticalGap: menuBarRect.top - titleBottom,
        leftGap: menuBarRect.left - windowInnerRect.left,
        rightGap: windowInnerRect.right - menuBarRect.right,
        widthMatch: Math.abs(menuBarRect.width - windowInnerRect.width) <= 2
      };
    });
    
    console.log('📊 Final measurements:', measurements);
    
    // Analyze results
    const perfectVerticalSpacing = measurements.verticalGap <= 2;
    const perfectWidth = measurements.widthMatch;
    const perfectLeftAlignment = Math.abs(measurements.leftGap) <= 2;
    const perfectRightAlignment = Math.abs(measurements.rightGap) <= 2;
    
    console.log('\n🎯 Final Analysis:');
    console.log(`Vertical spacing: ${measurements.verticalGap}px ${perfectVerticalSpacing ? '✅' : '❌'}`);
    console.log(`Width match: ${measurements.widthMatch ? '✅' : '❌'} (MenuBar: ${measurements.menuBarWidth}px, Window: ${measurements.windowInnerWidth}px)`);
    console.log(`Left alignment: ${measurements.leftGap}px gap ${perfectLeftAlignment ? '✅' : '❌'}`);
    console.log(`Right alignment: ${measurements.rightGap}px gap ${perfectRightAlignment ? '✅' : '❌'}`);
    
    if (dropdownVisible && perfectVerticalSpacing && perfectWidth && perfectLeftAlignment && perfectRightAlignment) {
        console.log('\n🎉 PERFECT SUCCESS: All issues fixed!');
    } else {
        console.log('\n⚠️ Some issues remain:');
        if (!dropdownVisible) console.log('   - Dropdown functionality');
        if (!perfectVerticalSpacing) console.log('   - Vertical spacing');
        if (!perfectWidth) console.log('   - Width alignment');
        if (!perfectLeftAlignment || !perfectRightAlignment) console.log('   - Horizontal alignment');
    }
    
    // Take final screenshot
    const windowElement = page.locator('.aionda-window').last();
    await windowElement.screenshot({ path: 'menubar-final-fix-result.png' });
    console.log('\n📸 Screenshot saved: menubar-final-fix-result.png');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testFinalMenuBarFix();