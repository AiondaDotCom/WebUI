const { chromium } = require('playwright');

async function testFormHTML() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Testing test.html...');
    
    // Set up event listeners BEFORE loading the page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      } else {
        console.log('📝 Console:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });
    
    await page.goto('file://' + __dirname + '/test.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✅ Page loaded');
    
    // Check if form is rendered
    const formExists = await page.locator('form').count();
    console.log('Form elements found:', formExists);
    
    // Check if fields are rendered
    const nameField = await page.locator('input[name="name"]').count();
    const emailField = await page.locator('input[name="email"]').count(); 
    const richTextField = await page.locator('.aionda-richtext-editor').count();
    
    console.log('Name field found:', nameField);
    console.log('Email field found:', emailField);
    console.log('RichTextField found:', richTextField);
    
    // Check if buttons are rendered
    const buttons = await page.locator('button').count();
    console.log('Buttons found:', buttons);
    
    // Check what's actually in the DOM
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Body HTML length:', bodyHTML.length);
    
    if (bodyHTML.length < 100) {
      console.log('⚠️ Very short HTML, something might be wrong');
      console.log('Body HTML:', bodyHTML);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-html-debug.png' });
    console.log('📸 Screenshot saved as test-html-debug.png');
    
    // Wait a bit to see the page
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testFormHTML();