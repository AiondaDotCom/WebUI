const { chromium } = require('playwright');

async function testSimpleWindow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Testing simple window...');
    
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('ERROR:', error.message));
    
    await page.goto('file://' + __dirname + '/test-simple-window.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click test button
    await page.click('#test-btn');
    await page.waitForTimeout(3000);
    
    // Check if window exists
    const windowExists = await page.locator('.aionda-window').isVisible();
    console.log(`Window exists: ${windowExists}`);
    
    if (windowExists) {
      // Click File menu
      const fileMenu = page.locator('.aionda-menubar-item').first();
      await fileMenu.click();
      await page.waitForTimeout(2000);
      
      const dropdownExists = await page.locator('.aionda-menu').isVisible().catch(() => false);
      console.log(`Dropdown exists: ${dropdownExists}`);
      
      if (dropdownExists) {
        console.log('🎉 SUCCESS: Simple MenuBar working!');
        
        // Take screenshot
        await page.screenshot({ path: 'simple-menubar-success.png' });
      }
    }
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Simple test failed:', error);
  } finally {
    await browser.close();
  }
}

testSimpleWindow();