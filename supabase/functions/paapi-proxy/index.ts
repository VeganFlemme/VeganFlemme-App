import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHash, createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-shared-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PAAPIRequest {
  Keywords: string;
  Resources: string[];
  SearchIndex: string;
  ItemCount?: number;
  PartnerTag?: string;
  PartnerType?: string;
  Marketplace?: string;
}

interface PAAPIResponse {
  searchResult?: {
    items?: any[];
  };
  error?: string;
}

/**
 * Calculate AWS4 signature for PA-API requests
 */
function calculateSignature(
  stringToSign: string,
  secretAccessKey: string,
  date: string,
  region: string,
  service: string
): string {
  const kDate = createHmac('sha256', `AWS4${secretAccessKey}`).update(date).digest();
  const kRegion = createHmac('sha256', kDate).update(region).digest();
  const kService = createHmac('sha256', kRegion).update(service).digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
  
  return createHmac('sha256', kSigning).update(stringToSign).digest('hex');
}

/**
 * Make authenticated request to Amazon PA-API
 */
async function callPAAPI(request: PAAPIRequest): Promise<PAAPIResponse> {
  const accessKeyId = Deno.env.get('PAAPI_ACCESS_KEY_ID');
  const secretAccessKey = Deno.env.get('PAAPI_SECRET_ACCESS_KEY');
  const region = Deno.env.get('PAAPI_REGION') || 'us-east-1';
  const host = Deno.env.get('PAAPI_HOST') || 'webservices.amazon.com';
  const marketplace = Deno.env.get('PAAPI_MARKETPLACE') || 'www.amazon.com';
  const partnerTag = Deno.env.get('PAAPI_PARTNER_TAG');

  if (!accessKeyId || !secretAccessKey || !partnerTag) {
    throw new Error('Missing required PA-API credentials');
  }

  // Prepare the payload
  const payload = {
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    Marketplace: marketplace,
    Keywords: request.Keywords,
    SearchIndex: request.SearchIndex,
    ItemCount: request.ItemCount || 10,
    Resources: request.Resources
  };

  const method = 'POST';
  const endpoint = '/paapi5/searchitems';
  const service = 'ProductAdvertisingAPI';
  const payloadStr = JSON.stringify(payload);
  
  // Create timestamp and date
  const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  const date = timestamp.substring(0, 8);
  
  // Create canonical headers
  const amzTarget = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
  const contentType = 'application/json; charset=utf-8';
  
  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-date:${timestamp}`,
    `x-amz-target:${amzTarget}`
  ].join('\n');
  
  const signedHeaders = 'content-type;host;x-amz-date;x-amz-target';
  
  // Create canonical request
  const payloadHash = createHash('sha256').update(payloadStr).digest('hex');
  const canonicalRequest = [
    method,
    endpoint,
    '', // canonical query string
    canonicalHeaders,
    '',
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    timestamp,
    credentialScope,
    createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');
  
  // Calculate signature
  const signature = calculateSignature(stringToSign, secretAccessKey, date, region, service);
  
  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  // Make the request
  const response = await fetch(`https://${host}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': authorizationHeader,
      'Content-Type': contentType,
      'Host': host,
      'X-Amz-Date': timestamp,
      'X-Amz-Target': amzTarget
    },
    body: payloadStr
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('PA-API Error:', errorText);
    throw new Error(`PA-API request failed: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Verify shared secret
    const sharedSecret = req.headers.get('x-shared-secret');
    const expectedSecret = Deno.env.get('FRONTEND_FUNCTION_SHARED_SECRET');
    
    if (!sharedSecret || !expectedSecret || sharedSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await req.json();
    
    if (!body.Keywords) {
      return new Response(
        JSON.stringify({ error: 'Keywords parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Default values for PA-API request
    const paapiRequest: PAAPIRequest = {
      Keywords: body.Keywords,
      Resources: body.Resources || [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Images.Primary.Medium'
      ],
      SearchIndex: body.SearchIndex || 'Grocery',
      ItemCount: body.ItemCount || 10
    };

    console.log('PA-API Proxy Request:', { 
      keywords: paapiRequest.Keywords, 
      searchIndex: paapiRequest.SearchIndex,
      resourceCount: paapiRequest.Resources.length
    });

    // Call PA-API
    const result = await callPAAPI(paapiRequest);
    
    console.log('PA-API Proxy Response:', { 
      itemCount: result.searchResult?.items?.length || 0,
      hasError: !!result.error
    });

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('PA-API Proxy Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});