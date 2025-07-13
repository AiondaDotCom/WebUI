const { chromium } = require('playwright');

async function debugSpacingSimple() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Simple spacing debug...');
    
    await page.goto('file://' + __dirname + '/examples/advanced-components/index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Switch to window tab
    await page.evaluate(() => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector('[data-tab="window"]').classList.add('active');
      document.querySelector('#window').classList.add('active');
    });
    
    await page.waitForTimeout(1000);
    
    // Click MenuBar Window button
    await page.click('#menubar-window-btn');
    await page.waitForTimeout(3000);
    
    // Get spacing measurements
    const spacing = await page.evaluate(() => {
      const window = document.querySelector('.aionda-window');
      const windowTitle = window.querySelector('.aionda-window-title');
      const menuBar = window.querySelector('.aionda-menubar');
      const menuBarContainer = window.querySelector('#window-menubar-container');
      
      if (!windowTitle || !menuBar) {
        return { error: 'Elements not found' };
      }
      
      const titleRect = windowTitle.getBoundingClientRect();
      const menuBarRect = menuBar.getBoundingClientRect();
      const containerRect = menuBarContainer.getBoundingClientRect();
      
      return {
        titleBottom: titleRect.bottom,
        menuBarTop: menuBarRect.top,
        containerTop: containerRect.top,
        gap: menuBarRect.top - titleRect.bottom,
        containerGap: containerRect.top - titleRect.bottom,
        containerClass: menuBarContainer.className,
        menuBarClass: menuBar.className
      };
    });
    
    console.log('Spacing measurements:', spacing);
    
    if (spacing.gap > 5) {
      console.log(`⚠️ PROBLEM: Gap is ${spacing.gap}px - needs fixing`);
      
      // Try to fix it by modifying the container positioning
      await page.evaluate(() => {
        const container = document.querySelector('#window-menubar-container');
        const windowTitle = document.querySelector('.aionda-window-title');
        
        if (container && windowTitle) {
          // Calculate how much to move up
          const titleRect = windowTitle.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const gap = containerRect.top - titleRect.bottom;
          
          console.log(`Gap detected: ${gap}px`);
          
          // Apply negative margin to close the gap
          container.style.marginTop = `-${gap + 5}px`;
          container.style.position = 'relative';
          container.style.zIndex = '10';
          
          return gap;
        }
        return 0;
      });
      
      await page.waitForTimeout(1000);
      
      // Re-measure after fix
      const newSpacing = await page.evaluate(() => {
        const window = document.querySelector('.aionda-window');
        const windowTitle = window.querySelector('.aionda-window-title');
        const menuBar = window.querySelector('.aionda-menubar');
        
        const titleRect = windowTitle.getBoundingClientRect();
        const menuBarRect = menuBar.getBoundingClientRect();
        
        return {
          titleBottom: titleRect.bottom,
          menuBarTop: menuBarRect.top,
          newGap: menuBarRect.top - titleRect.bottom
        };
      });
      
      console.log('After fix:', newSpacing);
      
      if (Math.abs(newSpacing.newGap) <= 2) {
        console.log('✅ FIXED: Gap reduced to acceptable level');
      } else {
        console.log(`⚠️ Still has gap: ${newSpacing.newGap}px`);
      }
    } else {
      console.log('✅ Gap is acceptable');
    }
    
    // Take final screenshot
    const windowElement = page.locator('.aionda-window').last();
    await windowElement.screenshot({ path: 'spacing-fix-result.png' });
    console.log('📸 Final screenshot saved');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugSpacingSimple();