const { chromium } = require('playwright');

async function forceMenuVisible() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Force making menu visible...');
    
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
    console.log('Clicking menu item...');
    const firstMenuItem = page.locator('.aionda-window .aionda-menubar-item').first();
    await firstMenuItem.click();
    
    // Wait a bit for menu to be created
    await page.waitForTimeout(1000);
    
    // Force the menu to be visible with extreme styling
    await page.evaluate(() => {
      const menus = document.querySelectorAll('.aionda-menu');
      console.log(`Found ${menus.length} menus`);
      
      menus.forEach((menu, index) => {
        console.log(`Processing menu ${index}:`, menu.className);
        
        // Apply extreme styling to force visibility
        menu.style.cssText = `
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: fixed !important;
          top: 250px !important;
          left: 300px !important;
          z-index: 99999 !important;
          background-color: white !important;
          border: 3px solid red !important;
          box-shadow: 0 0 20px rgba(255,0,0,0.5) !important;
          min-width: 200px !important;
          min-height: 100px !important;
          padding: 10px !important;
          font-size: 16px !important;
          color: black !important;
          pointer-events: auto !important;
          transform: none !important;
          transition: none !important;
        `;
        
        console.log(`Applied styling to menu ${index}`);
      });
      
      // Also check if any are hidden by parent elements
      const windowEl = document.querySelector('.aionda-window');
      if (windowEl) {
        windowEl.style.overflow = 'visible';
        windowEl.style.zIndex = '1000';
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: 'forced-menu-visible.png', fullPage: true });
    console.log('📸 Screenshot with forced menu styling taken');
    
    // Check if any menus are now visible
    const finalVisibility = await page.evaluate(() => {
      const menus = document.querySelectorAll('.aionda-menu');
      return Array.from(menus).map((menu, index) => {
        const rect = menu.getBoundingClientRect();
        return {
          index,
          visible: rect.width > 0 && rect.height > 0,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          },
          styles: {
            display: menu.style.display,
            visibility: menu.style.visibility,
            opacity: menu.style.opacity
          }
        };
      });
    });
    
    console.log('Final menu visibility:', finalVisibility);
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Force test failed:', error);
  } finally {
    await browser.close();
  }
}

forceMenuVisible();