const { chromium } = require('playwright');

async function debugSpacing() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🔧 Debugging spacing issue...');
    
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
    
    // Analyze the spacing structure
    const spacingAnalysis = await page.evaluate(() => {
      const window = document.querySelector('.aionda-window');
      const windowHeader = window.querySelector('.aionda-window-header');
      const windowTitle = window.querySelector('.aionda-window-title');
      const menuBarContainer = window.querySelector('#window-menubar-container');
      const menuBar = window.querySelector('.aionda-menubar');
      const windowContent = window.querySelector('div.flex.flex-col.h-full');
      
      const getRect = (el) => el ? el.getBoundingClientRect() : null;
      const getStyles = (el) => el ? window.getComputedStyle(el) : null;
      
      return {
        window: {
          rect: getRect(window),
          styles: getStyles(window)
        },
        windowHeader: {
          rect: getRect(windowHeader),
          styles: getStyles(windowHeader),
          exists: !!windowHeader
        },
        windowTitle: {
          rect: getRect(windowTitle),
          styles: getStyles(windowTitle),
          exists: !!windowTitle
        },
        menuBarContainer: {
          rect: getRect(menuBarContainer),
          styles: getStyles(menuBarContainer),
          exists: !!menuBarContainer,
          className: menuBarContainer ? menuBarContainer.className : null
        },
        menuBar: {
          rect: getRect(menuBar),
          styles: getStyles(menuBar),
          exists: !!menuBar,
          className: menuBar ? menuBar.className : null
        },
        windowContent: {
          rect: getRect(windowContent),
          styles: getStyles(windowContent),
          exists: !!windowContent
        }
      };
    });
    
    console.log('Spacing analysis:');
    console.log('Window header exists:', spacingAnalysis.windowHeader.exists);
    console.log('Window title exists:', spacingAnalysis.windowTitle.exists);
    console.log('MenuBar container exists:', spacingAnalysis.menuBarContainer.exists);
    console.log('MenuBar exists:', spacingAnalysis.menuBar.exists);
    
    if (spacingAnalysis.windowTitle.exists && spacingAnalysis.menuBar.exists) {
      const titleBottom = spacingAnalysis.windowTitle.rect.bottom;
      const menuBarTop = spacingAnalysis.menuBar.rect.top;
      const gap = menuBarTop - titleBottom;
      
      console.log(`Title bottom: ${titleBottom}px`);
      console.log(`MenuBar top: ${menuBarTop}px`);
      console.log(`Gap: ${gap}px`);
      
      console.log('MenuBar container styles:');
      console.log(`  margin: ${spacingAnalysis.menuBarContainer.styles.margin}`);
      console.log(`  padding: ${spacingAnalysis.menuBarContainer.styles.padding}`);
      console.log(`  border: ${spacingAnalysis.menuBarContainer.styles.border}`);
      console.log(`  className: ${spacingAnalysis.menuBarContainer.className}`);
      
      console.log('MenuBar styles:');
      console.log(`  margin: ${spacingAnalysis.menuBar.styles.margin}`);
      console.log(`  padding: ${spacingAnalysis.menuBar.styles.padding}`);
      console.log(`  className: ${spacingAnalysis.menuBar.className}`);
    }
    
    // Take screenshot for analysis
    const windowElement = page.locator('.aionda-window').last();
    await windowElement.screenshot({ path: 'spacing-debug-analysis.png' });
    console.log('📸 Screenshot saved for analysis');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugSpacing();