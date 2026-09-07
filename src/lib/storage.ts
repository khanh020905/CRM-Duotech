/**
 * IndexedDB helper for storing file attachments in demo mode
 */

const DB_NAME = 'DuotechCRM_DB';
const DB_VERSION = 1;
const STORE_ATTACHMENTS = 'attachments';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_ATTACHMENTS)) {
        db.createObjectStore(STORE_ATTACHMENTS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAttachmentBlob(id: string, file: File): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ATTACHMENTS, 'readwrite');
      const store = tx.objectStore(STORE_ATTACHMENTS);
      const reader = new FileReader();
      reader.onload = () => {
        const item = {
          id,
          name: file.name,
          type: file.type,
          data: reader.result,
          uploadedAt: new Date().toISOString(),
        };
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve(id);
        putReq.onerror = () => reject(putReq.error);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.warn('Falling back from IndexedDB storage:', error);
    return id;
  }
}

export async function getAttachmentBlob(id: string): Promise<{ name: string; dataUrl: string; type: string } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ATTACHMENTS, 'readonly');
      const store = tx.objectStore(STORE_ATTACHMENTS);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result) {
          resolve({
            name: req.result.name,
            dataUrl: req.result.data,
            type: req.result.type,
          });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to retrieve attachment:', error);
    return null;
  }
}

export async function deleteAttachmentBlob(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ATTACHMENTS, 'readwrite');
      const store = tx.objectStore(STORE_ATTACHMENTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return false;
  }
}
