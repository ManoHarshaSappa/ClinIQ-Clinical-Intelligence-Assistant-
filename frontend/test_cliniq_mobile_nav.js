const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing ClinIQ mobile navigation functionality...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE viewport
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the ClinIQ homepage on correct port
    console.log('📱 Loading ClinIQ homepage...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Wait for React to render
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ path: 'cliniq_mobile_home.png', fullPage: true });
    console.log('📷 ClinIQ homepage screenshot saved as cliniq_mobile_home.png');
    
    // Check page title to verify we're on the right app
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Look for the hamburger menu button (three lines)
    console.log('🔍 Looking for hamburger menu...');
    
    // Try different selectors for the hamburger menu
    const hamburgerSelectors = [
      '[aria-label="Toggle navigation menu"]',
      'button:has-text("☰")',
      'button:has([data-lucide="menu"])',
      '.lg\\:hidden button',
      'header button'
    ];
    
    let hamburgerButton = null;
    for (const selector of hamburgerSelectors) {
      try {
        hamburgerButton = await page.locator(selector).first();
        const isVisible = await hamburgerButton.isVisible({ timeout: 1000 });
        console.log(`📋 Checking selector "${selector}": visible=${isVisible}`);
        if (isVisible) break;
      } catch (e) {
        console.log(`📋 Selector "${selector}" not found`);
      }
    }
    
    // Check what elements are actually visible in the header
    const headerButtons = await page.locator('header button, .lg\\:hidden button').all();
    console.log(`🔍 Found ${headerButtons.length} buttons in mobile header area`);
    
    for (let i = 0; i < headerButtons.length; i++) {
      const button = headerButtons[i];
      const isVisible = await button.isVisible();
      const ariaLabel = await button.getAttribute('aria-label');
      console.log(`📋 Button ${i}: visible=${isVisible}, aria-label="${ariaLabel}"`);
      
      if (isVisible) {
        // Try clicking this button to see if it opens the sidebar
        console.log(`👆 Trying to click button ${i}...`);
        await button.click();
        await page.waitForTimeout(500);
        
        // Check if mobile sidebar appeared
        const sidebarChecks = [
          'aside[class*="mobile"]',
          '[aria-label="Close navigation menu"]',
          'div[class*="sidebar"]',
          'nav[class*="mobile"]'
        ];
        
        for (const check of sidebarChecks) {
          try {
            const sidebar = await page.locator(check);
            const sidebarVisible = await sidebar.isVisible({ timeout: 500 });
            if (sidebarVisible) {
              console.log(`📱 Mobile sidebar found with selector: ${check}`);
              await page.screenshot({ path: 'cliniq_sidebar_open.png', fullPage: true });
              console.log('📷 Open sidebar screenshot saved');
              
              // Test navigation within sidebar
              const navLinks = await page.locator('nav a, aside a').all();
              console.log(`🔗 Found ${navLinks.length} navigation links in sidebar`);
              
              // Click on a navigation link (like Patients)
              const patientsLink = await page.locator('text=Patients').first();
              const patientsVisible = await patientsLink.isVisible();
              console.log(`📋 Patients link visible: ${patientsVisible}`);
              
              if (patientsVisible) {
                await patientsLink.click();
                await page.waitForLoadState('networkidle');
                
                const currentUrl = page.url();
                console.log(`🔄 Navigated to: ${currentUrl}`);
                
                // Take screenshot of the patients page
                await page.screenshot({ path: 'cliniq_patients_mobile.png', fullPage: true });
                console.log('📷 Patients page screenshot saved');
                
                // Look for back button
                const backButton = await page.locator('[aria-label="Go back"]').first();
                const backVisible = await backButton.isVisible();
                console.log(`⬅️ Back button visible: ${backVisible}`);
                
                if (backVisible) {
                  await backButton.click();
                  await page.waitForLoadState('networkidle');
                  console.log(`🔄 Back navigation completed, URL: ${page.url()}`);
                }
              }
              break;
            }
          } catch (e) {
            // Continue checking other selectors
          }
        }
        break;
      }
    }
    
    console.log('✅ ClinIQ mobile navigation test completed');
    
  } catch (error) {
    console.error('❌ Error during mobile navigation test:', error.message);
    await page.screenshot({ path: 'cliniq_mobile_error.png', fullPage: true });
    console.log('📷 Error screenshot saved as cliniq_mobile_error.png');
  } finally {
    await browser.close();
  }
})();
