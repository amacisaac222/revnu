import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null

export async function createPaymentLink(params: {
  invoiceId: string
  amount: number // in cents
  description: string
  metadata?: Record<string, string>
}) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }

  // Create a payment link for the invoice
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: params.description,
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoiceId: params.invoiceId,
      ...params.metadata,
    },
    after_completion: {
      type: 'redirect',
      redirect: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?invoice=${params.invoiceId}`,
      },
    },
  })

  return paymentLink
}
