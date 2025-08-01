# Supabase Edge Functions Environment Variables

## PA-API Proxy Function Environment Variables

Set these environment variables in your Supabase project settings:

### Required PA-API Credentials
```
PAAPI_ACCESS_KEY_ID=your-amazon-access-key-id
PAAPI_SECRET_ACCESS_KEY=your-amazon-secret-access-key
PAAPI_PARTNER_TAG=your-amazon-associate-tag
```

### Optional PA-API Configuration (with defaults)
```
PAAPI_REGION=us-east-1
PAAPI_HOST=webservices.amazon.com
PAAPI_MARKETPLACE=www.amazon.com
```

### Security Configuration
```
FRONTEND_FUNCTION_SHARED_SECRET=your-secure-shared-secret-here
```

## How to Set Environment Variables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to Settings > Edge Functions
3. Add each environment variable under "Environment Variables"
4. Deploy or redeploy your edge functions

## Security Notes

- Use a secure, randomly generated string for `FRONTEND_FUNCTION_SHARED_SECRET`
- Never commit actual secret values to version control
- The same `FRONTEND_FUNCTION_SHARED_SECRET` value must be set in both:
  - Supabase Edge Functions (as `FRONTEND_FUNCTION_SHARED_SECRET`)
  - Next.js frontend (as `VEGANFLEMME_FUNCTION_SHARED_SECRET`)