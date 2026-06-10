import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryEntry } from '../types';

const HISTORY_KEY = '@edubidan_history';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load history from storage
  const loadHistory = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed: HistoryEntry[] = JSON.parse(raw);
        // Sort by newest first
        parsed.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(parsed);
      }
    } catch (_) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Add a new history entry
  const addHistory = useCallback(
    async (entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'date'>) => {
      const now = new Date();
      const newEntry: HistoryEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: now.getTime(),
        date: now.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        const existing: HistoryEntry[] = raw ? JSON.parse(raw) : [];
        const updated = [newEntry, ...existing];
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        setHistory(updated);
      } catch (_) {
        // ignore
      }
    },
    []
  );

  // Clear all history
  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      setHistory([]);
    } catch (_) {
      // ignore
    }
  }, []);

  return { history, loading, addHistory, clearHistory, reload: loadHistory };
}
