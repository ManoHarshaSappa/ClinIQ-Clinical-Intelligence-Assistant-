const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing fixed patient mobile navigation...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  try {
    // Go to homepage first
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Click on first patient
    console.log('👆 Clicking on a patient...');
    const patientLink = await page.locator('a[href^="/patients/"]').first();
    await patientLink.click();
    await page.waitForLoadState('networkidle');
    
    console.log(`📱 Patient page URL: ${page.url()}`);
    
    // Take screenshot of patient page
    await page.screenshot({ path: 'patient_mobile_fixed.png', fullPage: true });
    console.log('📷 Patient page screenshot saved');
    
    // Check for mobile back button
    const backButton = await page.locator('[aria-label="Go back"]');
    const backVisible = await backButton.isVisible();
    console.log(`⬅️ Back button visible: ${backVisible}`);
    
    if (backVisible) {
      console.log('✅ Mobile navigation working on patient page!');
    } else {
      console.log('⚠️ Back button not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
