export class SimpleCache<T> {
  private timeout: number;
  private cache: { [key: string]: { timestamp: number; value: T } };

  constructor(timeoutInMinutes: number) {
    this.timeout = timeoutInMinutes * 60 * 1000;
    this.cache = {};
  }

  get(key?: string) {
    const record = this.cache[key || 'default'];
    if (record && record.timestamp + this.timeout > Date.now()) {
      return record.value;
    }
    return null;
  }
  set(key: string | undefined, value: T) {
    this.cache[key || 'default'] = {
      timestamp: Date.now(),
      value,
    };
  }

  clear() {
    this.cache = {};
  }
}
