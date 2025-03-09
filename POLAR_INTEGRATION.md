# Polar.sh Integration Guide for Tip Tracker

This guide explains how to set up and configure Polar.sh as a payment processor for your Tip Tracker application.

## What is Polar.sh?

Polar.sh is an open-source Merchant of Record (MoR) platform designed specifically for developers. It allows you to sell digital products and subscriptions with features like:

- Automated tax handling
- Global payment processing
- Subscription management
- Webhook integrations
- Developer-friendly APIs

## Prerequisites

Before you begin, make sure you have:

1. A Polar.sh account (sign up at [polar.sh](https://polar.sh))
2. Your Netlify website set up and connected to GitHub
3. Supabase database configured

## Setup Steps

### 1. Create a Polar.sh Organization

1. Sign up or log in to [polar.sh](https://polar.sh)
2. Create a new organization or use an existing one
3. Note your **Organization Identifier** and **Organization Slug** from the settings page

### 2. Create Products in Polar.sh

1. Go to your Polar.sh dashboard
2. Navigate to Products and create three products:
   - Monthly subscription ($6/month)
   - Annual subscription ($30/year)
   - Lifetime access ($99 one-time)
3. Note the **Product IDs** for each product

### 3. Generate Access Tokens

1. In your Polar.sh dashboard, go to Settings > Developers
2. Create a new access token with appropriate permissions
3. Save the token securely - you'll need it for your environment variables

### 4. Configure Environment Variables

Add the following environment variables to your Netlify site (Site settings > Environment variables):

```
POLAR_ORG_IDENTIFIER=your_organization_identifier
POLAR_ACCESS_TOKEN=your_access_token
POLAR_MONTHLY_PRODUCT_ID=your_monthly_product_id
POLAR_ANNUAL_PRODUCT_ID=your_annual_product_id
POLAR_LIFETIME_PRODUCT_ID=your_lifetime_product_id
POLAR_PUBLIC_KEY=your_public_key
POLAR_WEBHOOK_SECRET=your_webhook_secret
```

### 5. Set Up Webhooks

1. In your Polar.sh dashboard, go to Settings > Webhooks
2. Create a new webhook with the URL: `https://your-netlify-site.netlify.app/api/polar/webhook`
3. Select the events you want to receive (at minimum: checkout.session.completed, subscription.created, subscription.updated, subscription.deleted, payment.succeeded)
4. Copy the webhook secret and add it to your environment variables as `POLAR_WEBHOOK_SECRET`

## Testing the Integration

1. Deploy your site to Netlify
2. Go to the Upgrade page and select "Pay with Polar"
3. Choose a plan and complete the checkout process
4. Verify that your user account is properly updated with premium access

## Troubleshooting

If you encounter issues:

1. Check the Netlify function logs for errors
2. Verify your environment variables are correctly set
3. Ensure your Polar.sh products are properly configured
4. Check the webhook configuration in Polar.sh

## Additional Resources

- [Polar.sh Documentation](https://docs.polar.sh)
- [Polar.sh API Reference](https://docs.polar.sh/api-reference)
- [Polar.sh JavaScript SDK](https://docs.polar.sh/integrate/sdk/typescript)

## Support

If you need help with your Polar.sh integration, you can:

1. Join the [Polar.sh Discord](https://discord.gg/polar)
2. Contact Polar.sh support at support@polar.sh
3. Check the GitHub repository at [github.com/polarsource/polar](https://github.com/polarsource/polar) 