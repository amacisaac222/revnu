# RevenuPros

Collection management platform for trades businesses (electricians, HVAC, plumbers, contractors).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Payments**: Stripe
- **SMS**: Twilio
- **Email**: Resend
- **Hosting**: Vercel + Neon/Supabase

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database (local or via Neon/Supabase) and add the connection string to `.env`:

```bash
cp .env.example .env
# Edit .env and add your DATABASE_URL
```

### 3. Run Migrations

```bash
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

Core models:
- **Organization** - Multi-tenant business accounts
- **User** - Team members
- **Customer** - Debtors with TCPA consent tracking
- **Invoice** - Outstanding balances
- **Payment** - Payment records
- **SequenceTemplate** - Collection sequence templates
- **SequenceStep** - Individual steps in a sequence
- **Message** - SMS/Email communication log
- **AuditLog** - Compliance audit trail

## Key Features

### TCPA Compliance
- SMS consent tracking (date, method)
- Opt-out handling (STOP keyword)
- Quiet hours enforcement (8 AM - 9 PM per customer timezone)
- Complete audit logging

### Collection Automation
- Customizable reminder sequences
- Template variables (customer name, amount, payment link)
- Automatic scheduling based on days past due

### Payment Processing
- Stripe payment links embedded in messages
- Automatic invoice updates on payment
- Payment tracking and reconciliation

## Project Structure

```
revenupros/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Core utilities
│   ├── db.ts        # Prisma client
│   ├── twilio.ts    # SMS service
│   ├── email.ts     # Email service
│   ├── stripe.ts    # Payment service
│   └── audit.ts     # Audit logging
├── prisma/
│   └── schema.prisma
└── package.json
```

## Environment Variables

See [.env.example](.env.example) for required configuration.

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
```

## Next Steps

- [ ] Set up authentication (Clerk or NextAuth)
- [ ] Build dashboard UI
- [ ] Implement customer import
- [ ] Create sequence builder
- [ ] Add background job processing (Inngest)
- [ ] Set up Stripe webhooks
- [ ] Implement Twilio webhooks (for opt-outs)
- [ ] Add analytics and reporting

## License

Proprietary
