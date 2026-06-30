import { useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

/**
 * Custom hook for table row virtualization
 *
 * Keeps virtualization logic isolated from the table wrapper and
 * handles Carbon's internal `.cds--data-table-content` scroll container.
 *
 * @param {Object} params - Hook parameters
 * @param {Object} params.table - TanStack table instance
 * @param {React.RefObject} params.tableContainerRef - Reference to outer table content wrapper
 * @param {boolean} params.enabled - Whether virtualization is enabled
 * @param {number} params.estimateSize - Estimated row height in pixels
 * @param {number} params.overscan - Number of rows to render outside viewport
 * @returns {Object} Virtualization state and utilities
 */
export const useTableVirtualization = ({
  table,
  tableContainerRef,
  enabled = false,
  estimateSize = 48,
  overscan = 5,
}) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsRendered(false);
      return;
    }

    const renderReady = async () => {
      await undefined;
      setIsRendered(true);
    };

    renderReady();
  }, [enabled]);

  const rowVirtualizer = useVirtualizer({
    count: enabled && isRendered ? table.getRowModel().rows.length : 0,
    estimateSize: () => estimateSize,
    getScrollElement: () =>
      enabled && isRendered
        ? tableContainerRef.current?.querySelector('.cds--data-table-content')
        : null,
    measureElement:
      enabled &&
      isRendered &&
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: enabled ? overscan : 0,
  });

  const rows = table.getRowModel().rows;
  const shouldUseVirtualization = enabled && isRendered;

  return {
    isRendered,
    rowVirtualizer: shouldUseVirtualization ? rowVirtualizer : null,
    virtualRows: shouldUseVirtualization ? rowVirtualizer.getVirtualItems() : [],
    totalSize: shouldUseVirtualization ? rowVirtualizer.getTotalSize() : 0,
    rows,
  };
};

export default useTableVirtualization;
