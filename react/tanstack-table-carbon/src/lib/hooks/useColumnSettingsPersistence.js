/* eslint-disable custom/hooks-first */
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage column settings persistence
 * Automatically handles localStorage for client-side tables
 * Passes through to callbacks for server-side tables
 *
 * @param {Object} config - Configuration object
 * @param {string} config.localStorageKey - Key for localStorage (enables auto-persistence)
 * @param {boolean} config.isServerSideTable - Whether table is in server-side mode
 * @param {Object} config.controlledVisibility - Controlled visibility state (server-side)
 * @param {Array} config.controlledOrder - Controlled order state (server-side)
 * @param {Function} config.onVisibilityChange - Callback for visibility changes (server-side)
 * @param {Function} config.onOrderChange - Callback for order changes (server-side)
 * @returns {Object} Column settings state and setters
 */
export const useColumnSettingsPersistence = ({
  localStorageKey,
  isServerSideTable,
  controlledVisibility,
  controlledOrder,
  onVisibilityChange,
  onOrderChange,
}) => {
  /* Determine persistence strategy
   NOTE: Use localStorage only if: client-side table + localStorageKey provided + no manual handlers
  */
  const useLocalStorage =
    !isServerSideTable && !!localStorageKey && !onVisibilityChange && !onOrderChange;

  const storageKey = useLocalStorage ? `table_${localStorageKey}` : null;

  const getInitialSettings = useCallback(() => {
    if (useLocalStorage && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            visibility: parsed.visibility || {},
            order: parsed.order || [],
          };
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to load column settings from localStorage (${storageKey}):`, error);
      }
    }

    return {
      visibility: controlledVisibility || {},
      order: controlledOrder || [],
    };
  }, [useLocalStorage, storageKey, controlledVisibility, controlledOrder]);

  const [settings, setSettings] = useState(getInitialSettings);

  // NOTE: Update settings when controlled values change (server-side mode)
  useEffect(() => {
    if (!useLocalStorage) {
      setSettings({
        visibility: controlledVisibility || {},
        order: controlledOrder || [],
      });
    }
  }, [controlledVisibility, controlledOrder, useLocalStorage]);

  // NOTE: Save to localStorage when settings change (client-side mode only)
  useEffect(() => {
    if (useLocalStorage && storageKey) {
      try {
        const settingsToSave = {
          visibility: settings.visibility,
          order: settings.order,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(settingsToSave));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to save column settings to localStorage (${storageKey}):`, error);
      }
    }
  }, [settings, useLocalStorage, storageKey]);

  // NOTE: Setter for visibility
  const setVisibility = useCallback(
    (newVisibility) => {
      const visibility =
        typeof newVisibility === 'function' ? newVisibility(settings.visibility) : newVisibility;

      if (useLocalStorage) {
        // NOTE: Client-side: update local state (will auto-save via useEffect)
        setSettings((prev) => ({ ...prev, visibility }));
      } else if (onVisibilityChange) {
        // NOTE: Server-side: call handler (parent manages state)
        onVisibilityChange(visibility);
      } else {
        // NOTE: Uncontrolled mode without localStorage
        setSettings((prev) => ({ ...prev, visibility }));
      }
    },
    [useLocalStorage, onVisibilityChange, settings.visibility]
  );

  const setOrder = useCallback(
    (newOrder) => {
      const order = typeof newOrder === 'function' ? newOrder(settings.order) : newOrder;

      if (useLocalStorage) {
        // NOTE: Client-side: update local state (will auto-save via useEffect)
        setSettings((prev) => ({ ...prev, order }));
      } else if (onOrderChange) {
        // NOTE: Server-side: call handler (parent manages state)
        onOrderChange(order);
      } else {
        // NOTE: Uncontrolled mode without localStorage
        setSettings((prev) => ({ ...prev, order }));
      }
    },
    [useLocalStorage, onOrderChange, settings.order]
  );

  // NOTE: Clear settings from localStorage
  const clearSettings = useCallback(() => {
    if (useLocalStorage && storageKey) {
      try {
        localStorage.removeItem(storageKey);
        setSettings({ visibility: {}, order: [] });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Failed to clear column settings from localStorage (${storageKey}):`, error);
      }
    }
  }, [useLocalStorage, storageKey]);

  return {
    visibility: settings.visibility,
    order: settings.order,
    setVisibility,
    setOrder,
    clearSettings,
    isUsingLocalStorage: useLocalStorage,
  };
};
