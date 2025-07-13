const { chromium } = require('playwright');

async function debugMenuBarWidth() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Debugging MenuBar elements...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Click Window tab
    await page.click('[data-tab="window"]');
    await page.waitForTimeout(500);
    
    // Click MenuBar Window button
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(3000); // Wait longer for window to fully initialize
    
    // Debug what elements exist
    const elements = await page.evaluate(() => {
      const window = document.querySelector('.aionda-window');
      const windowContent = window ? window.querySelector('.aionda-window-content') : null;
      const menuBar = window ? window.querySelector('.aionda-menubar') : null;
      const menuBarContainer = window ? window.querySelector('#window-menubar-container') : null;
      
      return {
        hasWindow: !!window,
        hasWindowContent: !!windowContent,
        hasMenuBar: !!menuBar,
        hasMenuBarContainer: !!menuBarContainer,
        windowClass: window ? window.className : null,
        menuBarClass: menuBar ? menuBar.className : null,
        containerClass: menuBarContainer ? menuBarContainer.className : null
      };
    });
    
    console.log('Elements found:', elements);
    
    if (elements.hasWindow && elements.hasMenuBar) {
      // Get more detailed measurements
      const measurement = await page.evaluate(() => {
        const window = document.querySelector('.aionda-window');
        const windowContent = window.querySelector('.aionda-window-content');
        const menuBar = window.querySelector('.aionda-menubar');
        const menuBarContainer = window.querySelector('#window-menubar-container');
        
        const windowRect = window.getBoundingClientRect();
        const windowContentRect = windowContent.getBoundingClientRect();
        const menuBarRect = menuBar.getBoundingClientRect();
        const containerRect = menuBarContainer.getBoundingClientRect();
        
        return {
          window: {
            width: Math.round(windowRect.width),
            left: Math.round(windowRect.left),
            right: Math.round(windowRect.right)
          },
          windowContent: {
            width: Math.round(windowContentRect.width),
            left: Math.round(windowContentRect.left),
            right: Math.round(windowContentRect.right)
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
      
      console.log('Detailed measurements:', measurement);
      
      // Check if MenuBar spans full width
      const menuBarSpansFullWidth = Math.abs(measurement.menuBar.width - measurement.windowContent.width) <= 2;
      const containerSpansFullWidth = Math.abs(measurement.container.width - measurement.windowContent.width) <= 2;
      
      console.log('\n📊 Width Analysis:');
      console.log(`Window content width: ${measurement.windowContent.width}px`);
      console.log(`MenuBar width: ${measurement.menuBar.width}px`);
      console.log(`Container width: ${measurement.container.width}px`);
      
      if (menuBarSpansFullWidth) {
        console.log('✅ MenuBar spans full width!');
      } else {
        console.log(`⚠️ MenuBar is ${measurement.windowContent.width - measurement.menuBar.width}px short of full width`);
      }
      
      if (containerSpansFullWidth) {
        console.log('✅ Container spans full width!');
      } else {
        console.log(`⚠️ Container is ${measurement.windowContent.width - measurement.container.width}px short of full width`);
      }
    }
    
    // Take screenshot
    const windowElement = page.locator('.aionda-window').last();
    await windowElement.screenshot({ path: 'menubar-width-debug.png' });
    console.log('📸 Screenshot saved: menubar-width-debug.png');
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugMenuBarWidth();