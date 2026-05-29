# ⚡ ClinIQ Quick Setup Guide

## 🚀 **Start ClinIQ in 3 Steps:**

### **1. Start Backend Server**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
**Expected:** Server running at `http://localhost:8000`

### **2. Start Frontend Server**
```bash
cd frontend  
npm run dev -- --port 3000
```
**Expected:** App running at `http://localhost:3000`

### **3. Open ClinIQ**
```bash
open http://localhost:3000
```
**Expected:** ClinIQ dashboard opens in browser

---

## 🧭 **Navigation Overview:**

| **Section** | **Purpose** | **Key Features** |
|---|---|---|
| **📊 Dashboard** | System overview | Patient stats, quick upload |
| **👥 Patients** | Patient records | View, search, AI chat |
| **🔍 Search** | Semantic search | Natural language queries |
| **💊 Drug Checker** | Drug interactions | Safety assessment, recommendations |
| **🚨 Emergency** | Emergency tools | Critical care support |
| **📤 Upload** | Add records | PDF/TXT/CSV processing |

---

## 💡 **Quick Test:**

### **Test Drug Checker:**
1. Go to **Drug Checker** tab
2. Enter: **Drug 1:** `Warfarin`, **Drug 2:** `Aspirin`  
3. Click **"Check Interaction"**
4. **Expected:** ❌ "Do Not Prescribe" with bleeding risk warning

### **Test Patient Upload:**
1. Go to **Upload** tab
2. Upload any medical text file
3. **Expected:** AI extracts patient data automatically
4. **Result:** New patient appears in Patients section

### **Test AI Chat:**
1. Go to **Patients** → Select any patient
2. Click **"AI Chat"** tab  
3. Ask: *"What medications is this patient on?"*
4. **Expected:** Structured clinical response with evidence

---

## 🎯 **You're Ready!**

✅ **Backend:** `localhost:8000` (API + drug checker)  
✅ **Frontend:** `localhost:3000` (Clinical interface)  
✅ **Features:** Upload, AI Chat, Drug Checker, Search

**Next:** Upload your first patient record and try the AI chat! 🏥⚡

---

*For detailed instructions, see `CLINIQ_USER_GUIDE.md`*