# 🛒 VeganFlemme PA-API Proxy

> **Secure Supabase Edge Function for Amazon Product Advertising API integration**

This Supabase Edge Function serves as a secure proxy for Amazon's Product Advertising API (PA-API), enabling VeganFlemme to search for vegan products and provide affiliate links while maintaining security and compliance.

## 🌐 **Production Status**

**The PA-API Proxy is fully deployed and operational:**
- **✅ Deployment**: Supabase Edge Function successfully deployed
- **✅ Security**: AWS SigV4 authentication implemented and functional
- **✅ Integration**: Connected to VeganFlemme frontend via secure API routes
- **🔧 Affiliate Status**: Amazon Associate Program application submitted (awaiting approval)

## 🏗️ **Architecture Overview**

The secure proxy architecture ensures API keys are never exposed to the client:

```
🌐 Frontend (Next.js)
    ↓ HTTPS Request
📡 Next.js API Route (/api/vegan-search)
    ↓ Authenticated Request
☁️ Supabase Edge Function (paapi-proxy)
    ↓ AWS SigV4 Signed Request
🛒 Amazon PA-API
```

### 🔒 **Security Features**
- **Server-side Authentication**: All Amazon credentials stored securely in Supabase
- **Shared Secret**: Frontend-to-proxy authentication via secure shared secret
- **CORS Protection**: Restricted to VeganFlemme domains only
- **Input Validation**: Comprehensive request validation and sanitization
- **Error Handling**: Secure error responses without sensitive information exposure

## ⚙️ **Configuration Requirements**

### Required Supabase Environment Variables

Set these in your Supabase project dashboard under Settings > Edge Functions:

```bash
# Amazon PA-API Credentials (Required)
PAAPI_ACCESS_KEY_ID=your-amazon-access-key-id
PAAPI_SECRET_ACCESS_KEY=your-amazon-secret-access-key
PAAPI_PARTNER_TAG=your-amazon-associate-tag

# Regional Configuration (Optional - defaults shown)
PAAPI_REGION=eu-west-1
PAAPI_HOST=webservices.amazon.fr
PAAPI_MARKETPLACE=www.amazon.fr

# Security Configuration (Required)
FRONTEND_FUNCTION_SHARED_SECRET=your-secure-random-secret
```

### Frontend Configuration

In your Next.js application environment:

```bash
# Production (Vercel)
VEGANFLEMME_PAAPI_PROXY_URL=https://your-project.supabase.co/functions/v1/paapi-proxy
VEGANFLEMME_FUNCTION_SHARED_SECRET=same-secret-as-supabase

# Local Development
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🚀 **Deployment Status**

### ✅ **Current Implementation**
- **Supabase Function**: Deployed and responding to requests
- **AWS Authentication**: SigV4 signing working correctly
- **Frontend Integration**: API routes configured and functional
- **Test Interface**: Available at [veganflemme.vercel.app/vegan-search-test](https://veganflemme.vercel.app/vegan-search-test)

### 🔧 **Pending Actions**
- **Amazon Associate Approval**: Application submitted, awaiting Amazon's approval
- **Production Testing**: Full product search testing post-approval
- **Analytics Integration**: Track search success rates and user engagement

## 📋 **API Usage**

Once Amazon Associate approval is complete, the proxy will support:

### Product Search
```javascript
// Frontend API call
const response = await fetch('/api/vegan-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    keywords: 'organic tofu',
    searchIndex: 'All',
    itemCount: 10
  })
});
```

### Expected Response
```json
{
  "SearchResult": {
    "Items": [
      {
        "ASIN": "B08XYZ123",
        "DetailPageURL": "https://amazon.fr/dp/B08XYZ123?tag=veganflemme-21",
        "ItemInfo": {
          "Title": "Organic Silken Tofu 400g",
          "Features": ["Organic", "Vegan", "Non-GMO"]
        },
        "Offers": {
          "Listings": [
            {
              "Price": {
                "Amount": 3.99,
                "Currency": "EUR"
              }
            }
          ]
        }
      }
    ]
  }
}
```

## 🛠️ **Development & Testing**

### Local Testing with Supabase CLI
```bash
# Start local Supabase development
supabase start

# Deploy function locally
supabase functions deploy paapi-proxy --no-verify-jwt

# Test function
curl -X POST http://localhost:54321/functions/v1/paapi-proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SHARED_SECRET" \
  -d '{"Keywords": "vegan protein", "SearchIndex": "All"}'
```

### Production Deployment
```bash
# Deploy to production
supabase functions deploy paapi-proxy

# Verify deployment
curl -X POST https://your-project.supabase.co/functions/v1/paapi-proxy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SHARED_SECRET" \
  -d '{"Keywords": "organic food", "SearchIndex": "All"}'
```

## 📊 **Monitoring & Analytics**

The proxy function includes comprehensive logging and monitoring:

- **Request Tracking**: All API calls logged with performance metrics
- **Error Monitoring**: Detailed error reporting and debugging information
- **Success Rates**: Track successful vs failed API calls
- **Performance Metrics**: Response times and throughput analysis

## 🔐 **Security Best Practices**

1. **Never commit real API keys** to version control
2. **Rotate shared secrets** regularly
3. **Monitor function logs** for unusual activity
4. **Keep dependencies updated** for security patches
5. **Use HTTPS only** for all communications

---

**Status**: ✅ Deployed and Ready - Awaiting Amazon Associate Program Approval