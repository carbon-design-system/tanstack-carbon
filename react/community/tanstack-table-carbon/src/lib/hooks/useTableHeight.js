import { useRef, useLayoutEffect, useCallback } from 'react';

// The loading skeleton renders its own pagination placeholder instead of .cds--pagination
const PAGINATION_SELECTOR = ':scope .cds--pagination, :scope [data-skeleton-pagination]';

/**
 * Custom hook to manage table, skeleton & emptyState container height
 *
 * @param {string|number|null} height - Explicit height value (e.g. 500, "500px", or "100%")
 * @param {number} dataLength - Length of data array to detect empty state
 * @returns {Object} - { wrapperRef, skeletonRef } - Refs to attach to wrapper and skeleton divs
 */
const useTableHeight = (height, dataLength) => {
  const wrapperRef = useRef(null);
  const skeletonRef = useRef(null);

  const updateHeight = useCallback(() => {
    if (!wrapperRef.current) {
      return;
    }

    const scrollDiv = wrapperRef.current.querySelector(':scope div.cds--data-table-content');
    const skeletonDiv = wrapperRef.current.querySelector(':scope .cds--data-table-container');
    const emptyStateDiv = wrapperRef.current.querySelector(':scope .emptyStateDt');

    const targetEl = scrollDiv || skeletonDiv;
    if (!targetEl) {
      return;
    }

    // When height is '100%', measure parent container height and observe it
    if (height === '100%') {
      const wrapperEl = wrapperRef.current;
      const parentEl = wrapperEl.parentElement;

      // Measure the parent with the table taken out of the layout. If the table's previous height
      // is still counted, the parent keeps growing with it and the table only settles after
      // several re-renders (visible as the skeleton/table height jumping on load).
      const previousDisplay = wrapperEl.style.display;
      wrapperEl.style.display = 'none';
      const parentHeight = parentEl ? parentEl.clientHeight : 0;
      wrapperEl.style.display = previousDisplay;

      if (parentHeight > 0) {
        const headerElement = wrapperRef.current.querySelector(':scope thead');
        const paginationElement = wrapperRef.current.querySelector(PAGINATION_SELECTOR);
        const toolbarElement = wrapperRef.current.querySelector(':scope .cds--table-toolbar');

        const headerHeight = headerElement?.offsetHeight || 0;
        const paginationHeight = paginationElement?.offsetHeight || 0;
        const toolbarHeight = toolbarElement?.offsetHeight || 0;
        const totalOffset = headerHeight + paginationHeight + toolbarHeight;

        const contentHeight = Math.max(0, parentHeight - totalOffset);

        targetEl.style.maxHeight = `${contentHeight}px`;
        targetEl.style.overflow = 'auto';
        targetEl.style.position = 'relative';

        if (emptyStateDiv && dataLength === 0) {
          const emptyStateHeight = Math.max(0, contentHeight - headerHeight - 3);
          emptyStateDiv.style.height = `${emptyStateHeight}px`;
        }
      }
      return;
    }

    // When numeric / pixel height is provided (e.g. 500, "500px")
    if (height) {
      const parsedValue = typeof height === 'number' ? height : parseInt(height, 10);
      if (!Number.isNaN(parsedValue)) {
        const headerElement = wrapperRef.current.querySelector(':scope thead');
        const paginationElement = wrapperRef.current.querySelector(PAGINATION_SELECTOR);

        const headerHeight = headerElement?.offsetHeight || 0;
        const paginationHeight = paginationElement?.offsetHeight || 0;
        const totalOffset = headerHeight + paginationHeight;

        const contentHeight = Math.max(0, parsedValue - totalOffset);

        targetEl.style.maxHeight = `${contentHeight}px`;
        targetEl.style.overflow = 'auto';
        targetEl.style.position = 'relative';

        if (emptyStateDiv && dataLength === 0) {
          const emptyStateHeight = Math.max(0, contentHeight - headerHeight - 3);
          emptyStateDiv.style.height = `${emptyStateHeight}px`;
        }
      }
    } else {
      // Natural height (height is null/undefined)
      targetEl.style.maxHeight = '';
      if (emptyStateDiv) {
        emptyStateDiv.style.height = '';
      }
    }
  }, [height, dataLength]);

  // Layout effect so the height is applied before the browser paints (no flash of full height)
  useLayoutEffect(() => {
    updateHeight();

    if (!wrapperRef.current) {
      return;
    }

    // 1. Observe parent element resizing when height === '100%'
    let resizeObserver = null;
    if (height === '100%' && typeof ResizeObserver !== 'undefined') {
      const targetToObserve = wrapperRef.current.parentElement || wrapperRef.current;
      resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserver.observe(targetToObserve);
    }

    // 2. Observe DOM swaps (Skeleton <-> Table and Empty State)
    let mutationObserver = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        updateHeight();
      });
      mutationObserver.observe(wrapperRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [updateHeight, height, dataLength]);

  return { wrapperRef, skeletonRef };
};

export default useTableHeight;
