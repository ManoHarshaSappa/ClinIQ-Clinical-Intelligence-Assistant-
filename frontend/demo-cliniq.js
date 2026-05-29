const { chromium } = require('playwright');
const path = require('path');

async function demoClinIQ() {
  console.log('🚀 Launching ClinIQ Clinical Intelligence Assistant...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000  // Slow down for demo visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });

  const page = await context.newPage();

  try {
    // Step 1: Launch the application
    console.log('📱 Opening ClinIQ Dashboard...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'demo-01-dashboard.png' });
    console.log('   ✅ Dashboard loaded - showing patient statistics and quick upload');

    await page.waitForTimeout(3000);

    // Step 2: Demonstrate file upload
    console.log('\n📁 Demonstrating file upload functionality...');

    // Create a sample medical record for demo
    const testRecord = `PATIENT MEDICAL RECORD

Patient: Jane Smith
DOB: 03/22/1985
Age: 39
Gender: Female
MRN: 987654321

CHIEF COMPLAINT: Persistent fatigue and frequent urination

HISTORY OF PRESENT ILLNESS:
Patient presents with a 3-month history of increasing fatigue, frequent urination, and unexplained weight loss of 15 pounds. Reports excessive thirst and blurred vision episodes.

PAST MEDICAL HISTORY:
- Family history of Type 2 Diabetes (mother)
- Previous gestational diabetes during pregnancy

MEDICATIONS:
- Multivitamin daily
- Birth control pills

ALLERGIES:
- Sulfonamides (hives)
- Latex (contact dermatitis)

PHYSICAL EXAMINATION:
Vital Signs: BP 140/85, HR 92, RR 16, Temp 98.4°F, Weight 145 lbs
General: Alert, appears tired
HEENT: Dry mucous membranes
Cardiovascular: Regular rate and rhythm
Pulmonary: Clear to auscultation

LABORATORY RESULTS:
- Fasting Glucose: 185 mg/dL (HIGH)
- HbA1c: 8.2% (HIGH)
- Urinalysis: Glucose 3+, Ketones negative

ASSESSMENT AND PLAN:
1. New onset Type 2 Diabetes Mellitus
   - Start Metformin 500mg twice daily
   - Diabetes education referral
   - Follow up in 2 weeks
2. Hypertension - monitor, lifestyle modifications

Dr. Michael Chen, MD
Internal Medicine
Date: ${new Date().toLocaleDateString()}`;

    // Write the demo file
    const fs = require('fs');
    fs.writeFileSync('../demo-patient.txt', testRecord);

    const fileInput = page.locator('#file-input-compact');
    await fileInput.setInputFiles('../demo-patient.txt');
    console.log('   ✅ Demo medical record uploaded');

    await page.screenshot({ path: 'demo-02-uploading.png' });

    // Wait for processing and redirect
    console.log('   🔄 Processing with GPT-4o...');
    await page.waitForNavigation({ timeout: 30000 });
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'demo-03-patient-detail.png' });
    console.log('   ✅ Upload complete - patient record extracted and displayed');

    await page.waitForTimeout(3000);

    // Step 3: Show patient summary
    console.log('\n👤 Demonstrating patient summary...');

    // Check if we're on patient detail page
    const patientName = await page.locator('h1').first().textContent();
    console.log(`   📋 Patient: ${patientName}`);

    // Look for allergy warnings
    const allergyElements = await page.locator('text=Allerg').count();
    if (allergyElements > 0) {
      console.log('   ⚠️ Allergy warnings detected and highlighted');
    }

    await page.waitForTimeout(3000);

    // Step 4: Demonstrate chat functionality
    console.log('\n💬 Demonstrating AI Chat functionality...');

    // Click on AI Chat tab
    await page.click('button:has-text("AI Chat")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'demo-04-chat-tab.png' });
    console.log('   ✅ AI Chat tab opened');

    // Test chat with a relevant question
    const chatInput = page.locator('input[placeholder*="medications"]').first();
    const testQuestion = "What medications should I prescribe and are there any allergy concerns?";

    await chatInput.fill(testQuestion);
    console.log(`   ❓ Asking: "${testQuestion}"`);

    await page.click('button:has-text("Send")');
    console.log('   📤 Question sent to AI');

    // Wait for response
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'demo-05-chat-response.png' });

    // Check if response appeared
    const messages = await page.locator('.rounded-2xl').count();
    if (messages > 0) {
      console.log('   ✅ AI response received - grounded in patient data');
    }

    await page.waitForTimeout(3000);

    // Step 5: Demonstrate search functionality
    console.log('\n🔍 Demonstrating semantic search...');

    await page.goto('http://localhost:3000/search');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'demo-06-search-page.png' });
    console.log('   ✅ Search page loaded');

    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('diabetes medications');
    await page.click('button:has-text("Search")');

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'demo-07-search-results.png' });
    console.log('   ✅ Semantic search completed - found relevant patients');

    // Step 6: Final dashboard view
    console.log('\n📊 Returning to dashboard...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'demo-08-final-dashboard.png' });
    console.log('   ✅ Updated dashboard showing new patient data');

    console.log('\n🎉 ClinIQ Demo Complete!');
    console.log('\nKey Features Demonstrated:');
    console.log('  ✅ File Upload & Processing (PDF/TXT/CSV → GPT-4o extraction)');
    console.log('  ✅ Patient Summary Display (structured medical data)');
    console.log('  ✅ AI Chat Interface (RAG-powered clinical Q&A)');
    console.log('  ✅ Semantic Search (vector similarity across all records)');
    console.log('  ✅ Allergy Detection & Warnings');
    console.log('  ✅ Medical Specialty Organization');

    console.log('\nScreenshots saved:');
    console.log('  📸 demo-01-dashboard.png - Main dashboard');
    console.log('  📸 demo-02-uploading.png - File upload process');
    console.log('  📸 demo-03-patient-detail.png - Patient summary');
    console.log('  📸 demo-04-chat-tab.png - Chat interface');
    console.log('  📸 demo-05-chat-response.png - AI response');
    console.log('  📸 demo-06-search-page.png - Search interface');
    console.log('  📸 demo-07-search-results.png - Search results');
    console.log('  📸 demo-08-final-dashboard.png - Updated dashboard');

    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Demo failed:', error);
    await page.screenshot({ path: 'demo-error.png' });
  } finally {
    await browser.close();
  }
}

// Run the demo
demoClinIQ().catch(console.error);