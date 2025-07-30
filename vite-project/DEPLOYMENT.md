# Deploying Vue 3 AI Chatbot to Vercel

This guide will help you deploy your Vue 3 AI chatbot to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your project should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Node.js**: Ensure you have Node.js installed locally for testing

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your Git repository
   - Vercel will automatically detect it's a Vite project

3. **Configure Project Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

4. **Environment Variables** (if needed)
   - Add any environment variables in the Vercel dashboard
   - The API key is already configured in `vercel.json`

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd vue3-tailwindcss4-starter/vite-project
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Confirm settings
   - Deploy

## Configuration Files

### vercel.json
This file configures:
- Build command and output directory
- API proxy to your chat backend
- SPA routing (all routes serve index.html)
- API headers for authentication

### .gitignore
Excludes unnecessary files from deployment:
- `node_modules`
- `dist`
- Environment files
- Vercel cache

## Post-Deployment

1. **Test Your Application**
   - Visit your deployed URL
   - Test the chat functionality
   - Verify API calls work correctly

2. **Custom Domain** (Optional)
   - In Vercel dashboard, go to your project settings
   - Add a custom domain if desired

3. **Environment Variables**
   - If you need to change the API endpoint or key, update them in Vercel dashboard
   - Or modify `vercel.json` and redeploy

## Troubleshooting

### Build Issues
- Ensure all dependencies are in `package.json`
- Check that `pnpm run build` works locally
- Review build logs in Vercel dashboard

### API Issues
- Verify the API endpoint is accessible
- Check that the API key is correct
- Test the proxy configuration

### Routing Issues
- Ensure `vercel.json` has the SPA rewrite rule
- Check that Vue Router is configured correctly

## Local Testing

Before deploying, test the build locally:
```bash
pnpm install
pnpm run build
pnpm run preview
```

## Continuous Deployment

Once connected to Vercel:
- Every push to your main branch will trigger a new deployment
- Pull requests will create preview deployments
- You can configure branch protection rules in your Git provider

## Performance Optimization

Vercel automatically:
- Optimizes static assets
- Provides global CDN
- Enables automatic HTTPS
- Offers edge functions for serverless API routes

Your Vue 3 + Vite + Tailwind CSS v4 application is optimized for fast loading and modern browsers. 