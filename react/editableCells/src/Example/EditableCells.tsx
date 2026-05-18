import { useState, useRef } from 'react';
import { DataTable, TextInput, IconButton } from '@carbon/react';
import { Edit } from '@carbon/icons-react';
import type { Table as TanStackTable, Cell, TableMeta } from '@tanstack/react-table';

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
import { useKeyPress } from './hooks/useKeyPress';

interface CustomTableMeta extends TableMeta<Resource> {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}

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
  ...rest
}: EditableCellProps) => {
  const [editValue, setEditValue] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const cellId = `cell__${id}`;

  const resetEditState = () => {
    setEditingId(null);
    setEditValue(null);
    setIsHovered(false);
  };

  const saveAndExitEditMode = () => {
    (table.options.meta as CustomTableMeta | undefined)?.updateData?.(
      cell.row.index,
      cell.column.id,
      editValue ?? cell.getValue()
    );
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

  const { style } = rest;

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
        value={editValue ?? String(cell.getValue() ?? '')}
        {...rest}
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      {...rest}>
      <div className="editable-cell-container">
        <span>{children}</span>
        <IconButton
          label="Edit cell"
          kind="ghost"
          size="sm"
          tabIndex={-1}
          className={`editable-cell-edit-button ${isHovered ? 'editable-cell-edit-button--visible' : ''}`}
          onClick={() => setEditingId(cellId)}>
          <Edit />
        </IconButton>
      </div>
    </TableCell>
  );
};

export const EditableCells = () => {
  const columnHelper = createColumnHelper<Resource>();

  const commandLeft = useKeyPress([
    'MetaLeft+ArrowLeft',
    'MetaRight+ArrowLeft',
  ]);

  const columns = [
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
  ];
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
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    },
  });

  type HTMLElementEvent<T extends HTMLElement> = Event & {
    target: T;
  };

  const removeActiveCell = () => {
    if (editingId || !tableContainer.current) return;
    const allTableCells = tableContainer.current.querySelectorAll('td');
    allTableCells.forEach((cell) => {
      cell.tabIndex = -1;
    });
    (document.activeElement as HTMLElement)?.blur();
  };

  const getActiveCell = (): Element | null => {
    if (!tableContainer.current) return null;
    const activeCellElement =
      tableContainer.current.querySelector('td[tabindex="0"]');
    return activeCellElement;
  };

  const addActiveCell = (target: Element) => {
    if (editingId) return;
    const activeCell = target.closest('td');
    if (!activeCell) return;
    activeCell.tabIndex = 0;
    activeCell.focus();
  };

  const navigateCells = (activeCellElement: Element, direction: 'horizontal' | 'vertical', forward: boolean) => {
    removeActiveCell();
    
    if (direction === 'horizontal') {
      const sibling = forward
        ? activeCellElement.nextElementSibling
        : activeCellElement.previousElementSibling;
      
      if (sibling) {
        addActiveCell(sibling);
      } else if (forward) {
        // If at end of row, move to first cell of next row
        const parentRow = activeCellElement.closest('tr');
        if (parentRow?.nextElementSibling) {
          const firstCell = parentRow.nextElementSibling.children[0];
          if (firstCell) {
            addActiveCell(firstCell);
          }
        }
      }
    } else {
      // Vertical navigation
      const parentRow = activeCellElement.closest('tr');
      const activeCellRowIndex = getChildElementIndex(activeCellElement);
      const targetRow = forward ? parentRow?.nextElementSibling : parentRow?.previousElementSibling;
      
      if (targetRow && activeCellRowIndex >= 0) {
        const targetCell = targetRow.children[activeCellRowIndex];
        if (targetCell) {
          addActiveCell(targetCell);
        }
      }
    }
  };

  const handleFocusChange = (event: HTMLElementEvent<HTMLElement>) => {
    if (tableContainer?.current) {
      const tableBody = tableContainer?.current.querySelector('tbody');
      if (!tableBody?.contains(event.target)) {
        return;
      }
    }
    removeActiveCell();
    addActiveCell(event.target);
  };

  const getChildElementIndex = (node: Element | null): number => {
    if (!node?.parentNode) return -1;
    return Array.prototype.indexOf.call(node.parentNode.children, node);
  };

  const handleKeyDownActiveCell = (event: KeyboardEvent) => {
    const key = event.code;
    const activeCellElement = getActiveCell();

    if (commandLeft) {
      return;
    }

    // Don't enter switch if there is no active cell
    if (!activeCellElement) return;

    // Prevent default for navigation keys
    event.preventDefault();

    switch (key) {
      case 'ArrowLeft':
        navigateCells(activeCellElement, 'horizontal', false);
        return;
      case 'ArrowRight':
        navigateCells(activeCellElement, 'horizontal', true);
        return;
      case 'ArrowUp':
        navigateCells(activeCellElement, 'vertical', false);
        return;
      case 'ArrowDown':
        navigateCells(activeCellElement, 'vertical', true);
        return;
      case 'Tab':
        navigateCells(activeCellElement, 'horizontal', true);
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
