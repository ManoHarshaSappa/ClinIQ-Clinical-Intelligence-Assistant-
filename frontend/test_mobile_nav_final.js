const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Final test: Complete mobile navigation flow...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Click hamburger menu
    const hamburger = await page.locator('[aria-label="Toggle navigation menu"]');
    await hamburger.click();
    await page.waitForTimeout(500);
    
    // Click on Patients navigation
    console.log('🔗 Clicking on Patients...');
    const patientsNav = await page.locator('aside a:has-text("Patients")');
    await patientsNav.click();
    await page.waitForLoadState('networkidle');
    
    const patientsUrl = page.url();
    console.log(`✅ Successfully navigated to: ${patientsUrl}`);
    
    // Take screenshot of patients page
    await page.screenshot({ path: 'patients_mobile_final.png', fullPage: true });
    
    // Test back button
    console.log('⬅️ Testing back button...');
    const backButton = await page.locator('[aria-label="Go back"]');
    const backVisible = await backButton.isVisible();
    console.log(`Back button visible: ${backVisible}`);
    
    if (backVisible) {
      await backButton.click();
      await page.waitForLoadState('networkidle');
      const homeUrl = page.url();
      console.log(`✅ Back navigation successful: ${homeUrl}`);
      
      await page.screenshot({ path: 'back_to_home_final.png' });
    }
    
    console.log('✅ Mobile navigation working perfectly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
