/**
 * Rate limits API calls to avoid hitting quotas
 */
export class ApiRateLimiter {
  private requestsPerDay: number;
  private dailyRequests: number = 0;
  private lastReset: Date;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing: boolean = false;
  
  constructor(requestsPerDay: number = 150) {
    this.requestsPerDay = requestsPerDay;
    this.lastReset = new Date();
    
    // Reset counter daily
    setInterval(() => this.resetCounter(), 24 * 60 * 60 * 1000);
  }
  
  /**
   * Executes an API call respecting rate limits
   */
  public async executeRequest<T>(request: () => Promise<T>): Promise<T> {
    // Reset counter if day changed
    const now = new Date();
    if (now.getDate() !== this.lastReset.getDate() || 
        now.getMonth() !== this.lastReset.getMonth() || 
        now.getFullYear() !== this.lastReset.getFullYear()) {
      this.resetCounter();
    }
    
    // Check if we're under the daily limit
    if (this.dailyRequests < this.requestsPerDay) {
      this.dailyRequests++;
      return request();
    }
    
    // We've hit the limit, queue the request
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      // Start processing the queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }
  
  /**
   * Process queued requests when rate limit resets
   */
  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0 || this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0 && this.dailyRequests < this.requestsPerDay) {
      const request = this.requestQueue.shift();
      if (request) {
        this.dailyRequests++;
        await request();
      }
    }
    
    this.isProcessing = false;
  }
  
  /**
   * Reset the daily counter
   */
  private resetCounter(): void {
    this.dailyRequests = 0;
    this.lastReset = new Date();
    
    // If there are queued requests, start processing them
    if (this.requestQueue.length > 0 && !this.isProcessing) {
      this.processQueue();
    }
  }
}