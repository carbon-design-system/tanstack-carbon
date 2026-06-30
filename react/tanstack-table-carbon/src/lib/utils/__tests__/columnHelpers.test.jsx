import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  createSelectionColumn,
  createExpandColumn,
  addExpandColumn,
  enhanceColumnsWithSmartFiltering,
  addSelectionColumn,
} from '../columnHelpers';

vi.mock('@carbon/icons-react', () => ({
  ChevronRight: ({ size, style }) => (
    <div data-testid="chevron-right" data-size={String(size)} data-transform={style?.transform} />
  ),
}));

vi.mock('../../components/selectionCell', () => ({
  SelectionHeader: ({ table, isCheckbox }) => (
    <div
      data-testid="selection-header"
      data-table={table ? 'present' : 'missing'}
      data-is-checkbox={String(Boolean(isCheckbox))}
    />
  ),
  SelectionCell: ({ row, isCheckbox, isRadio }) => (
    <div
      data-testid="selection-cell"
      data-row-id={row?.id}
      data-is-checkbox={String(Boolean(isCheckbox))}
      data-is-radio={String(Boolean(isRadio))}
    />
  ),
}));

describe('columnHelpers', () => {
  it('creates selection column for checkbox and radio modes', () => {
    const checkboxColumn = createSelectionColumn(true, false);
    const radioColumn = createSelectionColumn(false, true);

    expect(checkboxColumn.id).toBe('select');
    expect(checkboxColumn.enableSorting).toBe(false);
    expect(checkboxColumn.enableColumnFilter).toBe(false);

    render(
      <>
        {checkboxColumn.header({ table: {} })}
        {checkboxColumn.cell({ row: { id: 'row-1' } })}
        {radioColumn.cell({ row: { id: 'row-2' } })}
      </>
    );

    expect(screen.getByTestId('selection-header')).toHaveAttribute('data-is-checkbox', 'true');
    expect(screen.getAllByTestId('selection-cell')[0]).toHaveAttribute('data-row-id', 'row-1');
    expect(screen.getAllByTestId('selection-cell')[0]).toHaveAttribute('data-is-checkbox', 'true');
    expect(screen.getAllByTestId('selection-cell')[0]).toHaveAttribute('data-is-radio', 'false');
    expect(screen.getAllByTestId('selection-cell')[1]).toHaveAttribute('data-is-checkbox', 'false');
    expect(screen.getAllByTestId('selection-cell')[1]).toHaveAttribute('data-is-radio', 'true');
  });

  it('creates expand column and handles header and row toggle actions', () => {
    const toggleRow = vi.fn();
    const toggleAllRows = vi.fn();

    const expandedColumn = createExpandColumn(toggleRow, toggleAllRows, true);
    const collapsedColumn = createExpandColumn(toggleRow, toggleAllRows, false);

    expect(expandedColumn.id).toBe('expand');
    expect(expandedColumn.enableSorting).toBe(false);
    expect(expandedColumn.enableColumnFilter).toBe(false);

    render(
      <>
        {expandedColumn.header()}
        {expandedColumn.cell({
          row: {
            id: 'row-1',
            getIsExpanded: () => true,
          },
        })}
        {collapsedColumn.cell({
          row: {
            id: 'row-2',
            getIsExpanded: () => false,
          },
        })}
      </>
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);

    expect(toggleAllRows).toHaveBeenCalled();
    expect(toggleRow).toHaveBeenCalledWith('row-1');
    expect(toggleRow).toHaveBeenCalledWith('row-2');
    expect(screen.getByLabelText('Collapse all rows')).toBeInTheDocument();
    expect(screen.getByLabelText('Collapse row')).toBeInTheDocument();
    expect(screen.getByLabelText('Expand row')).toBeInTheDocument();
  });

  it('adds expand column in first, last, and afterSelection positions', () => {
    const baseColumns = [{ id: 'selection' }, { id: 'name' }];
    const expansion = {
      toggleRow: vi.fn(),
      toggleAllRows: vi.fn(),
      isAllExpanded: false,
    };

    expect(addExpandColumn(baseColumns, null)).toBe(baseColumns);

    const firstColumns = addExpandColumn(baseColumns, expansion, 'first');
    const lastColumns = addExpandColumn(baseColumns, expansion, 'last');
    const afterSelectionColumns = addExpandColumn(baseColumns, expansion, 'afterSelection', true);
    const afterSelectionWithoutSelection = addExpandColumn(
      baseColumns,
      expansion,
      'afterSelection',
      false
    );

    expect(firstColumns[0].id).toBe('expand');
    expect(lastColumns[lastColumns.length - 1].id).toBe('expand');
    expect(afterSelectionColumns[0].id).toBe('selection');
    expect(afterSelectionColumns[1].id).toBe('expand');
    expect(afterSelectionWithoutSelection[0].id).toBe('expand');
  });

  it('enhances columns with smart filtering and preserves existing filterFn', () => {
    const columns = [
      {
        id: 'existing',
        filterFn: vi.fn(() => true),
      },
      {
        id: 'formatted-string',
        cell: ({ getValue }) => `Value: ${getValue()}`,
      },
      {
        id: 'formatted-object',
        cell: () => <span>Rendered Element</span>,
      },
      {
        id: 'throws',
        cell: () => {
          throw new Error('format failure');
        },
      },
      {
        id: 'plain',
      },
    ];

    const enhanced = enhanceColumnsWithSmartFiltering(columns);
    const row = {
      getValue: (columnId) => {
        if (columnId === 'formatted-string') {
          return 'abc123';
        }
        if (columnId === 'formatted-object') {
          return 'raw-object';
        }
        if (columnId === 'throws') {
          return 'safe-raw';
        }
        return 'plain';
      },
    };

    expect(enhanced[0]).toBe(columns[0]);
    expect(enhanced[4]).toBe(columns[4]);

    expect(enhanced[1].filterFn(row, 'formatted-string', 'abc')).toBe(true);
    expect(enhanced[1].filterFn(row, 'formatted-string', 'value: abc123')).toBe(true);
    expect(enhanced[1].filterFn(row, 'formatted-string', 'missing')).toBe(false);

    expect(enhanced[2].filterFn(row, 'formatted-object', 'raw-object')).toBe(true);
    expect(enhanced[2].filterFn(row, 'formatted-object', 'rendered')).toBe(false);

    expect(enhanced[3].filterFn(row, 'throws', 'safe-raw')).toBe(true);
    expect(enhanced[3].filterFn(row, 'throws', 'missing')).toBe(false);
  });

  it('adds selection column only when selection type is provided', () => {
    const baseColumns = [{ id: 'name' }];

    expect(addSelectionColumn(baseColumns, null)).toBe(baseColumns);

    const checkboxColumns = addSelectionColumn(baseColumns, 'checkbox');
    const radioColumns = addSelectionColumn(baseColumns, 'radio');

    expect(checkboxColumns[0].id).toBe('select');
    expect(radioColumns[0].id).toBe('select');
    expect(checkboxColumns[1]).toBe(baseColumns[0]);
    expect(radioColumns[1]).toBe(baseColumns[0]);
  });
});
