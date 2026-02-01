/**
 * Notice of Intent to Lien (NOI) Letter Templates
 *
 * State-specific NOI templates with required statutory language.
 * These templates are designed to be legally compliant while maintaining
 * professional contractor positioning (not debt collector).
 */

export interface NOITemplateData {
  // Contractor info (sender)
  contractorName: string;
  contractorAddress: string;
  contractorCity: string;
  contractorState: string;
  contractorZip: string;
  contractorPhone: string;
  contractorEmail: string;
  contractorLicenseNumber?: string;

  // Customer info (recipient)
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerZip: string;

  // Property info
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;

  // Invoice/work details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  workDescription: string;
  firstWorkDate: string;
  lastWorkDate: string;

  // Financial details
  amountDue: number; // in cents
  lateFees?: number; // in cents
  totalAmount: number; // in cents

  // Deadlines
  responseDeadline: string; // Date string
  lienFilingDeadline: string; // Date string

  // Sending date
  noticeDate: string;
}

/**
 * Get NOI template for specific state
 */
export function getNOITemplate(stateCode: string, data: NOITemplateData): string {
  const state = stateCode.toUpperCase();

  switch (state) {
    case "CO":
      return getColoradoNOITemplate(data);
    case "PA":
      return getPennsylvaniaNOITemplate(data);
    case "CA":
      return getCaliforniaNOITemplate(data);
    case "TX":
      return getTexasNOITemplate(data);
    case "FL":
      return getFloridaNOITemplate(data);
    default:
      return getGenericNOITemplate(data);
  }
}

/**
 * Colorado NOI Template
 * Required by CRS 38-22-109
 */
function getColoradoNOITemplate(data: NOITemplateData): string {
  const amountFormatted = formatCurrency(data.totalAmount);

  return `
${data.contractorName}
${data.contractorAddress}
${data.contractorCity}, ${data.contractorState} ${data.contractorZip}
${data.contractorPhone}
${data.contractorEmail}
${data.contractorLicenseNumber ? `License #${data.contractorLicenseNumber}` : ""}

${data.noticeDate}

${data.customerName}
${data.customerAddress}
${data.customerCity}, ${data.customerState} ${data.customerZip}

RE: NOTICE OF INTENT TO FILE MECHANICS LIEN
    Property: ${data.propertyAddress}, ${data.propertyCity}, ${data.propertyState} ${data.propertyZip}
    Invoice #${data.invoiceNumber}

Dear ${data.customerName}:

This letter serves as formal notice of our intent to file a mechanics lien against the above-referenced property pursuant to Colorado Revised Statutes Section 38-22-101 et seq.

**WORK PERFORMED:**
${data.workDescription}

Work Period: ${data.firstWorkDate} through ${data.lastWorkDate}

**AMOUNT OWED:**
Original Invoice Amount: ${formatCurrency(data.amountDue)}
${data.lateFees ? `Late Fees: ${formatCurrency(data.lateFees)}` : ""}
**Total Amount Due: ${amountFormatted}**

Invoice Date: ${data.invoiceDate}
Due Date: ${data.dueDate}
Days Past Due: ${calculateDaysPastDue(data.dueDate)}

**NOTICE PURSUANT TO COLORADO LAW:**
Pursuant to C.R.S. § 38-22-109, you are hereby notified that ${data.contractorName} has provided labor, materials, and/or services that have improved the above-referenced property, and payment remains outstanding.

Under Colorado law, we have the right to file a mechanics lien against your property if this invoice is not paid. A mechanics lien:
• Creates a legal claim against your property
• Appears in public property records
• Can prevent sale or refinancing of the property
• May result in foreclosure if not resolved
• Remains until the debt is satisfied

**DEADLINE TO AVOID LIEN FILING:**
You must pay the full balance of ${amountFormatted} on or before ${data.responseDeadline} to avoid lien filing.

**LIEN FILING DEADLINE:**
Under Colorado law, we have until ${data.lienFilingDeadline} to file a mechanics lien. If payment is not received by ${data.responseDeadline}, we will proceed with filing.

**PAYMENT INSTRUCTIONS:**
Please remit payment immediately to avoid mechanics lien filing:
• Check payable to: ${data.contractorName}
• Mail to: ${data.contractorAddress}, ${data.contractorCity}, ${data.contractorState} ${data.contractorZip}
• Reference: Invoice #${data.invoiceNumber}

If you have already sent payment or dispute this amount, please contact us immediately at ${data.contractorPhone} or ${data.contractorEmail}.

**NOTICE TO PROPERTY OWNER:**
This is not a lien. This is a notice that a lien may be filed unless the above-referenced account is paid.

This notice is sent in accordance with Colorado law and is not an attempt to collect a debt by a debt collection agency. ${data.contractorName} is the original creditor providing notice of lien rights.

Sincerely,

${data.contractorName}
${data.contractorPhone}
${data.contractorEmail}

---
This Notice sent via certified mail on ${data.noticeDate}
`.trim();
}

/**
 * Pennsylvania NOI Template
 * Required by Mechanics Lien Law of 1963
 */
function getPennsylvaniaNOITemplate(data: NOITemplateData): string {
  const amountFormatted = formatCurrency(data.totalAmount);

  return `
${data.contractorName}
${data.contractorAddress}
${data.contractorCity}, ${data.contractorState} ${data.contractorZip}
${data.contractorPhone}
${data.contractorEmail}

${data.noticeDate}

SENT VIA CERTIFIED MAIL

${data.customerName}
${data.customerAddress}
${data.customerCity}, ${data.customerState} ${data.customerZip}

RE: 30-DAY NOTICE OF INTENT TO FILE MECHANICS LIEN
    Property: ${data.propertyAddress}, ${data.propertyCity}, ${data.propertyState} ${data.propertyZip}
    Invoice #${data.invoiceNumber}

Dear ${data.customerName}:

**THIS IS A REQUIRED 30-DAY NOTICE PURSUANT TO PENNSYLVANIA'S MECHANICS LIEN LAW OF 1963**

You are hereby notified that ${data.contractorName} performed work on your property located at ${data.propertyAddress}, ${data.propertyCity}, PA ${data.propertyZip}, and payment for said work remains outstanding.

**WORK DESCRIPTION:**
${data.workDescription}

Date of First Work: ${data.firstWorkDate}
Date of Last Work: ${data.lastWorkDate}

**PAYMENT DUE:**
Invoice Number: ${data.invoiceNumber}
Invoice Date: ${data.invoiceDate}
Original Amount: ${formatCurrency(data.amountDue)}
${data.lateFees ? `Late Fees: ${formatCurrency(data.lateFees)}` : ""}
**Total Due: ${amountFormatted}**

**NOTICE REQUIREMENT:**
Under Pennsylvania's Mechanics Lien Law (49 P.S. § 1101 et seq.), we are required to provide you with thirty (30) days written notice before filing a mechanics lien claim against your property.

This letter constitutes that required notice.

**CONSEQUENCES OF MECHANICS LIEN:**
If payment is not received within thirty (30) days from the date of this notice, we will file a mechanics lien against your property. A mechanics lien:

1. Creates a legal encumbrance on your property
2. Becomes a matter of public record
3. Clouds the title, preventing sale or refinancing
4. Can only be removed by payment or court order
5. May result in foreclosure proceedings

**30-DAY DEADLINE:**
Payment must be received on or before ${data.responseDeadline} (30 days from this notice) to avoid mechanics lien filing.

**PAYMENT INSTRUCTIONS:**
Make check payable to: ${data.contractorName}
Amount: ${amountFormatted}
Reference: Invoice #${data.invoiceNumber}

Mail to:
${data.contractorName}
${data.contractorAddress}
${data.contractorCity}, ${data.contractorState} ${data.contractorZip}

**DISPUTE RESOLUTION:**
If you dispute this claim or have already made payment, you must contact us in writing within 30 days at:
${data.contractorEmail} or ${data.contractorPhone}

**LEGAL NOTICE:**
This is a notice of intention to file a mechanics lien as permitted under Pennsylvania law. This notice is sent by the original creditor and contractor, not by a debt collection agency.

Sincerely,

${data.contractorName}
${data.contractorPhone}

---
Notice Date: ${data.noticeDate}
30-Day Deadline: ${data.responseDeadline}
Sent via Certified Mail - Return Receipt Requested
`.trim();
}

/**
 * California NOI Template (optional but highly effective)
 */
function getCaliforniaNOITemplate(data: NOITemplateData): string {
  const amountFormatted = formatCurrency(data.totalAmount);

  return `
${data.contractorName}
${data.contractorAddress}
${data.contractorCity}, ${data.contractorState} ${data.contractorZip}
${data.contractorPhone}
${data.contractorEmail}
${data.contractorLicenseNumber ? `Contractor License #${data.contractorLicenseNumber}` : ""}

${data.noticeDate}

${data.customerName}
${data.customerAddress}
${data.customerCity}, ${data.customerState} ${data.customerZip}

RE: NOTICE OF INTENT TO FILE MECHANICS LIEN
    Property: ${data.propertyAddress}, ${data.propertyCity}, CA ${data.propertyZip}
    Invoice #${data.invoiceNumber}

Dear ${data.customerName}:

This notice is to inform you of our intent to file a mechanics lien against the above property pursuant to California Civil Code Sections 8400-8494 unless payment is received.

**PROJECT INFORMATION:**
${data.workDescription}

Work Performed: ${data.firstWorkDate} through ${data.lastWorkDate}
Property: ${data.propertyAddress}, ${data.propertyCity}, CA ${data.propertyZip}

**OUTSTANDING BALANCE:**
Invoice #${data.invoiceNumber} (Due: ${data.dueDate})
Amount Owed: ${formatCurrency(data.amountDue)}
${data.lateFees ? `Late Fees: ${formatCurrency(data.lateFees)}` : ""}
**Total Due: ${amountFormatted}**

Days Past Due: ${calculateDaysPastDue(data.dueDate)}

**MECHANICS LIEN RIGHTS:**
Under California law, contractors who improve real property have the right to file a mechanics lien if not paid. Per Civil Code § 8412, we have ninety (90) days from completion of work to record a mechanics lien.

If a lien is filed against your property:
• It becomes a public record attached to your property title
• It prevents the sale or refinance of your property
• It can only be removed by payment, bond, or court order
• It may lead to foreclosure under California law
• Additional costs, fees, and interest will accrue

**DEADLINE TO AVOID LIEN:**
To avoid mechanics lien filing, payment of ${amountFormatted} must be received by ${data.responseDeadline}.

After this date, we will proceed with recording a mechanics lien with the county recorder's office.

**PAYMENT OPTIONS:**
Amount Due: ${amountFormatted}
Payable to: ${data.contractorName}
Reference: Invoice #${data.invoiceNumber}

Payment can be made by:
• Check mailed to address above
• Contact us for electronic payment: ${data.contractorEmail}

**PAYMENT ARRANGEMENTS:**
If you need to discuss payment arrangements, please contact us immediately at ${data.contractorPhone} or ${data.contractorEmail}.

**ALREADY PAID OR DISPUTE:**
If payment has been made or you dispute this amount, please provide proof of payment or contact us immediately.

**IMPORTANT NOTICE:**
This is a notice of intent to file a mechanics lien, not a collection letter. ${data.contractorName} is the original contractor who performed the work, not a debt collection agency. This notice is sent to protect our lien rights under California law.

We prefer to resolve this amicably. Please contact us to arrange payment.

Sincerely,

${data.contractorName}
${data.contractorLicenseNumber ? `CA License #${data.contractorLicenseNumber}` : ""}
${data.contractorPhone}
${data.contractorEmail}

---
Date of Notice: ${data.noticeDate}
Response Deadline: ${data.responseDeadline}
Lien Filing Deadline: ${data.lienFilingDeadline}
`.trim();
}

/**
 * Texas NOI Template (optional but effective)
 */
function getTexasNOITemplate(data: NOITemplateData): string {
  const amountFormatted = formatCurrency(data.totalAmount);

  return `
${data.contractorName}
${data.contractorAddress}
${data.contractorCity}, ${data.contractorState} ${data.contractorZip}
${data.contractorPhone}

${data.noticeDate}

${data.customerName}
${data.customerAddress}
${data.customerCity}, ${data.customerState} ${data.customerZip}

RE: NOTICE REGARDING UNPAID INVOICE AND LIEN RIGHTS
    Property: ${data.propertyAddress}, ${data.propertyCity}, TX ${data.propertyZip}
    Invoice #${data.invoiceNumber}

Dear ${data.customerName}:

This letter is to notify you that payment for work performed on your property remains outstanding, and to inform you of our rights under Texas Property Code Chapter 53.

**WORK COMPLETED:**
${data.workDescription}

Dates of Work: ${data.firstWorkDate} through ${data.lastWorkDate}
Location: ${data.propertyAddress}, ${data.propertyCity}, TX ${data.propertyZip}

**AMOUNT DUE:**
Invoice Number: ${data.invoiceNumber}
Invoice Date: ${data.invoiceDate}
Due Date: ${data.dueDate}
Original Amount: ${formatCurrency(data.amountDue)}
**Total Due: ${amountFormatted}**

**TEXAS MECHANICS LIEN LAW:**
Under Texas Property Code § 53.001 et seq., contractors who improve real property may file a mechanics and materialmen's lien against the property if not paid.

In Texas, we have until ${data.lienFilingDeadline} to file a mechanics lien.

**WHAT IS A MECHANICS LIEN:**
A mechanics lien is a legal claim against your property that:
• Is recorded in public property records
• Clouds your property title
• Can prevent you from selling or refinancing
• May result in foreclosure to satisfy the debt
• Adds legal fees and court costs to the amount owed

**DEADLINE:**
Please pay the full balance of ${amountFormatted} by ${data.responseDeadline} to avoid mechanics lien filing.

**HOW TO PAY:**
Make payment to: ${data.contractorName}
Amount: ${amountFormatted}
Reference: Invoice #${data.invoiceNumber}

Mail to address above or call ${data.contractorPhone} for payment options.

**CONTACT US:**
If you have questions, need payment arrangements, or have already paid, please contact:
${data.contractorPhone}
${data.contractorEmail}

**LEGAL NOTICE:**
This notice is sent by ${data.contractorName}, the contractor who performed the work. We are not a debt collection agency. This notice is to inform you of our lien rights under Texas law.

Sincerely,

${data.contractorName}

---
Notice Date: ${data.noticeDate}
Payment Deadline: ${data.responseDeadline}
`.trim();
}

/**
 * Florida NOI Template
 */
function getFloridaNOITemplate(data: NOITemplateData): string {
  const amountFormatted = formatCurrency(data.totalAmount);

  return `
${data.contractorName}
${data.contractorAddress}
${data.contractorCity}, ${data.contractorState} ${data.contractorZip}
${data.contractorPhone}
${data.contractorLicenseNumber ? `FL License #${data.contractorLicenseNumber}` : ""}

${data.noticeDate}

${data.customerName}
${data.customerAddress}
${data.customerCity}, ${data.customerState} ${data.customerZip}

RE: NOTICE OF INTENT TO FILE CONSTRUCTION LIEN
    Property: ${data.propertyAddress}, ${data.propertyCity}, FL ${data.propertyZip}
    Invoice #${data.invoiceNumber}

Dear ${data.customerName}:

This is formal notice that ${data.contractorName} intends to file a construction lien against your property located at ${data.propertyAddress}, ${data.propertyCity}, FL ${data.propertyZip}, pursuant to Florida Statutes Chapter 713 (Construction Liens).

**SERVICES PROVIDED:**
${data.workDescription}

Period of Work: ${data.firstWorkDate} through ${data.lastWorkDate}

**PAYMENT OUTSTANDING:**
Invoice: #${data.invoiceNumber} dated ${data.invoiceDate}
Due Date: ${data.dueDate}
Amount Owed: ${formatCurrency(data.amountDue)}
**Total Due: ${amountFormatted}**

**FLORIDA CONSTRUCTION LIEN LAW:**
Under Florida Statutes § 713.08, contractors have the right to file a construction lien against property for unpaid work. We have until ${data.lienFilingDeadline} to record our lien.

**CONSEQUENCES:**
If we file a construction lien on your property:
• The lien will be recorded in county public records
• Your property title will be encumbered
• You cannot sell or refinance without satisfying the lien
• The lien can be enforced through foreclosure
• You may be responsible for additional legal fees and costs

**DEADLINE TO AVOID LIEN:**
Pay ${amountFormatted} by ${data.responseDeadline} to prevent lien filing.

**PAYMENT:**
Payable to: ${data.contractorName}
Amount: ${amountFormatted}
Reference: Invoice #${data.invoiceNumber}
Mail to address above

**QUESTIONS OR DISPUTES:**
Contact us immediately if:
• Payment has already been made
• You dispute the amount owed
• You need to arrange a payment plan

${data.contractorPhone}
${data.contractorEmail}

**NOTICE:**
This notice is sent by ${data.contractorName}, the original contractor. We are not a debt collection agency. This is notification of our lien rights under Florida law.

Respectfully,

${data.contractorName}
${data.contractorLicenseNumber ? `FL License #${data.contractorLicenseNumber}` : ""}

---
Notice Date: ${data.noticeDate}
Payment Deadline: ${data.responseDeadline}
Sent via Certified Mail
`.trim();
}

/**
 * Generic NOI Template (for states without specific requirements)
 */
function getGenericNOITemplate(data: NOITemplateData): string {
  const amountFormatted = formatCurrency(data.totalAmount);

  return `
${data.contractorName}
${data.contractorAddress}
${data.contractorCity}, ${data.contractorState} ${data.contractorZip}
${data.contractorPhone}
${data.contractorEmail}

${data.noticeDate}

${data.customerName}
${data.customerAddress}
${data.customerCity}, ${data.customerState} ${data.customerZip}

RE: NOTICE OF INTENT TO FILE MECHANICS LIEN
    Property: ${data.propertyAddress}, ${data.propertyCity}, ${data.propertyState} ${data.propertyZip}
    Invoice #${data.invoiceNumber}

Dear ${data.customerName}:

This notice is to inform you that ${data.contractorName} performed work on your property and payment remains outstanding. We are providing this notice of our intent to file a mechanics lien.

**WORK PERFORMED:**
${data.workDescription}

Work Period: ${data.firstWorkDate} through ${data.lastWorkDate}
Property: ${data.propertyAddress}, ${data.propertyCity}, ${data.propertyState} ${data.propertyZip}

**AMOUNT OWED:**
Invoice #${data.invoiceNumber}
Invoice Date: ${data.invoiceDate}
Due Date: ${data.dueDate}
Amount Owed: ${formatCurrency(data.amountDue)}
${data.lateFees ? `Late Fees: ${formatCurrency(data.lateFees)}` : ""}
**Total Due: ${amountFormatted}**

**MECHANICS LIEN NOTICE:**
Under state law, contractors who improve real property have the right to file a mechanics lien if not paid. A mechanics lien:

• Creates a legal claim against your property
• Appears in public property records
• Prevents sale or refinancing of the property
• Can only be removed by payment or court order
• May result in foreclosure proceedings

**DEADLINE:**
To avoid mechanics lien filing, please pay ${amountFormatted} by ${data.responseDeadline}.

Our deadline to file a mechanics lien is ${data.lienFilingDeadline}. If payment is not received by the deadline above, we will proceed with filing.

**PAYMENT INSTRUCTIONS:**
Payable to: ${data.contractorName}
Amount: ${amountFormatted}
Reference: Invoice #${data.invoiceNumber}

Mail to address above or contact us for payment options:
${data.contractorPhone}
${data.contractorEmail}

**ALREADY PAID OR DISPUTE:**
If you have already paid or dispute this amount, please contact us immediately with proof of payment or details of the dispute.

**NOTICE:**
This is a notice from the contractor who performed the work, not from a debt collection agency. We are providing notice of our lien rights under state law.

We would prefer to resolve this amicably. Please contact us to arrange payment.

Sincerely,

${data.contractorName}
${data.contractorPhone}

---
Notice Date: ${data.noticeDate}
Payment Deadline: ${data.responseDeadline}
`.trim();
}

/**
 * Helper: Format currency
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Helper: Calculate days past due
 */
function calculateDaysPastDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}
