const express = require('express')
const router = express.Router()
const auth = require('../auth')
const flashMsg = require('../flashMessages')
const stripe = require('stripe')(process.env.STRIPE_API_KEY)
const {saveStripeCustomerId, updatePremiumStatus, getUserById} = require('../models/user')

const YOUR_DOMAIN = process.env.STRIPE_DOMAIN;

router.get('/', auth.checkAuthenticated, (req, res) => {
    if (req.user.isPremium) return res.redirect('/user/account')
    res.render('subscription/pricing_preview', {isAuthenticated: true})
})

router.get('/success', auth.checkAuthenticated, (req, res) => {
    res.render('subscription/success', {isAuthenticated: true})
})

router.get('/cancel', auth.checkAuthenticated, (req, res) => {
    res.render('subscription/cancel', {isAuthenticated: true})
})


router.post('/create-checkout-session', auth.checkAuthenticated, async (req, res) => {
    let session
    try {
        const prices = await stripe.prices.list({
            lookup_keys: [req.body.lookup_key],
            expand: ['data.product'],
          });
        console.log(`prices are ${prices.data[0].id}`)
        session = await stripe.checkout.sessions.create({
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
    } catch (err) {
        console.error(err)
        console.error(`There has been an error while creating a checkout session for user with id ${req.user.id}`)
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        res.redirect('/subscription')    
    }

    res.redirect(303, session.url)
  });

  router.post('/create-portal-session', auth.checkAuthenticated, async (req, res) => {
    const user = await getUserById(req.user.id)
    if (!user.stripe_customer_id) {
        return res.redirect('/subscription')
    }

    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = YOUR_DOMAIN;
    let portalSession;
    try {
        portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: returnUrl,
          });
    } catch (err) {
        console.error(err)
        console.error(`There has been an error while createing a portal session for user with id ${req.user.id}`)
        req.flash(flashMsg.generalError.htmlClass, flashMsg.generalError.msg)
        res.redirect('/subscription/pricing_preview')    
    }
    res.redirect(303, portalSession.url);
  });

router.post(
'/webhook',
express.raw({type: 'application/json'}),
async (req, res) => {
    let event;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SUB_SECRET;
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
    console.log(`Processing event ${event.type}.`);
    switch (event.type) {
    case 'checkout.session.completed':
        await saveStripeCustomerId(event.data.object.client_reference_id, event.data.object.customer)
        break;
    case 'invoice.paid':
        // checks what happens if there is not row updated - prepare a solution for this?
        await updatePremiumStatus(event.data.object.customer)
        break;
    case 'invoice.payment_failed':
        // here maybe it makes sense to add an email to the client?
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