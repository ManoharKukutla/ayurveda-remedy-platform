import { openDB } from 'idb';

const DB_NAME = 'AyurvedaDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('chats', { keyPath: 'id' });
      db.createObjectStore('appointments', { keyPath: 'id' });
    }
  });
};

export const saveChat = async (chatData) => {
  const db = await initDB();
  return db.put('chats', chatData);
};