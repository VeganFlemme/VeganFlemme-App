import { NextRequest, NextResponse } from 'next/server';

/**
 * Vegan Search API Route
 * Proxies requests to Supabase PA-API proxy function
 */
export async function POST(req: NextRequest) {
  try {
    const { q, searchIndex, resources } = await req.json();

    // Validate required parameters
    if (!q || typeof q !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter "q" is required and must be a string' },
        { status: 400 }
      );
    }

    // Get environment variables
    const proxyUrl = process.env.VEGANFLEMME_PAAPI_PROXY_URL;
    const sharedSecret = process.env.VEGANFLEMME_FUNCTION_SHARED_SECRET;

    if (!proxyUrl || !sharedSecret) {
      console.error('Missing environment variables:', {
        hasProxyUrl: !!proxyUrl,
        hasSharedSecret: !!sharedSecret
      });
      
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // Prepare request payload
    const payload = {
      Keywords: q,
      Resources: resources || [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Images.Primary.Medium'
      ],
      SearchIndex: searchIndex || 'Grocery'
    };

    console.log('Vegan Search API Request:', {
      query: q,
      searchIndex: payload.SearchIndex,
      resourceCount: payload.Resources.length
    });

    // Make request to Supabase proxy
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shared-secret': sharedSecret,
      },
      body: JSON.stringify(payload),
    });

    // Get response data
    const data = await response.text();
    
    console.log('Vegan Search API Response:', {
      status: response.status,
      hasData: !!data,
      dataLength: data.length
    });

    // Return the response with the same status and content type
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Vegan Search API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}