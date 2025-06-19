// User-specific localStorage service
export class UserStorage {
  constructor(userId) {
    this.userId = userId;
  }

  // Get user-specific key
  getUserKey(key) {
    return `${this.userId}_${key}`;
  }

  // Get data from localStorage
  get(key) {
    try {
      const data = localStorage.getItem(this.getUserKey(key));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  // Set data in localStorage
  set(key, value) {
    try {
      localStorage.setItem(this.getUserKey(key), JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  }

  // Remove data from localStorage
  remove(key) {
    try {
      localStorage.removeItem(this.getUserKey(key));
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  // Get all keys for this user
  getAllKeys() {
    const userPrefix = `${this.userId}_`;
    const keys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(userPrefix)) {
        keys.push(key.substring(userPrefix.length));
      }
    }
    
    return keys;
  }

  // Clear all data for this user
  clearAll() {
    const userPrefix = `${this.userId}_`;
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(userPrefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  // Schema-specific methods
  getSchemas() {
    return this.get('schemas') || [];
  }

  setSchemas(schemas) {
    return this.set('schemas', schemas);
  }

  // Query history-specific methods
  getQueryHistory() {
    return this.get('queryHistory') || [];
  }

  setQueryHistory(history) {
    return this.set('queryHistory', history);
  }

  addToQueryHistory(entry) {
    const history = this.getQueryHistory();
    const newHistory = [entry, ...history];
    return this.setQueryHistory(newHistory);
  }
}

// Create a storage instance for a user
export function createUserStorage(userId) {
  if (!userId) {
    throw new Error('User ID is required for storage');
  }
  return new UserStorage(userId);
}
