"""
Seed 10 realistic patients with full medical history into Supabase.
Each patient gets: patients row, documents row, extracted_info row, embeddings.

Run:
  cd backend
  source .venv/bin/activate
  python scripts/seed_patients.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv()

from db.supabase import get_supabase
from services.embeddings import store_embeddings

# ── 10 Patient Records ───────────────────────────────────────────────────────

PATIENTS = [
    {
        "profile": {
            "name": "Sarah Johnson",
            "age": 45,
            "gender": "Female",
            "medical_specialty": "Cardiology",
        },
        "extracted": {
            "medications": ["Lisinopril 10mg", "Metoprolol 25mg", "Aspirin 81mg", "Atorvastatin 40mg"],
            "allergies": ["Sulfa drugs", "Iodine contrast dye"],
            "diagnoses": ["Hypertension", "Coronary Artery Disease", "Hyperlipidemia", "Mild Heart Failure (EF 45%)"],
            "lab_results": [
                {"test": "LDL Cholesterol", "value": "142", "unit": "mg/dL", "date": "2025-03-10"},
                {"test": "Blood Pressure", "value": "148/92", "unit": "mmHg", "date": "2025-04-01"},
                {"test": "BNP", "value": "310", "unit": "pg/mL", "date": "2025-04-01"},
                {"test": "HbA1c", "value": "5.6", "unit": "%", "date": "2025-03-10"},
            ],
            "summary_text": "Sarah Johnson is a 45-year-old female with a history of hypertension and coronary artery disease. She has mild heart failure with an ejection fraction of 45% and is currently managed on Lisinopril, Metoprolol, Aspirin, and Atorvastatin. She has a documented allergy to sulfa drugs and iodine contrast dye.",
        },
        "raw_text": """
PATIENT: Sarah Johnson | AGE: 45 | GENDER: Female | SPECIALTY: Cardiology
PATIENT ID: SJ-2025-001

CHIEF COMPLAINT: Follow-up for hypertension and cardiac management.

HISTORY OF PRESENT ILLNESS:
Sarah Johnson is a 45-year-old female presenting for routine cardiac follow-up.
She was diagnosed with hypertension 8 years ago and coronary artery disease 3 years ago
following a stress test that showed mild ischemia. She underwent cardiac catheterization
which revealed 60% stenosis in the LAD. Recent echocardiogram showed mild left ventricular
dysfunction with ejection fraction of 45%. She reports occasional shortness of breath on
exertion and mild ankle swelling in the evenings.

PAST MEDICAL HISTORY:
- Hypertension (diagnosed 2017)
- Coronary Artery Disease (diagnosed 2022)
- Hyperlipidemia (diagnosed 2019)
- Mild Heart Failure, EF 45% (diagnosed 2024)

MEDICATIONS:
- Lisinopril 10mg once daily (ACE inhibitor for heart failure and hypertension)
- Metoprolol Succinate 25mg once daily (beta blocker for heart failure)
- Aspirin 81mg once daily (antiplatelet for CAD)
- Atorvastatin 40mg at bedtime (statin for hyperlipidemia)

ALLERGIES:
- Sulfa drugs — rash and urticaria
- Iodine contrast dye — anaphylactic reaction in 2020

FAMILY HISTORY:
Father died of myocardial infarction at age 58. Mother has hypertension and type 2 diabetes.

SOCIAL HISTORY:
Non-smoker. Occasional alcohol (1-2 drinks per week). Works as a school teacher.
Exercises 2-3 times per week (walking 30 minutes).

REVIEW OF SYSTEMS:
Positive: Exertional dyspnea, mild bilateral ankle edema, occasional palpitations.
Negative: No chest pain at rest, no syncope, no orthopnea.

PHYSICAL EXAMINATION:
BP: 148/92 mmHg, HR: 78 bpm, RR: 16, SpO2: 97% on room air
Weight: 168 lbs, Height: 5'5"
Cardiovascular: Regular rate and rhythm, S3 gallop present, mild bilateral pitting edema (1+)
Lungs: Clear to auscultation bilaterally, no crackles

LABORATORY RESULTS:
- LDL Cholesterol: 142 mg/dL (elevated, target < 70 for CAD patients)
- HDL Cholesterol: 48 mg/dL
- Triglycerides: 189 mg/dL
- Blood Pressure: 148/92 mmHg
- BNP: 310 pg/mL (elevated, indicating heart failure)
- HbA1c: 5.6% (pre-diabetic range)
- Creatinine: 1.1 mg/dL (normal)
- eGFR: 72 mL/min (normal)

ASSESSMENT AND PLAN:
1. Hypertension — poorly controlled. Increase Lisinopril to 20mg. Dietary sodium restriction advised.
2. CAD with mild heart failure — EF 45%, consider cardiology referral for ICD evaluation if EF drops below 35%.
3. Hyperlipidemia — LDL above goal. Increase Atorvastatin to 80mg or consider adding Ezetimibe.
4. Pre-diabetes — lifestyle modification, repeat HbA1c in 6 months.
Follow-up in 4 weeks or sooner if symptoms worsen.
""",
    },

    {
        "profile": {
            "name": "Michael Chen",
            "age": 62,
            "gender": "Male",
            "medical_specialty": "Oncology",
        },
        "extracted": {
            "medications": ["Carboplatin IV", "Pemetrexed IV", "Pembrolizumab IV", "Ondansetron 8mg", "Dexamethasone 4mg", "Omeprazole 20mg"],
            "allergies": ["Cisplatin — nephrotoxicity", "Penicillin — rash"],
            "diagnoses": ["Non-Small Cell Lung Cancer (Stage IIIA)", "COPD", "Type 2 Diabetes"],
            "lab_results": [
                {"test": "WBC", "value": "3.2", "unit": "K/uL", "date": "2025-04-15"},
                {"test": "Hemoglobin", "value": "10.8", "unit": "g/dL", "date": "2025-04-15"},
                {"test": "Platelets", "value": "145", "unit": "K/uL", "date": "2025-04-15"},
                {"test": "Creatinine", "value": "1.4", "unit": "mg/dL", "date": "2025-04-15"},
            ],
            "summary_text": "Michael Chen is a 62-year-old male with Stage IIIA non-small cell lung cancer currently on Carboplatin/Pemetrexed/Pembrolizumab chemotherapy. He has comorbid COPD and type 2 diabetes. He has a documented allergy to Cisplatin and Penicillin. Current blood counts show mild myelosuppression.",
        },
        "raw_text": """
PATIENT: Michael Chen | AGE: 62 | GENDER: Male | SPECIALTY: Oncology
PATIENT ID: MC-2025-002

CHIEF COMPLAINT: Cycle 4 chemotherapy follow-up, non-small cell lung cancer.

HISTORY OF PRESENT ILLNESS:
Michael Chen is a 62-year-old male with a 40 pack-year smoking history, diagnosed with
Stage IIIA non-small cell lung cancer (adenocarcinoma, EGFR negative, PD-L1 TPS 65%) in
November 2024. He is currently receiving Carboplatin AUC5 + Pemetrexed 500mg/m2 +
Pembrolizumab 200mg every 3 weeks. He has completed 3 cycles and is presenting for Cycle 4.
He reports moderate fatigue, occasional nausea controlled with Ondansetron, and decreased
appetite. No hemoptysis, no new chest pain.

PAST MEDICAL HISTORY:
- Non-Small Cell Lung Cancer, Stage IIIA, adenocarcinoma (diagnosed 2024)
- COPD, moderate severity (FEV1 62% predicted)
- Type 2 Diabetes Mellitus (on oral agents, HbA1c 7.2%)
- Former smoker — quit 2023, 40 pack-year history

MEDICATIONS:
- Carboplatin AUC5 IV every 3 weeks (chemotherapy)
- Pemetrexed 500mg/m2 IV every 3 weeks (chemotherapy)
- Pembrolizumab 200mg IV every 3 weeks (immunotherapy)
- Ondansetron 8mg orally every 8 hours PRN nausea
- Dexamethasone 4mg twice daily on chemo days
- Omeprazole 20mg daily (GI prophylaxis)
- Tiotropium inhaler once daily (COPD management)
- Metformin 1000mg twice daily (diabetes)

ALLERGIES:
- Cisplatin — nephrotoxicity (creatinine rose to 3.2 during trial in 2023)
- Penicillin — urticarial rash

LABORATORY RESULTS (pre-cycle 4):
- WBC: 3.2 K/uL (low — nadir expected)
- ANC: 1.4 K/uL (borderline, proceed with caution)
- Hemoglobin: 10.8 g/dL (mild anemia)
- Platelets: 145 K/uL (adequate for treatment)
- Creatinine: 1.4 mg/dL (stable, dose adjust Pemetrexed if > 1.5)
- ALT: 32 U/L (normal)
- HbA1c: 7.2%

IMAGING: CT chest (March 2025) — primary tumor decreased from 4.2cm to 2.8cm.
No new mediastinal adenopathy. Partial response to therapy.

ASSESSMENT AND PLAN:
1. NSCLC Stage IIIA — partial response. Proceed with Cycle 4.
2. Mild myelosuppression — monitor CBC, add G-CSF if ANC < 1.0
3. Anemia — consider Epoetin if Hgb drops below 10
4. COPD — continue Tiotropium, avoid respiratory infections
5. Follow-up CT scan after Cycle 6 to reassess response.
""",
    },

    {
        "profile": {
            "name": "Emily Rodriguez",
            "age": 29,
            "gender": "Female",
            "medical_specialty": "Obstetrics",
        },
        "extracted": {
            "medications": ["Prenatal vitamins", "Metformin 500mg", "Labetalol 100mg", "Low-dose Aspirin 81mg"],
            "allergies": ["Latex", "Codeine — nausea and vomiting"],
            "diagnoses": ["Gestational Diabetes Mellitus", "Gestational Hypertension", "Twin Pregnancy (28 weeks)", "Mild Anemia"],
            "lab_results": [
                {"test": "Glucose (fasting)", "value": "118", "unit": "mg/dL", "date": "2025-04-10"},
                {"test": "Blood Pressure", "value": "142/88", "unit": "mmHg", "date": "2025-04-20"},
                {"test": "Hemoglobin", "value": "10.2", "unit": "g/dL", "date": "2025-04-10"},
                {"test": "HbA1c", "value": "6.1", "unit": "%", "date": "2025-04-10"},
            ],
            "summary_text": "Emily Rodriguez is a 29-year-old female at 28 weeks gestation with twin pregnancy, complicated by gestational diabetes and gestational hypertension. She is on Metformin, Labetalol, low-dose aspirin, and prenatal vitamins. She has latex and codeine allergies. Fetal growth appears appropriate for gestational age.",
        },
        "raw_text": """
PATIENT: Emily Rodriguez | AGE: 29 | GENDER: Female | SPECIALTY: Obstetrics
PATIENT ID: ER-2025-003

CHIEF COMPLAINT: Routine prenatal visit, 28-week twin pregnancy with gestational diabetes.

OBSTETRIC HISTORY:
G2P1 — one prior uncomplicated vaginal delivery in 2022.
Current pregnancy: dichorionic-diamniotic twins (IVF conception).
Gestational age: 28 weeks 3 days by ultrasound.

HISTORY OF PRESENT ILLNESS:
Emily Rodriguez is a 29-year-old female presenting for her 28-week prenatal visit.
She was diagnosed with gestational diabetes mellitus at 24 weeks following a failed
50g glucose challenge test (1-hour glucose 178 mg/dL) and abnormal 100g OGTT.
She is now managed on Metformin and dietary modification. Fasting glucose at home
averages 110-125 mg/dL. She also developed gestational hypertension at 26 weeks
and was started on Labetalol. She denies headaches, visual changes, or epigastric pain.
No contractions, fetal movements are active bilaterally.

MEDICATIONS:
- Prenatal vitamins with DHA (daily)
- Metformin 500mg twice daily (gestational diabetes)
- Labetalol 100mg twice daily (gestational hypertension)
- Low-dose Aspirin 81mg daily (preeclampsia prophylaxis)
- Iron supplementation 325mg daily (anemia)

ALLERGIES:
- Latex — contact urticaria and anaphylaxis risk
- Codeine — severe nausea and vomiting

PHYSICAL EXAMINATION:
BP: 142/88 mmHg (elevated), HR: 88 bpm
Weight: 172 lbs (pre-pregnancy: 145 lbs, weight gain 27 lbs appropriate for twins)
Fundal height: 32 cm (appropriate for twin gestation)
Fetal heart tones: Twin A 148 bpm, Twin B 152 bpm
Cervix: Closed, long, posterior

LABORATORY RESULTS:
- Fasting glucose: 118 mg/dL (target < 95 — above goal)
- 2-hour postprandial glucose: 148 mg/dL (target < 120 — above goal)
- HbA1c: 6.1%
- Hemoglobin: 10.2 g/dL (mild anemia)
- Urine protein: 1+ (monitoring for preeclampsia)
- Uric acid: 5.8 mg/dL
- Platelets: 198 K/uL (normal)

ULTRASOUND (28 weeks):
Twin A: EFW 1,180g (51st percentile), cephalic presentation, AFI 12
Twin B: EFW 1,140g (48th percentile), transverse presentation, AFI 11
No placenta previa. Cervical length 3.2 cm (adequate).

ASSESSMENT AND PLAN:
1. GDM — glucose above target. Increase Metformin to 1000mg twice daily.
   If still uncontrolled in 1 week, add insulin.
2. Gestational hypertension — BP elevated. Increase Labetalol to 200mg twice daily.
   Monitor for preeclampsia symptoms. 24-hour urine protein ordered.
3. Twin pregnancy — growth appropriate, continue biweekly NST from 32 weeks.
4. Mild anemia — increase iron supplementation.
Delivery plan: Planned C-section at 37 weeks given twin B transverse presentation.
""",
    },

    {
        "profile": {
            "name": "Robert Williams",
            "age": 72,
            "gender": "Male",
            "medical_specialty": "Neurology",
        },
        "extracted": {
            "medications": ["Carbidopa-Levodopa 25/100mg", "Pramipexole 0.5mg", "Rivastigmine 9.5mg patch", "Memantine 10mg", "Donepezil 10mg"],
            "allergies": ["Haloperidol — severe extrapyramidal reactions", "NSAIDs — GI bleeding history"],
            "diagnoses": ["Parkinson's Disease (Hoehn & Yahr Stage 3)", "Mild Cognitive Impairment", "Orthostatic Hypotension", "Depression"],
            "lab_results": [
                {"test": "MoCA Score", "value": "21", "unit": "/30", "date": "2025-02-15"},
                {"test": "BP Lying", "value": "138/82", "unit": "mmHg", "date": "2025-04-05"},
                {"test": "BP Standing", "value": "108/64", "unit": "mmHg", "date": "2025-04-05"},
                {"test": "Vitamin B12", "value": "310", "unit": "pg/mL", "date": "2025-02-15"},
            ],
            "summary_text": "Robert Williams is a 72-year-old male with Parkinson's disease (Hoehn & Yahr Stage 3) and mild cognitive impairment on Carbidopa-Levodopa, Pramipexole, Rivastigmine, and Memantine. He has significant orthostatic hypotension (30 mmHg drop on standing) and a documented allergy to Haloperidol causing severe extrapyramidal reactions.",
        },
        "raw_text": """
PATIENT: Robert Williams | AGE: 72 | GENDER: Male | SPECIALTY: Neurology
PATIENT ID: RW-2025-004

CHIEF COMPLAINT: Parkinson's disease follow-up — worsening tremor and balance issues.

HISTORY OF PRESENT ILLNESS:
Robert Williams is a 72-year-old male with a 9-year history of Parkinson's disease,
currently at Hoehn & Yahr Stage 3. He reports increased resting tremor in the right hand
over the past 3 months, significant "wearing off" of medications (dyskinesias 2-3 hours
before next dose), and two falls in the past month. His wife reports increased forgetfulness
and confusion, particularly in the evenings (sundowning). He has documented orthostatic
hypotension causing presyncope when standing.

PAST MEDICAL HISTORY:
- Parkinson's Disease, Hoehn & Yahr Stage 3 (diagnosed 2016)
- Mild Cognitive Impairment (diagnosed 2023, MoCA 21/30)
- Orthostatic Hypotension (symptomatic)
- Major Depressive Disorder (in remission on medications)
- History of GI bleeding (2019, likely NSAID-related)

MEDICATIONS:
- Carbidopa-Levodopa 25/100mg four times daily (Parkinson's motor symptoms)
- Pramipexole 0.5mg three times daily (dopamine agonist)
- Rivastigmine 9.5mg transdermal patch daily (cognitive impairment)
- Memantine 10mg twice daily (cognitive impairment)
- Donepezil 10mg at bedtime (cognitive support)
- Sertraline 50mg daily (depression)
- Fludrocortisone 0.1mg daily (orthostatic hypotension)
- Compression stockings (orthostatic hypotension)

ALLERGIES:
- Haloperidol — severe extrapyramidal reactions (cannot use ANY typical antipsychotics)
- NSAIDs — GI bleeding episode in 2019
NOTE: If antipsychotic is needed, use Quetiapine (safest in Parkinson's dementia).

NEUROLOGICAL EXAMINATION:
- Tremor: Resting tremor 3-4 Hz, right > left hand, pill-rolling
- Rigidity: Moderate cogwheel rigidity bilateral upper extremities
- Bradykinesia: Moderate, finger tapping reduced amplitude
- Gait: Shuffling, reduced arm swing, festination noted
- Postural instability: Pull test positive (takes 2 steps back)

COGNITIVE ASSESSMENT:
MoCA Score: 21/30 (mild cognitive impairment, down from 24/30 in 2023)
Deficits noted in visuospatial tasks, attention, and delayed recall.

LABORATORY RESULTS:
- Lying BP: 138/82 mmHg | Standing BP (2 min): 108/64 mmHg (orthostatic drop 30/18)
- Vitamin B12: 310 pg/mL (borderline low)
- TSH: 2.1 mIU/L (normal)
- CBC: Normal
- Renal function: Normal

ASSESSMENT AND PLAN:
1. Parkinson's — wearing-off phenomenon. Change to Carbidopa-Levodopa CR formulation.
   Consider adding Entacapone to extend levodopa effect.
2. Falls risk — physical therapy referral for balance training. Home safety assessment.
3. Cognitive decline — continue Rivastigmine + Memantine. Caregiver education.
4. Orthostatic hypotension — add Midodrine 5mg with meals.
5. IMPORTANT: No typical antipsychotics. If behavioral symptoms worsen, use Quetiapine only.
""",
    },

    {
        "profile": {
            "name": "Priya Patel",
            "age": 38,
            "gender": "Female",
            "medical_specialty": "Endocrinology",
        },
        "extracted": {
            "medications": ["Insulin Glargine 24 units", "Insulin Lispro sliding scale", "Levothyroxine 75mcg", "Metformin 1000mg", "Lisinopril 5mg"],
            "allergies": ["Glipizide — hypoglycemic episodes", "Shellfish"],
            "diagnoses": ["Type 1 Diabetes Mellitus", "Hypothyroidism (Hashimoto's)", "Diabetic Nephropathy (Stage 2)", "Diabetic Retinopathy (mild non-proliferative)"],
            "lab_results": [
                {"test": "HbA1c", "value": "8.4", "unit": "%", "date": "2025-04-01"},
                {"test": "Fasting Glucose", "value": "198", "unit": "mg/dL", "date": "2025-04-01"},
                {"test": "TSH", "value": "4.8", "unit": "mIU/L", "date": "2025-04-01"},
                {"test": "Urine Albumin/Creatinine", "value": "85", "unit": "mg/g", "date": "2025-04-01"},
            ],
            "summary_text": "Priya Patel is a 38-year-old female with Type 1 diabetes mellitus and Hashimoto's hypothyroidism. Her diabetes is poorly controlled (HbA1c 8.4%) with evidence of early nephropathy (microalbuminuria 85 mg/g) and mild non-proliferative retinopathy. She is on Insulin Glargine, Lispro, Levothyroxine, Metformin, and Lisinopril.",
        },
        "raw_text": """
PATIENT: Priya Patel | AGE: 38 | GENDER: Female | SPECIALTY: Endocrinology
PATIENT ID: PP-2025-005

CHIEF COMPLAINT: Poorly controlled Type 1 diabetes, HbA1c review.

HISTORY OF PRESENT ILLNESS:
Priya Patel is a 38-year-old female with a 22-year history of Type 1 diabetes mellitus,
diagnosed at age 16. She presents for quarterly endocrinology follow-up. Her most recent
HbA1c is 8.4%, above her target of 7.0%. She uses a continuous glucose monitor (CGM) but
reports frequent hypoglycemic episodes at night (glucose 50-65 mg/dL) and hyperglycemia
post-meals. She was recently found to have microalbuminuria on her annual nephrology screen
and has mild non-proliferative diabetic retinopathy on ophthalmology exam.

PAST MEDICAL HISTORY:
- Type 1 Diabetes Mellitus (diagnosed age 16, 2003)
- Hypothyroidism, Hashimoto's thyroiditis (diagnosed 2018)
- Diabetic Nephropathy, Stage 2 (microalbuminuria)
- Mild Non-Proliferative Diabetic Retinopathy (ophthalmology confirmed 2025)
- Celiac disease (dietary restriction only)

MEDICATIONS:
- Insulin Glargine (Lantus) 24 units at bedtime (basal insulin)
- Insulin Lispro (Humalog) sliding scale with meals (bolus insulin)
  Ratio: 1 unit per 15g carbohydrates + correction factor
- Levothyroxine 75mcg daily on empty stomach (hypothyroidism)
- Metformin 1000mg twice daily (off-label for insulin sensitization)
- Lisinopril 5mg daily (nephroprotection for microalbuminuria)
- Vitamin D3 2000 IU daily

ALLERGIES:
- Glipizide (sulfonylurea) — severe hypoglycemic episodes (not indicated for T1DM anyway)
- Shellfish — anaphylaxis

LABORATORY RESULTS:
- HbA1c: 8.4% (target < 7.0%)
- Fasting glucose: 198 mg/dL
- CGM Time-in-Range: 51% (target > 70%)
- TSH: 4.8 mIU/L (mildly elevated — Levothyroxine may need adjustment)
- Free T4: 0.9 ng/dL (low-normal)
- Urine Albumin/Creatinine Ratio: 85 mg/g (microalbuminuria, target < 30)
- Creatinine: 0.9 mg/dL, eGFR 82 mL/min
- Lipid panel: LDL 108 mg/dL (needs statin for diabetes with nephropathy)
- Vitamin D: 22 ng/mL (insufficient)

OPHTHALMOLOGY NOTE (2025): Mild bilateral non-proliferative diabetic retinopathy.
No macular edema. Repeat in 12 months.

ASSESSMENT AND PLAN:
1. Poorly controlled T1DM — increase Glargine to 28 units. Adjust carb ratio.
   Consider insulin pump therapy referral (better TIR outcomes).
2. Microalbuminuria — increase Lisinopril to 10mg. Goal ACR < 30.
3. Hypothyroidism — increase Levothyroxine to 88mcg. Recheck TSH in 6 weeks.
4. Add Rosuvastatin 10mg for cardiovascular risk reduction (diabetes + nephropathy).
5. Ophthalmology follow-up annually for retinopathy monitoring.
""",
    },

    {
        "profile": {
            "name": "James Thompson",
            "age": 56,
            "gender": "Male",
            "medical_specialty": "Orthopedics",
        },
        "extracted": {
            "medications": ["Celecoxib 200mg", "Tramadol 50mg PRN", "Calcium 1200mg", "Vitamin D 1000 IU", "Pantoprazole 40mg"],
            "allergies": ["Morphine — respiratory depression", "Aspirin — GI intolerance"],
            "diagnoses": ["Severe Osteoarthritis Right Knee (Grade IV)", "Lumbar Spondylosis L4-L5", "Obesity (BMI 34)", "Hypertension"],
            "lab_results": [
                {"test": "BMI", "value": "34.2", "unit": "kg/m2", "date": "2025-04-12"},
                {"test": "Vitamin D", "value": "18", "unit": "ng/mL", "date": "2025-03-01"},
                {"test": "CRP", "value": "14.2", "unit": "mg/L", "date": "2025-03-01"},
                {"test": "ESR", "value": "38", "unit": "mm/hr", "date": "2025-03-01"},
            ],
            "summary_text": "James Thompson is a 56-year-old male with Grade IV osteoarthritis of the right knee and lumbar spondylosis at L4-L5, complicated by obesity (BMI 34). He is scheduled for total right knee replacement surgery. He has allergies to Morphine and Aspirin. Post-operative pain management must avoid opioids and NSAIDs — use regional anesthesia.",
        },
        "raw_text": """
PATIENT: James Thompson | AGE: 56 | GENDER: Male | SPECIALTY: Orthopedics
PATIENT ID: JT-2025-006

CHIEF COMPLAINT: Pre-operative assessment for total right knee replacement.

HISTORY OF PRESENT ILLNESS:
James Thompson is a 56-year-old male presenting for pre-operative evaluation before
scheduled total right knee arthroplasty (TKA). He has a 10-year history of progressive
right knee osteoarthritis with significant functional limitation. He reports right knee
pain 8/10 at rest and 10/10 with activity, inability to walk more than one block,
difficulty climbing stairs, and severely impaired quality of life. X-rays show Grade IV
osteoarthritis with bone-on-bone contact, severe joint space narrowing, and osteophyte
formation. Conservative management has failed including physical therapy, cortisone
injections (4 in past 2 years), hyaluronic acid injections, and oral analgesics.

PAST MEDICAL HISTORY:
- Severe Osteoarthritis, Right Knee, Grade IV (Kellgren-Lawrence)
- Lumbar Spondylosis L4-L5 with moderate foraminal stenosis
- Obesity, BMI 34.2
- Hypertension (well-controlled on Amlodipine)
- Vitamin D deficiency

MEDICATIONS:
- Celecoxib 200mg twice daily (COX-2 inhibitor — NSAID alternative)
- Tramadol 50mg every 6 hours PRN pain
- Amlodipine 5mg daily (hypertension)
- Calcium 1200mg daily (bone health)
- Vitamin D3 1000 IU daily (deficiency replacement)
- Pantoprazole 40mg daily (GI prophylaxis with COX-2 inhibitor)

ALLERGIES:
- Morphine — respiratory depression and severe nausea (documented ER visit 2018)
- Aspirin — GI intolerance, peptic ulcer in 2016
NOTE: Post-op pain management MUST avoid morphine and aspirin.
Use: Acetaminophen + Ketorolac + Regional nerve block (femoral/adductor canal block).

IMAGING:
Right Knee X-ray (AP/Lateral): Grade IV OA, complete loss of medial joint space,
varus deformity 8 degrees, large osteophytes, subchondral sclerosis.
MRI Right Knee: Full-thickness cartilage loss medial compartment, medial meniscal
extrusion, bone marrow edema.

LABORATORY RESULTS (Pre-op):
- CBC: WBC 8.2, Hgb 13.8 g/dL, Platelets 278K (normal for surgery)
- Coagulation: PT 12.1, INR 1.0, aPTT 29 sec (normal)
- BMP: Normal renal and electrolyte function
- BMI: 34.2 kg/m2 (obese — increased surgical risk)
- Vitamin D: 18 ng/mL (deficient — increase supplementation pre-op)
- CRP: 14.2 mg/L (elevated — inflammatory marker)
- ESR: 38 mm/hr

SURGICAL PLAN:
Total right knee arthroplasty (TKA) using cemented posterior-stabilized implant.
Anesthesia: Spinal anesthesia + adductor canal nerve block.
Post-op pain: Acetaminophen 1000mg Q6h + Ketorolac 15mg Q6h + nerve block.
DVT prophylaxis: Enoxaparin 40mg daily for 10 days post-op.
Physical therapy: Day 1 post-op weight bearing as tolerated.
""",
    },

    {
        "profile": {
            "name": "Lisa Anderson",
            "age": 43,
            "gender": "Female",
            "medical_specialty": "Psychiatry",
        },
        "extracted": {
            "medications": ["Lithium Carbonate 600mg", "Quetiapine 200mg", "Lamotrigine 150mg", "Sertraline 50mg", "Lorazepam 0.5mg PRN"],
            "allergies": ["Valproate — hepatotoxicity", "Olanzapine — severe weight gain and metabolic syndrome"],
            "diagnoses": ["Bipolar I Disorder (current episode mixed)", "Generalized Anxiety Disorder", "PTSD", "Hypothyroidism (lithium-induced)"],
            "lab_results": [
                {"test": "Lithium Level", "value": "0.7", "unit": "mEq/L", "date": "2025-04-18"},
                {"test": "TSH", "value": "6.2", "unit": "mIU/L", "date": "2025-04-18"},
                {"test": "Creatinine", "value": "1.0", "unit": "mg/dL", "date": "2025-04-18"},
                {"test": "PHQ-9 Score", "value": "14", "unit": "/27", "date": "2025-04-18"},
            ],
            "summary_text": "Lisa Anderson is a 43-year-old female with Bipolar I disorder, PTSD, and GAD on Lithium, Quetiapine, Lamotrigine, and Sertraline. Her lithium level is at the lower therapeutic range (0.7 mEq/L) and she has lithium-induced hypothyroidism with TSH 6.2. Allergies to Valproate (hepatotoxicity) and Olanzapine (metabolic syndrome).",
        },
        "raw_text": """
PATIENT: Lisa Anderson | AGE: 43 | GENDER: Female | SPECIALTY: Psychiatry
PATIENT ID: LA-2025-007

CHIEF COMPLAINT: Bipolar disorder follow-up — mixed episode with increased anxiety.

HISTORY OF PRESENT ILLNESS:
Lisa Anderson is a 43-year-old female with a 15-year history of Bipolar I disorder
presenting for outpatient psychiatric follow-up. She reports a mixed episode over the
past 3 weeks with symptoms of elevated mood, decreased need for sleep (3-4 hours/night),
racing thoughts, impulsivity, AND simultaneous depression with passive suicidal ideation
(no plan or intent). She denies psychotic symptoms. She also reports worsening anxiety
and flashbacks related to childhood trauma (PTSD diagnosis 2019). No recent hospitalizations.
Last manic episode requiring hospitalization was in 2022.

PAST MEDICAL HISTORY:
- Bipolar I Disorder (diagnosed 2009, multiple hospitalizations)
- Generalized Anxiety Disorder (comorbid)
- PTSD (childhood trauma, diagnosed 2019)
- Lithium-induced Hypothyroidism (developed 2021, on Levothyroxine)
- Mild Essential Tremor (lithium side effect)

MEDICATIONS:
- Lithium Carbonate 600mg twice daily (mood stabilizer — monitor levels)
- Quetiapine 200mg at bedtime (mood stabilizer + sleep)
- Lamotrigine 150mg once daily (mood stabilizer, depression prevention)
- Sertraline 50mg once daily (GAD and PTSD — cautious use in bipolar)
- Lorazepam 0.5mg PRN anxiety (limited supply — addiction risk monitored)
- Levothyroxine 50mcg daily (lithium-induced hypothyroidism)
- Propranolol 10mg twice daily (lithium tremor)

ALLERGIES:
- Valproate (Depakote) — hepatotoxicity, ALT elevated 3x ULN in 2015
- Olanzapine — severe weight gain (gained 35 lbs in 3 months, 2018) and metabolic syndrome

MENTAL STATUS EXAMINATION:
Appearance: Well-groomed, age-appropriate, mildly agitated
Behavior: Cooperative, psychomotor agitation noted
Speech: Mildly pressured
Mood: "Up and down at the same time"
Affect: Labile, dysphoric
Thought process: Mildly tangential
Thought content: Passive SI, no HI, no delusions
Perceptual: No hallucinations
Cognition: Alert and oriented x4, intact
Insight: Fair | Judgment: Fair
PHQ-9: 14/27 (moderate depression)
GAD-7: 16/21 (severe anxiety)

LABORATORY RESULTS:
- Lithium level (12-hour trough): 0.7 mEq/L (therapeutic range 0.6-1.2; lower end)
- TSH: 6.2 mIU/L (above normal — increase Levothyroxine)
- Free T4: 0.8 ng/dL (low-normal)
- Creatinine: 1.0 mg/dL (lithium nephrotoxicity monitoring — normal)
- eGFR: 85 mL/min (normal)
- Sodium: 140 mEq/L (monitor — low Na increases lithium toxicity risk)

ASSESSMENT AND PLAN:
1. Bipolar mixed episode — increase Lithium to 900mg nightly. Target level 0.8-1.0.
2. Anxiety/PTSD — refer to trauma-focused CBT. Continue Sertraline cautiously.
3. Hypothyroidism — increase Levothyroxine to 75mcg. Recheck TSH in 6 weeks.
4. Safety plan reviewed. Emergency contacts identified. No hospitalization indicated now.
5. Next appointment in 2 weeks due to mixed episode severity.
NEVER prescribe Valproate or Olanzapine for this patient.
""",
    },

    {
        "profile": {
            "name": "David Kim",
            "age": 68,
            "gender": "Male",
            "medical_specialty": "Pulmonology",
        },
        "extracted": {
            "medications": ["Tiotropium 18mcg inhaler", "Salmeterol/Fluticasone 50/500mcg", "Albuterol inhaler PRN", "Roflumilast 500mcg", "Azithromycin 250mg"],
            "allergies": ["ACE inhibitors — chronic cough", "Theophylline — seizures (toxic levels in 2017)"],
            "diagnoses": ["COPD (GOLD Stage III)", "Obstructive Sleep Apnea (severe)", "Pulmonary Hypertension", "Cor Pulmonale"],
            "lab_results": [
                {"test": "FEV1", "value": "42", "unit": "% predicted", "date": "2025-03-20"},
                {"test": "SpO2 (resting)", "value": "91", "unit": "%", "date": "2025-04-15"},
                {"test": "6MWT Distance", "value": "280", "unit": "meters", "date": "2025-03-20"},
                {"test": "BNP", "value": "420", "unit": "pg/mL", "date": "2025-04-15"},
            ],
            "summary_text": "David Kim is a 68-year-old male with GOLD Stage III COPD, severe obstructive sleep apnea, and pulmonary hypertension with cor pulmonale. He is on triple inhaler therapy, Roflumilast, and prophylactic Azithromycin. He has allergies to ACE inhibitors (cough) and Theophylline (seizures). Resting SpO2 of 91% — supplemental oxygen indicated.",
        },
        "raw_text": """
PATIENT: David Kim | AGE: 68 | GENDER: Male | SPECIALTY: Pulmonology
PATIENT ID: DK-2025-008

CHIEF COMPLAINT: COPD follow-up — worsening dyspnea and reduced exercise tolerance.

HISTORY OF PRESENT ILLNESS:
David Kim is a 68-year-old male, former heavy smoker (50 pack-years, quit 2018), with
GOLD Stage III COPD (FEV1 42% predicted on most recent PFTs). He presents with worsening
dyspnea on minimal exertion over the past 6 months, now limited to walking less than 100
feet before stopping. He had 3 COPD exacerbations in the past year, two requiring
hospitalization. He is also managed for severe obstructive sleep apnea (AHI 45/hr on
CPAP compliance data showing 6.2 hours/night use). Recent echocardiogram showed elevated
RV pressure (55 mmHg) consistent with pulmonary hypertension and early cor pulmonale.

PAST MEDICAL HISTORY:
- COPD, GOLD Stage III (FEV1/FVC 0.58, FEV1 42% predicted)
- Obstructive Sleep Apnea, severe (AHI 45/hr, on CPAP)
- Pulmonary Arterial Hypertension (confirmed on right heart catheterization)
- Cor Pulmonale (RV dysfunction secondary to pulmonary hypertension)
- Former smoker — 50 pack-years, quit 2018

MEDICATIONS:
- Tiotropium 18mcg inhaler once daily (long-acting anticholinergic bronchodilator)
- Salmeterol/Fluticasone 50/500mcg inhaler twice daily (LABA/ICS combination)
- Albuterol 90mcg inhaler every 4-6 hours PRN (rescue bronchodilator)
- Roflumilast 500mcg once daily (PDE4 inhibitor — reduces exacerbations)
- Azithromycin 250mg three times weekly (prophylactic — reduces exacerbation frequency)
- Sildenafil 20mg three times daily (pulmonary hypertension)
- Furosemide 40mg daily (cor pulmonale — right heart failure)
- Supplemental oxygen 2L/min continuously (SpO2 target 88-92%)

ALLERGIES:
- ACE inhibitors (all — Lisinopril, Enalapril) — intractable chronic cough
- Theophylline — seizure in 2017 when levels became toxic (narrow therapeutic index)

PULMONARY FUNCTION TESTS (March 2025):
- FVC: 2.8L (62% predicted)
- FEV1: 1.1L (42% predicted) — severe obstruction
- FEV1/FVC ratio: 0.39 (obstructive pattern)
- DLCO: 45% predicted (reduced — emphysema/pulmonary hypertension)

LABORATORY RESULTS:
- ABG (room air): pH 7.38, PaO2 58 mmHg, PaCO2 48 mmHg, HCO3 28 mEq/L
  (chronic hypoxemia with compensated hypercapnia)
- SpO2 resting: 91% on 2L O2 (drops to 82% on exertion)
- BNP: 420 pg/mL (elevated — right heart failure)
- CBC: Polycythemia (Hgb 17.2 g/dL, Hct 52%) — secondary to chronic hypoxemia
- 6-minute walk test: 280 meters (severely reduced, predicted > 500m)

ECHOCARDIOGRAM: RVSP 55 mmHg (pulmonary hypertension), RV dilation,
moderate tricuspid regurgitation. LV function preserved (EF 58%).

ASSESSMENT AND PLAN:
1. COPD — continue triple inhaler therapy. Consider pulmonary rehab referral.
2. Pulmonary hypertension — Sildenafil at therapeutic dose. Consider Riociguat if inadequate.
3. Cor pulmonale — Furosemide for fluid management. Daily weights.
4. Hypoxemia — increase O2 to 3L/min. Nocturnal O2 titration study.
5. COPD action plan given — start Prednisone 40mg + Azithromycin for exacerbations.
AVOID: ACE inhibitors, Theophylline, high-flow O2 (risk of CO2 retention).
""",
    },

    {
        "profile": {
            "name": "Maria Garcia",
            "age": 53,
            "gender": "Female",
            "medical_specialty": "Nephrology",
        },
        "extracted": {
            "medications": ["Sevelamer 800mg", "Cinacalcet 30mg", "Epoetin alfa 4000 units", "Ferrous sulfate 325mg", "Sodium bicarbonate 650mg", "Amlodipine 10mg"],
            "allergies": ["Contrast dye — AKI risk (contraindicated)", "Potassium supplements — hyperkalemia risk"],
            "diagnoses": ["Chronic Kidney Disease Stage 4 (eGFR 22)", "Diabetic Nephropathy", "Renal Anemia", "Secondary Hyperparathyroidism", "Metabolic Acidosis"],
            "lab_results": [
                {"test": "eGFR", "value": "22", "unit": "mL/min/1.73m2", "date": "2025-04-08"},
                {"test": "Creatinine", "value": "3.8", "unit": "mg/dL", "date": "2025-04-08"},
                {"test": "Hemoglobin", "value": "9.4", "unit": "g/dL", "date": "2025-04-08"},
                {"test": "PTH", "value": "385", "unit": "pg/mL", "date": "2025-04-08"},
            ],
            "summary_text": "Maria Garcia is a 53-year-old female with CKD Stage 4 (eGFR 22) secondary to diabetic nephropathy, complicated by renal anemia, secondary hyperparathyroidism, and metabolic acidosis. She is approaching dialysis threshold (eGFR < 15). Contrast dye is absolutely contraindicated. Potassium supplements must be avoided due to hyperkalemia risk.",
        },
        "raw_text": """
PATIENT: Maria Garcia | AGE: 53 | GENDER: Female | SPECIALTY: Nephrology
PATIENT ID: MG-2025-009

CHIEF COMPLAINT: CKD Stage 4 follow-up — progressive kidney disease management.

HISTORY OF PRESENT ILLNESS:
Maria Garcia is a 53-year-old female with a 20-year history of Type 2 diabetes mellitus
and progressive diabetic nephropathy, now at CKD Stage 4 (eGFR 22 mL/min/1.73m2).
She was referred to nephrology 3 years ago when eGFR dropped below 30. Over the past
12 months eGFR has declined from 28 to 22 (rate of decline ~6/year — faster than expected).
She is being prepared for dialysis planning. Arteriovenous fistula creation is scheduled
for next month. She reports fatigue, decreased appetite, mild lower extremity edema, and
generalized pruritus (uremic symptoms).

PAST MEDICAL HISTORY:
- Chronic Kidney Disease, Stage 4 (eGFR 22), diabetic nephropathy etiology
- Type 2 Diabetes Mellitus (25-year history, HbA1c 7.8%)
- Renal Anemia (EPO deficiency)
- Secondary Hyperparathyroidism (elevated PTH 385 pg/mL)
- Metabolic Acidosis (bicarbonate 17 mEq/L)
- Hypertension (target BP < 130/80 in CKD)
- Fluid overload (2+ pitting edema bilateral lower extremities)

MEDICATIONS:
- Sevelamer 800mg three times daily with meals (phosphate binder)
- Cinacalcet 30mg daily (secondary hyperparathyroidism)
- Epoetin alfa (Epogen) 4000 units subcutaneous weekly (renal anemia)
- Ferrous sulfate 325mg twice daily (iron for EPO response)
- Sodium bicarbonate 650mg three times daily (metabolic acidosis)
- Amlodipine 10mg daily (hypertension)
- Furosemide 80mg twice daily (fluid management)
- Insulin Glargine 20 units at bedtime (diabetes — Metformin STOPPED as eGFR < 30)
- Nephrovite (renal vitamin supplement) daily

ALLERGIES:
- Contrast dye (iodinated) — ABSOLUTE CONTRAINDICATION, risk of acute kidney injury
  and precipitating dialysis — never administer without nephrology consultation
- Potassium supplements/salt substitutes — hyperkalemia risk (K+ already 5.4 mEq/L)
- Metformin — discontinued (contraindicated in CKD Stage 3b+, lactic acidosis risk)
- NSAIDs — contraindicated (worsen kidney function)

DIETARY RESTRICTIONS: Low potassium, low phosphorus, low sodium, fluid restriction 1.5L/day.

LABORATORY RESULTS:
- Creatinine: 3.8 mg/dL (up from 3.2 six months ago)
- BUN: 68 mg/dL (elevated — uremic)
- eGFR: 22 mL/min/1.73m2 (Stage 4 CKD)
- Potassium: 5.4 mEq/L (high-normal — monitor closely)
- Phosphorus: 5.8 mg/dL (elevated despite sevelamer)
- PTH: 385 pg/mL (severely elevated — target 150-300 for CKD 4)
- Hemoglobin: 9.4 g/dL (renal anemia — target 10-11.5)
- Bicarbonate: 17 mEq/L (metabolic acidosis)
- Albumin: 3.4 g/dL (mildly low — nutritional marker)

ASSESSMENT AND PLAN:
1. CKD Stage 4 — dialysis planning initiated. AV fistula surgery scheduled.
   Renal transplant evaluation referral placed.
2. Hyperphosphatemia — increase Sevelamer to 1600mg with meals.
3. Hyperparathyroidism — increase Cinacalcet to 60mg.
4. Renal anemia — increase Epoetin to 6000 units weekly. Check iron studies.
5. Metabolic acidosis — increase sodium bicarbonate dose.
CRITICAL: NO contrast dye without nephrology approval. NO NSAIDs. NO Metformin.
""",
    },

    {
        "profile": {
            "name": "Thomas Brown",
            "age": 34,
            "gender": "Male",
            "medical_specialty": "Gastroenterology",
        },
        "extracted": {
            "medications": ["Infliximab 5mg/kg IV", "Azathioprine 150mg", "Prednisone 20mg (tapering)", "Mesalamine 4g enema", "Pantoprazole 40mg"],
            "allergies": ["Adalimumab — injection site reactions and loss of response", "5-ASA oral — worsening diarrhea"],
            "diagnoses": ["Crohn's Disease (ileocolonic, active flare)", "Perianal Fistula", "Iron Deficiency Anemia", "Osteopenia (steroid-induced)"],
            "lab_results": [
                {"test": "CRP", "value": "48", "unit": "mg/L", "date": "2025-04-20"},
                {"test": "Fecal Calprotectin", "value": "1850", "unit": "mcg/g", "date": "2025-04-10"},
                {"test": "Hemoglobin", "value": "10.1", "unit": "g/dL", "date": "2025-04-20"},
                {"test": "Albumin", "value": "2.9", "unit": "g/dL", "date": "2025-04-20"},
            ],
            "summary_text": "Thomas Brown is a 34-year-old male with active ileocolonic Crohn's disease and perianal fistula on Infliximab and Azathioprine combination therapy. He has iron deficiency anemia (Hgb 10.1) and malnutrition (albumin 2.9). He failed Adalimumab (loss of response) and oral 5-ASA (worsening diarrhea). High inflammatory markers suggest active flare requiring treatment optimization.",
        },
        "raw_text": """
PATIENT: Thomas Brown | AGE: 34 | GENDER: Male | SPECIALTY: Gastroenterology
PATIENT ID: TB-2025-010

CHIEF COMPLAINT: Crohn's disease flare — increased stool frequency, abdominal pain, rectal bleeding.

HISTORY OF PRESENT ILLNESS:
Thomas Brown is a 34-year-old male with a 9-year history of Crohn's disease (ileocolonic
distribution, L3 in Montreal classification) presenting with a moderate-to-severe flare.
Over the past 6 weeks he reports 8-10 loose bloody stools per day, severe crampy
periumbilical pain (7/10), significant weight loss (12 lbs in 2 months), fever to 38.3°C,
and worsening perianal pain from a known fistula. He was previously in remission on
Adalimumab but lost response after 2 years (detectable antibodies to adalimumab). He was
switched to Infliximab 4 months ago and initially responded but is now flaring again.
Colonoscopy 3 months ago showed deep ulcerations in terminal ileum and sigmoid colon.

PAST MEDICAL HISTORY:
- Crohn's Disease, ileocolonic (L3), complicated (fistulizing, B3 in Montreal)
- Perianal fistula (complex, previously required surgical drainage 2022)
- Iron deficiency anemia (from GI blood loss)
- Osteopenia (steroid-induced, on bisphosphonate)
- Prior small bowel resection (15cm terminal ileum, 2020)

MEDICATIONS:
- Infliximab (Remicade) 5mg/kg IV every 8 weeks (anti-TNF biologic)
- Azathioprine 150mg once daily (immunomodulator — combination with Infliximab)
- Prednisone 20mg daily tapering (acute flare — currently on 4-week taper)
- Mesalamine (5-ASA) 4g retention enema nightly (rectal inflammation)
- Pantoprazole 40mg daily (GI protection on steroids)
- IV Iron (Ferric carboxymaltose) 750mg infusion (iron deficiency anemia)
- Calcium 1500mg + Vitamin D 800 IU (steroid-induced osteopenia)

ALLERGIES:
- Adalimumab (Humira) — loss of therapeutic response (anti-drug antibodies detected 2023)
  and injection site reactions. NOT a true allergy but documented treatment failure.
- Oral 5-ASA (Mesalamine tablets) — paradoxical worsening of diarrhea.
  Note: Topical 5-ASA (enema) is tolerated.

RECENT COLONOSCOPY (January 2025):
Terminal ileum: Deep linear ulcerations, cobblestone mucosa, luminal narrowing 50%.
Sigmoid colon: Aphthous ulcers, erythema, friability.
Rectum: Mild inflammation. Internal opening of perianal fistula identified.
Biopsies: Consistent with active Crohn's disease. No dysplasia.

LABORATORY RESULTS:
- CRP: 48 mg/L (severely elevated — active inflammation)
- ESR: 62 mm/hr (elevated)
- Fecal Calprotectin: 1850 mcg/g (severely elevated — target < 250 in remission)
- Hemoglobin: 10.1 g/dL (iron deficiency anemia)
- MCV: 72 fL (microcytic — iron deficiency)
- Ferritin: 8 ng/mL (severely depleted)
- Albumin: 2.9 g/dL (low — malnutrition/inflammation)
- Infliximab trough level: 2.1 mcg/mL (subtherapeutic — target > 5)
- Anti-infliximab antibodies: Positive (loss of response mechanism)

ASSESSMENT AND PLAN:
1. Active Crohn's flare — Infliximab levels subtherapeutic with antibodies.
   Step up to Infliximab 10mg/kg or switch to Ustekinumab (IL-12/23 inhibitor).
2. Perianal fistula — colorectal surgery consultation. Consider seton placement.
3. Iron deficiency anemia — complete IV iron infusion course.
4. Malnutrition — dietitian referral. Consider enteral nutrition support.
5. Do not use oral 5-ASA. Adalimumab is contraindicated (loss of response + antibodies).
""",
    },
]


def seed():
    supabase = get_supabase()
    print(f"\nSeeding {len(PATIENTS)} patients into Supabase...\n")

    for i, p in enumerate(PATIENTS):
        name = p["profile"]["name"]
        print(f"[{i+1}/10] {name}...", end=" ", flush=True)

        # 1. Insert patient
        patient_res = supabase.table("patients").insert(p["profile"]).execute()
        patient_id = patient_res.data[0]["id"]

        # 2. Insert document (raw medical text)
        doc_res = supabase.table("documents").insert({
            "patient_id": patient_id,
            "file_name": f"{name.lower().replace(' ', '_')}_medical_record.txt",
            "raw_text": p["raw_text"].strip(),
        }).execute()
        document_id = doc_res.data[0]["id"]

        # 3. Insert extracted info
        supabase.table("extracted_info").insert({
            "patient_id": patient_id,
            **p["extracted"],
        }).execute()

        # 4. Generate + store embeddings
        store_embeddings(patient_id, document_id, p["raw_text"].strip())

        print(f"✓  ID: {patient_id}")

    print(f"\nDone. {len(PATIENTS)} patients loaded successfully.")
    print("\nPatient IDs:")
    result = supabase.table("patients").select("id, name, medical_specialty").order("created_at", desc=False).execute()
    for row in result.data[-10:]:
        print(f"  {row['id']}  |  {row['name']}  |  {row['medical_specialty']}")


if __name__ == "__main__":
    seed()
