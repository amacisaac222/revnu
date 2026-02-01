/**
 * Certified Mail Service (Lob.com Integration)
 *
 * Sends NOI letters via USPS Certified Mail with tracking.
 * Uses Lob.com API for programmatic mail sending.
 *
 * Pricing: $2.17 per certified letter
 * Delivery: 3-5 business days
 * Tracking: Real-time USPS tracking included
 */

// Note: Install Lob SDK with: npm install lob
// For now, we'll use fetch API directly to avoid adding dependency until ready

export interface MailRecipient {
  name: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country?: string;
}

export interface MailSender {
  name: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

export interface CertifiedMailOptions {
  recipient: MailRecipient;
  sender: MailSender;
  pdfBase64: string; // Base64 encoded PDF
  description?: string;
  metadata?: Record<string, string>;
  sendDate?: Date; // Optional: schedule for future date
  color?: boolean; // true for color printing ($0.50 extra)
  doubleSided?: boolean; // true for double-sided printing
  returnEnvelope?: boolean; // Include return envelope
}

export interface CertifiedMailResult {
  success: boolean;
  letterId: string;
  trackingNumber: string;
  trackingUrl: string;
  expectedDeliveryDate: Date;
  cost: number; // in cents
  error?: string;
}

/**
 * Send NOI via USPS Certified Mail using Lob.com
 */
export async function sendCertifiedMail(
  options: CertifiedMailOptions
): Promise<CertifiedMailResult> {
  const lobApiKey = process.env.LOB_API_KEY;

  if (!lobApiKey) {
    throw new Error("LOB_API_KEY not configured in environment variables");
  }

  try {
    // Prepare letter data for Lob API
    const letterData = {
      description: options.description || "Notice of Intent to Lien",
      to: {
        name: options.recipient.name,
        address_line1: options.recipient.address_line1,
        address_line2: options.recipient.address_line2 || "",
        address_city: options.recipient.address_city,
        address_state: options.recipient.address_state,
        address_zip: options.recipient.address_zip,
        address_country: options.recipient.address_country || "US",
      },
      from: {
        name: options.sender.name,
        address_line1: options.sender.address_line1,
        address_line2: options.sender.address_line2 || "",
        address_city: options.sender.address_city,
        address_state: options.sender.address_state,
        address_zip: options.sender.address_zip,
      },
      file: options.pdfBase64, // Base64 PDF or URL
      color: options.color || false,
      double_sided: options.doubleSided || false,
      mail_type: "usps_first_class", // First Class with tracking
      extra_service: "certified", // THIS IS KEY - adds certified mail
      return_envelope: options.returnEnvelope || false,
      metadata: options.metadata || {},
      send_date: options.sendDate
        ? options.sendDate.toISOString().split("T")[0]
        : undefined,
    };

    // Call Lob API
    const response = await fetch("https://api.lob.com/v1/letters", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(lobApiKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(letterData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Lob API error:", error);
      throw new Error(error.error?.message || "Failed to send certified mail");
    }

    const result = await response.json();

    // Extract tracking information
    return {
      success: true,
      letterId: result.id,
      trackingNumber: result.tracking_number || "",
      trackingUrl: result.tracking_events?.[0]?.tracking_url || "",
      expectedDeliveryDate: new Date(result.expected_delivery_date),
      cost: calculateCost(options),
    };
  } catch (error) {
    console.error("Certified mail error:", error);
    return {
      success: false,
      letterId: "",
      trackingNumber: "",
      trackingUrl: "",
      expectedDeliveryDate: new Date(),
      cost: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Track certified mail delivery status
 */
export async function getDeliveryStatus(
  letterId: string
): Promise<{
  status: "pending" | "in_transit" | "delivered" | "returned" | "failed";
  deliveredAt?: Date;
  trackingEvents: Array<{
    type: string;
    location: string;
    timestamp: Date;
  }>;
}> {
  const lobApiKey = process.env.LOB_API_KEY;

  if (!lobApiKey) {
    throw new Error("LOB_API_KEY not configured");
  }

  try {
    const response = await fetch(`https://api.lob.com/v1/letters/${letterId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(lobApiKey + ":").toString("base64")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch delivery status");
    }

    const letter = await response.json();

    // Map Lob status to our internal status
    let status: "pending" | "in_transit" | "delivered" | "returned" | "failed" =
      "pending";

    if (letter.status === "delivered") {
      status = "delivered";
    } else if (letter.status === "in_transit") {
      status = "in_transit";
    } else if (letter.status === "returned_to_sender") {
      status = "returned";
    } else if (letter.status === "failed") {
      status = "failed";
    }

    // Parse tracking events
    const trackingEvents = (letter.tracking_events || []).map((event: any) => ({
      type: event.name,
      location: event.location || "",
      timestamp: new Date(event.time),
    }));

    // Find delivery date
    const deliveryEvent = trackingEvents.find(
      (e: any) => e.type === "Delivered"
    );

    return {
      status,
      deliveredAt: deliveryEvent?.timestamp,
      trackingEvents,
    };
  } catch (error) {
    console.error("Delivery status error:", error);
    throw error;
  }
}

/**
 * Calculate total cost for certified mail
 */
function calculateCost(options: CertifiedMailOptions): number {
  let cost = 217; // Base: $2.17 in cents

  if (options.color) {
    cost += 50; // Color printing: +$0.50
  }

  if (options.returnEnvelope) {
    cost += 30; // Return envelope: +$0.30
  }

  return cost;
}

/**
 * Validate address using Lob's address verification
 */
export async function verifyAddress(
  address: MailRecipient
): Promise<{
  valid: boolean;
  deliverable: boolean;
  correctedAddress?: MailRecipient;
  components?: any;
}> {
  const lobApiKey = process.env.LOB_API_KEY;

  if (!lobApiKey) {
    throw new Error("LOB_API_KEY not configured");
  }

  try {
    const response = await fetch("https://api.lob.com/v1/us_verifications", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(lobApiKey + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        primary_line: address.address_line1,
        secondary_line: address.address_line2 || "",
        city: address.address_city,
        state: address.address_state,
        zip_code: address.address_zip,
      }),
    });

    if (!response.ok) {
      return { valid: false, deliverable: false };
    }

    const result = await response.json();

    return {
      valid: result.deliverability === "deliverable",
      deliverable: result.deliverability === "deliverable",
      correctedAddress: result.deliverability === "deliverable"
        ? {
            name: address.name,
            address_line1: result.primary_line,
            address_line2: result.secondary_line || undefined,
            address_city: result.components.city,
            address_state: result.components.state,
            address_zip: result.components.zip_code,
          }
        : undefined,
      components: result.components,
    };
  } catch (error) {
    console.error("Address verification error:", error);
    return { valid: false, deliverable: false };
  }
}

/**
 * Cancel scheduled certified mail (must be before send date)
 */
export async function cancelCertifiedMail(
  letterId: string
): Promise<{ success: boolean; error?: string }> {
  const lobApiKey = process.env.LOB_API_KEY;

  if (!lobApiKey) {
    throw new Error("LOB_API_KEY not configured");
  }

  try {
    const response = await fetch(
      `https://api.lob.com/v1/letters/${letterId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${Buffer.from(lobApiKey + ":").toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || "Failed to cancel",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get estimated delivery date for certified mail
 */
export function estimateDeliveryDate(sendDate: Date = new Date()): Date {
  // Certified mail typically takes 3-5 business days
  // Add 4 business days (conservative estimate)
  const estimatedDate = new Date(sendDate);
  let daysAdded = 0;
  let targetDays = 4;

  while (daysAdded < targetDays) {
    estimatedDate.setDate(estimatedDate.getDate() + 1);

    // Skip weekends
    const dayOfWeek = estimatedDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }

  return estimatedDate;
}
