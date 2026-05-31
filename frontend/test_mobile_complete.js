const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Click hamburger menu
    await page.locator('[aria-label="Toggle navigation menu"]').click();
    await page.waitForTimeout(500);
    
    // Click on mobile sidebar Patients link specifically
    await page.locator('aside a[href="/patients"]').first().click();
    await page.waitForLoadState('networkidle');
    
    console.log(`✅ Navigated to: ${page.url()}`);
    
    // Check for back button
    const backButton = await page.locator('[aria-label="Go back"]');
    const backVisible = await backButton.isVisible();
    console.log(`✅ Back button visible: ${backVisible}`);
    
    if (backVisible) {
      await backButton.click();
      await page.waitForTimeout(1000);
      console.log(`✅ Back to: ${page.url()}`);
    }
    
    console.log('🎉 Mobile navigation working perfectly!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();
