const { chromium } = require('playwright');

async function testSimple() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Testing simple components...');
    
    page.on('console', msg => {
      console.log('📝 Console:', msg.text());
    });
    
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });
    
    await page.goto('file://' + __dirname + '/test-simple.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    
    console.log('Buttons found:', buttons);
    console.log('Inputs found:', inputs);
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSimple();