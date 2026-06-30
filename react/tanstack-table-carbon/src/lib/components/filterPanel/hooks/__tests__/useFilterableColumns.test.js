import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFilterableColumns } from '../useFilterableColumns';

const createColumn = ({ id, header, canFilter = true, filterVariant, uniqueValues = [] } = {}) => ({
  id,
  getCanFilter: () => canFilter,
  getFacetedUniqueValues: () => new Map(uniqueValues.map((value) => [value, 1])),
  columnDef: {
    header,
    meta: filterVariant ? { filterVariant } : {},
  },
});

describe('useFilterableColumns', () => {
  it('returns only filterable columns when search term is empty', () => {
    const columns = [
      createColumn({ id: 'name', header: 'Name' }),
      createColumn({ id: 'hidden', header: 'Hidden', canFilter: false }),
    ];

    const { result } = renderHook(() => useFilterableColumns({ columns, searchTerm: '' }));

    expect(result.current.filterableColumns).toHaveLength(1);
    expect(result.current.searchedColumns).toEqual([
      {
        column: columns[0],
        matchedByLabel: false,
      },
    ]);
  });

  it('matches by header/id, by searchable option values, and excludes non-matches', () => {
    const columns = [
      createColumn({ id: 'status', header: 'Status', filterVariant: 'select' }),
      createColumn({
        id: 'priority',
        header: 'Priority',
        filterVariant: 'checkbox',
        uniqueValues: ['High', 'Low'],
      }),
      createColumn({
        id: 'age',
        header: 'Age',
        filterVariant: 'number',
        uniqueValues: ['10', '20'],
      }),
    ];

    const { result } = renderHook(() => useFilterableColumns({ columns, searchTerm: 'high' }));

    expect(result.current.searchedColumns).toEqual([
      {
        column: columns[1],
        matchedByLabel: false,
      },
    ]);

    const { result: labelResult } = renderHook(() =>
      useFilterableColumns({ columns, searchTerm: 'stat' })
    );

    expect(labelResult.current.searchedColumns).toEqual([
      {
        column: columns[0],
        matchedByLabel: true,
      },
    ]);
  });
});
