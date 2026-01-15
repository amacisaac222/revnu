import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

interface CSVRow {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  invoiceNumber?: string;
  invoiceDescription?: string;
  invoiceAmount?: string;
  invoiceDueDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const organizationId = formData.get("organizationId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json({ error: "No organization ID provided" }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    const parseResult = await new Promise<Papa.ParseResult<CSVRow>>((resolve) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: resolve,
      });
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: "Failed to parse CSV file", details: parseResult.errors },
        { status: 400 }
      );
    }

    const rows = parseResult.data;
    let customersCreated = 0;
    let invoicesCreated = 0;

    // Process each row
    for (const row of rows) {
      // Validate required customer fields
      if (!row.firstName || !row.lastName) {
        continue; // Skip invalid rows
      }

      // Try to find existing customer by email if provided
      let customer;

      if (row.email) {
        // Try to find customer by email
        customer = await db.customer.findFirst({
          where: {
            organizationId,
            email: row.email,
          },
        });

        if (customer) {
          // Update existing customer
          customer = await db.customer.update({
            where: { id: customer.id },
            data: {
              firstName: row.firstName,
              lastName: row.lastName,
              phone: row.phone || customer.phone,
              address: row.address || customer.address,
              city: row.city || customer.city,
              state: row.state || customer.state,
              zip: row.zip || customer.zip,
              customerNotes: row.notes || customer.customerNotes,
            },
          });
        } else {
          // Create new customer
          customer = await db.customer.create({
            data: {
              organizationId,
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              phone: row.phone || null,
              address: row.address || null,
              city: row.city || null,
              state: row.state || null,
              zip: row.zip || null,
              customerNotes: row.notes || null,
            },
          });
        }
      } else {
        // No email provided - create new customer without email
        customer = await db.customer.create({
          data: {
            organizationId,
            firstName: row.firstName,
            lastName: row.lastName,
            phone: row.phone || null,
            address: row.address || null,
            city: row.city || null,
            state: row.state || null,
            zip: row.zip || null,
            customerNotes: row.notes || null,
          },
        });
      }

      customersCreated++;

      // Create invoice if invoice fields are provided
      if (row.invoiceNumber && row.invoiceAmount && row.invoiceDueDate) {
        const amountInCents = Math.round(parseFloat(row.invoiceAmount) * 100);
        const dueDate = new Date(row.invoiceDueDate);

        // Check if invoice already exists
        const existingInvoice = await db.invoice.findUnique({
          where: {
            organizationId_invoiceNumber: {
              organizationId,
              invoiceNumber: row.invoiceNumber,
            },
          },
        });

        if (!existingInvoice) {
          await db.invoice.create({
            data: {
              organizationId,
              customerId: customer.id,
              invoiceNumber: row.invoiceNumber,
              invoiceDate: new Date(),
              description: row.invoiceDescription || "Imported invoice",
              amountDue: amountInCents,
              amountRemaining: amountInCents,
              dueDate,
              status: dueDate < new Date() ? "outstanding" : "pending",
            },
          });

          invoicesCreated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      customersCreated,
      invoicesCreated,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 }
    );
  }
}
