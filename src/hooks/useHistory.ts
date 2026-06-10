/**
 * useHistory.ts
 * Migrasi dari AsyncStorage ke Firebase Firestore
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection, addDoc, getDocs, deleteDoc,
  query, where, orderBy, limit,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface HistoryItem {
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleColor: string;
  type: 'lesson' | 'quiz' | 'video';
  score?: number;
  total?: number;
  passed?: boolean;
  timestamp: number;
  userId: string;
}

const HISTORY_COL = 'history';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const getCurrentUserId = () => auth.currentUser?.uid || 'anonymous';

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getCurrentUserId();
      const q = query(
        collection(db, HISTORY_COL),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({
        ...d.data(), id: d.id,
        timestamp: d.data().timestamp instanceof Timestamp
          ? d.data().timestamp.toMillis()
          : d.data().timestamp || Date.now(),
      } as HistoryItem));
      setHistory(items);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addHistory = useCallback(async (
    item: Omit<HistoryItem, 'id' | 'timestamp' | 'userId'>
  ) => {
    try {
      const userId = getCurrentUserId();
      const newItem = { ...item, userId, timestamp: Date.now() };
      const ref = await addDoc(collection(db, HISTORY_COL), newItem);
      
      setHistory(prev => [{
        ...newItem, id: ref.id,
      }, ...prev].slice(0, 50));
    } catch (error) {
      console.error('Error adding history:', error);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      const q = query(collection(db, HISTORY_COL), where('userId', '==', userId));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, []);

  return { history, loading, addHistory, clearHistory, loadHistory };
}