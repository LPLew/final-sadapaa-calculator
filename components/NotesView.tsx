
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Note, Folder, GalleryPhoto } from '../types';
import * as db from '../db';
import { ArrowLeft, Trash2, X, Loader2, Folder as FolderIcon, Pencil, Search, FolderPlus, FilePenLine, ArrowDownUp, BookPlus, Circle, CheckCircle, Images, ChevronLeft, ChevronRight, Notebook, Calculator } from 'lucide-react';

const ALL_NOTES_FOLDER_ID = -1;

// --- Helper: Get Note Title ---
const getNoteTitle = (text: string) => text.split('\n').find(line => line.trim() !== '') || 'Untitled Note';

// --- Confirmation Modal ---
const ConfirmationModal: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-700 rounded-lg p-6 w-full max-w-sm space-y-4 shadow-lg border border-slate-600">
        <h2 className="text-xl font-semibold text-yellow-300">{title}</h2>
        <p className="text-slate-300">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-500 text-white rounded-md font-semibold hover:bg-slate-400 active:scale-95 transition-transform">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-500 active:scale-95 transition-transform">Confirm Delete</button>
        </div>
      </div>
    </div>
);

// --- Image Viewer Modal ---
const ImageViewer: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fadeIn p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors active:scale-95"
        aria-label="Close image view"
      >
        <X size={24} />
      </button>
      <img
        src={imageUrl}
        className="max-w-full max-h-full object-contain"
        alt="Full screen note view"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// --- Note Card Component ---
const NoteCard: React.FC<{
  note: Note;
  onSelect: (id: number) => void;
  onDeselect: (id: number) => void;
  onView: (note: Note) => void;
  onViewImage: (imageUrl: string) => void;
  isSelected: boolean;
  isEditMode: boolean;
}> = ({ note, onSelect, onDeselect, onView, onViewImage, isSelected, isEditMode }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    if (note.photo) {
      url = URL.createObjectURL(note.photo);
      setImageUrl(url);
    }
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [note.photo]);

  const handleCardClick = () => {
    if (isEditMode) {
      if (isSelected) {
        onDeselect(note.id);
      } else {
        onSelect(note.id);
      }
    } else {
      onView(note);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isEditMode && imageUrl) {
      e.stopPropagation(); // Prevent card click from firing
      onViewImage(imageUrl);
    } else if (isEditMode) {
        handleCardClick(); // Allow selection by clicking image in edit mode
    }
  };

  return (
    <div onClick={handleCardClick} className="bg-slate-800 p-3 rounded-lg flex items-center gap-4 animate-fadeIn transition-transform duration-200 cursor-pointer hover:bg-slate-700 active:scale-95">
      <div className="flex-shrink-0 w-16 h-16 bg-slate-700 rounded-md overflow-hidden" onClick={handleImageClick}>
        {imageUrl ? (
          <img src={imageUrl} alt={getNoteTitle(note.text)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <FilePenLine size={24} />
          </div>
        )}
      </div>
      <div className="flex-grow overflow-hidden">
        <h3 className="text-slate-100 font-semibold truncate text-lg">{getNoteTitle(note.text)}</h3>
        <p className="text-sm text-slate-400 mt-1">{new Date(note.createdAt).toLocaleDateString()}</p>
      </div>
      {isEditMode && (
         <div className="flex-shrink-0 cursor-pointer ml-auto pl-3" onClick={handleCardClick} aria-label={isSelected ? `Deselect note: ${getNoteTitle(note.text)}` : `Select note: ${getNoteTitle(note.text)}`}>
              {isSelected ? (
                  <CheckCircle size={22} className="text-sky-400" />
              ) : (
                  <Circle size={22} className="text-slate-500" />
              )}
          </div>
        )}
    </div>
  );
};

// --- Create/Edit Note Modal ---
const NoteEditor: React.FC<{
  noteToEdit: Note | null;
  folderId: number;
  onSave: (note: Note | Omit<Note, 'id'>) => void;
  onDelete: (noteId: number) => void;
  onClose: () => void;
}> = ({ noteToEdit, folderId, onSave, onDelete, onClose }) => {
  const [text, setText] = useState(noteToEdit?.text || '');
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(noteToEdit?.photo || null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    if (photoBlob) {
      url = URL.createObjectURL(photoBlob);
      setPhotoPreview(url);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [photoBlob]);

  const handleSave = () => {
    if (text.trim() === '') return;
    const noteData = {
      ...noteToEdit,
      text,
      photo: photoBlob,
      folderId: noteToEdit?.folderId ?? folderId,
      createdAt: noteToEdit?.createdAt ?? new Date(),
    };
    onSave(noteData as Note | Omit<Note, 'id'>);
  };
  
  const handleDelete = () => {
    if(noteToEdit && noteToEdit.id) {
        // Confirmation is now handled by the parent component (NotesView)
        onDelete(noteToEdit.id);
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoBlob(file);
    }
  };
  
  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900 flex flex-col animate-fadeIn">
        <header className="flex-shrink-0 bg-slate-800 shadow-md p-4 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 text-sky-400 hover:text-sky-300 active:scale-95 transition-transform">
            <ArrowLeft size={20} /> Back
          </button>
          <div className="flex items-center gap-2">
            {noteToEdit && (
                 <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-300 active:scale-95 transition-transform">
                    <Trash2 size={20} />
                </button>
            )}
            <button onClick={handleSave} disabled={text.trim() === ''} className="px-4 py-2 bg-sky-600 text-white rounded-md font-semibold disabled:bg-slate-500 disabled:cursor-not-allowed hover:bg-sky-500 active:scale-95 transition-transform">
              Save
            </button>
          </div>
        </header>
        <main className="flex-grow p-4 flex flex-col gap-4 overflow-y-auto">
          {photoPreview && (
             <div className="relative group cursor-pointer transition-transform duration-200 hover:scale-105" onClick={() => setImageViewerOpen(true)}>
                <img src={photoPreview} alt="Note preview" className="w-full h-48 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">View Image</div>
            </div>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 active:scale-95 transition-transform">
            {photoPreview ? 'Change Image' : 'Add Image'}
          </button>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start writing your note here..."
            className="w-full flex-grow p-3 bg-slate-800 border border-slate-700 text-white rounded-md focus:ring-sky-500 focus:border-sky-500 text-lg"
          />
        </main>
      </div>
      {isImageViewerOpen && photoPreview && <ImageViewer imageUrl={photoPreview} onClose={() => setImageViewerOpen(false)} />}
    </>
  );
};

// --- Folder Modal ---
const FolderModal: React.FC<{
  folder?: Folder;
  onSave: (name: string, id?: number) => void;
  onCancel: () => void;
}> = ({ folder, onSave, onCancel }) => {
  const [name, setName] = useState(folder?.name || '');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), folder?.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-700 rounded-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-xl font-semibold text-white">{folder ? 'Rename Folder' : 'New Folder'}</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name"
          className="w-full p-2 bg-slate-600 border border-slate-500 text-white rounded-md focus:ring-sky-500 focus:border-sky-500"
          autoFocus
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-500 text-white rounded-md font-semibold hover:bg-slate-400 active:scale-95 transition-transform">Cancel</button>
          <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 bg-sky-600 text-white rounded-md font-semibold disabled:bg-slate-500 hover:bg-sky-500 active:scale-95 transition-transform">Save</button>
        </div>
      </div>
    </div>
  );
};

// --- Gallery Viewer ---
const GalleryViewer: React.FC<{
    photos: GalleryPhoto[];
    startIndex: number;
    onClose: () => void;
    onGoToNote: (noteId: number) => void;
}> = ({ photos, startIndex, onClose, onGoToNote }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, [photos.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }, [photos.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, onClose]);
    
    const currentPhoto = photos[currentIndex];

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-fadeIn p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition-colors z-10 active:scale-95"
                aria-label="Close image viewer"
            >
                <X size={24} />
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Image */}
                <div className="w-full h-full flex items-center justify-center">
                     <img src={currentPhoto.imageUrl} className="max-w-full max-h-full object-contain" alt={getNoteTitle(currentPhoto.noteText)} />
                </div>
               
                {/* Prev Button */}
                <button
                    onClick={handlePrev}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full hover:bg-black/60 transition-colors active:scale-95"
                    aria-label="Previous image"
                >
                    <ChevronLeft size={28} />
                </button>
                {/* Next Button */}
                 <button
                    onClick={handleNext}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full hover:bg-black/60 transition-colors active:scale-95"
                    aria-label="Next image"
                >
                    <ChevronRight size={28} />
                </button>
            </div>

            {/* Bottom Toolbar */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-3 rounded-xl flex items-center justify-between text-white backdrop-blur-sm">
                <button onClick={() => onGoToNote(currentPhoto.noteId)} className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 rounded-md hover:bg-sky-500 transition-colors text-sm active:scale-95">
                    <Notebook size={16}/>
                    Go to Note
                </button>
                <div className="text-sm text-slate-300 font-mono">
                    {currentIndex + 1} / {photos.length}
                </div>
            </div>
        </div>
    );
};

// --- Photo Gallery Grid ---
const PhotoGalleryGrid: React.FC<{
    onBack: () => void;
    onPhotoClick: (index: number) => void;
}> = ({ onBack, onPhotoClick }) => {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isCancelled = false;
        const loadPhotos = async () => {
            setIsLoading(true);
            try {
                const allNotes = await db.getAllNotes();
                const notesWithPhotos = allNotes.filter(n => n.photo);
                if (!isCancelled) {
                    const galleryPhotos = notesWithPhotos.map(note => ({
                        noteId: note.id,
                        photo: note.photo!,
                        imageUrl: URL.createObjectURL(note.photo!),
                        noteText: note.text
                    }));
                    setPhotos(galleryPhotos);
                }
            } catch (error) {
                console.error("Failed to load gallery photos:", error);
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        loadPhotos();

        return () => {
            isCancelled = true;
            photos.forEach(p => URL.revokeObjectURL(p.imageUrl));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <header className="flex-shrink-0 bg-slate-800 shadow-md p-4 flex items-center justify-between z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-sky-400 hover:text-sky-300 active:scale-95 transition-transform">
                    <ArrowLeft size={20} /> Folders
                </button>
                <h1 className="text-xl font-semibold text-cyan-300">Photo Gallery</h1>
                <div className="w-20"></div> {/* Spacer for balance */}
            </header>
            <main className="flex-grow p-4 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin text-slate-400" size={48} />
                    </div>
                ) : photos.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {photos.map((photo, index) => (
                            <button key={photo.noteId} onClick={() => onPhotoClick(index)} className="aspect-square bg-slate-700 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-sky-500 active:scale-95 transition-transform">
                                <img
                                    src={photo.imageUrl}
                                    alt={`Note ${photo.noteId}`}
                                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-slate-400 italic mt-8 p-4">
                        <Images size={48} className="mx-auto mb-4" />
                        <p>No photos found in your notes.</p>
                        <p className="text-sm mt-1">Add images to your notes to see them here.</p>
                    </div>
                )}
            </main>
        </>
    );
};


// --- Main Notes View Component ---
interface NotesViewProps {
  onNavigate: (view: 'calculator') => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onNavigate }) => {
  type View = 'folders' | 'notes' | 'editor' | 'gallery';
  type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

  const [view, setView] = useState<View>('folders');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteCounts, setNoteCounts] = useState<Record<number, number>>({});
  const [currentFolder, setCurrentFolder] = useState<Folder | { id: number, name: string } | null>(null);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFolderEditMode, setIsFolderEditMode] = useState(false);
  const [isNoteEditMode, setIsNoteEditMode] = useState(false);
  
  const [folderSearchTerm, setFolderSearchTerm] = useState('');
  const [noteSearchTerm, setNoteSearchTerm] = useState('');

  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<number>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const [modal, setModal] = useState<'createFolder' | 'renameFolder' | null>(null);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [imageViewerUrl, setImageViewerUrl] = useState<string | null>(null);
  const [galleryViewerIndex, setGalleryViewerIndex] = useState<number | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);


  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await db.initDB();
      let f = await db.getAllFolders();
      // Check for first-time setup
      if (f.length === 0) {
        const notesFolder = await db.addFolder({ name: 'Notes' });
        await db.addFolder({ name: 'Ideas' });
        f = await db.getAllFolders();

        const allNotes = await db.getAllNotes();
        if (allNotes.length === 0 && notesFolder) {
            // Create two separate default notes to guide the user.
            await db.addNote({
                folderId: notesFolder.id,
                photo: null,
                text: "About the 'All Notes' View\n\nThis special view acts as your master list, showing every note you've created, regardless of which folder it's in. This is also the only place where you can sort all your notes by date or title."
            });
            await db.addNote({
                folderId: notesFolder.id,
                photo: null,
                text: "About the 'Notes' Folder\n\nThis is your default folder. Any new note you create from the main folders screen (without creating a new folder for it) will automatically be saved here."
            });
        }
      }
      setFolders(f);
      const counts = await db.getNoteCountsByFolder();
      setNoteCounts(counts);
    } catch (err) {
      console.error(err);
      setError("Could not load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  useEffect(() => {
    if (view === 'gallery') {
      const loadPhotos = async () => {
          try {
              const allNotes = await db.getAllNotes();
              const notesWithPhotos = allNotes.filter(n => n.photo);
              const photos = notesWithPhotos.map(note => ({
                  noteId: note.id,
                  photo: note.photo!,
                  imageUrl: URL.createObjectURL(note.photo!),
                  noteText: note.text
              }));
              setGalleryPhotos(photos);
          } catch (error) {
              console.error("Failed to load gallery photos:", error);
              setError("Could not load photos for gallery.");
          }
      };
      loadPhotos();

      return () => {
          galleryPhotos.forEach(p => URL.revokeObjectURL(p.imageUrl));
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const handleSelectFolder = useCallback(async (folder: Folder | { id: number; name: string }) => {
    setCurrentFolder(folder);
    setIsNoteEditMode(false);
    setSelectedNoteIds(new Set());
    setNoteSearchTerm('');
    setView('notes');
    setIsLoading(true);
    try {
      const notesData = folder.id === ALL_NOTES_FOLDER_ID ? await db.getAllNotes() : await db.getNotesByFolder(folder.id);
      setNotes(notesData);
    } catch(err) {
      setError("Could not load notes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBackToFolders = () => {
    setView('folders');
    setCurrentFolder(null);
    setIsFolderEditMode(false);
  };
  
  // Folder Handlers
  const handleSaveFolder = async (name: string, id?: number) => {
      try {
          if (id) {
              await db.updateFolder({ id, name, createdAt: new Date() });
          } else {
              await db.addFolder({ name });
          }
          await loadData();
          setModal(null);
      } catch (err) {
          setError("Could not save folder.");
      }
  };

  const handleDeleteFolder = (folderId: number) => {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return;
      setConfirmation({
        title: `Delete Folder: "${folder.name}"`,
        message: "Are you sure you want to delete this folder and all its notes? This action cannot be undone.",
        onConfirm: async () => {
            try {
                await db.deleteFolder(folderId);
                await loadData();
            } catch(err) {
                setError("Could not delete folder.");
            }
            setConfirmation(null);
        }
    });
  };
  
  // Note Handlers
  const handleSaveNote = async (noteData: Note | Omit<Note, 'id'>) => {
    try {
      let savedOrUpdatedNote: Note;
      if ('id' in noteData && noteData.id) {
        savedOrUpdatedNote = await db.updateNote(noteData);
      } else {
        savedOrUpdatedNote = await db.addNote(noteData as Omit<Note, 'id'>);
      }
      setNoteToEdit(null);
      
      const allFolders = await db.getAllFolders();
      const counts = await db.getNoteCountsByFolder();
      setFolders(allFolders);
      setNoteCounts(counts);

      const targetFolder = allFolders.find(f => f.id === savedOrUpdatedNote.folderId);
      
      if (targetFolder) {
        handleSelectFolder(targetFolder);
      } else {
        setView('folders'); // Fallback
      }
    } catch (err) {
      setError("Could not save note.");
      console.error("Error saving note:", err);
    }
  };

  const handleDeleteNote = (noteId: number) => {
    const note = notes.find(n => n.id === noteId) || noteToEdit;
    if (!note) return;

    setConfirmation({
        title: "Delete Note",
        message: `Are you sure you want to delete the note "${getNoteTitle(note.text)}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await db.deleteNote(noteId);
                setNoteToEdit(null);
                const counts = await db.getNoteCountsByFolder();
                setNoteCounts(counts);

                if (currentFolder) {
                    handleSelectFolder(currentFolder);
                } else {
                    setView('folders');
                }
            } catch (err) {
                setError("Could not delete note.");
            } finally {
                setConfirmation(null);
            }
        },
    });
  };
  
  const handleCreateNewNote = (folderId: number) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) {
        setError("Cannot create note: folder not found.");
        return;
    }
    setCurrentFolder(folder);
    setNoteToEdit(null);
    setView('editor');
  }

  const handleNewNoteFromFoldersView = () => {
    const notesFolder = folders.find(f => f.name === 'Notes');
    if (notesFolder) {
        handleCreateNewNote(notesFolder.id);
    } else {
        const firstFolder = folders[0];
        if (firstFolder) {
            handleCreateNewNote(firstFolder.id);
        } else {
            setError("No folders available to create a note in.");
        }
    }
  };

  const handleDeleteSelectedNotes = () => {
      if (selectedNoteIds.size === 0) return;
      setConfirmation({
        title: `Delete ${selectedNoteIds.size} Note(s)`,
        message: `Are you sure you want to delete the ${selectedNoteIds.size} selected note(s)? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await db.deleteMultipleNotes(Array.from(selectedNoteIds));
                if (currentFolder) {
                    handleSelectFolder(currentFolder);
                }
                setIsNoteEditMode(false);
                setSelectedNoteIds(new Set());
            } catch (err) {
                setError("Failed to delete notes.");
            }
            setConfirmation(null);
        }
      });
  };

    const filteredFolders = useMemo(() =>
        folders.filter(f => f.name.toLowerCase().includes(folderSearchTerm.toLowerCase())),
        [folders, folderSearchTerm]
    );

    const sortedAndFilteredNotes = useMemo(() => {
        const filtered = notes.filter(n =>
            getNoteTitle(n.text).toLowerCase().includes(noteSearchTerm.toLowerCase()) ||
            n.text.toLowerCase().includes(noteSearchTerm.toLowerCase())
        );

        return filtered.sort((a, b) => {
            switch (sortOption) {
                case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'title-asc': return getNoteTitle(a.text).localeCompare(getNoteTitle(b.text));
                case 'title-desc': return getNoteTitle(b.text).localeCompare(getNoteTitle(a.text));
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });
    }, [notes, noteSearchTerm, sortOption]);

    const allNotesCount = useMemo(() => Object.values(noteCounts).reduce((sum, count) => sum + count, 0), [noteCounts]);

    const renderContent = () => {
        if (isLoading && view !== 'editor') {
            return <div className="flex-grow flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={48} /></div>;
        }

        if (error) {
            return <div className="flex-grow flex items-center justify-center text-red-400 p-4">{error}</div>;
        }

        switch (view) {
            case 'folders':
                return (
                    <>
                        <header className="flex-shrink-0 bg-slate-800 shadow-md p-4 flex items-center justify-between z-10">
                             <button onClick={() => onNavigate('calculator')} className="flex items-center gap-2 text-sky-400 hover:text-sky-300 active:scale-95 transition-transform">
                                <Calculator size={20} /> Calculator
                            </button>
                            <h1 className="text-xl font-semibold text-cyan-300">Notes</h1>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsFolderEditMode(!isFolderEditMode)} className={`p-2 rounded-md transition-colors active:scale-95 ${isFolderEditMode ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                                    <Pencil size={20} />
                                </button>
                                <button onClick={() => setModal('createFolder')} className="p-2 text-slate-400 hover:bg-slate-700 rounded-md active:scale-95 transition-transform">
                                    <FolderPlus size={20} />
                                </button>
                            </div>
                        </header>
                        <main className="flex-grow p-4 overflow-y-auto space-y-4">
                             <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Search folders..." value={folderSearchTerm} onChange={(e) => setFolderSearchTerm(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md pl-10 pr-4 py-2 focus:ring-sky-500 focus:border-sky-500"/>
                            </div>
                            
                            {/* Static Folders */}
                            <div onClick={() => handleSelectFolder({id: ALL_NOTES_FOLDER_ID, name: 'All Notes'})} className="bg-slate-700 p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-slate-600 active:scale-95 transition-transform">
                                <FolderIcon size={24} className="text-sky-400" />
                                <div className="flex-grow">
                                    <h3 className="text-slate-100 font-semibold text-lg">All Notes</h3>
                                    <span className="text-sm text-slate-400">{allNotesCount} notes</span>
                                </div>
                            </div>
                            <div onClick={() => setView('gallery')} className="bg-slate-700 p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-slate-600 active:scale-95 transition-transform">
                                <Images size={24} className="text-green-400" />
                                <div className="flex-grow">
                                    <h3 className="text-slate-100 font-semibold text-lg">Photo Gallery</h3>
                                </div>
                            </div>

                            <hr className="border-slate-700" />

                            {/* Dynamic Folders */}
                            {filteredFolders.map(folder => (
                                <div key={folder.id} onClick={() => !isFolderEditMode && handleSelectFolder(folder)} className={`bg-slate-800 p-4 rounded-lg flex items-center gap-4 ${!isFolderEditMode ? 'cursor-pointer hover:bg-slate-700 active:scale-95 transition-transform' : ''}`}>
                                    <FolderIcon size={24} className="text-sky-400" />
                                    <div className="flex-grow">
                                        <h3 className="text-slate-100 font-semibold text-lg">{folder.name}</h3>
                                        <span className="text-sm text-slate-400">{noteCounts[folder.id] || 0} notes</span>
                                    </div>
                                    {isFolderEditMode && (
                                        <div className="flex gap-2">
                                            <button onClick={() => { setFolderToRename(folder); setModal('renameFolder'); }} className="p-2 text-slate-400 hover:text-white active:scale-95 transition-transform"><Pencil size={18} /></button>
                                            <button onClick={() => handleDeleteFolder(folder.id)} className="p-2 text-red-500 hover:text-red-400 active:scale-95 transition-transform"><Trash2 size={18} /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </main>
                        <footer className="flex-shrink-0 p-4">
                            <button onClick={handleNewNoteFromFoldersView} className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-500 active:scale-95 transition-transform">
                                <BookPlus size={20} /> New Note
                            </button>
                        </footer>
                    </>
                );
            case 'notes':
                if (!currentFolder) return null;
                const isAllNotesView = currentFolder.id === ALL_NOTES_FOLDER_ID;
                return (
                    <>
                        <header className="flex-shrink-0 bg-slate-800 shadow-md p-4 flex items-center justify-between z-10">
                            <button onClick={handleBackToFolders} className="flex items-center gap-2 text-sky-400 hover:text-sky-300 active:scale-95 transition-transform">
                                <ArrowLeft size={20} /> Folders
                            </button>
                            <h1 className="text-xl font-semibold text-cyan-300 truncate px-2">{currentFolder.name}</h1>
                             <button onClick={() => setIsNoteEditMode(!isNoteEditMode)} className={`p-2 rounded-md transition-colors active:scale-95 ${isNoteEditMode ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                                {isNoteEditMode ? <X size={20} /> : <Pencil size={20} />}
                            </button>
                        </header>
                        <main className="flex-grow p-4 overflow-y-auto space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" placeholder="Search notes..." value={noteSearchTerm} onChange={(e) => setNoteSearchTerm(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md pl-10 pr-4 py-2 focus:ring-sky-500 focus:border-sky-500"/>
                                </div>
                                {isAllNotesView && (
                                <select value={sortOption} onChange={e => setSortOption(e.target.value as SortOption)} className="bg-slate-700 border-slate-600 rounded-md px-2 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 active:scale-95 transition-transform">
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="title-asc">Title A-Z</option>
                                    <option value="title-desc">Title Z-A</option>
                                </select>
                                )}
                            </div>
                            
                            {sortedAndFilteredNotes.length > 0 ? (
                                sortedAndFilteredNotes.map(note => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onView={n => { setNoteToEdit(n); setView('editor'); }}
                                        onViewImage={setImageViewerUrl}
                                        onSelect={(id) => setSelectedNoteIds(prev => new Set(prev).add(id))}
                                        onDeselect={(id) => {
                                            const newSet = new Set(selectedNoteIds);
                                            newSet.delete(id);
                                            setSelectedNoteIds(newSet);
                                        }}
                                        isSelected={selectedNoteIds.has(note.id)}
                                        isEditMode={isNoteEditMode}
                                    />
                                ))
                            ) : (
                                <div className="text-center text-slate-400 mt-8 p-4 flex flex-col items-center gap-4 animate-fadeIn">
                                    <FilePenLine size={48} className="mx-auto" />
                                    <p className="text-lg font-semibold">No notes found</p>
                                    {!isAllNotesView ? (
                                        <>
                                            <p className="text-sm text-slate-500 -mt-2">This folder is empty. Why not create one?</p>
                                            <button
                                                onClick={() => handleCreateNewNote(currentFolder.id)}
                                                className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-500 active:scale-95 transition-transform"
                                            >
                                                <BookPlus size={20} /> Create a New Note
                                            </button>
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-500 -mt-2">Create notes inside specific folders.</p>
                                    )}
                                </div>
                            )}
                        </main>
                        <footer className="flex-shrink-0 p-4">
                            {isNoteEditMode ? (
                                <button
                                    onClick={handleDeleteSelectedNotes}
                                    disabled={selectedNoteIds.size === 0}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 disabled:bg-slate-500 disabled:cursor-not-allowed active:scale-95 transition-transform"
                                >
                                    <Trash2 size={20} /> Delete ({selectedNoteIds.size})
                                </button>
                            ) : !isAllNotesView && (
                                <button onClick={() => handleCreateNewNote(currentFolder.id)} className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-500 active:scale-95 transition-transform">
                                    <BookPlus size={20} /> New Note in "{currentFolder.name}"
                                </button>
                            )}
                        </footer>
                    </>
                );
            case 'editor':
                return (
                    <NoteEditor
                        noteToEdit={noteToEdit}
                        folderId={currentFolder?.id ?? 0}
                        onSave={handleSaveNote}
                        onDelete={handleDeleteNote}
                        onClose={() => currentFolder ? handleSelectFolder(currentFolder) : setView('folders')}
                    />
                );
            case 'gallery':
                return (
                    <PhotoGalleryGrid
                        onBack={handleBackToFolders}
                        onPhotoClick={setGalleryViewerIndex}
                    />
                );
        }
    };
    
    return (
        <div className="bg-slate-900 text-white h-full flex flex-col overflow-hidden">
            {renderContent()}
            {modal && (
                <FolderModal
                    folder={modal === 'renameFolder' ? folderToRename! : undefined}
                    onSave={handleSaveFolder}
                    onCancel={() => setModal(null)}
                />
            )}
            {imageViewerUrl && <ImageViewer imageUrl={imageViewerUrl} onClose={() => setImageViewerUrl(null)} />}
            {galleryViewerIndex !== null && galleryPhotos.length > 0 && (
                <GalleryViewer
                    photos={galleryPhotos}
                    startIndex={galleryViewerIndex}
                    onClose={() => setGalleryViewerIndex(null)}
                    onGoToNote={(noteId) => {
                        const note = notes.find(n => n.id === noteId);
                        if (note) {
                            setNoteToEdit(note);
                            setView('editor');
                        }
                        setGalleryViewerIndex(null);
                    }}
                />
            )}
             {confirmation && (
                <ConfirmationModal 
                    title={confirmation.title}
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onCancel={() => setConfirmation(null)}
                />
            )}
        </div>
    );
};