const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyClinIQ() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000  // Slow down operations for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    console.log('🔍 Step 1: Opening ClinIQ application...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'verification-step1-homepage.png' });
    console.log('✅ Homepage loaded successfully');

    console.log('🔍 Step 2: Testing file upload functionality...');

    // Look for the file upload button in the Quick Upload section
    const uploadButton = page.locator('label[for="file-input-compact"]');
    await uploadButton.waitFor({ timeout: 10000 });
    console.log('✅ Upload button found');

    // Upload the test file
    const testFilePath = path.resolve('../test_patient_record.txt');
    console.log(`Uploading file: ${testFilePath}`);

    if (fs.existsSync(testFilePath)) {
      // Set the file on the hidden input
      const fileInput = page.locator('#file-input-compact');
      await fileInput.setInputFiles(testFilePath);
      console.log('✅ File selected for upload');

      // Wait for upload to process and look for processing indicators
      await page.waitForTimeout(2000);

      // Check for processing indicators
      const processingText = page.locator('text="Processing..."', 'text="Analyzing..."', 'text="GPT-4o extracting data..."');
      try {
        await processingText.first().waitFor({ timeout: 5000 });
        console.log('✅ Upload processing started');

        // Wait for processing to complete (should redirect to patient page)
        await page.waitForNavigation({ timeout: 30000 });
        console.log('✅ Upload completed - redirected to patient page');
      } catch (e) {
        console.log('⚠️ Upload processing indicators not found, but continuing...');
      }

      await page.screenshot({ path: 'verification-step2-upload.png' });
    } else {
      console.log('❌ Test file not found at', testFilePath);
    }

    // Check if we're already on a patient detail page (after upload redirect)
    const currentUrl = page.url();
    if (currentUrl.includes('/patients/')) {
      console.log('✅ Already on patient detail page after upload');
      await page.screenshot({ path: 'verification-step3-patient-detail.png' });
    } else {
      console.log('🔍 Step 3: Navigating to patients page...');

      // Try to navigate to patients page
      try {
        await page.click('a[href="/patients"], [href*="patients"], text="Patients"');
        await page.waitForLoadState('networkidle');
      } catch (e) {
        // Alternative: try direct navigation
        await page.goto('http://localhost:3000/patients');
        await page.waitForLoadState('networkidle');
      }

      await page.screenshot({ path: 'verification-step3-patients-list.png' });
      console.log('✅ Patients page loaded');

      console.log('🔍 Step 4: Checking for patient cards...');

      // Look for patient cards or entries
      const patientCards = page.locator('a[href*="/patients/"]');
      const patientCount = await patientCards.count();
      console.log(`Found ${patientCount} patient cards/entries`);

      if (patientCount > 0) {
        console.log('✅ Patient data is displaying');

        // Click on the first patient to view details
        await patientCards.first().click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'verification-step4-patient-detail.png' });
      } else {
        console.log('⚠️ No patient cards found');
        return;
      }
    }

    console.log('🔍 Step 5: Checking patient summary and testing chat functionality...');

    // Check for patient summary information
    const summaryElements = page.locator('.summary, [data-testid*="summary"], .patient-info, h1, h2');
    if (await summaryElements.count() > 0) {
      console.log('✅ Patient summary information found');
    }

    // Click on the "AI Chat" tab to access chat functionality
    const chatTab = page.locator('button:has-text("AI Chat")');
    if (await chatTab.count() > 0) {
      await chatTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ Clicked on AI Chat tab');
      await page.screenshot({ path: 'verification-step5-chat-tab.png' });

      // Look for chat interface
      const chatInput = page.locator('input[placeholder*="medications"], input[placeholder*="Ask about"]');

      if (await chatInput.count() > 0) {
        // Test chat with a sample question
        const testQuestion = "What is the patient's main diagnosis?";
        await chatInput.first().fill(testQuestion);
        console.log(`Entered question: "${testQuestion}"`);

        // Look for send button and click it
        const sendButton = page.locator('button:has-text("Send")');
        if (await sendButton.count() > 0) {
          await sendButton.first().click();
          console.log('✅ Chat message sent');

          // Wait for response
          await page.waitForTimeout(5000);
          await page.screenshot({ path: 'verification-step5-chat-response.png' });

          // Check for chat response
          const chatMessages = page.locator('.chat-message, .message, .response');
          if (await chatMessages.count() > 0) {
            console.log('✅ Chat response received');
          } else {
            console.log('⚠️ No visible chat response found');
          }
        } else {
          console.log('⚠️ Send button not found');
        }
      } else {
        console.log('⚠️ Chat interface not found on this page');
      }
    } else {
      console.log('⚠️ AI Chat tab not found');
    }

    // Final screenshot
    await page.screenshot({ path: 'verification-final.png' });
    console.log('🔍 Verification completed');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    await page.screenshot({ path: 'verification-error.png' });
  } finally {
    await browser.close();
  }
}

// Run verification
verifyClinIQ().catch(console.error);