// Request deduplication and caching utility
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pending = new Map<string, Promise<any>>();
  private readonly ttl = 5 * 60 * 1000; // 5 minutes

  async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    // Check if request is already pending
    const pending = this.pending.get(key);
    if (pending) {
      return pending;
    }

    // Create new request
    const promise = fetcher()
      .then((data) => {
        this.cache.set(key, { data, timestamp: Date.now() });
        this.pending.delete(key);
        return data;
      })
      .catch((error) => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, promise);
    return promise;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.pending.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.pending.clear();
  }
}

export const requestCache = new RequestCache();
