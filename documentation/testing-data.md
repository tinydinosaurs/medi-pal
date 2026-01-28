# Testing Data

## Medications

Paste this in the browser console to seed mock medications

```js
localStorage.setItem(
  "medications",
  JSON.stringify([
    {
      id: 1,
      name: "Lisinopril",
      dose: "10mg",
      priority: "critical",
      frequency: "daily",
      times: ["08:00"],
      instructions: "Take with water",
      purpose: "Blood pressure",
      doctor: "Dr. Chen",
      pillsRemaining: 12,
      refillable: true,
    },
    {
      id: 2,
      name: "Metformin",
      dose: "500mg",
      priority: "critical",
      frequency: "daily",
      times: ["08:00", "20:00"],
      instructions: "Take with food",
      purpose: "Diabetes",
      doctor: "Dr. Patel",
      pillsRemaining: 45,
      refillable: true,
    },
    {
      id: 3,
      name: "Atorvastatin",
      dose: "20mg",
      priority: "important",
      frequency: "daily",
      times: ["20:00"],
      instructions: "Take in the evening",
      purpose: "Cholesterol",
      doctor: "Dr. Chen",
      pillsRemaining: 30,
      refillable: true,
    },
    {
      id: 4,
      name: "Aspirin",
      dose: "81mg",
      priority: "routine",
      frequency: "daily",
      times: ["08:00"],
      purpose: "Heart health",
      doctor: "Dr. Chen",
      pillsRemaining: 90,
      refillable: true,
    },
    {
      id: 5,
      name: "Levothyroxine",
      dose: "50mcg",
      priority: "critical",
      frequency: "daily",
      times: ["06:00"],
      instructions: "Take on empty stomach, 30min before breakfast",
      purpose: "Thyroid",
      doctor: "Dr. Morrison",
      pillsRemaining: 28,
      refillable: true,
    },
  ]),
);

// Refresh the page after running this
location.reload();
```

## Bills

Sample medical bill for testing bill analysis:
Good call. Here are two medical bills - one clean, one with issues:

### Clean Medical Bill (no issues)

```text

MERCY GENERAL HOSPITAL
Statement Date: January 15, 2026
Account Number: 7834291

Patient: John Smith
Date of Service: December 28, 2025

DESCRIPTION AMOUNT

Emergency Room Visit $1,250.00
CT Scan - Abdomen $892.00
Laboratory Services $345.00
Physician Fee - Dr. Martinez $475.00
IV Fluids/Medications $128.00

---

TOTAL CHARGES $3,090.00

Insurance Adjustment -$1,856.00
Insurance Payment -$987.00

---

PATIENT RESPONSIBILITY $247.00

Amount Due: $247.00
Due Date: February 15, 2026
Minimum Payment: $50.00

Questions? Call our billing office at 1-800-555-0123
or visit mercygeneral.com/billing

PAYMENT OPTIONS:

- Pay online at mercygeneral.com/pay
- Mail check to: Mercy General Hospital, PO Box 12345, Springfield, IL 62701
- Call to set up a payment plan
```

### Medical Bill with Common Issues

```text
WESTSIDE MEDICAL CENTER
Statement Date: January 10, 2026
Account Number: 55829104

Patient: Margaret Thompson
Date of Service: November 15, 2025

## DESCRIPTION AMOUNT

Office Visit - Level 4 (99214) $285.00
Office Visit - Level 4 (99214) $285.00
Comprehensive Metabolic Panel $187.00
Lipid Panel $124.00
Urinalysis $45.00
Hemoglobin A1C $86.00
EKG Interpretation $150.00
EKG Interpretation $150.00
Venipuncture $36.00
Facility Fee $475.00
Provider Fee - Dr. Wellness $320.00
Medical Supplies $89.00
Miscellaneous Services $124.00

---

TOTAL CHARGES $2,356.00

Insurance Adjustment -$892.00
Insurance Payment -$445.00

---

PATIENT RESPONSIBILITY $1,019.00

PAST DUE - IMMEDIATE PAYMENT REQUIRED
Original Due Date: December 20, 2025
Late Fee Applied $50.00

---

TOTAL AMOUNT DUE $1,069.00

FINAL NOTICE: Payment must be received within 10 days
to avoid collection action.

Make checks payable to: WMC Billing Services LLC
Mail to: PO Box 99182, Processingville, DE 19999
```

**Issues in this bill:**

- Duplicate Office Visit charges (99214 appears twice)
- Duplicate EKG Interpretation charges
- Vague "Miscellaneous Services" line item
- "Facility Fee" on top of other charges (possible double-billing)
- Billing entity name differs from hospital name (WMC Billing Services LLC)
- Aggressive collection language for a relatively recent bill
- Statement is nearly 2 months after date of service
- No phone number provided for questions

```

```
