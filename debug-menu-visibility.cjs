const { chromium } = require('playwright');

async function debugMenuVisibility() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Debugging menu visibility...');
    
    page.on('console', msg => console.log(`BROWSER:`, msg.text()));
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Switch to window tab
    await page.evaluate(() => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('[data-tab="window"]').classList.add('active');
      document.querySelector('#window').classList.add('active');
    });
    
    await page.waitForTimeout(1000);
    
    // Click MenuBar Window button
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(4000);
    
    // Click first menu item
    const firstMenuItem = page.locator('.aionda-window .aionda-menubar-item').first();
    await firstMenuItem.click();
    await page.waitForTimeout(2000);
    
    // Debug the menu that was created
    const menuDebugInfo = await page.evaluate(() => {
      const menus = document.querySelectorAll('.aionda-menu');
      if (menus.length === 0) {
        return { error: 'No menus found' };
      }
      
      const menu = menus[menus.length - 1]; // Get the last created menu
      const rect = menu.getBoundingClientRect();
      const styles = window.getComputedStyle(menu);
      
      return {
        menuCount: menus.length,
        position: {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height
        },
        styles: {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position,
          overflow: styles.overflow
        },
        isVisible: rect.width > 0 && rect.height > 0 && styles.display !== 'none' && styles.visibility !== 'hidden',
        isInViewport: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth,
        className: menu.className,
        innerHTML: menu.innerHTML.substring(0, 200)
      };
    });
    
    console.log('Menu debug info:', menuDebugInfo);
    
    if (menuDebugInfo.menuCount > 0) {
      if (!menuDebugInfo.isVisible) {
        console.log('❌ PROBLEM: Menu exists but is not visible!');
        console.log('Reason: Display, visibility, or size issue');
        
        // Try to make it visible
        await page.evaluate(() => {
          const menu = document.querySelector('.aionda-menu');
          if (menu) {
            menu.style.display = 'block';
            menu.style.visibility = 'visible';
            menu.style.opacity = '1';
            menu.style.zIndex = '9999';
            menu.style.position = 'absolute';
            menu.style.backgroundColor = 'white';
            menu.style.border = '1px solid #ccc';
            menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            menu.style.minWidth = '150px';
            menu.style.padding = '5px';
          }
        });
        
        await page.waitForTimeout(1000);
        console.log('Applied visibility fixes...');
      } else if (!menuDebugInfo.isInViewport) {
        console.log('❌ PROBLEM: Menu is visible but positioned outside viewport!');
        console.log(`Position: top:${menuDebugInfo.position.top}, left:${menuDebugInfo.position.left}`);
        
        // Reposition the menu
        await page.evaluate(() => {
          const menu = document.querySelector('.aionda-menu');
          const menuItem = document.querySelector('.aionda-window .aionda-menubar-item');
          
          if (menu && menuItem) {
            const itemRect = menuItem.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = (itemRect.bottom + 2) + 'px';
            menu.style.left = itemRect.left + 'px';
            menu.style.zIndex = '9999';
          }
        });
        
        await page.waitForTimeout(1000);
        console.log('Repositioned menu...');
      } else {
        console.log('✅ Menu appears to be properly visible and positioned');
      }
      
      // Take screenshot after fixes
      await page.screenshot({ path: 'menu-visibility-debug.png', fullPage: true });
      console.log('📸 Screenshot taken after visibility fixes');
      
      // Check if menu is now visible
      const finalCheck = await page.locator('.aionda-menu').isVisible();
      console.log(`Final visibility check: ${finalCheck}`);
      
    } else {
      console.log('❌ No menus were created at all');
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugMenuVisibility();