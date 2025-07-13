const { chromium } = require('playwright');

async function testToastWidth() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to our simple test page
    await page.goto('http://localhost:8080/simple-toast-test.html');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click the long toast button
    await page.click('#longToast');
    
    // Wait for toast to appear
    await page.waitForSelector('[id^="toast-container-"]', { timeout: 5000 });
    
    // Get toast element and measure its width
    const toast = await page.locator('[id^="toast-container-"] > div').first();
    const boundingBox = await toast.boundingBox();
    
    console.log('Toast width:', boundingBox.width, 'px');
    console.log('Toast height:', boundingBox.height, 'px');
    
    // Get viewport width for comparison
    const viewportSize = page.viewportSize();
    console.log('Viewport width:', viewportSize.width, 'px');
    console.log('Toast width percentage:', ((boundingBox.width / viewportSize.width) * 100).toFixed(1), '%');
    
    // Take screenshot
    await page.screenshot({ path: 'toast-width-test.png', fullPage: false });
    
    // Check text element dimensions
    const textElement = await page.locator('[id^="toast-container-"] p').last();
    const textBox = await textElement.boundingBox();
    console.log('Text height:', textBox.height, 'px');
    
    // Wait a bit to see the toast
    await page.waitForTimeout(3000);
    
    if (boundingBox.width < 300) {
      console.log('❌ Toast is still too narrow (< 300px)');
    } else if (boundingBox.width < 500) {
      console.log('⚠️ Toast width is okay but could be wider (300-500px)');
    } else {
      console.log('✅ Toast width looks good (> 500px)');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testToastWidth();