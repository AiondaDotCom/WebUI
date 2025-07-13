const { chromium } = require('playwright');

async function testDropdownAndColorPicker() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Testing font dropdowns and color pickers...');
    
    // Start server if needed
    await page.goto('http://localhost:8080/examples/richtext-editor/index.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    
    // Test font dropdown
    console.log('\n📝 Testing font dropdown...');
    const fontSelect = page.locator('#basic-richtext select[data-command="fontName"]').first();
    
    // Click to open dropdown
    await fontSelect.click();
    await page.waitForTimeout(500);
    
    // Select Arial
    await fontSelect.selectOption('Arial');
    await page.waitForTimeout(300);
    
    // Check if selection was reset
    const selectedValue = await fontSelect.inputValue();
    console.log(`Font dropdown value after selection: "${selectedValue}"`);
    
    if (selectedValue === '') {
      console.log('✅ Font dropdown works - resets after selection');
    } else {
      console.log('⚠️ Font dropdown might not reset properly');
    }
    
    // Test font size dropdown
    console.log('\n📏 Testing font size dropdown...');
    const fontSizeSelect = page.locator('#basic-richtext select[data-command="fontSize"]').first();
    
    await fontSizeSelect.click();
    await page.waitForTimeout(500);
    await fontSizeSelect.selectOption('4');
    await page.waitForTimeout(300);
    
    const sizeValue = await fontSizeSelect.inputValue();
    console.log(`Font size dropdown value after selection: "${sizeValue}"`);
    
    // Test color pickers
    console.log('\n🎨 Testing color pickers...');
    
    // Add some text first
    const editor = page.locator('#basic-richtext .aionda-richtext-editor');
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.type('Test text for color');
    await page.keyboard.press('Control+a');
    
    // Test text color picker
    const textColorPicker = page.locator('#basic-richtext input[data-command="foreColor"]').first();
    console.log('Text color picker visible:', await textColorPicker.isVisible());
    
    // Try to click the color picker
    await textColorPicker.click();
    await page.waitForTimeout(500);
    
    // Set color to red
    await textColorPicker.fill('#ff0000');
    await page.waitForTimeout(300);
    
    // Check if color was applied
    const htmlOutput = await page.locator('#html-output').inputValue();
    console.log('HTML after text color change:', htmlOutput.substring(0, 200));
    
    if (htmlOutput.includes('ff0000') || htmlOutput.includes('red') || htmlOutput.includes('color')) {
      console.log('✅ Text color picker works');
    } else {
      console.log('⚠️ Text color picker might not be working');
    }
    
    // Test background color picker
    const bgColorPicker = page.locator('#basic-richtext input[data-command="backColor"]').first();
    console.log('Background color picker visible:', await bgColorPicker.isVisible());
    
    await bgColorPicker.click();
    await page.waitForTimeout(500);
    await bgColorPicker.fill('#ffff00');
    await page.waitForTimeout(300);
    
    const htmlOutput2 = await page.locator('#html-output').inputValue();
    console.log('HTML after background color change:', htmlOutput2.substring(0, 200));
    
    if (htmlOutput2.includes('ffff00') || htmlOutput2.includes('yellow') || htmlOutput2.includes('background')) {
      console.log('✅ Background color picker works');
    } else {
      console.log('⚠️ Background color picker might not be working');
    }
    
    // Take screenshot for visual confirmation
    await page.screenshot({ path: 'dropdown-colorpicker-test.png' });
    console.log('📸 Screenshot saved as dropdown-colorpicker-test.png');
    
    console.log('\n🎉 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testDropdownAndColorPicker();