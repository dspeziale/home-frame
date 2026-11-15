import { JobPhoto, PhotoCategory, MediaType } from '../types';

const DB_NAME = 'immophoto_db';
const DB_VERSION = 2;
const STORE_NAME = 'job_photos';

// In-memory fallback if IndexedDB is unavailable
const memoryPhotoStore: Record<string, JobPhoto[]> = {};

// Inizializza IndexedDB con fallback sicuro
function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('jobId', 'jobId', { unique: false });
            store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
          }
        } catch (e) {
          console.warn('Errore upgrade IndexedDB:', e);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('Impossibile aprire IndexedDB, fallback su memoria/storage:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('Eccezione apertura IndexedDB:', err);
      resolve(null);
    }
  });
}

// Salva una o più foto o video
export async function saveJobPhotos(
  jobId: string, 
  files: { 
    name: string; 
    size: number; 
    type: string; 
    dataUrl: string; 
    mediaType?: MediaType;
    videoUrl?: string;
    duration?: string;
    category?: PhotoCategory 
  }[]
): Promise<JobPhoto[]> {
  const db = await openDB();
  const savedList: JobPhoto[] = [];

  for (const f of files) {
    const isVideo = f.mediaType === 'video' || f.type.startsWith('video/') || (f.name && /\.(mp4|mov|webm|m4v)$/i.test(f.name));
    const photo: JobPhoto = {
      id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      jobId,
      name: f.name,
      size: f.size,
      type: f.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
      mediaType: isVideo ? 'video' : 'photo',
      category: f.category || (isVideo ? 'Video & Reel' : 'Soggiorno'),
      dataUrl: f.dataUrl,
      videoUrl: f.videoUrl,
      duration: f.duration || (isVideo ? '0:45' : undefined),
      uploadedAt: new Date().toISOString()
    };
    savedList.push(photo);
  }

  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const p of savedList) {
        store.put(p);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Fallback salvataggio foto su memoria locale:', e);
    }
  }

  // Backup in memoria
  if (!memoryPhotoStore[jobId]) memoryPhotoStore[jobId] = [];
  memoryPhotoStore[jobId].push(...savedList);

  return savedList;
}

// Recupera tutti i file multimediali di un lavoro (foto e video)
export async function getPhotosForJob(jobId: string): Promise<JobPhoto[]> {
  try {
    const db = await openDB();
    let dbPhotos: JobPhoto[] = [];

    if (db) {
      dbPhotos = await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const index = store.index('jobId');
          const request = index.getAll(jobId);

          request.onsuccess = () => resolve((request.result as JobPhoto[]) || []);
          request.onerror = () => resolve([]);
        } catch {
          resolve([]);
        }
      });
    }

    const memPhotos = memoryPhotoStore[jobId] || [];
    const combined = [...dbPhotos];
    for (const mp of memPhotos) {
      if (!combined.some(p => p.id === mp.id)) {
        combined.push(mp);
      }
    }

    // Se non ci sono ancora foto caricate, carica il set demo realistico specifico per questo immobile
    if (combined.length === 0) {
      const seedPhotos = getDemoPhotosForJob(jobId);
      return seedPhotos;
    }

    return combined;
  } catch (err) {
    console.error('Errore recupero foto lavoro:', err);
    return getDemoPhotosForJob(jobId);
  }
}

// Elimina una foto o video
export async function deleteJobPhoto(id: string): Promise<void> {
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    }

    // Rimuovi da store in memoria
    for (const key of Object.keys(memoryPhotoStore)) {
      memoryPhotoStore[key] = memoryPhotoStore[key].filter(p => p.id !== id);
    }
  } catch (err) {
    console.error('Errore eliminazione foto:', err);
  }
}

// Aggiorna dettagli foto/video
export async function updatePhoto(id: string, updates: Partial<JobPhoto>): Promise<void> {
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        if (getReq.result) {
          const updated = { ...getReq.result, ...updates };
          store.put(updated);
        }
      };

      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    }

    for (const key of Object.keys(memoryPhotoStore)) {
      memoryPhotoStore[key] = memoryPhotoStore[key].map(p => p.id === id ? { ...p, ...updates } : p);
    }
  } catch (err) {
    console.error('Errore aggiornamento foto:', err);
  }
}

// Converte un file in data URL
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Foto e Video professionali preconfigurati per gli immobili demo
function getDemoPhotosForJob(jobId: string): JobPhoto[] {
  if (jobId === 'job-1') {
    return [
      {
        id: 'demo-1-1',
        jobId,
        name: 'attico-spiga-salone-duomo.jpg',
        size: 3240000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Copertina',
        isCover: true,
        dataUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-14T10:00:00Z'
      },
      {
        id: 'demo-1-video',
        jobId,
        name: 'attico-spiga-video-reel-tour.mp4',
        size: 16500000,
        type: 'video/mp4',
        mediaType: 'video',
        category: 'Video & Reel',
        dataUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39726-large.mp4',
        videoUrl: 'https://drive.google.com/drive/folders/demo-spiga22',
        duration: '0:48',
        uploadedAt: '2026-11-14T10:02:00Z'
      },
      {
        id: 'demo-1-2',
        jobId,
        name: 'attico-spiga-cucina-marmo.jpg',
        size: 2850000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Cucina',
        dataUrl: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-14T10:05:00Z'
      },
      {
        id: 'demo-1-3',
        jobId,
        name: 'attico-spiga-terrazzo-panoramico.jpg',
        size: 4120000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Terrazzo / Vista',
        dataUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-14T10:10:00Z'
      },
      {
        id: 'demo-1-4',
        jobId,
        name: 'attico-spiga-camera-master.jpg',
        size: 2980000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Camera',
        dataUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-14T10:15:00Z'
      }
    ];
  } else if (jobId === 'job-2') {
    return [
      {
        id: 'demo-2-1',
        jobId,
        name: 'quadronno-living-design.jpg',
        size: 3100000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Copertina',
        isCover: true,
        dataUrl: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-14T14:00:00Z'
      },
      {
        id: 'demo-2-2',
        jobId,
        name: 'quadronno-cucina-abitabile.jpg',
        size: 2900000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Cucina',
        dataUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-14T14:05:00Z'
      },
      {
        id: 'demo-2-3',
        jobId,
        name: 'quadronno-camera-matrimoniale.jpg',
        size: 2750000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Camera',
        dataUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-14T14:10:00Z'
      }
    ];
  } else if (jobId === 'job-3') {
    return [
      {
        id: 'demo-3-1',
        jobId,
        name: 'villa-como-facciata-lago.jpg',
        size: 4500000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Copertina',
        isCover: true,
        dataUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-13T16:00:00Z'
      },
      {
        id: 'demo-3-video',
        jobId,
        name: 'villa-como-drone-cinematic-4k.mp4',
        size: 24000000,
        type: 'video/mp4',
        mediaType: 'video',
        category: 'Drone',
        dataUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-luxury-pool-and-house-41223-large.mp4',
        duration: '1:15',
        uploadedAt: '2026-11-13T16:02:00Z'
      },
      {
        id: 'demo-3-2',
        jobId,
        name: 'villa-como-piscina-sfioro.jpg',
        size: 3800000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Esterni',
        dataUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-13T16:05:00Z'
      }
    ];
  } else if (jobId === 'job-past-1' || jobId === 'job-4') {
    return [
      {
        id: 'demo-p1-1',
        jobId,
        name: 'bosco-verticale-living.jpg',
        size: 3450000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Copertina',
        isCover: true,
        dataUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-13T15:00:00Z'
      },
      {
        id: 'demo-p1-video',
        jobId,
        name: 'bosco-verticale-tour-interattivo.mp4',
        size: 15200000,
        type: 'video/mp4',
        mediaType: 'video',
        category: 'Video & Reel',
        dataUrl: 'https://assets.mixkit.co/videos/preview/mixkit-living-room-with-a-modern-interior-and-furniture-41484-large.mp4',
        duration: '0:35',
        uploadedAt: '2026-11-13T15:05:00Z'
      },
      {
        id: 'demo-p1-2',
        jobId,
        name: 'bosco-verticale-terrazzo-verde.jpg',
        size: 3890000,
        type: 'image/jpeg',
        mediaType: 'photo',
        category: 'Esterni',
        dataUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: '2026-11-13T15:10:00Z'
      }
    ];
  }

  // Set di default per qualsiasi nuovo lavoro creato
  return [
    {
      id: `default-${jobId}-1`,
      jobId,
      name: 'scatto-panoramico-principale.jpg',
      size: 3100000,
      type: 'image/jpeg',
      mediaType: 'photo',
      category: 'Copertina',
      isCover: true,
      dataUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      uploadedAt: new Date().toISOString()
    },
    {
      id: `default-${jobId}-video`,
      jobId,
      name: 'video-presentazione-immobile.mp4',
      size: 14000000,
      type: 'video/mp4',
      mediaType: 'video',
      category: 'Video & Reel',
      dataUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-39726-large.mp4',
      duration: '0:45',
      uploadedAt: new Date().toISOString()
    }
  ];
}
