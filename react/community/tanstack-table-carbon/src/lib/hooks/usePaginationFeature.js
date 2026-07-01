import { useState, useCallback, useMemo } from 'react';
import { DEFAULT_PAGINATION } from '../constants';

export const usePaginationFeature = ({
  pagination,
  enableVirtualization,
  dataLength,
  isServerSidePagination,
}) => {
  const controlledPaginationState = useMemo(
    () => ({
      pageIndex: pagination?.pageIndex ?? 0,
      pageSize: pagination?.pageSize ?? DEFAULT_PAGINATION.pageSize,
    }),
    [pagination?.pageIndex, pagination?.pageSize]
  );

  const [paginationState, setPaginationState] = useState({
    pageIndex: pagination?.pageIndex ?? 0,
    pageSize: pagination?.pageSize ?? DEFAULT_PAGINATION.pageSize,
  });

  const handlePaginationChange = useCallback(
    (updater) => {
      if (pagination?.onChange) {
        const baseState = {
          pageIndex: pagination?.pageIndex ?? 0,
          pageSize: pagination?.pageSize ?? DEFAULT_PAGINATION.pageSize,
        };
        const newPagination = typeof updater === 'function' ? updater(baseState) : updater;

        if (
          baseState.pageIndex === newPagination.pageIndex &&
          baseState.pageSize === newPagination.pageSize
        ) {
          return;
        }

        pagination.onChange(newPagination);
        return;
      }

      setPaginationState((prev) => {
        const newPagination = typeof updater === 'function' ? updater(prev) : updater;

        if (
          prev.pageIndex === newPagination.pageIndex &&
          prev.pageSize === newPagination.pageSize
        ) {
          return prev;
        }

        return newPagination;
      });
    },
    [pagination]
  );

  const paginationConfig = pagination || null;
  const enablePagination = !enableVirtualization && !!paginationConfig;
  const initialPageSize = paginationConfig?.pageSize ?? DEFAULT_PAGINATION.pageSize;
  const pageSizeOptions = paginationConfig?.pageSizeOptions ?? DEFAULT_PAGINATION.pageSizeOptions;

  return {
    enabled: enablePagination,
    initialPageSize,
    pageSizeOptions,
    paginationState: isServerSidePagination ? controlledPaginationState : paginationState,
    handlePaginationChange,
    tableOptions: {
      onPaginationChange: handlePaginationChange,
      manualPagination: isServerSidePagination,
    },
    shouldRender: enablePagination && dataLength > 0,
  };
};

export default usePaginationFeature;
