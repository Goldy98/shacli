const tmpStorage = new Map<string, string>();

export function saveToStorage(key: string, value: string) {
  tmpStorage.set(key, value);
}

export function retrieveFromStorage(key: string) {
  return tmpStorage.get(key);
}
