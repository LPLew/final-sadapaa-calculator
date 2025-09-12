import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FinancialHistoryEntry } from '../types';

const FINANCIAL_HISTORY_KEY = 'financialCalculatorHistory';

interface FinancialHistoryContextType {
  history: FinancialHistoryEntry[];
  addHistoryEntry: (entry: Omit<FinancialHistoryEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  deleteHistoryEntry: (id: number) => void;
  reuseEntry: (id: number) => void;
  entryToReuse: FinancialHistoryEntry | null;
  consumeEntryToReuse: () => void;
}

const FinancialHistoryContext = createContext<FinancialHistoryContextType | undefined>(undefined);

export const FinancialHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<FinancialHistoryEntry[]>([]);
    const [entryToReuse, setEntryToReuse] = useState<FinancialHistoryEntry | null>(null);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(FINANCIAL_HISTORY_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (e) {
            console.error("Failed to load financial history from localStorage", e);
            setHistory([]);
        }
    }, []);

    const saveHistory = useCallback((newHistory: FinancialHistoryEntry[]) => {
        try {
            localStorage.setItem(FINANCIAL_HISTORY_KEY, JSON.stringify(newHistory));
        } catch (e) {
            console.error("Failed to save financial history to localStorage", e);
        }
    }, []);

    const addHistoryEntry = useCallback((entry: Omit<FinancialHistoryEntry, 'id' | 'timestamp'>) => {
        setHistory(prevHistory => {
            const newEntry: FinancialHistoryEntry = {
                ...entry,
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            };
            const newHistory = [newEntry, ...prevHistory].slice(0, 50); // Keep max 50 entries
            saveHistory(newHistory);
            return newHistory;
        });
    }, [saveHistory]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        saveHistory([]);
    }, [saveHistory]);

    const deleteHistoryEntry = useCallback((id: number) => {
        setHistory(prevHistory => {
            const newHistory = prevHistory.filter(entry => entry.id !== id);
            saveHistory(newHistory);
            return newHistory;
        });
    }, [saveHistory]);

    const reuseEntry = useCallback((id: number) => {
        const entry = history.find(e => e.id === id);
        if (entry) {
            setEntryToReuse(entry);
        }
    }, [history]);
    
    const consumeEntryToReuse = useCallback(() => {
        setEntryToReuse(null);
    }, []);

    const value = { history, addHistoryEntry, clearHistory, deleteHistoryEntry, reuseEntry, entryToReuse, consumeEntryToReuse };

    return (
        <FinancialHistoryContext.Provider value={value}>
            {children}
        </FinancialHistoryContext.Provider>
    );
};

export const useFinancialHistory = () => {
    const context = useContext(FinancialHistoryContext);
    if (context === undefined) {
        throw new Error('useFinancialHistory must be used within a FinancialHistoryProvider');
    }
    return context;
};