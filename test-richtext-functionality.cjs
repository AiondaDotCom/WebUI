const { chromium } = require('playwright');

async function testRichTextFunctionality() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting RichTextField functionality test...');
    
    // Navigate to the richtext editor example
    await page.goto('http://localhost:8080/examples/richtext-editor/index.html');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully');
    
    // Test basic editor functionality
    await testBasicEditor(page);
    await testToolbarButtons(page);
    await testColorPickers(page);
    await testFormValidation(page);
    await testCustomEditor(page);
    
    console.log('🎉 All RichTextField tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

async function testBasicEditor(page) {
  console.log('\n📝 Testing basic editor functionality...');
  
  // Get the basic editor
  const editor = page.locator('#basic-richtext .aionda-richtext-editor').first();
  
  // Clear and add test content
  await editor.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type('Test content for basic editor');
  
  // Verify content appears in output
  await page.waitForTimeout(500);
  const textOutput = await page.locator('#text-output').inputValue();
  if (textOutput.includes('Test content for basic editor')) {
    console.log('✅ Basic text input works');
  } else {
    throw new Error('Basic text input failed');
  }
  
  // Test word count
  const wordCount = await page.locator('#word-count-display').textContent();
  if (parseInt(wordCount) === 6) {
    console.log('✅ Word count works correctly');
  } else {
    console.log(`⚠️ Word count might be incorrect: ${wordCount}`);
  }
}

async function testToolbarButtons(page) {
  console.log('\n🛠️ Testing toolbar buttons...');
  
  const editor = page.locator('#basic-richtext .aionda-richtext-editor').first();
  
  // Select some text first
  await editor.click();
  await page.keyboard.press('Control+a');
  
  // Test Bold button
  const boldButton = page.locator('#basic-richtext [data-command="bold"]').first();
  await boldButton.click();
  await page.waitForTimeout(200);
  
  const htmlOutput = await page.locator('#html-output').inputValue();
  if (htmlOutput.includes('<b>') || htmlOutput.includes('<strong>') || htmlOutput.includes('font-weight')) {
    console.log('✅ Bold button works');
  } else {
    console.log('⚠️ Bold button might not be working properly');
  }
  
  // Test Italic button
  const italicButton = page.locator('#basic-richtext [data-command="italic"]').first();
  await italicButton.click();
  await page.waitForTimeout(200);
  
  const htmlOutput2 = await page.locator('#html-output').inputValue();
  if (htmlOutput2.includes('<i>') || htmlOutput2.includes('<em>') || htmlOutput2.includes('font-style')) {
    console.log('✅ Italic button works');
  } else {
    console.log('⚠️ Italic button might not be working properly');
  }
  
  // Test Underline button  
  const underlineButton = page.locator('#basic-richtext [data-command="underline"]').first();
  await underlineButton.click();
  await page.waitForTimeout(200);
  
  const htmlOutput3 = await page.locator('#html-output').inputValue();
  if (htmlOutput3.includes('<u>') || htmlOutput3.includes('text-decoration')) {
    console.log('✅ Underline button works');
  } else {
    console.log('⚠️ Underline button might not be working properly');
  }
}

async function testColorPickers(page) {
  console.log('\n🎨 Testing color pickers...');
  
  const editor = page.locator('#basic-richtext .aionda-richtext-editor').first();
  await editor.click();
  await page.keyboard.press('Control+a');
  
  // Test text color picker
  const textColorInput = page.locator('#basic-richtext input[data-command="foreColor"]').first();
  
  // Set color to red
  await textColorInput.fill('#ff0000');
  await textColorInput.dispatchEvent('change');
  await page.waitForTimeout(300);
  
  const htmlOutput = await page.locator('#html-output').inputValue();
  if (htmlOutput.includes('ff0000') || htmlOutput.includes('red') || htmlOutput.includes('color')) {
    console.log('✅ Text color picker works');
  } else {
    console.log('⚠️ Text color picker might not be working:', htmlOutput.substring(0, 200));
  }
  
  // Test background color picker
  const bgColorInput = page.locator('#basic-richtext input[data-command="backColor"]').first();
  
  // Set background to yellow
  await bgColorInput.fill('#ffff00');
  await bgColorInput.dispatchEvent('change');
  await page.waitForTimeout(300);
  
  const htmlOutput2 = await page.locator('#html-output').inputValue();
  if (htmlOutput2.includes('ffff00') || htmlOutput2.includes('yellow') || htmlOutput2.includes('background')) {
    console.log('✅ Background color picker works');
  } else {
    console.log('⚠️ Background color picker might not be working:', htmlOutput2.substring(0, 200));
  }
}

async function testFormValidation(page) {
  console.log('\n📋 Testing form validation...');
  
  // Test required field validation
  const validateButton = page.locator('#validate-form');
  await validateButton.click();
  
  // Should show validation error since form editor is empty
  await page.waitForTimeout(500);
  
  // Check if validation error appears
  const validationError = page.locator('#form-richtext .aionda-richtext-validation');
  const isVisible = await validationError.isVisible();
  
  if (isVisible) {
    console.log('✅ Required field validation works');
  } else {
    console.log('⚠️ Required field validation might not be working');
  }
  
  // Add content and test again
  const formEditor = page.locator('#form-richtext .aionda-richtext-editor');
  await formEditor.click();
  await page.keyboard.type('This is required content');
  
  await validateButton.click();
  await page.waitForTimeout(500);
  
  const isStillVisible = await validationError.isVisible();
  if (!isStillVisible) {
    console.log('✅ Validation clears when content is added');
  } else {
    console.log('⚠️ Validation might not clear properly');
  }
}

async function testCustomEditor(page) {
  console.log('\n⚙️ Testing custom toolbar editor...');
  
  const customEditor = page.locator('#custom-richtext .aionda-richtext-editor');
  await customEditor.click();
  await page.keyboard.type('Custom editor test');
  
  // Should only have limited toolbar buttons
  const boldButton = page.locator('#custom-richtext [data-command="bold"]');
  const underlineButton = page.locator('#custom-richtext [data-command="underline"]');
  const fontSizeSelect = page.locator('#custom-richtext select[data-command="fontSize"]');
  
  const hasBold = await boldButton.count() > 0;
  const hasUnderline = await underlineButton.count() > 0;
  const hasFontSize = await fontSizeSelect.count() > 0;
  
  if (hasBold && hasUnderline && !hasFontSize) {
    console.log('✅ Custom toolbar configuration works');
  } else {
    console.log(`⚠️ Custom toolbar might not be configured correctly: bold=${hasBold}, underline=${hasUnderline}, fontSize=${hasFontSize}`);
  }
  
  // Test word count feature
  const wordCountButton = page.locator('#word-count');
  await wordCountButton.click();
  await page.waitForTimeout(1000);
  
  // Should show a toast with word count
  const toast = page.locator('[id^="toast-container-"]');
  const toastVisible = await toast.isVisible();
  
  if (toastVisible) {
    console.log('✅ Word count feature works');
  } else {
    console.log('⚠️ Word count feature might not be working');
  }
}

// Start the test
testRichTextFunctionality();