import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTableSelection } from '../useTableSelection';

describe('useTableSelection', () => {
  const createMockTable = (selectedRows = []) => ({
    current: {
      getSelectedRowModel: () => ({
        rows: selectedRows.map((data) => ({ original: data })),
      }),
    },
  });

  describe('Selection Type Detection', () => {
    it('should enable selection for checkbox type', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, 'checkbox', null));

      expect(result.current.enableSelection).toBe(true);
      expect(result.current.isCheckbox).toBe(true);
      expect(result.current.isRadio).toBe(false);
    });

    it('should enable selection for radio type', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, 'radio', null));

      expect(result.current.enableSelection).toBe(true);
      expect(result.current.isCheckbox).toBe(false);
      expect(result.current.isRadio).toBe(true);
    });

    it('should disable selection when type is null', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, null, null));

      expect(result.current.enableSelection).toBe(false);
      expect(result.current.isCheckbox).toBe(false);
      expect(result.current.isRadio).toBe(false);
    });

    it('should disable selection when type is undefined', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, undefined, null));

      expect(result.current.enableSelection).toBe(false);
    });
  });

  describe('Row Selection State', () => {
    it('should initialize with empty selection', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, 'checkbox', null));

      expect(result.current.rowSelection).toEqual({});
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.shouldShowBatchActions).toBe(false);
    });

    it('should update selection state', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, 'checkbox', null));

      act(() => {
        result.current.setRowSelection({ 0: true, 1: true });
      });

      expect(result.current.rowSelection).toEqual({ 0: true, 1: true });
      expect(result.current.selectedCount).toBe(2);
      expect(result.current.shouldShowBatchActions).toBe(true);
    });

    it('should clear selection', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, 'checkbox', null));

      act(() => {
        result.current.setRowSelection({ 0: true, 1: true });
      });

      expect(result.current.selectedCount).toBe(2);

      act(() => {
        result.current.setRowSelection({});
      });

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.shouldShowBatchActions).toBe(false);
    });
  });

  describe('Selection Change Callback', () => {
    it('should call onSelectionChange when selection changes', () => {
      const mockData = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ];
      const tableRef = createMockTable(mockData);
      const onSelectionChange = vi.fn();

      const { result } = renderHook(() =>
        useTableSelection(tableRef, 'checkbox', onSelectionChange)
      );

      act(() => {
        result.current.setRowSelection({ 0: true, 1: true });
      });

      expect(onSelectionChange).toHaveBeenCalledWith(mockData);
    });

    it('should not call onSelectionChange when selection is disabled', () => {
      const tableRef = createMockTable();
      const onSelectionChange = vi.fn();

      const { result } = renderHook(() => useTableSelection(tableRef, null, onSelectionChange));

      act(() => {
        result.current.setRowSelection({ 0: true });
      });

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('should not call onSelectionChange when callback is not provided', () => {
      const tableRef = createMockTable([{ id: 1 }]);

      const { result } = renderHook(() => useTableSelection(tableRef, 'checkbox', null));

      act(() => {
        result.current.setRowSelection({ 0: true });
      });

      expect(result.current.selectedCount).toBe(1);
    });

    it('should handle empty selection in callback', () => {
      const tableRef = createMockTable([]);
      const onSelectionChange = vi.fn();

      renderHook(() => useTableSelection(tableRef, 'checkbox', onSelectionChange));

      expect(onSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Batch Actions Visibility', () => {
    it('should show batch actions when rows are selected', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, 'checkbox', null));

      act(() => {
        result.current.setRowSelection({ 0: true });
      });

      expect(result.current.shouldShowBatchActions).toBe(true);
    });

    it('should hide batch actions when no rows are selected', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, 'checkbox', null));

      expect(result.current.shouldShowBatchActions).toBe(false);
    });

    it('should update batch actions visibility when selection changes', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, 'checkbox', null));

      act(() => {
        result.current.setRowSelection({ 0: true, 1: true });
      });

      expect(result.current.shouldShowBatchActions).toBe(true);

      act(() => {
        result.current.setRowSelection({});
      });

      expect(result.current.shouldShowBatchActions).toBe(false);
    });
  });

  describe('Selected Count', () => {
    it('should count selected rows correctly', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, 'checkbox', null));

      act(() => {
        result.current.setRowSelection({ 0: true, 1: true, 2: true });
      });

      expect(result.current.selectedCount).toBe(3);
    });

    it('should handle single selection for radio', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useTableSelection(tableRef, 'radio', null));

      act(() => {
        result.current.setRowSelection({ 0: true });
      });

      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isRadio).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null tableRef', () => {
      const onSelectionChange = vi.fn();
      const { result } = renderHook(() => useTableSelection(null, 'checkbox', onSelectionChange));

      act(() => {
        result.current.setRowSelection({ 0: true });
      });

      expect(result.current.selectedCount).toBe(1);
    });

    it('should handle tableRef without getSelectedRowModel', () => {
      const tableRef = { current: {} };
      const onSelectionChange = vi.fn();

      const { result } = renderHook(() =>
        useTableSelection(tableRef, 'checkbox', onSelectionChange)
      );

      act(() => {
        result.current.setRowSelection({ 0: true });
      });

      expect(result.current.selectedCount).toBe(1);
    });
  });
});
