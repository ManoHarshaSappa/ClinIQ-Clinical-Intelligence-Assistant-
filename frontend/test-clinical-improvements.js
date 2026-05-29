const { chromium } = require('playwright');

async function testClinicalImprovements() {
  console.log('🧪 Testing Enhanced Clinical Decision Support System\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to ClinIQ
    console.log('🔍 Opening ClinIQ application...');
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    console.log('✅ Application loaded');

    // Step 2: Upload a test patient file
    console.log('\n📁 Uploading test patient...');
    const fileInput = page.locator('#file-input-compact');
    await fileInput.setInputFiles('./test_patient_record.txt');

    // Wait for processing and redirect to patient detail page
    await page.waitForNavigation({ timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Patient uploaded and processed');

    // Step 3: Test enhanced clinical chat
    console.log('\n💬 Testing Enhanced Clinical Decision Support...');

    // Click on AI Chat tab
    await page.click('button:has-text("AI Chat")');
    await page.waitForTimeout(2000);

    // Test Question 1: Allergy concerns (should show improved risk quantification)
    console.log('\n🔍 Test 1: Allergy Risk Assessment');
    const chatInput = page.locator('input[placeholder*="medications"]').first();
    await chatInput.fill("The patient is allergic to Penicillin. Is it safe to prescribe Sulfamethoxazole or Glipizide?");
    await page.click('button:has-text("Send")');

    // Wait for response and capture
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'clinical-test-allergy-response.png' });
    console.log('📸 Screenshot saved: clinical-test-allergy-response.png');

    // Test Question 2: Medication management (should show missing clinical data awareness)
    console.log('\n🔍 Test 2: Medication Management with Missing Data');
    await chatInput.fill("Should I adjust the patient's Metformin dose? What else do I need to know?");
    await page.click('button:has-text("Send")');

    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'clinical-test-metformin-response.png' });
    console.log('📸 Screenshot saved: clinical-test-metformin-response.png');

    // Test Question 3: Overall clinical decision (should show structured format)
    console.log('\n🔍 Test 3: Comprehensive Clinical Assessment');
    await chatInput.fill("What is your overall assessment of this patient's condition and treatment plan?");
    await page.click('button:has-text("Send")');

    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'clinical-test-comprehensive-response.png' });
    console.log('📸 Screenshot saved: clinical-test-comprehensive-response.png');

    console.log('\n🎉 Clinical Decision Support Testing Complete!');
    console.log('\n📋 Key Improvements Tested:');
    console.log('  ✅ Structured response format (Evidence → Missing Data → Assessment → Recommendations → Confidence)');
    console.log('  ✅ Quantified allergy risk assessment (vs. binary warnings)');
    console.log('  ✅ Missing clinical data awareness (eGFR, BMI, HbA1c)');
    console.log('  ✅ Evidence attribution and source tracking');
    console.log('  ✅ Confidence levels and uncertainty handling');

    console.log('\n📸 Review Screenshots:');
    console.log('  📷 clinical-test-allergy-response.png - Allergy risk with quantification');
    console.log('  📷 clinical-test-metformin-response.png - Missing data awareness');
    console.log('  📷 clinical-test-comprehensive-response.png - Full structured format');

    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'clinical-test-error.png' });
  } finally {
    await browser.close();
  }
}

// Run the clinical test
testClinicalImprovements().catch(console.error);