import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface AmazonSearchRequest {
  keywords: string;
  searchIndex: string;
  itemCount: number;
  resources: string[];
  associateTag: string;
}

export interface AmazonGetItemsRequest {
  itemIds: string[];
  itemIdType: string;
  resources: string[];
  associateTag: string;
}

/**
 * Amazon Product Advertising API Service
 * Handles authentication and API calls to Amazon PA API
 */
export class AmazonPAAPIService {
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly region: string;
  private readonly host: string = 'webservices.amazon.fr';
  private readonly endpoint: string = '/paapi5/searchitems';
  private readonly service: string = 'ProductAdvertisingAPI';

  constructor() {
    this.accessKeyId = process.env.AMAZON_ACCESS_KEY_ID || '';
    this.secretAccessKey = process.env.AMAZON_SECRET_ACCESS_KEY || '';
    this.region = process.env.AMAZON_REGION || 'eu-west-1';

    // Only log warning in production or when explicitly requested
    if (!this.accessKeyId || !this.secretAccessKey) {
      if (process.env.NODE_ENV === 'production') {
        logger.warn('Amazon PA API credentials not configured for production');
      } else {
        logger.info('Amazon PA API running in demo mode - credentials not configured');
      }
    }
  }

  /**
   * Search for products using Amazon PA API
   */
  async searchProducts(request: AmazonSearchRequest): Promise<any> {
    try {
      const payload = {
        PartnerTag: request.associateTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.fr',
        Keywords: request.keywords,
        SearchIndex: request.searchIndex,
        ItemCount: request.itemCount,
        Resources: request.resources
      };

      const response = await this.makeAPICall('/paapi5/searchitems', payload);
      return response.data;
    } catch (error) {
      logger.error('Amazon search error:', error);
      throw error;
    }
  }

  /**
   * Get items by ASIN
   */
  async getItems(request: AmazonGetItemsRequest): Promise<any> {
    try {
      const payload = {
        PartnerTag: request.associateTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.fr',
        ItemIds: request.itemIds,
        ItemIdType: request.itemIdType,
        Resources: request.resources
      };

      const response = await this.makeAPICall('/paapi5/getitems', payload);
      return response.data;
    } catch (error) {
      logger.error('Amazon get items error:', error);
      throw error;
    }
  }

  /**
   * Make authenticated API call to Amazon PA API
   */
  private async makeAPICall(endpoint: string, payload: any): Promise<any> {
    const method = 'POST';
    const canonicalUri = endpoint;
    const canonicalQueryString = '';
    const payloadStr = JSON.stringify(payload);
    
    // Create canonical headers
    const amzTarget = endpoint === '/paapi5/searchitems' ? 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems' : 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';
    const contentType = 'application/json; charset=utf-8';
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = timestamp.substring(0, 8);

    const canonicalHeaders = [
      `content-type:${contentType}`,
      `host:${this.host}`,
      `x-amz-date:${timestamp}`,
      `x-amz-target:${amzTarget}`
    ].join('\n');

    const signedHeaders = 'content-type;host;x-amz-date;x-amz-target';

    // Create canonical request
    const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex');
    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      '',
      signedHeaders,
      payloadHash
    ].join('\n');

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${date}/${this.region}/${this.service}/aws4_request`;
    const stringToSign = [
      algorithm,
      timestamp,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    // Calculate signature
    const signature = this.calculateSignature(stringToSign, date);

    // Create authorization header
    const authorizationHeader = `${algorithm} Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    // Make the request
    const response = await axios.post(`https://${this.host}${endpoint}`, payloadStr, {
      headers: {
        'Authorization': authorizationHeader,
        'Content-Type': contentType,
        'Host': this.host,
        'X-Amz-Date': timestamp,
        'X-Amz-Target': amzTarget
      },
      timeout: 10000
    });

    return response;
  }

  /**
   * Calculate AWS4 signature
   */
  private calculateSignature(stringToSign: string, date: string): string {
    const kDate = crypto.createHmac('sha256', `AWS4${this.secretAccessKey}`).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(this.service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    
    return crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.accessKeyId && this.secretAccessKey);
  }
}

export default new AmazonPAAPIService();