# 🔐 GitHub Secrets Configuration

This document lists all the GitHub secrets that need to be configured for VeganFlemme to deploy successfully.

## Required Secrets

### Vercel (Frontend Deployment)

#### `VERCEL_TOKEN`
- **Description**: Personal access token from Vercel account
- **How to get**: 
  1. Go to https://vercel.com/account/tokens
  2. Create a new token
  3. Copy the token value

#### `VERCEL_ORG_ID`
- **Description**: Organization ID from Vercel
- **How to get**:
  1. Go to your Vercel dashboard
  2. Go to Settings → General
  3. Copy the "Team ID" or "User ID"

#### `VERCEL_PROJECT_ID`
- **Description**: Project ID for the VeganFlemme frontend
- **How to get**:
  1. In your Vercel project dashboard
  2. Go to Settings → General
  3. Copy the "Project ID"

### Render (Backend Deployment)

#### `RENDER_API_KEY`
- **Description**: API key from Render account
- **How to get**:
  1. Go to https://dashboard.render.com/account/api-keys
  2. Create a new API key
  3. Copy the key value

#### `RENDER_SERVICE_ID`
- **Description**: Service ID for the VeganFlemme engine
- **How to get**:
  1. In your Render service dashboard
  2. Go to Settings
  3. Copy the "Service ID"

## How to Configure Secrets

1. Go to your GitHub repository: `https://github.com/VeganFlemme/VeganFlemme-App`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

## Verification

After adding all secrets, you can verify the setup by:

1. Creating a new branch and pushing changes
2. Check that the GitHub Actions workflows run successfully
3. Verify that deployments are triggered on Vercel and Render

## Security Notes

- ⚠️ Never commit secrets to the repository
- 🔒 Secrets are encrypted and only accessible to GitHub Actions
- 🔄 Rotate secrets regularly for security
- 👥 Only repository administrators can view/edit secrets

## Environment Variables

### Production Environment Variables (Vercel)

These are configured directly in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://veganflemme-engine.onrender.com/api
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CART_BUILDER=true
NEXT_PUBLIC_ENABLE_AFFILIATE_LINKS=true
NEXT_PUBLIC_PWA_ENABLED=true
NEXT_PUBLIC_APP_NAME=VeganFlemme
NEXT_PUBLIC_APP_SHORT_NAME=VeganFlemme
NEXT_PUBLIC_APP_DESCRIPTION=Votre transition vegan simplifiée
```

### Production Environment Variables (Render)

These are configured directly in Render dashboard:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://veganflemme.vercel.app
LOG_LEVEL=info
ENABLE_MENU_GENERATION=true
ENABLE_CART_BUILDER=true
ENABLE_ANALYTICS=true
```

## Troubleshooting

### Common Issues

1. **Vercel deployment fails**: Check VERCEL_TOKEN and project permissions
2. **Render deployment fails**: Verify RENDER_API_KEY and SERVICE_ID
3. **Build errors**: Check that environment variables are correctly set
4. **API connection issues**: Verify FRONTEND_URL and NEXT_PUBLIC_API_URL match

### Support

For deployment issues:
- Check GitHub Actions logs
- Review Vercel deployment logs
- Check Render service logs
- Verify all secrets are correctly configured