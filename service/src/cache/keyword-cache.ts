interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class KeywordCache {
  private cache: Map<string, CacheEntry<any>>;
  private ttlMs: number;

  constructor(ttlMs: number = 86400000) { // 24 hours default
    this.cache = new Map();
    this.ttlMs = ttlMs;
    
    // Clean up expired entries every hour
    setInterval(() => this.cleanup(), 3600000);
  }

  private generateKey(request: { productTitle: string; productDescription: string; category?: string }): string {
    const normalized = {
      title: request.productTitle.toLowerCase().trim(),
      description: request.productDescription.toLowerCase().trim().substring(0, 100),
      category: (request.category || '').toLowerCase().trim()
    };
    return `${normalized.title}|${normalized.description}|${normalized.category}`;
  }

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async set(key: string, data: any): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.ttlMs
    });
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getSize(): number {
    return this.cache.size;
  }
}
