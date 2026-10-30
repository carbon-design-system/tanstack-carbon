/*
 ************************************************************
 * IBM Confidential
 * OCO Source Materials
 * 5655-ABB
 * Copyright IBM Corp. 2026
 * The source code for this program is not published
 * or otherwise divested of its trade secrets,
 * irrespective of what has been deposited with the
 * U. S. Copyright Office.
 ************************************************************
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useStatePersistence } from '../useStatePersistence';

describe('useStatePersistence', () => {
  it('does nothing when statePersistence is not configured or disabled', () => {
    const onStateChange = vi.fn();

    const { rerender } = renderHook(
      ({
        statePersistence,
        paginationState,
        searchValue,
        columnFilters,
        sorting,
      }) =>
        useStatePersistence({
          statePersistence,
          paginationState,
          searchValue,
          columnFilters,
          sorting,
        }),
      {
        initialProps: {
          statePersistence: null,
          paginationState: { pageIndex: 0, pageSize: 5 },
          searchValue: '',
          columnFilters: [],
        },
      }
    );

    expect(onStateChange).not.toHaveBeenCalled();

    rerender({
      statePersistence: { enabled: false, onStateChange },
      paginationState: { pageIndex: 1, pageSize: 5 },
      searchValue: 'test',
      columnFilters: [{ id: 'role', value: 'Admin' }],
    });

    expect(onStateChange).not.toHaveBeenCalled();
  });

  it('does not trigger onStateChange on initial mount', () => {
    const onStateChange = vi.fn();

    renderHook(() =>
      useStatePersistence({
        statePersistence: { onStateChange },
        paginationState: { pageIndex: 0, pageSize: 10 },
        searchValue: 'Alice',
        columnFilters: [{ id: 'department', value: 'Engineering' }],
      })
    );

    expect(onStateChange).not.toHaveBeenCalled();
  });

  it('triggers onStateChange when pagination, search, filters, or sorting change', () => {
    const onStateChange = vi.fn();

    const { rerender } = renderHook(
      ({
        statePersistence,
        paginationState,
        searchValue,
        columnFilters,
        sorting,
      }) =>
        useStatePersistence({
          statePersistence,
          paginationState,
          searchValue,
          columnFilters,
          sorting,
        }),
      {
        initialProps: {
          statePersistence: { onStateChange },
          paginationState: { pageIndex: 0, pageSize: 5 },
          searchValue: '',
          columnFilters: [],
        },
      }
    );

    expect(onStateChange).not.toHaveBeenCalled();

    // 1. Pagination change
    rerender({
      statePersistence: { onStateChange },
      paginationState: { pageIndex: 1, pageSize: 5 },
      searchValue: '',
      columnFilters: [],
    });

    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(onStateChange).toHaveBeenLastCalledWith({
      pagination: { pageIndex: 1, pageSize: 5 },
      search: '',
      filters: [],
      sorting: [],
    });

    // 2. Search change
    rerender({
      statePersistence: { onStateChange },
      paginationState: { pageIndex: 1, pageSize: 5 },
      searchValue: 'Bob',
      columnFilters: [],
    });

    expect(onStateChange).toHaveBeenCalledTimes(2);
    expect(onStateChange).toHaveBeenLastCalledWith({
      pagination: { pageIndex: 1, pageSize: 5 },
      search: 'Bob',
      filters: [],
      sorting: [],
    });

    // 3. Filters change
    rerender({
      statePersistence: { onStateChange },
      paginationState: { pageIndex: 1, pageSize: 5 },
      searchValue: 'Bob',
      columnFilters: [{ id: 'department', value: 'Engineering' }],
    });

    expect(onStateChange).toHaveBeenCalledTimes(3);
    expect(onStateChange).toHaveBeenLastCalledWith({
      pagination: { pageIndex: 1, pageSize: 5 },
      search: 'Bob',
      filters: [{ id: 'department', value: 'Engineering' }],
      sorting: [],
    });

    // 3b. Sorting change
    rerender({
      statePersistence: { onStateChange },
      paginationState: { pageIndex: 1, pageSize: 5 },
      searchValue: 'Bob',
      columnFilters: [{ id: 'department', value: 'Engineering' }],
      sorting: [{ id: 'name', desc: true }],
    });

    expect(onStateChange).toHaveBeenCalledTimes(4);
    expect(onStateChange).toHaveBeenLastCalledWith({
      pagination: { pageIndex: 1, pageSize: 5 },
      search: 'Bob',
      filters: [{ id: 'department', value: 'Engineering' }],
      sorting: [{ id: 'name', desc: true }],
    });

    // 4. Re-render with identical values does NOT trigger another callback
    rerender({
      statePersistence: { onStateChange },
      paginationState: { pageIndex: 1, pageSize: 5 },
      searchValue: 'Bob',
      columnFilters: [{ id: 'department', value: 'Engineering' }],
      sorting: [{ id: 'name', desc: true }],
    });

    expect(onStateChange).toHaveBeenCalledTimes(4);
  });
});
