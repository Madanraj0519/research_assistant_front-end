import React, { createContext, useContext, useEffect, useState } from 'react';
import { Note, SummaryHistoryItem } from '../types';

interface StoreContextType {
  notes: Note[];
  history: SummaryHistoryItem[];
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, content: Partial<Note>) => void;
  addHistory: (item: Omit<SummaryHistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  pendingContext?: any;
  clearPendingContext: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('ra_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<SummaryHistoryItem[]>(() => {
    const saved = localStorage.getItem('ra_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [pendingContext, setPendingContext] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('ra_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('ra_history', JSON.stringify(history));
  }, [history]);

  // Load pending context from storage on mount
  useEffect(() => {
    const loadContext = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
          const result = await chrome.storage.local.get(['pendingContext']);
          if (result.pendingContext) {
            setPendingContext(result.pendingContext);
          }
        } catch (error) {
          console.error('Error loading context:', error);
        }
      }
    };

    loadContext();
  }, []);

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...noteData
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const updateNote = (id: string, content: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...content } : n));
  };

  const addHistory = (itemData: Omit<SummaryHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: SummaryHistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...itemData
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const clearPendingContext = async () => {
    setPendingContext(null);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.remove('pendingContext');
    }
  };

  return (
    <StoreContext.Provider value={{ 
      notes, 
      history, 
      addNote, 
      deleteNote, 
      updateNote, 
      addHistory, 
      clearHistory,
      pendingContext,
      clearPendingContext
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};