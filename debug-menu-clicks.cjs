const { chromium } = require('playwright');

async function debugMenuClicks() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Debugging MenuBar clicks in detail...');
    
    // Listen to all browser console messages and errors
    page.on('console', msg => {
      console.log(`BROWSER ${msg.type().toUpperCase()}:`, msg.text());
    });
    page.on('pageerror', error => {
      console.log('PAGE ERROR:', error.message);
      console.log('STACK:', error.stack);
    });
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Switch to window tab manually
    await page.evaluate(() => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('[data-tab="window"]').classList.add('active');
      document.querySelector('#window').classList.add('active');
    });
    
    await page.waitForTimeout(1000);
    
    // Click MenuBar Window button
    console.log('Clicking MenuBar Window button...');
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(4000); // Wait longer for initialization
    
    // Check if window exists
    const windowExists = await page.locator('.aionda-window').isVisible();
    console.log(`Window exists: ${windowExists}`);
    
    if (windowExists) {
      // Debug the MenuBar setup
      const menuBarInfo = await page.evaluate(() => {
        const window = document.querySelector('.aionda-window');
        const menuBar = window.querySelector('.aionda-menubar');
        const menuItems = window.querySelectorAll('.aionda-menubar-item');
        
        return {
          hasMenuBar: !!menuBar,
          menuItemCount: menuItems.length,
          menuBarHTML: menuBar ? menuBar.outerHTML.substring(0, 200) : 'not found',
          hasComponent: menuBar ? !!menuBar._component : false,
          firstItemHTML: menuItems[0] ? menuItems[0].outerHTML.substring(0, 100) : 'not found'
        };
      });
      
      console.log('MenuBar info:', menuBarInfo);
      
      if (menuBarInfo.hasMenuBar && menuBarInfo.menuItemCount > 0) {
        console.log('Attempting to click first menu item...');
        
        // Try clicking the first menu item
        const firstMenuItem = page.locator('.aionda-window .aionda-menubar-item').first();
        
        // Check if it's clickable
        const isClickable = await firstMenuItem.isEnabled();
        console.log(`First menu item is clickable: ${isClickable}`);
        
        if (isClickable) {
          await firstMenuItem.click();
          await page.waitForTimeout(2000);
          
          // Check for any menus that appeared
          const menuCount = await page.evaluate(() => {
            return document.querySelectorAll('.aionda-menu').length;
          });
          
          console.log(`Number of menus found after click: ${menuCount}`);
          
          if (menuCount === 0) {
            console.log('❌ NO MENUS APPEARED - debugging event handlers...');
            
            // Check if event listeners exist
            const eventInfo = await page.evaluate(() => {
              const menuItem = document.querySelector('.aionda-window .aionda-menubar-item');
              
              // Try to manually trigger the event handler if it exists
              if (menuItem) {
                // Check if there's a component reference
                const menuBar = document.querySelector('.aionda-window .aionda-menubar');
                const component = menuBar ? menuBar._component : null;
                
                return {
                  hasOnClick: !!menuItem.onclick,
                  hasComponent: !!component,
                  componentType: component ? component.constructor.name : 'none',
                  itemsLength: component ? component.items.length : 0
                };
              }
              return { error: 'No menu item found' };
            });
            
            console.log('Event handler info:', eventInfo);
            
            // Try to manually execute the menu logic
            console.log('Attempting manual menu creation...');
            const manualMenuResult = await page.evaluate(() => {
              try {
                const menuBar = document.querySelector('.aionda-window .aionda-menubar');
                const component = menuBar ? menuBar._component : null;
                
                if (component && component.items && component.items[0]) {
                  const menuConfig = component.items[0];
                  console.log('Menu config:', menuConfig);
                  
                  if (menuConfig.menu && window.AiondaWebUI && window.AiondaWebUI.Menu) {
                    // Create menu manually
                    const menu = new window.AiondaWebUI.Menu({
                      items: menuConfig.menu,
                      contextMenu: true,
                      autoHide: true
                    });
                    
                    menu.render();
                    document.body.appendChild(menu.el);
                    
                    const firstItem = document.querySelector('.aionda-window .aionda-menubar-item');
                    const rect = firstItem.getBoundingClientRect();
                    menu.showAtPosition(rect.left, rect.bottom);
                    
                    return { success: true, menuCreated: true };
                  }
                }
                return { success: false, reason: 'Component or config missing' };
              } catch (error) {
                return { success: false, error: error.message };
              }
            });
            
            console.log('Manual menu result:', manualMenuResult);
            
            // Check again for menus
            await page.waitForTimeout(1000);
            const finalMenuCount = await page.evaluate(() => {
              return document.querySelectorAll('.aionda-menu').length;
            });
            
            console.log(`Final menu count: ${finalMenuCount}`);
            
            if (finalMenuCount > 0) {
              console.log('✅ Manual menu creation worked!');
            } else {
              console.log('❌ Even manual menu creation failed');
            }
          } else {
            console.log('✅ Menus appeared successfully!');
          }
        }
      }
    }
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'menu-debug-detailed.png', fullPage: true });
    console.log('📸 Debug screenshot saved');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugMenuClicks();