const { chromium } = require('playwright');

async function debugMenuBarInWindow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Debugging MenuBar in Window...');
    
    // Navigate to the demo page
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click on Window tab
    await page.click('[data-tab="window"]');
    await page.waitForTimeout(1000);
    
    // Click the MenuBar Window button
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(2000);
    
    // Wait for the window and MenuBar
    await page.waitForSelector('.aionda-window .aionda-menubar');
    console.log('✅ Window with MenuBar opened');
    
    // Test MenuBar methods directly
    const debugResult = await page.evaluate(() => {
      const windowMenuBar = document.querySelector('.aionda-window .aionda-menubar');
      const component = windowMenuBar._component;
      
      if (!component) {
        return { error: 'Component not found' };
      }
      
      console.log('Component found:', component);
      
      // Get File menu item
      const fileMenuItem = windowMenuBar.querySelector('[data-item-index="0"]');
      if (!fileMenuItem) {
        return { error: 'File menu item not found' };
      }
      
      console.log('File menu item:', fileMenuItem);
      
      // Check if component has the expected methods
      const methods = {
        onItemClick: typeof component.onItemClick,
        showMenu: typeof component.showMenu,
        setFocusedItemIndex: typeof component.setFocusedItemIndex,
        menuItems: component.menuItems ? component.menuItems.length : 0
      };
      
      console.log('Component methods:', methods);
      
      // Try to trigger click manually
      try {
        // Create a mock event
        const mockEvent = {
          target: fileMenuItem,
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        
        // Call the click handler directly
        if (component.onItemClick) {
          component.onItemClick(mockEvent);
          console.log('Called onItemClick directly');
        }
        
        return {
          success: true,
          methods,
          menuBarMode: component.menubarMode,
          activeMenu: !!component.activeMenu,
          menuItemsCount: component.menuItems.length
        };
        
      } catch (error) {
        return { 
          error: error.message,
          methods,
          stack: error.stack
        };
      }
    });
    
    console.log('Debug result:', debugResult);
    
    // Wait for any dropdown to appear
    await page.waitForTimeout(2000);
    
    // Check if dropdown appeared after direct method call
    const dropdownVisible = await page.locator('.aionda-menu').isVisible();
    console.log(`Dropdown visible after direct method call: ${dropdownVisible}`);
    
    if (dropdownVisible) {
      console.log('✅ SUCCESS: Direct method call worked!');
    } else {
      console.log('❌ Direct method call also failed');
      
      // Let's try to create a menu manually
      const manualMenuResult = await page.evaluate(() => {
        const component = document.querySelector('.aionda-window .aionda-menubar')._component;
        
        if (component && component.menuItems && component.menuItems[0]) {
          const fileMenuItem = component.menuItems[0];
          const fileMenuElement = document.querySelector('.aionda-window [data-item-index="0"]');
          
          console.log('File menu item component:', fileMenuItem);
          console.log('File menu element:', fileMenuElement);
          
          if (fileMenuItem.menu) {
            console.log('File menu has dropdown:', fileMenuItem.menu);
            try {
              component.showMenu(fileMenuItem, fileMenuElement);
              return { success: true, message: 'showMenu called' };
            } catch (error) {
              return { error: error.message, stack: error.stack };
            }
          } else {
            return { error: 'File menu item has no menu property' };
          }
        }
        
        return { error: 'Could not find file menu item' };
      });
      
      console.log('Manual menu result:', manualMenuResult);
    }
    
    // Final screenshot
    const windowElement = page.locator('.aionda-window').last();
    await windowElement.screenshot({ path: 'menubar-debug-final.png' });
    console.log('📸 Final screenshot: menubar-debug-final.png');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugMenuBarInWindow();