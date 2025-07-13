const { chromium } = require('playwright');

async function testButtonSpacing() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Testing button spacing...');
    
    await page.goto('file://' + __dirname + '/test.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Take screenshot of the buttons area
    const buttonsArea = page.locator('.aionda-form-buttons');
    await buttonsArea.screenshot({ path: 'button-spacing-fixed.png' });
    console.log('📸 Screenshot saved as button-spacing-fixed.png');
    
    // Check spacing between buttons
    const buttons = await page.locator('.aionda-form-buttons button').all();
    if (buttons.length >= 2) {
      const button1Box = await buttons[0].boundingBox();
      const button2Box = await buttons[1].boundingBox();
      
      const spacing = button2Box.x - (button1Box.x + button1Box.width);
      console.log(`Button spacing: ${spacing}px`);
      
      if (spacing >= 12) { // Tailwind space-x-3 = 12px
        console.log('✅ Button spacing looks good!');
      } else {
        console.log('⚠️ Button spacing might be too small');
      }
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testButtonSpacing();