/**
 * IndexedDB & In-Memory helper for storing and retrieving file attachments
 */

const DB_NAME = 'DuotechCRM_DB';
const DB_VERSION = 2;
const STORE_ATTACHMENTS = 'attachments';

// In-memory fallback cache to ensure zero-failure file uploads and instant retrieval
const memoryBlobCache = new Map<string, { name: string; dataUrl: string; type: string }>();

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

/**
 * Reads a file into a base64 DataURL
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Không thể đọc file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Saves attachment file into memory cache and IndexedDB without TransactionInactiveError
 */
export async function saveAttachmentBlob(id: string, file: File): Promise<{ id: string; dataUrl: string }> {
  // 1. Read file to dataUrl first before touching IndexedDB transaction
  const dataUrl = await readFileAsDataUrl(file);

  // 2. Cache in memory immediately for instantaneous access
  const record = {
    name: file.name,
    dataUrl,
    type: file.type || 'application/octet-stream',
  };
  memoryBlobCache.set(id, record);

  // 3. Persist to IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ATTACHMENTS, 'readwrite');
      const store = tx.objectStore(STORE_ATTACHMENTS);
      const item = {
        id,
        name: file.name,
        type: file.type || 'application/octet-stream',
        data: dataUrl,
        uploadedAt: new Date().toISOString(),
      };
      const putReq = store.put(item);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Falling back to in-memory attachment storage:', err);
  }

  return { id, dataUrl };
}

/**
 * Retrieves attachment blob dataUrl from memory cache or IndexedDB
 */
export async function getAttachmentBlob(id: string): Promise<{ name: string; dataUrl: string; type: string } | null> {
  // Check memory cache first
  if (memoryBlobCache.has(id)) {
    return memoryBlobCache.get(id)!;
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ATTACHMENTS, 'readonly');
      const store = tx.objectStore(STORE_ATTACHMENTS);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          const res = {
            name: req.result.name,
            dataUrl: req.result.data,
            type: req.result.type,
          };
          memoryBlobCache.set(id, res);
          resolve(res);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn('Failed to retrieve attachment:', error);
    return memoryBlobCache.get(id) || null;
  }
}

/**
 * Deletes attachment from memory and IndexedDB
 */
export async function deleteAttachmentBlob(id: string): Promise<boolean> {
  memoryBlobCache.delete(id);
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

/**
 * Triggers native browser download for a DataURL or blob
 */
export function triggerFileDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Generates a valid downloadable document blob for demo/mock files that have no stored blob
 */
export function generateSampleDocumentBlob(filename: string, description?: string): Blob {
  const isPdf = filename.toLowerCase().endsWith('.pdf');
  const isDoc = filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx');
  const content = `%PDF-1.4
%DUOTECH-CRM-CONTRACT-DOCUMENT
1 0 obj
<<
  /Title (${filename})
  /Creator (Duotech CRM Contract Manager)
  /Producer (Duotech CRM)
  /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)})
>>
endobj
2 0 obj
<<
  /Type /Catalog
  /Pages 3 0 R
>>
endobj
3 0 obj
<<
  /Type /Pages
  /Kids [4 0 R]
  /Count 1
>>
endobj
4 0 obj
<<
  /Type /Page
  /Parent 3 0 R
  /MediaBox [0 0 595 842]
  /Contents 5 0 R
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
      >>
    >>
  >>
>>
endobj
5 0 obj
<< /Length 170 >>
stream
BT
/F1 18 Tf
50 780 Td
(DUOTECH CRM - HOP DONG KINH DOANH) Tj
/F1 12 Tf
0 -30 Td
(Tai lieu: ${filename}) Tj
0 -20 Td
(${description || 'Hop dong ban giao dich vu & phu luc bao tri'}) Tj
0 -20 Td
(Ngay xuat tai lieu: ${new Date().toLocaleDateString('vi-VN')}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000050 00000 n 
0000000190 00000 n 
0000000240 00000 n 
0000000300 00000 n 
0000000490 00000 n 
trailer
<<
  /Size 6
  /Root 2 0 R
  /Info 1 0 R
>>
startxref
720
%%EOF`;

  if (isPdf) {
    return new Blob([content], { type: 'application/pdf' });
  } else if (isDoc) {
    return new Blob(
      [
        `DUOTECH CRM - TÀI LIỆU HỢP ĐỒNG\n\nTên tệp: ${filename}\nMô tả: ${description || 'Tài liệu hợp đồng hệ thống'}\nThời gian: ${new Date().toLocaleString('vi-VN')}\n`
      ],
      { type: 'application/msword;charset=utf-8' }
    );
  } else {
    return new Blob(
      [
        `DUOTECH CRM - TỆP ĐÍNH KÈM HỢP ĐỒNG\n\nTên tệp: ${filename}\nThời gian tải: ${new Date().toLocaleString('vi-VN')}\n`
      ],
      { type: 'text/plain;charset=utf-8' }
    );
  }
}
