# Deploying Cursor Tip Tracker to Vercel

This guide will help you deploy your Cursor Tip Tracker application to Vercel, making it accessible online to anyone with the URL.

## Prerequisites

- A GitHub account (which you already have)
- A Vercel account (free to create)
- Your Supabase project details (URL and anon key)

## Deployment Steps

### 1. Create a Vercel Account

If you don't already have one:
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account

### 2. Import Your GitHub Repository

1. Once logged in to Vercel, click "Add New..." and select "Project"
2. Select "Import Git Repository"
3. Find and select your "Cursor-Tip-Tracker" repository
4. Click "Import"

### 3. Configure Your Project

1. Project Name: You can keep the default or change it
2. Framework Preset: Make sure "Next.js" is selected
3. Root Directory: Keep as `.` (the default)
4. Build and Output Settings: Keep the defaults

### 4. Environment Variables

Add the following environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

These are the same values you have in your `.env.local` file.

### 5. Deploy

1. Click "Deploy"
2. Wait for the deployment to complete (usually takes 1-2 minutes)

### 6. Access Your Deployed Application

Once deployment is complete, Vercel will provide you with a URL (typically something like `cursor-tip-tracker.vercel.app`). This is your live application!

## Updating Your Deployed Application

Whenever you push changes to your GitHub repository, Vercel will automatically redeploy your application with the latest changes.

## Custom Domain (Optional)

If you want to use a custom domain:
1. Go to your project settings in Vercel
2. Click on "Domains"
3. Add your domain and follow the instructions

## Troubleshooting

If you encounter any issues during deployment:
1. Check the build logs in Vercel
2. Make sure your environment variables are correctly set
3. Ensure your Supabase project is properly configured

For more help, refer to the [Vercel documentation](https://vercel.com/docs) or [contact Vercel support](https://vercel.com/support). 