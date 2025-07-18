import { useCallback, useState } from 'react';

export type UseSetStateReturn<T> = {
  state: T;
  setState: (newState: Partial<T>) => void;
  resetState: () => void;
};

export function useSetState<T>(initialState: T): UseSetStateReturn<T> {
  const [state, setState] = useState<T>(initialState);

  const updateState = useCallback((newState: Partial<T>) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return {
    state,
    setState: updateState,
    resetState,
  };
}
