import { useState, useEffect, useMemo } from 'react';

/**
 * Custom hook to handle responsive batch actions
 * On small screens, collapses multiple button actions into an overflow menu
 *
 * @param {Array} batchActions - Array of batch action configurations
 * @param {number} breakpoint - Screen width breakpoint in pixels (default: 672px - Carbon's md breakpoint)
 * @returns {Object} - { isSmallScreen, buttonActions, customElements, shouldUseOverflow }
 */
const useResponsiveBatchActions = (batchActions = [], breakpoint = 672) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // NOTE: Check screen size on mount and resize
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < breakpoint);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [breakpoint]);

  // NOTE: Separate button actions from custom elements
  const { buttonActions, customElements } = useMemo(() => {
    const buttons = batchActions.filter((action) => action.type !== 'custom');
    const customs = batchActions.filter((action) => action.type === 'custom');

    return {
      buttonActions: buttons,
      customElements: customs,
    };
  }, [batchActions]);

  const shouldUseOverflow = isSmallScreen && buttonActions.length > 1;

  return {
    isSmallScreen,
    buttonActions,
    customElements,
    shouldUseOverflow,
  };
};

export default useResponsiveBatchActions;
