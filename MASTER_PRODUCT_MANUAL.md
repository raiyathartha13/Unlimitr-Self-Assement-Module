# UNLIMITR — Master Product Manual
## Production-Grade HealthTech Platform Documentation

**Version:** 2.0  
**Last Updated:** 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Brand System](#1-brand-system)
2. [Scoring Logic Explanation](#2-scoring-logic-explanation)
3. [Plan Structure](#3-plan-structure)
4. [Pricing Strategy](#4-pricing-strategy)
5. [Price Lock Mechanism](#5-price-lock-mechanism)
6. [Coach Selection Logic](#6-coach-selection-logic)
7. [EMI Logic](#7-emi-logic)
8. [Assessment Flow](#8-assessment-flow)
9. [Conversion Psychology](#9-conversion-psychology)
10. [SEO Strategy](#10-seo-strategy)
11. [Deployment Checklist](#11-deployment-checklist)
12. [Razorpay Integration Guide](#12-razorpay-integration-guide)
13. [Future ML Layer Expansion](#13-future-ml-layer-expansion)

---

## 1. Brand System

### 1.1 Color Palette

**Official Brand Colors:**

```css
--primary-indigo: #0D3256
--primary-green: #008944
--blue-gray: #0080DD
--earth-yellow: #FFC305
--almond: #F1DACC
--amaranth: #FFA1E6
--sky-blue: #23D2FF
--dark-pastel-red: #FF0A0A
```

**Usage:**
- All color references must use CSS variables from `/core/brandSystem.js`
- Never hardcode hex values
- Dark theme uses: `--deep`, `--cyan`, `--green`, `--amber`, `--red`

### 1.2 Typography

**Primary Font:** Outfit (weights: 300-900)  
**Body Font:** Lato (weights: 300, 400, 700, 900)

**Type Scale:**
- Hero: `clamp(34px, 5.5vw, 62px)`
- H1: `clamp(28px, 4.5vw, 46px)`
- H2: `clamp(24px, 4vw, 36px)`
- H3: `clamp(20px, 3vw, 28px)`
- Body: `clamp(14px, 2vw, 17px)`
- Small: `clamp(12px, 1.5vw, 14px)`

### 1.3 Brand Assets

**Logo URL:** `https://unlimitr.com/img/hca_logo.svg`

**Implementation:**
```html
<img src="https://unlimitr.com/img/hca_logo.svg" alt="Unlimitr" />
```

---

## 2. Scoring Logic Explanation

### 2.1 Biological Age Calculation (Fixed)

**Problem Solved:** Previous calculation was adding biologicalStrain (0-100) directly to age, causing 20+ year inflation.

**New Formula:**
```javascript
function calculateBiologicalAge(chronologicalAge, healthScores) {
  // Composite health index (0-100)
  const compositeHealthIndex =
    (metabolicScore * 0.25) +
    (recoveryScore * 0.20) +
    (hormonalScore * 0.20) +
    (behavioralScore * 0.20) +
    (activityScore * 0.15);

  // Convert to deviation: (100 - healthIndex) / 12
  const deviation = (100 - compositeHealthIndex) / 12;

  // Calculate biological age
  let biologicalAge = chronologicalAge + deviation;

  // Clamp to realistic band
  const maxDeviation = 8;  // Max +8 years older
  const minDeviation = -6;  // Max -6 years younger

  if (biologicalAge > chronologicalAge + maxDeviation) {
    biologicalAge = chronologicalAge + maxDeviation;
  }

  if (biologicalAge < chronologicalAge + minDeviation) {
    biologicalAge = chronologicalAge + minDeviation;
  }

  return Math.round(biologicalAge);
}
```

**Key Points:**
- Maximum deviation: +8 years (older) / -6 years (younger)
- Realistic and believable
- Retains urgency without manipulation
- Implemented in `core/HealthEngine.js`

### 2.2 Health Score Calculation

**5 Dimensions with Weights:**
- Metabolic: 30%
- Hormonal: 20%
- Behavioral: 20%
- Recovery: 15%
- Readiness: 15%

**Formula:**
```javascript
totalScore = 
  (metabolic * 0.30) +
  (hormonal * 0.20) +
  (behavioral * 0.20) +
  (recovery * 0.15) +
  (readiness * 0.15)
```

**Risk Zones:**
- 0-39: Severe Adaptive Strain (Critical)
- 40-59: Adaptive Strain (High)
- 60-74: Suboptimal Stability (Moderate)
- 75-100: Metabolic Stability (Low)

### 2.3 Transparency Display

**Show users how score was calculated:**
- Metabolic Throughput – 25%
- Recovery Integrity – 20%
- Hormonal Regulation – 20%
- Behavioral Stability – 20%
- Activity Load – 15%

**Location:** Expandable section in dashboard: "How Your Score Was Calculated"

---

## 3. Plan Structure

### 3.1 Plan Options

**3 Plans Available:**

1. **3 Months**
   - Total Sessions: 24
   - 1:1 Coach Frequency: 2x/week
   - Price: ₹6,999
   - Original: ₹8,999
   - Savings: ₹2,000

2. **6 Months**
   - Total Sessions: 48
   - 1:1 Coach Frequency: 2x/week
   - Price: ₹12,999
   - Original: ₹15,999
   - Savings: ₹3,000
   - Badge: "Best Value"

3. **12 Months** (Recommended)
   - Total Sessions: 96
   - 1:1 Coach Frequency: 2x/week
   - Price: ₹19,999
   - Original: ₹27,999
   - Savings: ₹8,000
   - Badge: "Most Chosen"
   - Priority Access: Yes

### 3.2 Plan Features (All Plans Include)

- ✓ Total Sessions (varies by duration)
- ✓ 1:1 Coach Frequency (2x/week)
- ✓ Personalized Nutrition Plan
- ✓ AI Score Tracking
- ✓ Doctor Review
- ✓ WhatsApp Accountability
- ✓ Weekly Progress Recalibration

### 3.3 Plan Recommendation Logic

**Based on:**
- Health Score
- Biological Age Delta
- Medical Conditions
- Commitment Level
- Weight Gap

**Recommendation Rules:**
- Score < 40: 12 months
- Score 40-60: 6-12 months
- Score 60-75: 3-6 months
- Score 75+: 3 months (optimization)

---

## 4. Pricing Strategy

### 4.1 Price Anchoring

**Market Cost Comparison:**
- Personal Trainer: ₹15,000/month
- Dietitian: ₹8,000/month
- Behavioral Coaching: ₹5,000/month
- Medical Review: ₹3,000/month
- **Total Market Cost:** ₹31,000/month

**Unlimitr Structured Plan:** ₹19,999 for 12 months
**Daily Cost:** ₹54/day

### 4.2 Psychological Pricing

**Display Format:**
- Original Price (striked)
- Discounted Price (highlighted)
- Savings Amount
- Daily Cost Breakdown
- "Less than your daily coffee"

### 4.3 Discount Strategy

**Launch Discount:** 50% off
**Lock Discount:** Additional 10% (via price lock)

---

## 5. Price Lock Mechanism

### 5.1 Overview

**Price:** ₹999 (refundable)  
**Duration:** 7 days  
**Location:** `/core/priceLock.js`

### 5.2 Benefits

- Price frozen for 7 days
- Free Counsellor Session
- Free Coach Session
- Fully adjustable against full payment
- Refundable if user changes mind

### 5.3 FOMO Elements

**Countdown Timer:**
- Format: "Price lock expires in: 23:12:09"
- Updates every second
- Visual urgency without pressure

**Display Logic:**
- Show on solution/offer page
- Visible before final CTA
- Auto-hide after lock expires

### 5.4 Backend API

**Endpoint:** `POST /api/lock-price`

**Payload:**
```json
{
  "user_id": "string",
  "plan_selected": {
    "duration": 12,
    "price": 19999
  },
  "payment_id": "razorpay_payment_id",
  "timestamp": "ISO8601",
  "lock_expiry": "ISO8601",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "lock_id": "string",
  "expiry": "ISO8601"
}
```

---

## 6. Coach Selection Logic

### 6.1 Coach Carousel Component

**Location:** `/components/CoachCarousel.js`

### 6.2 API Integration

**Fetch Coaches:**
```
GET /api/coaches?recommended=true&user_id={id}
```

**Response:**
```json
{
  "coaches": [
    {
      "id": 1,
      "name": "Dr. Priya Sharma",
      "specialty": "Metabolic Correction",
      "experience": "8 years",
      "rating": 4.9,
      "image": "url",
      "intro": "Specialized in...",
      "bestFor": "Thyroid",
      "compatibility": 98
    }
  ]
}
```

### 6.3 Coach Matching

**Compatibility Score Calculation:**
- Based on user's health conditions
- Based on user's primary goal
- Based on coach's specialty
- Based on coach's experience

**Display:**
- "98% Profile Compatibility" badge
- "Best for Thyroid" tag
- Dynamic recommendation: "Based on your biological profile, we recommend:"

### 6.4 Save Preference

**Endpoint:** `POST /api/save-preference`

**Payload:**
```json
{
  "user_id": "string",
  "coach_id": 1,
  "plan_type": 12,
  "timestamp": "ISO8601"
}
```

**Storage:**
- LocalStorage: `selectedCoach`
- Backend: User preference table

---

## 7. EMI Logic

### 7.1 EMI Calculator Component

**Location:** `/components/EMICalculator.js`

### 7.2 EMI Calculation

**Formula:**
```javascript
EMI = PlanPrice / Duration
```

**Example:**
- 12 Month Plan: ₹19,999
- EMI: ₹19,999 / 12 = ₹1,666/month

### 7.3 Display

**Toggle Options:**
- [ Pay in Full ]
- [ Pay via EMI ]

**EMI Breakdown Shows:**
- Monthly Payment Amount
- Total Amount (same as full)
- Payment Schedule (Month 1, Month 2, etc.)

**Note:** "No Cost EMI available. No interest or hidden charges."

### 7.4 Razorpay Integration

**Flag:** `enable_emi: true` in Razorpay options

**Implementation:**
- User selects EMI mode
- Razorpay checkout shows EMI options
- First EMI charged immediately
- Subsequent EMIs auto-debited

---

## 8. Assessment Flow

### 8.1 4-Step Flow

1. **Personal Details**
   - Name, Email, DOB, Gender
   - Menstrual Cycle (if female)

2. **Body Metrics**
   - Height (slider)
   - Weight (slider)
   - Target Weight (slider)

3. **Lifestyle Signals**
   - Activity Level
   - Sleep Quality
   - Stress Level

4. **Health & Goals**
   - Health Issues (with expandable fields)
   - Primary Goal
   - Diet Preferences
   - Weekly Commitment
   - Allergies/Restrictions
   - Obstacles

### 8.2 Micro-Validation Messages

**Location:** `/assets/js/microValidation.js`

**Triggers:**
- Low sleep → "Recovery deficit detected"
- High stress → "Cortisol load elevated"
- Sedentary → "Activity baseline low"
- Health conditions → Condition-specific messages
- Dietary restrictions → "Nutrition protocol will adapt"

**Display:**
- Top-right corner (desktop)
- Fixed position
- Auto-dismiss after 5 seconds
- "Signal acknowledged" label

### 8.3 Data Storage

**Storage Keys:**
- `assessmentData` (primary)
- `unlimitr_assessment` (fallback)
- `ai_health_assessment_v2` (legacy)

**Format:**
```json
{
  "clientName": "string",
  "clientEmail": "string",
  "age": 30,
  "gender": "male|female",
  "height": 175,
  "weight": 80,
  "targetWeight": 70,
  "activityLevel": "moderate",
  "sleepQuality": "good",
  "stressLevel": "moderate",
  "primaryGoal": "weight-loss",
  "health_thyroid": false,
  "health_pcos": false,
  "health_diabetes": false
}
```

---

## 9. Conversion Psychology

### 9.1 Messaging Hierarchy

**Core Philosophy:**
"Know Your Biology. Correct With Precision."

**Not:**
- "Transform your life"
- "Feel amazing"
- "Boost your energy"

**Instead:**
- "Structured metabolic correction"
- "Biological recalibration"
- "Adaptive strain reversal"

### 9.2 Authority Language

**Terminology System:**
- Biological Scoring Engine
- Metabolic Throughput
- Recovery Integrity
- Hormonal Regulation Index
- Behavioral Sustainability Score
- Adaptive Strain Detection
- Structured Correction Protocol

**Tone:**
- Clinical
- Structured
- Evidence-based
- High authority

### 9.3 Emotional Reassurance

**After showing deficits, always end with:**
- "Your system is under adaptive strain — not permanent damage."
- "Correction window: 8–12 weeks."
- "Reversibility probability: High."

**Never leave user in deficit without hope.**

### 9.4 FOMO Mechanics

**Price Lock:**
- 7-day countdown
- "Price valid for 7 days after lock"
- Visual urgency

**Plan Badges:**
- "Most Chosen" (12 months)
- "Best Value" (6 months)
- "Limited Time" (when applicable)

---

## 10. SEO Strategy

### 10.1 Meta Tags

**Landing Page:**
```html
<title>Genie AI — Decode Your Transformation | Unlimitr</title>
<meta name="description" content="AI-powered health assessment that calculates your biological age, health score, and builds a personalised transformation plan in 3 minutes.">
```

**Assessment Page:**
```html
<title>AI Health Assessment — Unlimitr</title>
```

**Dashboard:**
```html
<title>Genie AI — Biological Intelligence Report · Unlimitr</title>
```

### 10.2 Structured Data

**Health Assessment Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  "name": "Unlimitr",
  "description": "AI-powered health assessment platform",
  "offers": {
    "@type": "Offer",
    "price": "19999",
    "priceCurrency": "INR"
  }
}
```

### 10.3 Keywords

**Primary:**
- Biological age calculator
- Health score assessment
- Metabolic health analysis
- Personalized health plan
- AI health assessment

**Long-tail:**
- Calculate biological age online
- Free health score assessment
- PCOS weight loss plan
- Thyroid weight management
- Metabolic correction program

---

## 11. Deployment Checklist

### 11.1 Pre-Deployment

- [ ] All brand colors use CSS variables
- [ ] Logo URLs updated to production
- [ ] Biological age calculation tested
- [ ] All API endpoints configured
- [ ] Razorpay keys set
- [ ] Error handling implemented
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed

### 11.2 Environment Variables

```env
RAZORPAY_KEY_ID=your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
API_BASE_URL=https://api.unlimitr.com
```

### 11.3 File Structure

```
/
├── core/
│   ├── brandSystem.js
│   ├── HealthEngine.js
│   ├── narrativeEngine.js
│   └── priceLock.js
├── components/
│   ├── CoachCarousel.js
│   └── EMICalculator.js
├── assets/
│   ├── js/
│   │   ├── assessment.js
│   │   ├── microValidation.js
│   │   └── engine.js
│   └── css/
│       └── theme.css
├── solution/
│   ├── offer-upgraded.html
│   └── solution.html
├── landing-upgraded.html
├── assessment.html
├── journey-ultra.html
└── thank-you.html
```

### 11.4 Testing

**Unit Tests:**
- Biological age calculation
- Health score calculation
- Plan recommendation logic

**Integration Tests:**
- Assessment → Dashboard flow
- Dashboard → Solution flow
- Payment → Thank you flow

**E2E Tests:**
- Complete user journey
- OTP verification
- Payment processing

---

## 12. Razorpay Integration Guide

### 12.1 Setup

**1. Get Razorpay Keys:**
- Sign up at https://razorpay.com
- Get Key ID and Key Secret
- Add to environment variables

**2. Load Script:**
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 12.2 Implementation

**Basic Checkout:**
```javascript
const options = {
  key: 'YOUR_RAZORPAY_KEY',
  amount: 1999900, // ₹19,999 in paise
  currency: 'INR',
  name: 'Unlimitr',
  description: 'Structured Correction Plan',
  handler: function(response) {
    // Redirect to thank-you page
    window.location.href = 'thank-you.html?payment_id=' + response.razorpay_payment_id;
  },
  theme: {
    color: '#00ddb4'
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

### 12.3 Payment Modes

**Full Payment:**
- Amount: Full plan price
- One-time charge

**EMI Payment:**
- Amount: First EMI amount
- Enable EMI in options
- Subsequent EMIs auto-debited

**Price Lock:**
- Amount: ₹999
- Refundable
- Adjustable against full payment

### 12.4 Error Handling

```javascript
rzp.on('payment.failed', function(response) {
  console.error('Payment failed:', response);
  alert('Payment failed. Please try again or contact support.');
});
```

---

## 13. Future ML Layer Expansion

### 13.1 ML Integration Points

**Current:** Rule-based scoring  
**Future:** Hybrid ML + Rules

**Architecture:**
```javascript
if (mlModelLoaded) {
  const mlScore = mlModel.predict(userTensor);
  const ruleScore = healthEngine.computeAll();
  const finalScore = (0.7 * ruleScore) + (0.3 * mlScore);
}
```

### 13.2 Training Data

**Location:** `/ml/training-data.json`

**Features:**
- BMI, Age, Weight Gap
- Sleep, Stress, Activity (numerical encoding)
- Health conditions (binary flags)
- Dimension scores
- Total score
- Biological age delta

### 13.3 Model Training

**Framework:** TensorFlow.js  
**Type:** Regression (score prediction)  
**Features:** 15+ numerical features  
**Output:** Health score (0-100), Biological age delta

### 13.4 Deployment

**1. Train model offline**
**2. Export to TensorFlow.js format**
**3. Load in browser:**
```javascript
const model = await tf.loadLayersModel('/models/health-model.json');
```

**4. Integrate with HealthEngine:**
```javascript
const mlFeatures = healthEngine.extractMLFeatures();
const mlTensor = tf.tensor2d([Object.values(mlFeatures)]);
const mlPrediction = model.predict(mlTensor);
```

---

## Appendix A: User Flow Diagram

```
landing-upgraded.html
    ↓
assessment.html (4 steps)
    ↓
journey-ultra.html (OTP unlock)
    ↓
solution/offer-upgraded.html
    ↓
thank-you.html
```

---

## Appendix B: Key Files Reference

| File | Purpose |
|------|---------|
| `core/brandSystem.js` | Brand tokens & CSS variables |
| `core/HealthEngine.js` | Scoring engine (fixed biological age) |
| `core/priceLock.js` | Price lock mechanism |
| `components/CoachCarousel.js` | Coach selection UI |
| `components/EMICalculator.js` | EMI calculation & display |
| `assets/js/microValidation.js` | Intelligence messages |
| `landing-upgraded.html` | Home page |
| `assessment.html` | Assessment form |
| `journey-ultra.html` | Dashboard |
| `solution/offer-upgraded.html` | Plan selection & pricing |
| `thank-you.html` | Payment confirmation |

---

## Appendix C: API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/coaches` | GET | Fetch recommended coaches |
| `/api/save-preference` | POST | Save coach preference |
| `/api/lock-price` | POST | Create price lock |
| `/api/verify-otp` | POST | Verify mobile OTP |

---

## Appendix D: LocalStorage Keys

| Key | Purpose |
|-----|---------|
| `assessmentData` | User assessment data |
| `recommendedPlan` | Selected plan details |
| `healthScore` | Health score breakdown |
| `selectedCoach` | Chosen coach |
| `priceLock` | Price lock data |
| `paymentMode` | 'full' or 'emi' |

---

**End of Manual**

For questions or updates, refer to this document as the single source of truth.
