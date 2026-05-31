const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing mobile navigation functionality...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone SE viewport
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the homepage
    console.log('📱 Loading homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'mobile_home.png', fullPage: true });
    console.log('📷 Homepage screenshot saved as mobile_home.png');
    
    // Look for the hamburger menu button (three lines)
    console.log('🔍 Looking for hamburger menu...');
    const hamburgerButton = await page.locator('[aria-label="Toggle navigation menu"]').first();
    const isVisible = await hamburgerButton.isVisible();
    console.log(`📋 Hamburger menu visible: ${isVisible}`);
    
    if (isVisible) {
      // Click the hamburger menu
      console.log('👆 Clicking hamburger menu...');
      await hamburgerButton.click();
      await page.waitForTimeout(500); // Wait for animation
      
      // Check if mobile sidebar is visible
      const mobileSidebar = await page.locator('[aria-label="Close navigation menu"]');
      const sidebarVisible = await mobileSidebar.isVisible();
      console.log(`📱 Mobile sidebar visible after click: ${sidebarVisible}`);
      
      // Take screenshot of open sidebar
      await page.screenshot({ path: 'mobile_sidebar_open.png', fullPage: true });
      console.log('📷 Open sidebar screenshot saved as mobile_sidebar_open.png');
      
      if (sidebarVisible) {
        // Test navigation item click
        console.log('🔗 Testing navigation to Patients page...');
        const patientsLink = await page.locator('text=Patients').first();
        await patientsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check if we're on patients page and look for back button
        const pageTitle = await page.textContent('h1');
        console.log(`📄 Current page title: ${pageTitle}`);
        
        // Take screenshot of patients page
        await page.screenshot({ path: 'mobile_patients.png', fullPage: true });
        console.log('📷 Patients page screenshot saved as mobile_patients.png');
        
        // Look for back button
        const backButton = await page.locator('[aria-label="Go back"]').first();
        const backButtonVisible = await backButton.isVisible();
        console.log(`⬅️ Back button visible: ${backButtonVisible}`);
        
        if (backButtonVisible) {
          // Test back button
          console.log('👆 Testing back button...');
          await backButton.click();
          await page.waitForLoadState('networkidle');
          
          const newUrl = page.url();
          console.log(`🔄 After back button click, URL: ${newUrl}`);
          
          // Take final screenshot
          await page.screenshot({ path: 'mobile_after_back.png', fullPage: true });
          console.log('📷 After back navigation screenshot saved as mobile_after_back.png');
        }
      }
    }
    
    console.log('✅ Mobile navigation test completed successfully');
    
  } catch (error) {
    console.error('❌ Error during mobile navigation test:', error.message);
    await page.screenshot({ path: 'mobile_error.png', fullPage: true });
    console.log('📷 Error screenshot saved as mobile_error.png');
  } finally {
    await browser.close();
  }
})();
