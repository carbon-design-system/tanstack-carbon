import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFilterSidePanel } from '../useFilterSidePanel';

describe('useFilterSidePanel', () => {
  it('initializes closed and can open, close, and toggle the panel', () => {
    const { result } = renderHook(() => useFilterSidePanel());

    expect(result.current.showFilterPanel).toBe(false);

    act(() => {
      result.current.openFilterPanel();
    });
    expect(result.current.showFilterPanel).toBe(true);

    act(() => {
      result.current.toggleFilterPanel();
    });
    expect(result.current.showFilterPanel).toBe(false);

    act(() => {
      result.current.toggleFilterPanel();
    });
    expect(result.current.showFilterPanel).toBe(true);

    act(() => {
      result.current.closeFilterPanel();
    });
    expect(result.current.showFilterPanel).toBe(false);
  });

  it('arrayFilterFn returns true for empty filters and matching values, false otherwise', () => {
    const { result } = renderHook(() => useFilterSidePanel());

    const row = {
      getValue: vi.fn((columnId) => (columnId === 'status' ? 'active' : 'unknown')),
    };

    expect(result.current.arrayFilterFn(row, 'status', undefined)).toBe(true);
    expect(result.current.arrayFilterFn(row, 'status', [])).toBe(true);
    expect(result.current.arrayFilterFn(row, 'status', 'active')).toBe(true);
    expect(result.current.arrayFilterFn(row, 'status', ['active', 'inactive'])).toBe(true);
    expect(result.current.arrayFilterFn(row, 'status', ['inactive'])).toBe(false);
    expect(row.getValue).toHaveBeenCalledWith('status');
  });

  it('applies filters to table and invokes callback when table exists', () => {
    const setColumnFilters = vi.fn();
    const onColumnFiltersChange = vi.fn();
    const table = { setColumnFilters };

    const { result } = renderHook(() => useFilterSidePanel(table, onColumnFiltersChange));
    const filters = [{ id: 'status', value: 'active' }];

    act(() => {
      result.current.applyFilters(filters);
    });

    expect(setColumnFilters).toHaveBeenCalledWith(filters);
    expect(onColumnFiltersChange).toHaveBeenCalledWith(filters);
  });

  it('clears filters on table and invokes callback with empty array when table exists', () => {
    const resetColumnFilters = vi.fn();
    const onColumnFiltersChange = vi.fn();
    const table = { resetColumnFilters };

    const { result } = renderHook(() => useFilterSidePanel(table, onColumnFiltersChange));

    act(() => {
      result.current.clearFilters();
    });

    expect(resetColumnFilters).toHaveBeenCalled();
    expect(onColumnFiltersChange).toHaveBeenCalledWith([]);
  });

  it('does nothing for applyFilters and clearFilters when table is missing', () => {
    const onColumnFiltersChange = vi.fn();
    const { result } = renderHook(() => useFilterSidePanel(null, onColumnFiltersChange));

    act(() => {
      result.current.applyFilters([{ id: 'status', value: 'active' }]);
      result.current.clearFilters();
    });

    expect(onColumnFiltersChange).not.toHaveBeenCalled();
  });
});
