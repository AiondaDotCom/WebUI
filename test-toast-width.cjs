const { chromium } = require('playwright');

async function testToastWidth() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the comprehensive showcase
    await page.goto('http://localhost:8080/examples/comprehensive-showcase/index.html');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Navigate to feedback components tab
    await page.click('#tabDialog');
    await page.waitForTimeout(1000);
    
    // Find and click the toast test button
    await page.click('button:has-text("Show Toast")');
    
    // Wait for toast to appear
    await page.waitForSelector('.aionda-toast-container', { timeout: 5000 });
    
    // Get toast element and measure its width
    const toast = await page.locator('.aionda-toast-container > div').first();
    const boundingBox = await toast.boundingBox();
    
    console.log('Toast width:', boundingBox.width, 'px');
    console.log('Toast height:', boundingBox.height, 'px');
    
    // Take screenshot
    await page.screenshot({ path: 'toast-test.png' });
    
    // Check if toast text wraps to multiple lines
    const textElement = await page.locator('.aionda-toast-container div p').first();
    const textBox = await textElement.boundingBox();
    console.log('Text height:', textBox.height, 'px');
    
    if (textBox.height > 25) {
      console.log('❌ Toast text is wrapping - still too narrow');
    } else {
      console.log('✅ Toast text fits on one line');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testToastWidth();