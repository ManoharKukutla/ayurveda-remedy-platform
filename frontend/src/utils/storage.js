import { openDB } from 'idb';

// Storage constants
export const STORAGE_KEYS = {
  CHAT_HISTORY: "ayurveda_chat_history",
  FEEDBACK: "ayurveda_feedback",
  APPOINTMENTS: "doctorAppointments"
};

// Initialize IndexedDB
const initDB = async () => {
  return openDB('AyurvedaDB', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('chats', { keyPath: 'id' });
        db.createObjectStore('appointments', { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        db.createObjectStore('feedback', { keyPath: 'id' });
      }
    }
  });
};

// Core storage functions
export const saveData = async (key, data, expiryDays = null) => {
  try {
    const storageItem = expiryDays 
      ? { data, expiry: Date.now() + expiryDays * 86400000 } 
      : data;
    
    localStorage.setItem(key, JSON.stringify(storageItem));
    const db = await initDB();
    await db.put('chats', { id: key, data: storageItem });
    return true;
  } catch (error) {
    console.error("Error saving data:", error);
    return false;
  }
};

export const loadData = async (key) => {
  try {
    const localData = localStorage.getItem(key);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (parsed?.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed?.data || parsed;
    }

    const db = await initDB();
    const stored = await db.get('chats', key);
    return stored?.data || null;
  } catch (error) {
    console.error("Error loading data:", error);
    return null;
  }
};

// Appointment functions
export const saveAppointment = async (appointmentData) => {
  try {
    const db = await initDB();
    await db.put('appointments', {
      id: appointmentData.id || Date.now(),
      ...appointmentData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error saving appointment:", error);
    return saveData(STORAGE_KEYS.APPOINTMENTS, appointmentData);
  }
};

export const loadAppointments = async () => {
  try {
    const db = await initDB();
    const dbAppointments = await db.getAll('appointments');
    if (dbAppointments.length > 0) return dbAppointments;
    
    const localAppointments = await loadData(STORAGE_KEYS.APPOINTMENTS);
    return localAppointments || [];
  } catch (error) {
    console.error("Error loading appointments:", error);
    return [];
  }
};

export const getAppointmentById = async (id) => {
  const appointments = await loadAppointments();
  return appointments.find(app => app.id === Number(id));
};

export const updateAppointmentStatus = async (id, status) => {
  const appointments = await loadAppointments();
  const updated = appointments.map(app => 
    app.id === Number(id) ? { ...app, status } : app
  );
  await saveData(STORAGE_KEYS.APPOINTMENTS, updated);
  return true;
};

// Response handling functions
export const handleDoctorResponse = async (appointmentId, status) => {
  try {
    // 1. Update status in storage
    await updateAppointmentStatus(appointmentId, status);
    
    // 2. Get updated appointment
    const appointment = await getAppointmentById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');
    
    // 3. Return data for email sending
    return {
      patient_email: appointment.email,
      patient_name: appointment.name,
      status,
      doctor_name: appointment.doctorName,
      date: appointment.date,
      time: appointment.time
    };
  } catch (error) {
    console.error("Error handling doctor response:", error);
    throw error;
  }
};

// Other utility functions
export const clearData = async (key) => {
  try {
    localStorage.removeItem(key);
    const db = await initDB();
    await db.delete('chats', key);
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    return false;
  }
};