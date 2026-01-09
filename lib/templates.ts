import { createPaymentLink } from "./stripe";

interface TemplateData {
  businessName: string;
  customerFirstName: string;
  customerLastName: string;
  invoiceNumber: string;
  amountDue: number; // in cents
  amountRemaining: number; // in cents
  dueDate: Date;
  daysPastDue: number;
  invoiceId: string;
}

/**
 * Process template variables and replace them with actual data
 */
export async function processTemplate(
  template: string,
  data: TemplateData
): Promise<string> {
  let processed = template;

  // Generate payment link if needed
  let paymentLink = "";
  if (template.includes("{{paymentLink}}")) {
    try {
      const link = await createPaymentLink({
        invoiceId: data.invoiceId,
        amount: data.amountRemaining,
        description: `Invoice ${data.invoiceNumber}`,
        metadata: {
          customerName: `${data.customerFirstName} ${data.customerLastName}`,
        },
      });
      paymentLink = link?.url || "";
    } catch (error) {
      console.error("Error creating payment link:", error);
      paymentLink = "[Payment link unavailable]";
    }
  }

  // Replace all variables
  const replacements: Record<string, string> = {
    "{{businessName}}": data.businessName,
    "{{customerFirstName}}": data.customerFirstName,
    "{{customerName}}": `${data.customerFirstName} ${data.customerLastName}`,
    "{{invoiceNumber}}": data.invoiceNumber,
    "{{amountDue}}": formatCurrency(data.amountDue),
    "{{amountRemaining}}": formatCurrency(data.amountRemaining),
    "{{dueDate}}": formatDate(data.dueDate),
    "{{daysPastDue}}": data.daysPastDue.toString(),
    "{{paymentLink}}": paymentLink,
  };

  for (const [variable, value] of Object.entries(replacements)) {
    processed = processed.replace(new RegExp(escapeRegex(variable), "g"), value);
  }

  return processed;
}

/**
 * Preview template with example data (doesn't generate real payment links)
 */
export function previewTemplate(template: string): string {
  const exampleData = {
    "{{businessName}}": "Smith Electrical",
    "{{customerFirstName}}": "John",
    "{{customerName}}": "John Doe",
    "{{invoiceNumber}}": "INV-001",
    "{{amountDue}}": "$500.00",
    "{{amountRemaining}}": "$500.00",
    "{{dueDate}}": "Jan 15, 2026",
    "{{daysPastDue}}": "5",
    "{{paymentLink}}": "https://pay.stripe.com/example",
  };

  let processed = template;
  for (const [variable, value] of Object.entries(exampleData)) {
    processed = processed.replace(new RegExp(escapeRegex(variable), "g"), value);
  }

  return processed;
}

/**
 * Format cents to currency string
 */
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Format date to readable string
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validate template has no invalid variables
 */
export function validateTemplate(template: string): {
  isValid: boolean;
  errors: string[];
} {
  const validVariables = [
    "{{businessName}}",
    "{{customerFirstName}}",
    "{{customerName}}",
    "{{invoiceNumber}}",
    "{{amountDue}}",
    "{{amountRemaining}}",
    "{{dueDate}}",
    "{{daysPastDue}}",
    "{{paymentLink}}",
  ];

  const errors: string[] = [];

  // Find all template variables in the template
  const variablePattern = /\{\{[^}]+\}\}/g;
  const matches = template.match(variablePattern) || [];

  for (const match of matches) {
    if (!validVariables.includes(match)) {
      errors.push(`Invalid variable: ${match}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
