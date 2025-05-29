// import { openDB } from 'idb';

// // Storage constants
// export const STORAGE_KEYS = {
//   CHAT_HISTORY: "ayurveda_chat_history",
//   FEEDBACK: "ayurveda_feedback",
//   APPOINTMENTS: "doctorAppointments"
// };

// // Initialize IndexedDB
// const initDB = async () => {
//   return openDB('AyurvedaDB', 2, {
//     upgrade(db, oldVersion) {
//       if (oldVersion < 1) {
//         db.createObjectStore('chats', { keyPath: 'id' });
//         db.createObjectStore('appointments', { keyPath: 'id' });
//       }
//       if (oldVersion < 2) {
//         db.createObjectStore('feedback', { keyPath: 'id' });
//       }
//     }
//   });
// };

// // Core storage functions
// export const saveData = async (key, data, expiryDays = null) => {
//   try {
//     const storageItem = expiryDays 
//       ? { data, expiry: Date.now() + expiryDays * 86400000 } 
//       : data;
    
//     localStorage.setItem(key, JSON.stringify(storageItem));
//     const db = await initDB();
//     await db.put('chats', { id: key, data: storageItem });
//     return true;
//   } catch (error) {
//     console.error("Error saving data:", error);
//     return false;
//   }
// };

// export const loadData = async (key) => {
//   try {
//     const localData = localStorage.getItem(key);
//     if (localData) {
//       const parsed = JSON.parse(localData);
//       if (parsed?.expiry && Date.now() > parsed.expiry) {
//         localStorage.removeItem(key);
//         return null;
//       }
//       return parsed?.data || parsed;
//     }

//     const db = await initDB();
//     const stored = await db.get('chats', key);
//     return stored?.data || null;
//   } catch (error) {
//     console.error("Error loading data:", error);
//     return null;
//   }
// };

// storage.js
import { openDB } from 'idb';

export const DB_NAME = 'AyurvedaDB';
export const DB_VERSION = 3;

export const STORAGE_KEYS = {
  CHAT_HISTORY: "ayurveda_chat_history",
  FEEDBACK: "ayurveda_feedback",
  APPOINTMENTS: "doctorAppointments",
  USER_ID: "ayurveda_user_id"
};

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('chats')) {
        const store = db.createObjectStore('chats', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('appointments')) {
        db.createObjectStore('appointments', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('feedback')) {
        db.createObjectStore('feedback', { keyPath: 'id' });
      }
    }
  });
};

export const saveChat = async (userId, chatData, sessionId = null) => {
  try {
    const db = await initDB();
    const id = sessionId || Date.now();
    await db.put('chats', {
      id,
      userId,
      data: chatData,
      createdAt: new Date().toISOString()
    });
    return id;
  } catch (error) {
    console.error("Error saving chat:", error);
    return null;
  }
};

export const loadUserChats = async (userId) => {
  try {
    const db = await initDB();
    const allChats = await db.getAll('chats');
    return allChats
      .filter(chat => chat.userId === userId)
      .map(chat => ({
        sessionId: chat.id,
        preview: chat.data.preview,
        createdAt: chat.data.createdAt || chat.createdAt,
        messages: chat.data.chats || []
      }));
  } catch (error) {
    console.error("Error loading chats:", error);
    return [];
  }
};

export const deleteChat = async (sessionId) => {
  try {
    const db = await initDB();
    await db.delete('chats', sessionId);
    return true;
  } catch (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
};
