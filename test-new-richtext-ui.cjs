const { chromium } = require('playwright');

async function testNewRichTextUI() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Testing new RichTextField UI...');
    
    await page.goto('http://localhost:8080/examples/richtext-editor/index.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    
    // Test text color with 'A' display
    console.log('\n🎨 Testing text color with A icon...');
    
    const editor = page.locator('#basic-richtext .aionda-richtext-editor');
    await editor.click();
    await page.keyboard.type('Test text for colors');
    await page.keyboard.press('Control+a');
    
    // Test text color input
    const textColorInput = page.locator('#basic-richtext .aionda-textcolor-input');
    console.log('Text color input visible:', await textColorInput.isVisible());
    
    // Check if 'A' is displayed over the color input
    const textColorIcon = page.locator('#basic-richtext .aionda-textcolor-display');
    const iconText = await textColorIcon.textContent();
    console.log('Text color icon shows:', iconText);
    
    if (iconText === 'A') {
      console.log('✅ Text color shows A icon');
    } else {
      console.log('⚠️ Text color icon might not be correct');
    }
    
    // Click text color input to open color picker
    await textColorInput.click();
    await page.waitForTimeout(500);
    
    // Set color to red
    await textColorInput.fill('#ff0000');
    await page.waitForTimeout(300);
    
    // Check if A color changed
    const aColorStyle = await textColorIcon.getAttribute('style');
    console.log('A color style after change:', aColorStyle);
    
    if (aColorStyle && aColorStyle.includes('rgb(255, 0, 0)')) {
      console.log('✅ A icon color updates correctly');
    } else {
      console.log('⚠️ A icon color might not update');
    }
    
    // Test highlighter (background color)
    console.log('\n🖍️ Testing highlighter functionality...');
    
    const highlighterBtn = page.locator('#basic-richtext button[data-command="backColor"]');
    console.log('Highlighter button visible:', await highlighterBtn.isVisible());
    
    // Check highlighter icon
    const highlighterIcon = await highlighterBtn.textContent();
    console.log('Highlighter icon:', highlighterIcon);
    
    if (highlighterIcon.includes('🖍️')) {
      console.log('✅ Highlighter shows marker icon');
    } else {
      console.log('⚠️ Highlighter icon might not be correct');
    }
    
    // Click highlighter
    await highlighterBtn.click();
    await page.waitForTimeout(300);
    
    // Check if text is highlighted yellow
    const htmlOutput = await page.locator('#html-output').inputValue();
    console.log('HTML after highlighting:', htmlOutput.substring(0, 200));
    
    if (htmlOutput.includes('ffff00') || htmlOutput.includes('yellow') || htmlOutput.includes('background')) {
      console.log('✅ Highlighter creates yellow background');
    } else {
      console.log('⚠️ Highlighter might not work correctly');
    }
    
    // Test font dropdowns
    console.log('\n📝 Testing font dropdowns...');
    
    // Test font family dropdown
    const fontSelect = page.locator('#basic-richtext select[data-command="fontName"]');
    console.log('Font family dropdown visible:', await fontSelect.isVisible());
    
    // Check current value
    const currentFont = await fontSelect.inputValue();
    console.log('Current font family value:', currentFont);
    
    // Select Arial
    await fontSelect.selectOption('Arial');
    await page.waitForTimeout(500);
    
    // Check if dropdown shows Arial now
    const newFontValue = await fontSelect.inputValue();
    console.log('Font family value after selection:', newFontValue);
    
    if (newFontValue === 'Arial') {
      console.log('✅ Font family dropdown shows current selection');
    } else {
      console.log('⚠️ Font family dropdown might not update correctly');
    }
    
    // Test font size dropdown
    const sizeSelect = page.locator('#basic-richtext select[data-command="fontSize"]');
    console.log('Font size dropdown visible:', await sizeSelect.isVisible());
    
    const currentSize = await sizeSelect.inputValue();
    console.log('Current font size value:', currentSize);
    
    // Select size 4
    await sizeSelect.selectOption('4');
    await page.waitForTimeout(500);
    
    const newSizeValue = await sizeSelect.inputValue();
    console.log('Font size value after selection:', newSizeValue);
    
    if (newSizeValue === '4') {
      console.log('✅ Font size dropdown shows current selection');
    } else {
      console.log('⚠️ Font size dropdown might not update correctly');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'new-richtext-ui-test.png' });
    console.log('📸 Screenshot saved as new-richtext-ui-test.png');
    
    console.log('\n🎉 New UI test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testNewRichTextUI();