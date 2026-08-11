import { useState, useEffect } from 'react';
import { syncManager } from '../services/sync';
import type { SyncStatus } from '../types';

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    const unsubscribe = syncManager.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  return {
    status,
    flushSync: () => syncManager.flushQueue(),
    exportJSON: () => syncManager.exportJSON(),
    importJSON: (json: string) => syncManager.importJSON(json),
  };
}
