const express = require('express')
const { ReadyForQueryMessage } = require('pg-protocol/dist/messages')
const router = express.Router()
const auth = require('../auth')
const stripe = require('stripe')('sk_test_51JgEU0Dw9XEVgKC7aCPNktt1cYNN2jB8dLR5h5f4Pr5S24jZhv8a3orxUZPHIkZXvfMBoDgik6V4AHr85ZO9K6RW00LPvHQH7e')
const {saveStripeCustomerId, updatePremiumStatus} = require('../models/user')

const YOUR_DOMAIN = process.env.STRIPE_DOMAIN;

router.get('/', auth.checkAuthenticated, (req, res) => {
    res.render('subscription/pricing_preview', {isAuthenticated: true})
})

router.get('/success', auth.checkAuthenticated, (req, res) => {
    res.render('subscription/success', {isAuthenticated: true})
})

router.get('/cancel', auth.checkAuthenticated, (req, res) => {
    res.render('subscription/cancel', {isAuthenticated: true})
})


router.post('/create-checkout-session', async (req, res) => {
    const prices = await stripe.prices.list({
      lookup_keys: [req.body.lookup_key],
      expand: ['data.product'],
    });
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      payment_method_types: ['card'],
      client_reference_id: req.user.id,
      line_items: [
        {
          price: prices.data[0].id,
          // For metered billing, do not pass quantity
          quantity: 1
        },
      ],
      mode: 'subscription',
      success_url: `${YOUR_DOMAIN}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/subscription/cancel`,
    });
    console.log(session)
    res.redirect(303, session.url)
  });

  router.post('/create-portal-session', async (req, res) => {
    // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    // Typically this is stored alongside the authenticated user in your database.
    console.log(req.body.session_id)
    const session_id = req.query.session_id;
    console.log(session_id)
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    console.log(checkoutSession)
    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = YOUR_DOMAIN;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
    });
    res.redirect(303, portalSession.url);
  });

router.post(
'/webhook',
express.raw({type: 'application/json'}),
async (req, res) => {
    let event;
    // Replace this endpoint secret with your endpoint's unique secret
    // If you are testing with the CLI, find the secret by running 'stripe listen'
    // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
    // at https://dashboard.stripe.com/webhooks
    const endpointSecret = process.env.STRIPE_WEBHOOK_SUB_SECRET;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'];
    try {
        event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
        );
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return res.sendStatus(400);
    }
    }
    // Handle the event
    console.log(`Processing event  ${event.type}.`);
    switch (event.type) {
    case 'checkout.session.completed':
        await saveStripeCustomerId(event.data.client_reference_id, event.data.customer)
        break;
    case 'invoice.paid':
        await updatePremiumStatus(event.data.customer)
        break;
    case 'invoice.payment_failed':

        break;
    default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
}
);

module.exports = router