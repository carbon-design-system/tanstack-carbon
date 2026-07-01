import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePaginationFeature } from '../usePaginationFeature';

describe('usePaginationFeature', () => {
  const defaultProps = {
    pagination: null,
    enableVirtualization: false,
    dataLength: 100,
    isServerSidePagination: false,
  };

  describe('Disabled State', () => {
    it('should be disabled when pagination is null', () => {
      const { result } = renderHook(() => usePaginationFeature(defaultProps));

      expect(result.current.enabled).toBe(false);
      expect(result.current.shouldRender).toBe(false);
    });

    it('should be disabled when virtualization is enabled', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
          enableVirtualization: true,
        })
      );

      expect(result.current.enabled).toBe(false);
    });

    it('should not render when dataLength is 0', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
          dataLength: 0,
        })
      );

      expect(result.current.shouldRender).toBe(false);
    });
  });

  describe('Enabled State', () => {
    it('should be enabled with pagination config', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
        })
      );

      expect(result.current.enabled).toBe(true);
      expect(result.current.shouldRender).toBe(true);
    });

    it('should use default page size', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: {},
        })
      );

      expect(result.current.initialPageSize).toBe(10); // NOTE: DEFAULT_PAGINATION.pageSize
      expect(result.current.paginationState.pageSize).toBe(10);
    });

    it('should use custom page size', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 25 },
        })
      );

      expect(result.current.initialPageSize).toBe(25);
      expect(result.current.paginationState.pageSize).toBe(25);
    });

    it('should use default page size options', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: {},
        })
      );

      expect(result.current.pageSizeOptions).toEqual([10, 20, 50, 100]);
    });

    it('should use custom page size options', () => {
      const customOptions = [5, 10, 20];
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSizeOptions: customOptions },
        })
      );

      expect(result.current.pageSizeOptions).toEqual(customOptions);
    });
  });

  describe('Uncontrolled Pagination', () => {
    it('should initialize with page index 0', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
        })
      );

      expect(result.current.paginationState.pageIndex).toBe(0);
    });

    it('should update page index', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
        })
      );

      act(() => {
        result.current.handlePaginationChange({ pageIndex: 2, pageSize: 10 });
      });

      expect(result.current.paginationState.pageIndex).toBe(2);
    });

    it('should update page size', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
        })
      );

      act(() => {
        result.current.handlePaginationChange({ pageIndex: 0, pageSize: 20 });
      });

      expect(result.current.paginationState.pageSize).toBe(20);
    });

    it('should handle function updater', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
        })
      );

      act(() => {
        result.current.handlePaginationChange((prev) => ({
          ...prev,
          pageIndex: prev.pageIndex + 1,
        }));
      });

      expect(result.current.paginationState.pageIndex).toBe(1);
    });

    it('should not update state if values are the same', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
        })
      );

      const initialState = result.current.paginationState;

      act(() => {
        result.current.handlePaginationChange({ pageIndex: 0, pageSize: 10 });
      });

      // NOTE: Should return same reference if values haven't changed
      expect(result.current.paginationState).toBe(initialState);
    });
  });

  describe('Controlled Pagination (Server-Side)', () => {
    it('should use controlled pagination state', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageIndex: 2, pageSize: 20, onChange },
          isServerSidePagination: true,
        })
      );

      expect(result.current.paginationState.pageIndex).toBe(2);
      expect(result.current.paginationState.pageSize).toBe(20);
    });

    it('should call onChange when pagination changes', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageIndex: 0, pageSize: 10, onChange },
          isServerSidePagination: true,
        })
      );

      act(() => {
        result.current.handlePaginationChange({ pageIndex: 1, pageSize: 10 });
      });

      expect(onChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10 });
    });

    it('should call onChange with function updater result', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageIndex: 0, pageSize: 10, onChange },
          isServerSidePagination: true,
        })
      );

      act(() => {
        result.current.handlePaginationChange((prev) => ({
          ...prev,
          pageIndex: prev.pageIndex + 1,
        }));
      });

      expect(onChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10 });
    });

    it('should not call onChange if values are the same', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageIndex: 0, pageSize: 10, onChange },
          isServerSidePagination: true,
        })
      );

      act(() => {
        result.current.handlePaginationChange({ pageIndex: 0, pageSize: 10 });
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should update controlled state when props change', () => {
      const onChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ pageIndex }) =>
          usePaginationFeature({
            ...defaultProps,
            pagination: { pageIndex, pageSize: 10, onChange },
            isServerSidePagination: true,
          }),
        { initialProps: { pageIndex: 0 } }
      );

      expect(result.current.paginationState.pageIndex).toBe(0);

      rerender({ pageIndex: 3 });

      expect(result.current.paginationState.pageIndex).toBe(3);
    });
  });

  describe('Table Options', () => {
    it('should provide table options for uncontrolled mode', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
        })
      );

      expect(result.current.tableOptions.onPaginationChange).toBeDefined();
      expect(result.current.tableOptions.manualPagination).toBe(false);
    });

    it('should provide table options for controlled mode', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10, onChange },
          isServerSidePagination: true,
        })
      );

      expect(result.current.tableOptions.onPaginationChange).toBeDefined();
      expect(result.current.tableOptions.manualPagination).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined pagination config', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: undefined,
        })
      );

      expect(result.current.enabled).toBe(false);
    });

    it('should handle empty pagination config', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: {},
        })
      );

      expect(result.current.enabled).toBe(true);
      expect(result.current.paginationState.pageIndex).toBe(0);
      expect(result.current.paginationState.pageSize).toBe(10);
    });

    it('should handle custom initial page index', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageIndex: 5, pageSize: 10 },
        })
      );

      expect(result.current.paginationState.pageIndex).toBe(5);
    });

    it('should handle page size change resetting to first page', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
        })
      );

      // NOTE: Go to page 2
      act(() => {
        result.current.handlePaginationChange({ pageIndex: 2, pageSize: 10 });
      });

      expect(result.current.paginationState.pageIndex).toBe(2);

      // NOTE: Change page size (typically resets to page 0)
      act(() => {
        result.current.handlePaginationChange({ pageIndex: 0, pageSize: 20 });
      });

      expect(result.current.paginationState.pageIndex).toBe(0);
      expect(result.current.paginationState.pageSize).toBe(20);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with large datasets', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 50 },
          dataLength: 10000,
        })
      );

      expect(result.current.shouldRender).toBe(true);
      expect(result.current.enabled).toBe(true);
    });

    it('should handle rapid pagination changes', () => {
      const { result } = renderHook(() =>
        usePaginationFeature({
          ...defaultProps,
          pagination: { pageSize: 10 },
        })
      );

      act(() => {
        result.current.handlePaginationChange({ pageIndex: 1, pageSize: 10 });
        result.current.handlePaginationChange({ pageIndex: 2, pageSize: 10 });
        result.current.handlePaginationChange({ pageIndex: 3, pageSize: 10 });
      });

      expect(result.current.paginationState.pageIndex).toBe(3);
    });
  });
});
