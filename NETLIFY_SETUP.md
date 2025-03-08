# Netlify Environment Variables Setup

To ensure your Netlify deployment works correctly, you need to set up the following environment variables in your Netlify dashboard.

## Required Environment Variables

1. Go to your Netlify dashboard
2. Select your site
3. Go to Site settings > Build & deploy > Environment
4. Add the following environment variables:

### Supabase Credentials
```
NEXT_PUBLIC_SUPABASE_URL=https://bggsscexogsptcnnwckj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZ3NzY2V4b2dzcHRjbm53Y2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNjgwMDQsImV4cCI6MjA1Njk0NDAwNH0.yRmBEA5ddBqoM-N9iOjQpyMtxQcBlbEUJ-diV396J94
```

### Application URL
```
NEXT_PUBLIC_URL=https://your-netlify-site-url.netlify.app
```
(Replace with your actual Netlify URL)

### Stripe Credentials (When Available)
```
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_MONTHLY_PRICE_ID=your_monthly_price_id
STRIPE_ANNUAL_PRICE_ID=your_annual_price_id
```

## Additional Build Settings

Make sure your build settings are configured correctly:

1. **Build command**: `npm run build`
2. **Publish directory**: `.next`
3. **Node.js version**: 18.x

## Troubleshooting

If you encounter build issues:

1. Check that all environment variables are correctly set
2. Ensure your Node.js version is set to 18.x
3. Review build logs for specific errors

For more information, refer to the [Netlify documentation](https://docs.netlify.com/configure-builds/environment-variables/). 