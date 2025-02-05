import { useState, useRef, useEffect } from 'react';
import { DataTable, TextInput } from '@carbon/react';
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
import { makeData } from './makeData';
import { useKeyPress } from './hooks/useKeyPress';

type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
};

const EditableCell = ({
  tableContainerRef,
  table,
  cell,
  editingId,
  setEditingId,
  id,
  children,
  ...rest
}) => {
  const [editValue, setEditValue] = useState(null);
  const handleEditableCellKeyDown = (event: KeyboardEvent) => {
    if (event.code !== 'Enter') return;
    setEditingId((event.target as HTMLElement).id);
  };

  const handleEditModeKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Enter' || event.code === 'Escape') {
      table.options.meta?.updateData(
        cell.row.index,
        cell.column.id,
        editValue ?? cell.getValue()
      );
      setEditingId(null);
      // This is sketchy, refactor later
      setTimeout(() => {
        const activeCell = tableContainerRef?.current.querySelector(
          `#cell__${id}`
        );
        activeCell.tabIndex = 0;
        activeCell.focus();
      }, 10);
    }
  };

  const { style } = rest;

  return editingId === `cell__${id}` ? (
    <td
      style={{
        width: style?.width,
        padding: 0,
      }}>
      <TextInput
        className="editable-cell-input"
        id={`cell__${id}`}
        labelText="Editable cell"
        hideLabel
        value={editValue ?? cell.getValue()}
        {...rest}
        autoFocus
        style={{
          height: 48 - 1, // account for border to prevent extra 1px height added to cell
        }}
        onBlur={() => {
          // Save cell data
          table.options.meta?.updateData(
            cell.row.index,
            cell.column.id,
            editValue ?? cell.getValue()
          );
          setEditingId(null);
        }}
        onChange={(e) => setEditValue(e.target.value)}
        // @ts-expect-error TextInput doesn't like passing onKeyDown
        onKeyDown={handleEditModeKeyDown}
      />
    </td>
  ) : (
    <TableCell
      id={`cell__${id}`}
      // @ts-expect-error TextInput doesn't like passing onKeyDown
      onKeyDown={handleEditableCellKeyDown}
      {...rest}>
      {children}
    </TableCell>
  );
};

export const EditableCells = () => {
  const columnHelper = createColumnHelper<Resource>();

  const commandLeft = useKeyPress([
    'MetaLeft+ArrowLeft',
    'MetaRight+ArrowLeft',
  ]);
  const captureCommandLeft = useRef<boolean>(false);

  useEffect(() => {
    captureCommandLeft.current = commandLeft;
  }, [commandLeft]);

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
  const tableContainer = useRef<HTMLDivElement>();
  const [data, setData] = useState(makeData(7));
  const [editingId, setEditingId] = useState(null);

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
    if (editingId) return;
    const allTableCells = tableContainer.current.querySelectorAll('td');
    allTableCells.forEach((cell) => {
      cell.tabIndex = -1;
    });
    (document.activeElement as HTMLElement).blur();
  };

  const getActiveCell = () => {
    const activeCellElement =
      tableContainer.current.querySelector('td[tabindex="0"]');
    return activeCellElement;
  };

  const addActiveCell = (target: Element) => {
    if (editingId) return;
    const activeCell = target.closest('td');
    activeCell.tabIndex = 0;
    activeCell.focus();
  };

  const handleFocusChange = (event: HTMLElementEvent<HTMLElement>) => {
    if (tableContainer?.current) {
      const tableBody = tableContainer?.current.querySelector('tbody');
      if (!tableBody.contains(event.target)) {
        return;
      }
    }
    removeActiveCell();
    addActiveCell(event.target);
  };

  const getChildElementIndex = (node: Element) => {
    return Array.prototype.indexOf.call(node.parentNode.children, node);
  };

  const handleKeyDownActiveCell = (event: KeyboardEvent) => {
    event.preventDefault();
    const key = event.code;
    const activeCellElement = getActiveCell();
    if (commandLeft) {
      return;
    }
    // Don't enter switch if there is no active cell
    if (!getActiveCell()) return;
    switch (key) {
      case 'ArrowLeft': {
        // Prevent scrolling
        event.preventDefault();
        if (activeCellElement.previousElementSibling) {
          removeActiveCell();
          addActiveCell(activeCellElement.previousElementSibling);
        }
        return;
      }
      case 'ArrowRight': {
        // Prevent scrolling
        event.preventDefault();
        if (activeCellElement.nextElementSibling) {
          removeActiveCell();
          addActiveCell(activeCellElement.nextElementSibling);
        }
        return;
      }
      case 'ArrowUp': {
        // Prevent scrolling
        event.preventDefault();
        const parentRow = getActiveCell().closest('tr');
        const activeCellRowIndex = getChildElementIndex(getActiveCell());
        if (parentRow.previousElementSibling) {
          const newParentRow = parentRow.previousElementSibling;
          const newRowCells = newParentRow.children;
          removeActiveCell();
          addActiveCell(newRowCells[activeCellRowIndex]);
        }
        return;
      }
      case 'ArrowDown': {
        // Prevent scrolling
        event.preventDefault();
        const parentRow = getActiveCell().closest('tr');
        const activeCellRowIndex = getChildElementIndex(getActiveCell());
        if (parentRow.nextElementSibling) {
          const newParentRow = parentRow.nextElementSibling;
          const newRowCells = newParentRow.children;
          removeActiveCell();
          addActiveCell(newRowCells[activeCellRowIndex]);
        }
        return;
      }
      case 'Tab': {
        removeActiveCell();
        return;
      }
      case 'Enter': {
        return;
      }
    }
  };

  const handleMultiKeyPress = () => {
    console.log('multi');
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
          onKeyDown={
            !editingId
              ? commandLeft
                ? handleMultiKeyPress
                : handleKeyDownActiveCell
              : undefined
          }
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
