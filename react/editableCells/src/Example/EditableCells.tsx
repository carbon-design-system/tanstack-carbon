import { useCallback, useMemo, useRef, useState } from 'react';
import { DataTable, TextInput, IconButton } from '@carbon/react';
import { Edit } from '@carbon/icons-react';
import type { Table as TanStackTable, Cell, RowData } from '@tanstack/react-table';
import { useKeyPress } from './hooks/useKeyPress';

const {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} = DataTable;

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { makeData, type Resource } from './makeData';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

const columnHelper = createColumnHelper<Resource>();

interface EditableCellProps {
  tableContainerRef: React.RefObject<HTMLDivElement>;
  table: TanStackTable<Resource>;
  cell: Cell<Resource, unknown>;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  id: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  tabIndex?: number;
}

const EditableCell = ({
  tableContainerRef,
  table,
  cell,
  editingId,
  setEditingId,
  id,
  children,
  style,
  tabIndex,
}: EditableCellProps) => {
  const [editValue, setEditValue] = useState<string | null>(null);
  const [showEditButton, setShowEditButton] = useState(false);
  const cellId = `cell__${id}`;
  const initialValue = String(cell.getValue() ?? '');

  const resetEditState = () => {
    setEditingId(null);
    setEditValue(null);
    setShowEditButton(false);
  };

  const saveAndExitEditMode = () => {
    const nextValue = editValue ?? initialValue;

    if (nextValue !== initialValue) {
      table.options.meta?.updateData(cell.row.index, cell.column.id, nextValue);
    }

    resetEditState();
  };

  const focusCell = (cellElement: HTMLElement) => {
    cellElement.tabIndex = 0;
    cellElement.focus();
  };

  const handleTabNavigation = (e: React.KeyboardEvent, currentCellId: string) => {
    e.preventDefault();
    saveAndExitEditMode();

    // Move to next cell after state update
    setTimeout(() => {
      if (!tableContainerRef.current) return;
      const currentCell = tableContainerRef.current.querySelector(`#${currentCellId}`);
      if (!currentCell) return;

      const sibling = e.shiftKey
        ? currentCell.previousElementSibling
        : currentCell.nextElementSibling;
      
      if (sibling) {
        focusCell(sibling as HTMLElement);
      } else if (!e.shiftKey) {
        // If at end of row, move to first cell of next row
        const parentRow = currentCell.closest('tr');
        if (parentRow?.nextElementSibling) {
          const firstCell = parentRow.nextElementSibling.children[0] as HTMLElement;
          if (firstCell) {
            focusCell(firstCell);
          }
        }
      }
    }, 0);
  };

  const handleEditableCellKeyDown = (event: KeyboardEvent) => {
    // Enter edit mode on Enter, F2, or Space
    if (event.code === 'Enter' || event.code === 'F2' || event.code === 'Space') {
      event.preventDefault();
      setEditingId((event.target as HTMLElement).id);
      return;
    }

    // Start typing to enter edit mode and replace content
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      setEditingId((event.target as HTMLElement).id);
      setEditValue(event.key);
    }
  };

  return editingId === cellId ? (
    <td
      className="editable-cell-editing"
      style={{
        width: style?.width,
      }}>
      <TextInput
        className="editable-cell-input"
        id={cellId}
        labelText="Editable cell"
        hideLabel
        value={editValue ?? initialValue}
        style={style}
        tabIndex={tabIndex}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            handleTabNavigation(e, cellId);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            saveAndExitEditMode();
          } else if (e.key === 'Escape') {
            resetEditState();
          }
        }}
        onBlur={saveAndExitEditMode}
        onChange={(e) => setEditValue(e.target.value)}
      />
    </td>
  ) : (
    <TableCell
      id={cellId}
      // @ts-expect-error TableCell doesn't like passing onKeyDown
      onKeyDown={handleEditableCellKeyDown}
      onMouseEnter={() => setShowEditButton(true)}
      onMouseLeave={() => setShowEditButton(false)}
      onFocus={() => setShowEditButton(true)}
      onBlur={() => setShowEditButton(false)}
      style={style}
      tabIndex={tabIndex}>
      <div className="editable-cell-container">
        <span>{children}</span>
        <IconButton
          label="Edit cell"
          kind="ghost"
          size="sm"
          tabIndex={-1}
          className={`editable-cell-edit-button ${showEditButton ? 'editable-cell-edit-button--visible' : ''}`}
          onClick={() => setEditingId(cellId)}>
          <Edit />
        </IconButton>
      </div>
    </TableCell>
  );
};

export const EditableCells = () => {
  const commandLeft = useKeyPress([
    'MetaLeft+ArrowLeft',
    'MetaRight+ArrowLeft',
  ]);

  const columns = useMemo(() => [
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      cell: (info) => info.getValue(),
      header: () => <span>Name</span>,
    }),
    columnHelper.accessor('rule', {
      header: () => 'Rule',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('status', {
      header: () => <span>Status</span>,
    }),
    columnHelper.accessor('other', {
      header: 'Other',
    }),
    columnHelper.accessor('example', {
      header: 'Example',
    }),
  ], []);
  const tableContainer = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(makeData(7));
  const [editingId, setEditingId] = useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((old) =>
          old.map((row, index) =>
            index === rowIndex
              ? {
                ...row,
                [columnId]: value,
              }
              : row
          )
        );
      },
    },
  });

  type HTMLElementEvent<T extends HTMLElement> = Event & {
    target: T;
  };

  const getActiveCell = useCallback((): HTMLTableCellElement | null => {
    return tableContainer.current?.querySelector('td[tabindex="0"]') ?? null;
  }, []);

  const setActiveCell = useCallback((cell: HTMLTableCellElement | null) => {
    if (editingId) return;

    const activeCell = getActiveCell();

    if (activeCell && activeCell !== cell) {
      activeCell.tabIndex = -1;
    }

    if (!cell) {
      activeCell?.blur();
      return;
    }

    cell.tabIndex = 0;
    cell.focus();
  }, [editingId, getActiveCell]);

  const getCellIndex = (cell: Element | null): number => {
    if (!cell?.parentElement) return -1;
    return Array.prototype.indexOf.call(cell.parentElement.children, cell);
  };

  const navigateCells = (
    activeCellElement: HTMLTableCellElement,
    direction: 'horizontal' | 'vertical',
    forward: boolean
  ) => {
    if (direction === 'horizontal') {
      const sibling = forward
        ? activeCellElement.nextElementSibling
        : activeCellElement.previousElementSibling;

      if (sibling instanceof HTMLTableCellElement) {
        setActiveCell(sibling);
        return;
      }

      if (forward) {
        const parentRow = activeCellElement.closest('tr');
        const firstCell = parentRow?.nextElementSibling?.children[0];

        if (firstCell instanceof HTMLTableCellElement) {
          setActiveCell(firstCell);
        }
      }

      return;
    }

    const parentRow = activeCellElement.closest('tr');
    const activeCellRowIndex = getCellIndex(activeCellElement);
    const targetRow = forward
      ? parentRow?.nextElementSibling
      : parentRow?.previousElementSibling;

    if (!targetRow || activeCellRowIndex < 0) return;

    const targetCell = targetRow.children[activeCellRowIndex];

    if (targetCell instanceof HTMLTableCellElement) {
      setActiveCell(targetCell);
    }
  };

  const handleFocusChange = (event: HTMLElementEvent<HTMLElement>) => {
    const tableBody = tableContainer.current?.querySelector('tbody');

    if (!tableBody?.contains(event.target)) {
      return;
    }

    const targetCell = event.target.closest('td');

    if (targetCell instanceof HTMLTableCellElement) {
      setActiveCell(targetCell);
    }
  };

  const handleKeyDownActiveCell = (event: KeyboardEvent) => {
    const activeCellElement = getActiveCell();

    if (commandLeft) {
      return;
    }

    if (!activeCellElement || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    switch (event.code) {
      case 'ArrowLeft':
        event.preventDefault();
        navigateCells(activeCellElement, 'horizontal', false);
        return;
      case 'ArrowRight':
        event.preventDefault();
        navigateCells(activeCellElement, 'horizontal', true);
        return;
      case 'ArrowUp':
        event.preventDefault();
        navigateCells(activeCellElement, 'vertical', false);
        return;
      case 'ArrowDown':
        event.preventDefault();
        navigateCells(activeCellElement, 'vertical', true);
        return;
      case 'Tab':
        event.preventDefault();
        navigateCells(activeCellElement, 'horizontal', !event.shiftKey);
        return;
      case 'Enter':
        return;
    }
  };

  return (
    <div ref={tableContainer}>
      <TableContainer
        title="Editable cells"
        className="basic-table tanstack-example"
        style={{
          width: table.getCenterTotalSize(),
        }}>
        <Table
          size="lg"
          useZebraStyles={false}
          aria-label="sample table"
          // @ts-expect-error purposefully passing onClick
          onClick={handleFocusChange}
          onKeyDown={!editingId ? handleKeyDownActiveCell : undefined}
          role="grid">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHeader
                    key={header.id}
                    style={{
                      width: header.getSize(),
                    }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHeader>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <EditableCell
                      editingId={editingId}
                      setEditingId={setEditingId}
                      key={cell.id}
                      tabIndex={-1}
                      id={cell.id}
                      cell={cell}
                      table={table}
                      style={{
                        width: cell.column.getSize(),
                      }}
                      tableContainerRef={tableContainer}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </EditableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
