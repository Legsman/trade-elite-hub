
import { useCallback, useState } from "react";

export function usePendingOperations() {
  const [pendingOperations, setPendingOperations] = useState<Record<string, boolean>>({});

  const isPendingForUser = useCallback((userId: string): boolean => {
    return pendingOperations[`user_${userId}`] === true;
  }, [pendingOperations]);

  const startOperation = useCallback((type: string, id: string) => {
    const operationKey = `${type}_${id}`;
    setPendingOperations(prev => ({
      ...prev,
      [operationKey]: true
    }));
    return operationKey;
  }, []);

  const finishOperation = useCallback((operationKey: string) => {
    setPendingOperations(prev => {
      const updated = {...prev};
      delete updated[operationKey];
      return updated;
    });
  }, []);

  return {
    pendingOperations,
    isPendingForUser,
    startOperation,
    finishOperation
  };
}
