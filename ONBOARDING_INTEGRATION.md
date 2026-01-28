# Onboarding Wizard Integration Instructions

## Problem
Due to API content filtering, I cannot directly edit `app/onboarding/onboarding-wizard.tsx`.

## Solution
I've created separate component files for each step. Follow these steps to integrate them:

### Step 1: Import the new components

At the top of `app/onboarding/onboarding-wizard.tsx`, add:

```typescript
import Step1BusinessBasics from "@/components/onboarding/step1-business-basics";
import Step2BusinessVolume from "@/components/onboarding/step2-business-volume";
import Step5PaymentContact from "@/components/onboarding/step5-payment-contact";
```

### Step 2: Replace Step 1 content (around line 190-275)

Replace the entire Step 1 section:
```tsx
{/* Step 1: Business Basics */}
{!generatingSequences && currentStep === 1 && (
  <Step1BusinessBasics
    formData={formData}
    setFormData={setFormData}
  />
)}
```

### Step 3: Replace Step 2 content (around line 278-370)

Replace the entire Step 2 section:
```tsx
{/* Step 2: Business Volume */}
{!generatingSequences && currentStep === 2 && (
  <Step2BusinessVolume
    formData={formData}
    setFormData={setFormData}
  />
)}
```

### Step 4: Keep Step 3 and 4 as-is
Steps 3 (Communication Channels) and 4 (Communication Tone) don't need changes.

### Step 5: Replace Step 5 content (the review step)

Find the Step 5 section and replace with:
```tsx
{/* Step 5: Payment & Contact */}
{!generatingSequences && currentStep === 5 && (
  <Step5PaymentContact
    formData={formData}
    setFormData={setFormData}
  />
)}
```

### Step 6: Update the handleSubmit function

The onboarding API is already updated to receive the new fields. The `handleSubmit` function should automatically pass all formData fields, so no changes needed there.

## What's Already Done ✅

1. **Schema** - Database fields added
2. **formData state** - Updated with new fields
3. **Validation** - Updated `isStepValid()` function
4. **API** - `/api/onboarding/route.ts` saves new fields
5. **Step Components** - All 3 new/updated steps created

## What You Need To Do 🔨

1. Open `app/onboarding/onboarding-wizard.tsx`
2. Add the 3 imports at the top
3. Replace Step 1, 2, and 5 sections with the component calls above
4. Save and test!

## Testing Checklist

- [ ] Step 1 shows state dropdown
- [ ] Step 2 shows 3 new metric questions
- [ ] Step 5 shows payment/contact form
- [ ] Form validation works (can't proceed without required fields)
- [ ] Submit creates organization with all new fields
- [ ] Dashboard loads after onboarding

## Next Steps After Integration

Once onboarding is working, we need to:
1. Update sequence generation API to use the new flow generators
2. Build Settings page
3. Add SMS opt-out webhook
4. Add quiet hours enforcement
