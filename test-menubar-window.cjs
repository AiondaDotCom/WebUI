const { chromium } = require('playwright');

async function testMenuBarWindow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Testing MenuBar Window demo...');
    
    // Navigate to the demo page
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click on Window tab to show window demos
    console.log('📱 Clicking Window tab...');
    await page.click('[data-tab="window"]');
    await page.waitForTimeout(1000);
    
    // Click the MenuBar Window button
    console.log('🪟 Clicking MenuBar Window button...');
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(2000);
    
    // Wait for the window to appear
    await page.waitForSelector('.aionda-window');
    console.log('✅ MenuBar Window opened');
    
    // Wait for MenuBar to be rendered inside the window
    await page.waitForSelector('.aionda-window .aionda-menubar');
    console.log('✅ MenuBar found in window');
    
    // Take screenshot of the window
    const windowElement = page.locator('.aionda-window').last();
    await windowElement.screenshot({ path: 'menubar-window-before-click.png' });
    console.log('📸 Screenshot taken: menubar-window-before-click.png');
    
    // Try to click on File menu IN THE WINDOW (not the main page MenuBar)
    console.log('🔍 Attempting to click File menu in window...');
    const fileMenu = page.locator('.aionda-window .aionda-menubar-item').first();
    
    // Check if File menu is visible and clickable
    const isVisible = await fileMenu.isVisible();
    const isEnabled = await fileMenu.isEnabled();
    console.log(`File menu - Visible: ${isVisible}, Enabled: ${isEnabled}`);
    
    if (isVisible && isEnabled) {
      // Click the File menu
      await fileMenu.click();
      console.log('🖱️ Clicked File menu');
      
      // Wait a moment for dropdown to appear
      await page.waitForTimeout(1000);
      
      // Check if dropdown menu appeared (should be at document level, not in window)
      const dropdown = page.locator('.aionda-menu').last(); // Get the most recent menu
      const dropdownVisible = await dropdown.isVisible();
      console.log(`Dropdown visible: ${dropdownVisible}`);
      
      if (dropdownVisible) {
        console.log('✅ SUCCESS: Dropdown menu appeared!');
        const dropdownCount = await dropdown.count();
        console.log(`Found ${dropdownCount} dropdown menu(s)`);
      } else {
        console.log('❌ PROBLEM: Dropdown menu did not appear');
        
        // Let's inspect what happened
        console.log('🔍 Debugging...');
        
        // Check console errors
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));
        
        // Check if MenuBar in window has the right classes
        const windowMenuBarClasses = await page.locator('.aionda-window .aionda-menubar').getAttribute('class');
        console.log('Window MenuBar classes:', windowMenuBarClasses);
        
        // Check if File menu item has the right attributes
        const fileMenuAttrs = await fileMenu.evaluate(el => ({
          'data-item-index': el.getAttribute('data-item-index'),
          'role': el.getAttribute('role'),
          'aria-haspopup': el.getAttribute('aria-haspopup'),
          'classes': el.className,
          'textContent': el.textContent
        }));
        console.log('File menu attributes:', fileMenuAttrs);
        
        // Check if there are any JavaScript errors or console messages
        const browserLogs = await page.evaluate(() => {
          return window.logHistory || [];
        });
        console.log('Browser logs:', browserLogs);
        
        // Check MenuBar state
        const menuBarState = await page.evaluate(() => {
          const windowMenuBar = document.querySelector('.aionda-window .aionda-menubar');
          if (windowMenuBar && windowMenuBar._component) {
            return {
              menubarMode: windowMenuBar._component.menubarMode,
              focusedItemIndex: windowMenuBar._component.focusedItemIndex,
              activeMenu: !!windowMenuBar._component.activeMenu
            };
          }
          return null;
        });
        console.log('MenuBar state:', menuBarState);
        
        // Try clicking again with force
        console.log('🔄 Trying force click...');
        await fileMenu.click({ force: true });
        await page.waitForTimeout(1000);
        
        const dropdownVisibleAfterForce = await dropdown.isVisible();
        console.log(`Dropdown visible after force click: ${dropdownVisibleAfterForce}`);
      }
      
      // Take screenshot after click
      await windowElement.screenshot({ path: 'menubar-window-after-click.png' });
      console.log('📸 Screenshot taken: menubar-window-after-click.png');
      
    } else {
      console.log('❌ PROBLEM: File menu not visible or not enabled');
    }
    
    // Check for JavaScript errors
    page.on('pageerror', error => {
      console.log('❌ JavaScript Error:', error.message);
    });
    
    // Wait a bit longer to observe
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testMenuBarWindow();