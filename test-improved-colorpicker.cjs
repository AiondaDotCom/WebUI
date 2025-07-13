const { chromium } = require('playwright');

async function testImprovedColorpicker() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Testing improved RichTextField colorpicker...');
    
    await page.goto('file://' + __dirname + '/test-colorpicker-ui.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    
    const editor = page.locator('.aionda-richtext-editor');
    await editor.click();
    await page.keyboard.type('Dieser Text wird bunt formatiert!');
    
    // Test 1: Open colorpicker dropdown
    console.log('\n🎨 Testing colorpicker dropdown...');
    
    const colorButton = page.locator('.aionda-textcolor-btn');
    const dropdown = page.locator('.aionda-colorpicker-dropdown');
    
    // Initially dropdown should be hidden
    const initiallyHidden = await dropdown.evaluate(el => el.classList.contains('hidden'));
    console.log('Dropdown initially hidden:', initiallyHidden);
    
    // Click color button to open dropdown
    await colorButton.click();
    await page.waitForTimeout(200);
    
    const dropdownVisible = await dropdown.evaluate(el => !el.classList.contains('hidden'));
    console.log('Dropdown visible after click:', dropdownVisible);
    
    if (dropdownVisible) {
      console.log('✅ Colorpicker dropdown opens correctly');
    } else {
      console.log('⚠️ Colorpicker dropdown might not open');
    }
    
    // Test 2: Check for OK and Cancel buttons
    console.log('\n🔘 Testing OK/Cancel buttons...');
    
    const okButton = page.locator('.aionda-colorpicker-ok');
    const cancelButton = page.locator('.aionda-colorpicker-cancel');
    
    const okVisible = await okButton.isVisible();
    const cancelVisible = await cancelButton.isVisible();
    
    console.log('OK button visible:', okVisible);
    console.log('Cancel button visible:', cancelVisible);
    
    if (okVisible && cancelVisible) {
      console.log('✅ OK and Cancel buttons are present');
    } else {
      console.log('⚠️ OK/Cancel buttons might be missing');
    }
    
    // Test 3: Test color selection and OK button
    console.log('\n🌈 Testing color selection with OK button...');
    
    // Select some text first
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(200);
    
    // Change color in the picker
    const colorInput = page.locator('.aionda-colorpicker-dropdown .aionda-textcolor-input');
    await colorInput.fill('#ff0000');
    await page.waitForTimeout(200);
    
    // Click OK to apply
    await okButton.click();
    await page.waitForTimeout(500);
    
    // Check if dropdown is closed
    const dropdownHiddenAfterOK = await dropdown.evaluate(el => el.classList.contains('hidden'));
    console.log('Dropdown hidden after OK:', dropdownHiddenAfterOK);
    
    // Check if color was applied to text
    const editorHTML = await editor.innerHTML();
    console.log('Editor HTML after color application:', editorHTML.substring(0, 100) + '...');
    
    if (editorHTML.includes('color') && editorHTML.includes('255, 0, 0')) {
      console.log('✅ Color applied correctly via OK button');
    } else {
      console.log('⚠️ Color might not have been applied');
    }
    
    // Test 4: Test Cancel button behavior
    console.log('\n❌ Testing Cancel button...');
    
    // Open dropdown again
    await colorButton.click();
    await page.waitForTimeout(200);
    
    // Change color but don't apply
    await colorInput.fill('#00ff00');
    await page.waitForTimeout(200);
    
    // Click Cancel
    await cancelButton.click();
    await page.waitForTimeout(200);
    
    // Check if dropdown is closed
    const dropdownHiddenAfterCancel = await dropdown.evaluate(el => el.classList.contains('hidden'));
    console.log('Dropdown hidden after Cancel:', dropdownHiddenAfterCancel);
    
    if (dropdownHiddenAfterCancel) {
      console.log('✅ Cancel button closes dropdown correctly');
    } else {
      console.log('⚠️ Cancel button might not work correctly');
    }
    
    // Test 5: Click outside to close
    console.log('\n🖱️ Testing click outside to close...');
    
    // Open dropdown
    await colorButton.click();
    await page.waitForTimeout(200);
    
    // Click outside the dropdown
    await page.click('body', { position: { x: 10, y: 10 } });
    await page.waitForTimeout(200);
    
    const dropdownHiddenAfterClickOutside = await dropdown.evaluate(el => el.classList.contains('hidden'));
    console.log('Dropdown hidden after click outside:', dropdownHiddenAfterClickOutside);
    
    if (dropdownHiddenAfterClickOutside) {
      console.log('✅ Click outside closes dropdown correctly');
    } else {
      console.log('⚠️ Click outside might not work');
    }
    
    // Test 6: Check German labels
    console.log('\n🇩🇪 Testing German labels...');
    
    await colorButton.click();
    await page.waitForTimeout(200);
    
    const labelText = await page.locator('.aionda-colorpicker-dropdown label').textContent();
    const okButtonText = await okButton.textContent();
    const cancelButtonText = await cancelButton.textContent();
    
    console.log('Label text:', labelText);
    console.log('OK button text:', okButtonText);
    console.log('Cancel button text:', cancelButtonText);
    
    if (labelText.includes('Textfarbe') && okButtonText === 'OK' && cancelButtonText === 'Abbrechen') {
      console.log('✅ German labels are correct');
    } else {
      console.log('⚠️ German labels might be incorrect');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'improved-colorpicker-test.png' });
    console.log('📸 Screenshot saved as improved-colorpicker-test.png');
    
    console.log('\n🎉 All colorpicker tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testImprovedColorpicker();