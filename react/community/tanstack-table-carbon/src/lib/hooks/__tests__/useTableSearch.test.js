import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useTableSearch } from '../useTableSearch';

describe('useTableSearch', () => {
  it('updates search state, triggers callback, clears search, and covers global filtering branches', async () => {
    const onSearchChange = vi.fn();
    const columns = [
      { id: 'select' },
      { id: 'overflow-menu' },
      {
        accessorKey: 'name',
      },
      {
        accessorKey: 'formattedDate',
        cell: ({ getValue }) => `Formatted ${getValue()}`,
      },
      {
        accessorKey: 'brokenFormatter',
        cell: () => {
          throw new Error('format failed');
        },
      },
      {
        accessorKey: 'brokenValue',
      },
    ];

    const { result } = renderHook(() =>
      useTableSearch({
        onSearchChange,
        debounceDelay: 10,
        columns,
      })
    );

    act(() => {
      result.current.handleSearchChange('john');
    });
    expect(result.current.immediateSearchValue).toBe('john');
    expect(result.current.isSearching).toBe(true);

    await waitFor(() => {
      expect(result.current.debouncedSearchValue).toBe('john');
      expect(result.current.globalFilter).toBe('john');
    });

    expect(onSearchChange).toHaveBeenLastCalledWith('john');

    const formattedRow = {
      getValue: (id) => {
        if (id === 'name') {
          return 'Alice';
        }
        if (id === 'formattedDate') {
          return '2025-12-15';
        }
        if (id === 'brokenFormatter') {
          return 'x';
        }
        if (id === 'brokenValue') {
          throw new Error('getValue failed');
        }
        return null;
      },
    };

    expect(result.current.globalFilterFn(formattedRow, 'ignored', 'alice')).toBe(true);
    expect(result.current.globalFilterFn(formattedRow, 'ignored', 'formatted 2025-12-15')).toBe(
      true
    );
    expect(result.current.globalFilterFn(formattedRow, 'ignored', 'missing')).toBe(false);

    act(() => {
      result.current.clearSearch();
    });

    await waitFor(() => {
      expect(result.current.immediateSearchValue).toBe('');
      expect(result.current.debouncedSearchValue).toBe('');
      expect(result.current.globalFilter).toBe('');
    });

    expect(onSearchChange).toHaveBeenLastCalledWith('');
  });
});
