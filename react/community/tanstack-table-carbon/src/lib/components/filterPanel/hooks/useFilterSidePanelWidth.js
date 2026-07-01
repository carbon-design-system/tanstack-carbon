import { useRef, useState, useEffect } from 'react';

/**
 * Custom hook to measure the width of a side panel element
 * Measures the width once when the panel opens
 *
 * @param {boolean} isOpen - Whether the side panel is open
 * @param {string} selector - CSS selector for the side panel element
 * @returns {Object} - { ref, width }
 */
const useFilterSidePanelWidth = (isOpen, selector = '[data-filter-panel="true"]') => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (isOpen && ref.current) {
      const timer = setTimeout(() => {
        const sidePanelElement = ref.current.querySelector(selector);
        if (sidePanelElement) {
          setWidth(sidePanelElement.offsetWidth);
        }
      }, 10);

      return () => clearTimeout(timer);
    }

    setWidth(0);
  }, [isOpen, selector]);

  return { ref, width };
};

export default useFilterSidePanelWidth;
