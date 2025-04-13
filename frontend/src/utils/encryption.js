const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-secret-key-32bytes-long'; // Must be 32 chars for AES

// Convert string to ArrayBuffer
const _textToBytes = (str) => new TextEncoder().encode(str);

// Generate crypto key from string
const _getKey = async () => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    _textToBytes(ENCRYPTION_KEY),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
  return keyMaterial;
};

export const encryptData = async (data) => {
  try {
    const key = await _getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const encoded = _textToBytes(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    
    // Combine IV + encrypted data for storage
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...result)); // Base64 for storage
  } catch (err) {
    console.error('Encryption error:', err);
    return null;
  }
};

export const decryptData = async (encrypted) => {
  try {
    const key = await _getKey();
    const data = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    
    const iv = data.slice(0, 12); // Extract IV
    const encryptedData = data.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
};