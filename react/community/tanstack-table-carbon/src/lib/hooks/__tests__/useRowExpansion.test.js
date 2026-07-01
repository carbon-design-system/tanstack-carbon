import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRowExpansion } from '../useRowExpansion';

describe('useRowExpansion', () => {
  const createMockTable = (rows = []) => ({
    current: {
      getRowModel: () => ({
        rows: rows.map((id) => ({ id })),
      }),
    },
  });

  describe('Initial State', () => {
    it('should initialize with empty expansion state', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      expect(result.current.expanded).toEqual({});
      expect(result.current.isAllExpanded).toBe(false);
    });
  });

  describe('Single Row Expansion', () => {
    it('should expand a single row', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      act(() => {
        result.current.toggleRow('row-1');
      });

      expect(result.current.expanded).toEqual({ 'row-1': true });
      expect(result.current.isAllExpanded).toBe(false);
    });

    it('should collapse an expanded row', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      act(() => {
        result.current.toggleRow('row-1');
      });

      expect(result.current.expanded['row-1']).toBe(true);

      act(() => {
        result.current.toggleRow('row-1');
      });

      expect(result.current.expanded['row-1']).toBe(false);
    });

    it('should handle multiple row expansions', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      act(() => {
        result.current.toggleRow('row-1');
      });

      act(() => {
        result.current.toggleRow('row-2');
      });

      act(() => {
        result.current.toggleRow('row-3');
      });

      expect(result.current.expanded).toEqual({
        'row-1': true,
        'row-2': true,
        'row-3': true,
      });
    });

    it('should toggle individual rows independently', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      act(() => {
        result.current.toggleRow('row-1');
      });

      act(() => {
        result.current.toggleRow('row-2');
      });

      expect(result.current.expanded).toEqual({
        'row-1': true,
        'row-2': true,
      });

      act(() => {
        result.current.toggleRow('row-1');
      });

      expect(result.current.expanded).toEqual({
        'row-1': false,
        'row-2': true,
      });
    });
  });

  describe('Expand All Rows', () => {
    it('should expand all rows when toggling from collapsed state', () => {
      const rows = ['row-1', 'row-2', 'row-3'];
      const tableRef = createMockTable(rows);
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      act(() => {
        result.current.toggleAllRows();
      });

      expect(result.current.expanded).toEqual({
        'row-1': true,
        'row-2': true,
        'row-3': true,
      });
      expect(result.current.isAllExpanded).toBe(true);
    });

    it('should collapse all rows when toggling from expanded state', () => {
      const rows = ['row-1', 'row-2', 'row-3'];
      const tableRef = createMockTable(rows);
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      // NOTE: First expand all
      act(() => {
        result.current.toggleAllRows();
      });

      expect(result.current.isAllExpanded).toBe(true);

      // NOTE: Then collapse all
      act(() => {
        result.current.toggleAllRows();
      });

      expect(result.current.expanded).toEqual({});
      expect(result.current.isAllExpanded).toBe(false);
    });

    it('should handle empty table when toggling all rows', () => {
      const tableRef = createMockTable([]);
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      act(() => {
        result.current.toggleAllRows();
      });

      expect(result.current.expanded).toEqual({});
      expect(result.current.isAllExpanded).toBe(true);
    });

    it('should handle null tableRef gracefully', () => {
      const { result } = renderHook(() => useRowExpansion(null, null));

      act(() => {
        result.current.toggleAllRows();
      });

      // NOTE: Should not throw error
      expect(result.current.expanded).toEqual({});
      expect(result.current.isAllExpanded).toBe(false);
    });

    it('should handle undefined tableRef gracefully', () => {
      const { result } = renderHook(() => useRowExpansion(undefined, null));

      act(() => {
        result.current.toggleAllRows();
      });

      // NOTE: Should not throw error
      expect(result.current.expanded).toEqual({});
    });
  });

  describe('Expansion Change Callback', () => {
    it('should call onExpandedChange when expanding a row', () => {
      const tableRef = createMockTable();
      const onExpandedChange = vi.fn();
      const { result } = renderHook(() => useRowExpansion(tableRef, onExpandedChange));

      act(() => {
        result.current.toggleRow('row-1');
      });

      expect(onExpandedChange).toHaveBeenCalledWith({ 'row-1': true });
    });

    it('should call onExpandedChange when collapsing a row', () => {
      const tableRef = createMockTable();
      const onExpandedChange = vi.fn();
      const { result } = renderHook(() => useRowExpansion(tableRef, onExpandedChange));

      act(() => {
        result.current.toggleRow('row-1');
      });

      onExpandedChange.mockClear();

      act(() => {
        result.current.toggleRow('row-1');
      });

      expect(onExpandedChange).toHaveBeenCalledWith({ 'row-1': false });
    });

    it('should call onExpandedChange when expanding all rows', () => {
      const rows = ['row-1', 'row-2'];
      const tableRef = createMockTable(rows);
      const onExpandedChange = vi.fn();
      const { result } = renderHook(() => useRowExpansion(tableRef, onExpandedChange));

      act(() => {
        result.current.toggleAllRows();
      });

      expect(onExpandedChange).toHaveBeenCalledWith({
        'row-1': true,
        'row-2': true,
      });
    });

    it('should call onExpandedChange when collapsing all rows', () => {
      const rows = ['row-1', 'row-2'];
      const tableRef = createMockTable(rows);
      const onExpandedChange = vi.fn();
      const { result } = renderHook(() => useRowExpansion(tableRef, onExpandedChange));

      act(() => {
        result.current.toggleAllRows();
      });

      onExpandedChange.mockClear();

      act(() => {
        result.current.toggleAllRows();
      });

      expect(onExpandedChange).toHaveBeenCalledWith({});
    });

    it('should not throw error when callback is not provided', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      act(() => {
        result.current.toggleRow('row-1');
      });

      expect(result.current.expanded).toEqual({ 'row-1': true });
    });
  });

  describe('setExpanded with Function Updater', () => {
    it('should handle function updater', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      act(() => {
        result.current.setExpanded((prev) => ({ ...prev, 'row-1': true }));
      });

      expect(result.current.expanded).toEqual({ 'row-1': true });
    });

    it('should handle direct value updater', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      act(() => {
        result.current.setExpanded({ 'row-1': true, 'row-2': true });
      });

      expect(result.current.expanded).toEqual({ 'row-1': true, 'row-2': true });
    });

    it('should call callback with function updater', () => {
      const tableRef = createMockTable();
      const onExpandedChange = vi.fn();
      const { result } = renderHook(() => useRowExpansion(tableRef, onExpandedChange));

      act(() => {
        result.current.setExpanded((prev) => ({ ...prev, 'row-1': true }));
      });

      expect(onExpandedChange).toHaveBeenCalledWith({ 'row-1': true });
    });
  });

  describe('Complex Scenarios', () => {
    it('should maintain state when mixing individual and all toggles', () => {
      const rows = ['row-1', 'row-2', 'row-3'];
      const tableRef = createMockTable(rows);
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      // NOTE: Expand some rows individually
      act(() => {
        result.current.toggleRow('row-1');
      });

      act(() => {
        result.current.toggleRow('row-2');
      });

      expect(result.current.expanded).toEqual({
        'row-1': true,
        'row-2': true,
      });

      // NOTE: Expand all
      act(() => {
        result.current.toggleAllRows();
      });

      expect(result.current.expanded).toEqual({
        'row-1': true,
        'row-2': true,
        'row-3': true,
      });
      expect(result.current.isAllExpanded).toBe(true);
    });

    it('should handle rapid toggles', () => {
      const tableRef = createMockTable();
      const { result } = renderHook(() => useRowExpansion(tableRef, null));

      act(() => {
        result.current.toggleRow('row-1');
        result.current.toggleRow('row-1');
        result.current.toggleRow('row-1');
      });

      expect(result.current.expanded['row-1']).toBe(true);
    });
  });
});
