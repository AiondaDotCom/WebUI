const { chromium } = require('playwright');

async function testCompleteMenuBarFix() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Testing complete MenuBar fix...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Click Window tab
    await page.click('[data-tab="window"]');
    await page.waitForTimeout(500);
    
    // Click MenuBar Window button
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(3000);
    
    // Test dropdown functionality
    console.log('🖱️ Testing dropdown functionality...');
    const fileMenuItem = page.locator('.aionda-window .aionda-menubar .aionda-menubar-item').first();
    
    // Click File menu
    await fileMenuItem.click();
    await page.waitForTimeout(1000);
    
    // Check if dropdown appeared
    const dropdown = page.locator('.aionda-window .aionda-menu');
    const dropdownVisible = await dropdown.isVisible().catch(() => false);
    
    console.log(`Dropdown visible: ${dropdownVisible}`);
    
    if (!dropdownVisible) {
      console.log('❌ Dropdown not working - debugging...');
      
      // Debug event handlers
      const debugInfo = await page.evaluate(() => {
        const window = document.querySelector('.aionda-window');
        const menuBar = window.querySelector('.aionda-menubar');
        const fileItem = menuBar.querySelector('.aionda-menubar-item');
        
        return {
          hasComponent: !!menuBar._component,
          fileItemHTML: fileItem.outerHTML.substring(0, 100),
          hasClickListener: fileItem.onclick !== null,
          eventListeners: getEventListeners ? getEventListeners(fileItem) : 'not available'
        };
      });
      
      console.log('Debug info:', debugInfo);
    }
    
    // Test spacing
    console.log('📏 Testing spacing...');
    const spacing = await page.evaluate(() => {
      const window = document.querySelector('.aionda-window');
      const header = window.querySelector('.aionda-window-header') || window.querySelector('[class*="header"]');
      const menuBar = window.querySelector('.aionda-menubar');
      const menuBarContainer = window.querySelector('#window-menubar-container');
      
      let headerBottom = 0;
      if (header) {
        headerBottom = header.getBoundingClientRect().bottom;
      } else {
        // Find the title bar area
        const titleElement = window.querySelector('*');
        for (let el of window.children) {
          if (el.textContent.includes('Application Window with MenuBar')) {
            headerBottom = el.getBoundingClientRect().bottom;
            break;
          }
        }
      }
      
      const menuBarTop = menuBar.getBoundingClientRect().top;
      const containerTop = menuBarContainer.getBoundingClientRect().top;
      
      return {
        headerBottom,
        menuBarTop,
        containerTop,
        gap: menuBarTop - headerBottom,
        containerGap: containerTop - headerBottom
      };
    });
    
    console.log('Spacing measurements:', spacing);
    
    // Test width
    console.log('📐 Testing width...');
    const width = await page.evaluate(() => {
      const window = document.querySelector('.aionda-window');
      const menuBar = window.querySelector('.aionda-menubar');
      const windowInner = window.querySelector('div.flex.flex-col.h-full');
      
      const windowRect = window.getBoundingClientRect();
      const menuBarRect = menuBar.getBoundingClientRect();
      const windowInnerRect = windowInner.getBoundingClientRect();
      
      return {
        window: windowRect.width,
        windowInner: windowInnerRect.width,
        menuBar: menuBarRect.width,
        menuBarLeft: menuBarRect.left,
        windowInnerLeft: windowInnerRect.left,
        leftGap: menuBarRect.left - windowInnerRect.left,
        rightGap: windowInnerRect.right - menuBarRect.right
      };
    });
    
    console.log('Width measurements:', width);
    
    // Take screenshot
    const windowElement = page.locator('.aionda-window').last();
    await windowElement.screenshot({ path: 'menubar-debug-complete.png' });
    console.log('📸 Screenshot saved: menubar-debug-complete.png');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testCompleteMenuBarFix();