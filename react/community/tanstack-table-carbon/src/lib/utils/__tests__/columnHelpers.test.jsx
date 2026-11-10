import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import {
  createSelectionColumn,
  createExpandColumn,
  addExpandColumn,
  addSelectionColumn,
  enhanceColumnsWithSmartFiltering,
} from '../columnHelpers';

vi.mock('../../components/selectionCell', () => ({
  SelectionHeader: ({ _table, isCheckbox, tableId }) => (
    <div
      data-testid="selection-header"
      data-checkbox={isCheckbox}
      data-tableid={tableId}
    />
  ),
  SelectionCell: ({ _row, isCheckbox, isRadio, tableId }) => (
    <div
      data-testid="selection-cell"
      data-checkbox={isCheckbox}
      data-radio={isRadio}
      data-tableid={tableId}
    />
  ),
}));

vi.mock('@carbon/icons-react', () => ({
  ChevronRight: ({ size, className }) => (
    <svg data-testid="chevron" data-size={size} className={className} />
  ),
}));

vi.mock('../columnHelpers.module.scss', () => ({
  default: {
    expandButton: 'expandButton',
    expandIcon: 'expandIcon',
    expandIconExpanded: 'expandIconExpanded',
    expandIconCollapsed: 'expandIconCollapsed',
  },
}));

const makeRow = (id = 'row-1', isExpanded = false) => ({
  id,
  getIsExpanded: vi.fn(() => isExpanded),
});

afterEach(() => {
  cleanup();
});

describe('createSelectionColumn', () => {
  it('returns a column definition with id="select"', () => {
    const col = createSelectionColumn(true, false, 'tbl-1');
    expect(col.id).toBe('select');
    expect(col.size).toBe(48);
    expect(col.enableSorting).toBe(false);
    expect(col.enableColumnFilter).toBe(false);
  });

  it('renders SelectionHeader via header function', () => {
    const col = createSelectionColumn(true, false, 'tbl-1');
    const { render, screen } = require('@testing-library/react');
    render(col.header({ table: {} }));
    expect(screen.getByTestId('selection-header')).toBeInTheDocument();
  });

  it('renders SelectionCell via cell function', () => {
    const col = createSelectionColumn(false, true, 'tbl-1');
    const { render, screen } = require('@testing-library/react');
    render(col.cell({ row: makeRow() }));
    expect(screen.getByTestId('selection-cell')).toBeInTheDocument();
  });
});

describe('createExpandColumn', () => {
  it('returns a column definition with id="expand"', () => {
    const col = createExpandColumn(vi.fn(), vi.fn(), false);
    expect(col.id).toBe('expand');
    expect(col.enableSorting).toBe(false);
    expect(col.enableColumnFilter).toBe(false);
  });

  it('header button calls toggleAllRows on click', () => {
    const { render, screen, fireEvent } = require('@testing-library/react');
    const toggleAllRows = vi.fn();
    const col = createExpandColumn(vi.fn(), toggleAllRows, false);
    render(col.header());
    fireEvent.click(screen.getByRole('button'));
    expect(toggleAllRows).toHaveBeenCalled();
  });

  it('header button has correct aria-label when not all expanded', () => {
    const { render, screen } = require('@testing-library/react');
    const col = createExpandColumn(vi.fn(), vi.fn(), false);
    render(col.header());
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Expand all rows'
    );
  });

  it('header button has correct aria-label when all expanded', () => {
    const { render, screen } = require('@testing-library/react');
    const col = createExpandColumn(vi.fn(), vi.fn(), true);
    render(col.header());
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Collapse all rows'
    );
  });

  it('cell button calls toggleRow with row.id on click', () => {
    const { render, screen, fireEvent } = require('@testing-library/react');
    const toggleRow = vi.fn();
    const col = createExpandColumn(toggleRow, vi.fn(), false);
    render(col.cell({ row: makeRow('row-42') }));
    fireEvent.click(screen.getByRole('button'));
    expect(toggleRow).toHaveBeenCalledWith('row-42');
  });

  it('cell button aria-label reflects expanded state', () => {
    const { render, screen } = require('@testing-library/react');
    const col = createExpandColumn(vi.fn(), vi.fn(), false);
    render(col.cell({ row: makeRow('r1', true) }));
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Collapse row'
    );
  });
});

describe('addExpandColumn', () => {
  const expansion = {
    toggleRow: vi.fn(),
    toggleAllRows: vi.fn(),
    isAllExpanded: false,
  };
  const columns = [{ id: 'a' }, { id: 'b' }];

  it('returns original columns when expansion is null', () => {
    expect(addExpandColumn(columns, null)).toBe(columns);
  });

  it('adds expand column at the start by default', () => {
    const result = addExpandColumn(columns, expansion);
    expect(result[0].id).toBe('expand');
    expect(result).toHaveLength(3);
  });

  it('adds expand column at the end when position="last"', () => {
    const result = addExpandColumn(columns, expansion, 'last');
    expect(result[result.length - 1].id).toBe('expand');
  });

  it('adds expand column after selection when position="afterSelection" and hasSelection=true', () => {
    const cols = [{ id: 'select' }, { id: 'name' }];
    const result = addExpandColumn(cols, expansion, 'afterSelection', true);
    expect(result[0].id).toBe('select');
    expect(result[1].id).toBe('expand');
    expect(result[2].id).toBe('name');
  });

  it('falls back to first position when position="afterSelection" but hasSelection=false', () => {
    const result = addExpandColumn(columns, expansion, 'afterSelection', false);
    expect(result[0].id).toBe('expand');
  });
});

describe('addSelectionColumn', () => {
  it('returns original columns when selectionType is null', () => {
    const cols = [{ id: 'name' }];
    expect(addSelectionColumn(cols, null)).toBe(cols);
  });

  it('prepends selection column for checkbox type', () => {
    const cols = [{ id: 'name' }];
    const result = addSelectionColumn(cols, 'checkbox', 'tbl-1');
    expect(result[0].id).toBe('select');
    expect(result).toHaveLength(2);
  });

  it('prepends selection column for radio type', () => {
    const cols = [{ id: 'name' }];
    const result = addSelectionColumn(cols, 'radio', 'tbl-1');
    expect(result[0].id).toBe('select');
  });
});

describe('enhanceColumnsWithSmartFiltering', () => {
  it('returns column unchanged when filterFn already defined', () => {
    const col = { id: 'a', filterFn: vi.fn() };
    const result = enhanceColumnsWithSmartFiltering([col]);
    expect(result[0]).toBe(col);
  });

  it('returns column unchanged when no filterVariant and no cell formatter', () => {
    const col = { id: 'a' };
    const result = enhanceColumnsWithSmartFiltering([col]);
    expect(result[0]).toBe(col);
  });

  describe('dateRange filterFn', () => {
    const col = {
      id: 'date',
      accessorKey: 'date',
      meta: { filterVariant: 'dateRange' },
    };
    const [enhanced] = enhanceColumnsWithSmartFiltering([col]);

    it('returns true when filterValue is null', () => {
      expect(enhanced.filterFn({}, 'date', null)).toBe(true);
    });

    it('returns true when filterValue has no start and no end', () => {
      expect(enhanced.filterFn({}, 'date', {})).toBe(true);
    });

    it('returns false when raw value is missing', () => {
      const row = { original: {} };
      expect(
        enhanced.filterFn(row, 'date', { start: new Date('2024-01-01') })
      ).toBe(false);
    });

    it('returns true when date is within range', () => {
      const row = { original: { date: '2024-06-15' } };
      expect(
        enhanced.filterFn(row, 'date', {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        })
      ).toBe(true);
    });

    it('returns false when date is outside range', () => {
      const row = { original: { date: '2023-01-01' } };
      expect(
        enhanced.filterFn(row, 'date', {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        })
      ).toBe(false);
    });

    it('supports ISO timestamp values', () => {
      const row = { original: { date: '2024-06-15T12:00:00+00:00' } };
      expect(
        enhanced.filterFn(row, 'date', {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        })
      ).toBe(true);
    });
  });

  describe('date filterFn', () => {
    const col = {
      id: 'dob',
      accessorKey: 'dob',
      meta: { filterVariant: 'date' },
    };
    const [enhanced] = enhanceColumnsWithSmartFiltering([col]);

    it('returns true when filterValue is null', () => {
      expect(enhanced.filterFn({}, 'dob', null)).toBe(true);
    });

    it('returns false when raw value is missing', () => {
      expect(
        enhanced.filterFn({ original: {} }, 'dob', new Date('2024-06-15'))
      ).toBe(false);
    });

    it('returns true when dates match', () => {
      const row = { original: { dob: '2024-06-15' } };
      expect(enhanced.filterFn(row, 'dob', new Date('2024-06-15'))).toBe(true);
    });

    it('returns false when dates do not match', () => {
      const row = { original: { dob: '2024-06-15' } };
      expect(enhanced.filterFn(row, 'dob', new Date('2024-06-16'))).toBe(false);
    });
  });

  describe('slider filterFn', () => {
    const col = { id: 'age', meta: { filterVariant: 'slider' } };
    const [enhanced] = enhanceColumnsWithSmartFiltering([col]);

    it('returns true when filterValue is null', () => {
      expect(enhanced.filterFn({}, 'age', null)).toBe(true);
    });

    it('returns true when value is NaN', () => {
      const row = { getValue: () => 'abc' };
      expect(enhanced.filterFn(row, 'age', { min: 10, max: 50 })).toBe(true);
    });

    it('returns true when value is within range', () => {
      const row = { getValue: () => 30 };
      expect(enhanced.filterFn(row, 'age', { min: 10, max: 50 })).toBe(true);
    });

    it('returns false when value is outside range', () => {
      const row = { getValue: () => 5 };
      expect(enhanced.filterFn(row, 'age', { min: 10, max: 50 })).toBe(false);
    });
  });

  describe('number filterFn', () => {
    const col = { id: 'count', meta: { filterVariant: 'number' } };
    const [enhanced] = enhanceColumnsWithSmartFiltering([col]);

    it('returns true for empty filterValue', () => {
      const row = { getValue: () => 5 };
      expect(enhanced.filterFn(row, 'count', '')).toBe(true);
      expect(enhanced.filterFn(row, 'count', null)).toBe(true);
      expect(enhanced.filterFn(row, 'count', undefined)).toBe(true);
    });

    it('returns true when value matches', () => {
      const row = { getValue: () => 42 };
      expect(enhanced.filterFn(row, 'count', 42)).toBe(true);
    });

    it('returns false when value does not match', () => {
      const row = { getValue: () => 10 };
      expect(enhanced.filterFn(row, 'count', 42)).toBe(false);
    });
  });

  describe('radio filterFn', () => {
    const col = { id: 'gender', meta: { filterVariant: 'radio' } };
    const [enhanced] = enhanceColumnsWithSmartFiltering([col]);

    it('matches exact value only, not substrings', () => {
      const maleRow = { getValue: () => 'Male' };
      const femaleRow = { getValue: () => 'Female' };
      expect(enhanced.filterFn(maleRow, 'gender', '')).toBe(true);
      expect(enhanced.filterFn(maleRow, 'gender', 'Male')).toBe(true);
      expect(enhanced.filterFn(femaleRow, 'gender', 'Male')).toBe(false);
      expect(enhanced.filterFn(femaleRow, 'gender', 'Female')).toBe(true);
    });
  });

  describe('select filterFn', () => {
    const col = { id: 'location', meta: { filterVariant: 'select' } };
    const [enhanced] = enhanceColumnsWithSmartFiltering([col]);

    it('matches exact value only, not substrings', () => {
      const newYorkRow = { getValue: () => 'New York' };
      const yorkRow = { getValue: () => 'York' };
      expect(enhanced.filterFn(newYorkRow, 'location', null)).toBe(true);
      expect(enhanced.filterFn(newYorkRow, 'location', 'York')).toBe(false);
      expect(enhanced.filterFn(yorkRow, 'location', 'York')).toBe(true);
    });
  });

  describe('time filterFn', () => {
    const col = { id: 'time', meta: { filterVariant: 'time' } };
    const [enhanced] = enhanceColumnsWithSmartFiltering([col]);

    it('returns true when filterValue is falsy', () => {
      expect(enhanced.filterFn({ getValue: () => '09:30' }, 'time', '')).toBe(
        true
      );
    });

    it('returns false when raw is empty', () => {
      expect(
        enhanced.filterFn({ getValue: () => null }, 'time', '09:30 AM')
      ).toBe(false);
    });

    it('returns true when raw is contained in filter', () => {
      expect(
        enhanced.filterFn({ getValue: () => '09:30' }, 'time', '09:30 AM')
      ).toBe(true);
    });

    it('returns true when filter is contained in raw', () => {
      expect(
        enhanced.filterFn({ getValue: () => '09:30 AM' }, 'time', '09:30')
      ).toBe(true);
    });
  });

  describe('cell formatter filterFn', () => {
    it('matches by raw value', () => {
      const col = {
        id: 'name',
        cell: ({ getValue }) => getValue().toUpperCase(),
      };
      const [enhanced] = enhanceColumnsWithSmartFiltering([col]);
      const row = { getValue: () => 'alice', original: {} };
      expect(enhanced.filterFn(row, 'name', 'ali')).toBe(true);
    });

    it('matches by formatted string value', () => {
      const col = {
        id: 'name',
        cell: ({ getValue }) => getValue().toUpperCase(),
      };
      const [enhanced] = enhanceColumnsWithSmartFiltering([col]);
      const row = { getValue: () => 'alice', original: {} };
      expect(enhanced.filterFn(row, 'name', 'ALICE')).toBe(true);
    });

    it('returns false when formatted value is a non-string object', () => {
      const col = { id: 'name', cell: () => ({ type: 'jsx' }) };
      const [enhanced] = enhanceColumnsWithSmartFiltering([col]);
      const row = { getValue: () => 'xyz', original: {} };
      expect(enhanced.filterFn(row, 'name', 'abc')).toBe(false);
    });

    it('returns false when neither raw nor formatted matches', () => {
      const col = { id: 'name', cell: ({ getValue }) => getValue() };
      const [enhanced] = enhanceColumnsWithSmartFiltering([col]);
      const row = { getValue: () => 'alice', original: {} };
      expect(enhanced.filterFn(row, 'name', 'zzz')).toBe(false);
    });

    it('handles cell formatter that throws', () => {
      const col = {
        id: 'name',
        cell: () => {
          throw new Error('boom');
        },
      };
      const [enhanced] = enhanceColumnsWithSmartFiltering([col]);
      const row = { getValue: () => 'alice', original: {} };
      expect(enhanced.filterFn(row, 'name', 'zzz')).toBe(false);
    });
  });
});
