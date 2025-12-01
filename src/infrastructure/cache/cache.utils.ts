export function formatKey(key: string, prefix: string, namespace?: string): string {
  const parts = [prefix];
  if (namespace) parts.push(namespace);
  parts.push(key);
  return parts.join(':');
}

export function validateKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new Error('Cache key must be a non-empty string');
  }

  if (key.includes(' ')) {
    throw new Error('Cache key cannot contain spaces');
  }

  if (key.length > 250) {
    throw new Error('Cache key cannot be longer than 250 characters');
  }
}
