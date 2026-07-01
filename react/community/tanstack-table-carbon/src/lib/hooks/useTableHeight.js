import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage table, skeleton & emptyState container height
 *
 * @param {string|number|null} height - Explicit height value (e.g., "500px" or 500)
 * @param {number} dataLength - Length of data array to detect empty state
 * @returns {Object} - { wrapperRef, skeletonRef } - Refs to attach to wrapper and skeleton divs
 */
const useTableHeight = (height, dataLength) => {
  const wrapperRef = useRef(null);
  const skeletonRef = useRef(null);
  const observerRef = useRef(null);

  const updateHeight = useCallback(() => {
    if (!wrapperRef.current) {
      return;
    }

    const scrollDiv = wrapperRef.current.querySelector(
      ':scope div.cds--data-table-content'
    );
    const emptyStateDiv = wrapperRef.current.querySelector(
      ':scope .emptyStateDt'
    );

    if (scrollDiv) {
      // Calculate heights of header, and pagination
      const headerElement = wrapperRef.current.querySelector(':scope thead');
      const paginationElement = wrapperRef.current.querySelector(
        ':scope .cds--pagination'
      );

      const headerHeight = headerElement?.offsetHeight || 0;
      const paginationHeight = paginationElement?.offsetHeight || 0;
      const totalOffset = headerHeight + paginationHeight;

      if (height) {
        const heightValue =
          typeof height === 'number' ? height : parseInt(height);
        const contentHeight = heightValue - totalOffset;

        scrollDiv.style.maxHeight = `${contentHeight}px`;
        scrollDiv.style.overflow = 'auto';
        scrollDiv.style.position = 'relative';

        // Adjust empty state container height
        if (emptyStateDiv && dataLength === 0) {
          const emptyStateHeight = contentHeight - headerHeight - 3;
          emptyStateDiv.style.height = `${emptyStateHeight}px`;
        }
      }
    }
  }, [height, dataLength]);

  // Effect to set up MutationObserver when wrapperRef becomes available
  useEffect(() => {
    updateHeight();

    if (!wrapperRef.current) {
      return;
    }

    // Find the specific td element with emptyCell_tanstackTable class
    const emptyStateTd = wrapperRef.current.querySelector(
      ':scope td.emptyCell_tanstackTable'
    );
    if (!emptyStateTd) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Observe the td element for .emptyStateDt div appearing/disappearing
    observerRef.current = new MutationObserver(() => {
      updateHeight();
    });

    observerRef.current.observe(emptyStateTd, {
      childList: true, // Watch for .emptyStateDt div being added/removed
      subtree: false, // No need for subtree since we're watching the direct parent
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [updateHeight, dataLength, wrapperRef.current]);

  return { wrapperRef, skeletonRef };
};

export default useTableHeight;
