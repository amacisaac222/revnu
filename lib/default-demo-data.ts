// Default demo data when AI generation fails

export const DEFAULT_DEMO_DATA = {
  customers: [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@email.com",
      phone: "555-0101",
      company: "Smith Construction"
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@email.com",
      phone: "555-0102",
      company: "Johnson Landscaping"
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      email: "mbrown@email.com",
      phone: "555-0103",
      company: "Brown Plumbing"
    }
  ],
  invoices: [
    {
      invoiceNumber: "INV-1001",
      description: "Monthly service - October",
      amount: 45000, // $450.00 in cents
      dueDate: -5, // 5 days ago
      status: "outstanding" as const
    },
    {
      invoiceNumber: "INV-1002",
      description: "Project work completed",
      amount: 125000, // $1,250.00
      dueDate: -2, // 2 days ago
      status: "outstanding" as const
    },
    {
      invoiceNumber: "INV-1003",
      description: "Maintenance and repairs",
      amount: 75000, // $750.00
      dueDate: 7, // 7 days from now
      status: "outstanding" as const
    }
  ]
};
