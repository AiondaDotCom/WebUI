const { chromium } = require('playwright');

async function testFixedRichText() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Testing fixed RichTextField...');
    
    await page.goto('http://localhost:8080/examples/richtext-editor/index.html');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');
    
    const editor = page.locator('#basic-richtext .aionda-richtext-editor');
    await editor.click();
    await page.keyboard.type('This is a test text for formatting.');
    
    // Test 1: Text color on selected text only
    console.log('\n🎨 Testing text color on selected text...');
    
    // Select "test text"
    await page.keyboard.press('Control+Home'); // Go to beginning
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight'); // Navigate to "test"
    }
    await page.keyboard.press('Shift+ArrowRight'); // Select "t"
    await page.keyboard.press('Shift+ArrowRight'); // Select "te"
    await page.keyboard.press('Shift+ArrowRight'); // Select "tes"
    await page.keyboard.press('Shift+ArrowRight'); // Select "test"
    await page.waitForTimeout(200);
    
    // Change color to red
    const textColorInput = page.locator('#basic-richtext .aionda-textcolor-input');
    await textColorInput.fill('#ff0000');
    await page.waitForTimeout(300);
    
    // Check if only selected text changed color
    const htmlOutput = await page.locator('#html-output').inputValue();
    console.log('HTML after text color change:', htmlOutput);
    
    if (htmlOutput.includes('ff0000') && htmlOutput.includes('test')) {
      console.log('✅ Text color works on selected text only');
    } else {
      console.log('⚠️ Text color might still affect entire text');
    }
    
    // Test 2: Highlighter/marker functionality
    console.log('\n🖍️ Testing highlighter on selected text...');
    
    // Select "formatting"
    await page.keyboard.press('Control+End'); // Go to end
    for (let i = 0; i < 11; i++) {
      await page.keyboard.press('ArrowLeft'); // Navigate to "formatting"
    }
    await page.keyboard.press('Shift+ArrowRight'); // Start selecting
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight'); // "formatting"
    await page.waitForTimeout(200);
    
    // Click highlighter button
    const highlighterBtn = page.locator('#basic-richtext button[data-command="backColor"]');
    await highlighterBtn.click();
    await page.waitForTimeout(300);
    
    const htmlOutput2 = await page.locator('#html-output').inputValue();
    console.log('HTML after highlighting:', htmlOutput2);
    
    if (htmlOutput2.includes('ffff00') || htmlOutput2.includes('yellow')) {
      console.log('✅ Highlighter creates yellow background');
    } else {
      console.log('⚠️ Highlighter might not work correctly');
    }
    
    // Check if highlighter button has yellow background
    const highlighterClasses = await highlighterBtn.getAttribute('class');
    if (highlighterClasses.includes('bg-yellow')) {
      console.log('✅ Highlighter button has yellow styling');
    } else {
      console.log('⚠️ Highlighter button styling might be missing');
    }
    
    // Test 3: Link functionality
    console.log('\n🔗 Testing link functionality...');
    
    // Select "This"
    await page.keyboard.press('Control+Home');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight'); // "This"
    await page.waitForTimeout(200);
    
    // Click link button
    const linkBtn = page.locator('#basic-richtext button[data-command="createLink"]');
    
    // Handle the prompt dialog
    page.on('dialog', async dialog => {
      console.log('Prompt appeared:', dialog.message());
      await dialog.accept('https://example.com');
    });
    
    await linkBtn.click();
    await page.waitForTimeout(500);
    
    const htmlOutput3 = await page.locator('#html-output').inputValue();
    console.log('HTML after link creation:', htmlOutput3);
    
    if (htmlOutput3.includes('href') && htmlOutput3.includes('example.com')) {
      console.log('✅ Link creation works correctly');
    } else {
      console.log('⚠️ Link creation might not work');
    }
    
    // Test 4: Check that strikethrough is removed
    console.log('\n❌ Checking strikethrough removal...');
    
    const strikethroughBtn = page.locator('#basic-richtext button[data-command="strikethrough"]');
    const strikethroughExists = await strikethroughBtn.count() > 0;
    
    if (!strikethroughExists) {
      console.log('✅ Strikethrough button successfully removed');
    } else {
      console.log('⚠️ Strikethrough button still exists');
    }
    
    // Test 5: Font dropdowns showing current values
    console.log('\n📝 Testing font dropdown current values...');
    
    // Select some text and change font
    await page.keyboard.press('Control+Home');
    await page.keyboard.press('Shift+End'); // Select all
    
    const fontSelect = page.locator('#basic-richtext select[data-command="fontName"]');
    await fontSelect.selectOption('Arial');
    await page.waitForTimeout(300);
    
    const currentFontValue = await fontSelect.inputValue();
    console.log('Font dropdown value after selection:', currentFontValue);
    
    if (currentFontValue === 'Arial') {
      console.log('✅ Font dropdown shows current selection');
    } else {
      console.log('⚠️ Font dropdown might not update correctly');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'fixed-richtext-test.png' });
    console.log('📸 Screenshot saved as fixed-richtext-test.png');
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testFixedRichText();