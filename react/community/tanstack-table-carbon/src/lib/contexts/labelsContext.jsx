import { createContext, useContext, useMemo } from 'react';
import { DEFAULT_LABELS } from '../constants/defaultLabels.js';

const LabelsContext = createContext(DEFAULT_LABELS);

export const LabelsProvider = ({ children, labels = {} }) => {
  const mergedLabels = useMemo(() => {
    return { ...DEFAULT_LABELS, ...labels };
  }, [labels]);

  return <LabelsContext.Provider value={mergedLabels}>{children}</LabelsContext.Provider>;
};

export const useLabels = () => {
  const context = useContext(LabelsContext);
  if (!context) {
    throw new Error('useLabels must be used within a LabelsProvider');
  }
  return context;
};
