export class SimpleCache<T> {
  private timeout: number;
  private cache: { [key: string]: { timestamp: number; value: T } };

  constructor(timeoutInMinutes: number) {
    this.timeout = timeoutInMinutes * 60 * 1000;
    this.cache = {};
  }

  get(key: string) {
    const record = this.cache[key];
    if (record && record.timestamp + this.timeout > Date.now()) {
      return record.value;
    }
    return null;
  }
  set(key: string, value: T) {
    this.cache[key] = {
      timestamp: Date.now(),
      value,
    };
  }

  clear() {
    this.cache = {};
  }
}
