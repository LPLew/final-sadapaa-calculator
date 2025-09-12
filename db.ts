import { Note, Folder } from './types';

const DB_NAME = 'BigNumberProDB';
const FOLDERS_STORE_NAME = 'folders';
const NOTES_STORE_NAME = 'notes';
const DB_VERSION = 2; // Incremented version for schema change

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = request.result;
      
      // Create folders store if it doesn't exist
      if (!dbInstance.objectStoreNames.contains(FOLDERS_STORE_NAME)) {
        dbInstance.createObjectStore(FOLDERS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }

      // Handle notes store creation and indexing
      let notesStore;
      if (dbInstance.objectStoreNames.contains(NOTES_STORE_NAME)) {
        notesStore = (event.target as any).transaction.objectStore(NOTES_STORE_NAME);
      } else {
        notesStore = dbInstance.createObjectStore(NOTES_STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }

      if (!notesStore.indexNames.contains('folderId')) {
        notesStore.createIndex('folderId', 'folderId', { unique: false });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };
  });
};

// --- Folder Functions ---

export const addFolder = (folderData: { name: string }): Promise<Folder> => {
  return new Promise((resolve, reject) => {
    const newFolder: Omit<Folder, 'id'> = {
      name: folderData.name,
      createdAt: new Date(),
    };
    const transaction = db.transaction([FOLDERS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(FOLDERS_STORE_NAME);
    const request = store.add(newFolder);

    request.onsuccess = () => {
      const fullFolder: Folder = { ...newFolder, id: request.result as number };
      resolve(fullFolder);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getAllFolders = (): Promise<Folder[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FOLDERS_STORE_NAME], 'readonly');
    const store = transaction.objectStore(FOLDERS_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const foldersWithDate = request.result.map(f => ({ ...f, createdAt: new Date(f.createdAt) }));
      resolve(foldersWithDate);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const updateFolder = (folder: Folder): Promise<Folder> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FOLDERS_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(FOLDERS_STORE_NAME);
    const request = store.put(folder);

    request.onsuccess = () => {
      resolve(folder);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const deleteFolder = (folderId: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE_NAME, FOLDERS_STORE_NAME], 'readwrite');
    const notesStore = transaction.objectStore(NOTES_STORE_NAME);
    const foldersStore = transaction.objectStore(FOLDERS_STORE_NAME);
    const notesIndex = notesStore.index('folderId');
    const notesRequest = notesIndex.getAll(folderId);

    notesRequest.onsuccess = () => {
      const notesToDelete = notesRequest.result;
      for (const note of notesToDelete) {
        notesStore.delete(note.id);
      }

      const folderDeleteRequest = foldersStore.delete(folderId);
      folderDeleteRequest.onerror = () => {
        reject(folderDeleteRequest.error);
      };
    };

    notesRequest.onerror = () => {
      reject(notesRequest.error);
    };

    transaction.oncomplete = () => {
      resolve(true);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};

// --- Note Functions ---

export const addNote = (noteData: { folderId: number, photo: Blob | null, text: string }): Promise<Note> => {
  return new Promise((resolve, reject) => {
    const newNote: Omit<Note, 'id'> = {
      ...noteData,
      createdAt: new Date(),
    };
    const transaction = db.transaction([NOTES_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE_NAME);
    const request = store.add(newNote);

    request.onsuccess = () => {
      const fullNote: Note = { ...newNote, id: request.result as number };
      resolve(fullNote);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getNotesByFolder = (folderId: number): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE_NAME], 'readonly');
    const store = transaction.objectStore(NOTES_STORE_NAME);
    const index = store.index('folderId');
    const request = index.getAll(folderId);

    request.onsuccess = () => {
      const notesWithDate = request.result.map(n => ({ ...n, createdAt: new Date(n.createdAt) }));
      const sortedNotes = notesWithDate.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      resolve(sortedNotes);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getAllNotes = (): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE_NAME], 'readonly');
    const store = transaction.objectStore(NOTES_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const notesWithDate = request.result.map(n => ({ ...n, createdAt: new Date(n.createdAt) }));
      resolve(notesWithDate);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getNote = (id: number): Promise<Note | undefined> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([NOTES_STORE_NAME], 'readonly');
        const store = transaction.objectStore(NOTES_STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
};


export const updateNote = (note: Note): Promise<Note> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE_NAME);
    const request = store.put(note);

    request.onsuccess = () => {
      resolve(note);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const deleteNote = (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(false);
    };
  });
};

export const deleteMultipleNotes = (ids: number[]): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NOTES_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE_NAME);

    for (const id of ids) {
      store.delete(id);
    }

    transaction.oncomplete = () => {
      resolve(true);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};

export const getNoteCountsByFolder = async (): Promise<Record<number, number>> => {
    await initDB();
    const notes = await getAllNotes();
    const counts: Record<number, number> = {};
    for (const note of notes) {
        counts[note.folderId] = (counts[note.folderId] || 0) + 1;
    }
    return counts;
};
