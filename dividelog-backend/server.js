import express from 'express'
import Stripe from 'stripe'
import cors from 'cors'

const app = express()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Allow requests from your frontend domain
const allowedOrigins = [
  'https://dividelog.com',
  'https://www.dividelog.com',
  'http://localhost:5173', // local dev
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error('Not allowed by CORS'))
  }
}))

app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'DivideLog API running' })
})

// Create PaymentIntent — called by the frontend before showing payment form
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4999,           // $49.99 in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,        // enables Apple Pay, Google Pay, cards automatically
      },
      metadata: {
        product: 'DivideLog Inventory & Appraisement Report',
      },
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('Stripe error:', err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`DivideLog API running on port ${PORT}`)
})
