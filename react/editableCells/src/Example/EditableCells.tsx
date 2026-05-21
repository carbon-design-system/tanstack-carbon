import { useCallback, useEffect,  useMemo, useRef, useState } from 'react';
import { DataTable, TextInput, NumberInput, Dropdown, IconButton } from '@carbon/react';
import { Edit, CaretSort, ChevronDown } from '@carbon/icons-react';
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
import { makeData, ruleOptions, statusOptions, type Resource } from './makeData';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

const columnHelper = createColumnHelper<Resource>();

type CellType = 'text' | 'number' | 'selection';

interface SelectOption {
  id: string;
  text: string;
}

interface CellConfig {
  type?: CellType;
  selectOptions?: SelectOption[];
  validator?: (value: unknown) => boolean;
  invalidText?: string;
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
  config?: CellConfig;
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
  config,
}: EditableCellProps) => {
  const cellType = config?.type || 'text';
  const [editValue, setEditValue] = useState<string | number | SelectOption | null>(null);
  const [initialValue, setInitialValue] = useState(cell.getValue());
  const [showEditButton, setShowEditButton] = useState(false);
  const cellId = `cell__${id}`;
  const currentValue = cell.getValue();
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  // Update initialValue when cell value changes externally
  useEffect(() => {
    if (editingId !== cellId) {
      setInitialValue(currentValue);
    }
  }, [currentValue, editingId, cellId]);

  const resetEditState = () => {
    setEditingId(null);
    setEditValue(null);
    setShowEditButton(false);
  };

  const focusInputByCellType = () => {
    if (cellType === 'selection') {
      dropdownRef.current?.click();
    } else if (cellType === 'number') {
      numberInputRef.current?.focus();
    } else if (cellType === 'text') {
      textInputRef.current?.focus();
    }
  };

  const saveAndExitEditMode = useCallback(() => {
    const nextValue = editValue ?? initialValue;

    // Validate if validator is provided
    if (config?.validator && config.validator(nextValue)) {
      // Invalid - revert to initial value and don't save
      setEditValue(initialValue as string | number | SelectOption);
      return;
    }

    if (nextValue !== initialValue) {
      table.options.meta?.updateData(cell.row.index, cell.column.id, nextValue);
      setInitialValue(nextValue);
    }

    resetEditState();
  }, [editValue, initialValue, config, table, cell]);

  const focusCell = (cellElement: HTMLElement) => {
    cellElement.tabIndex = 0;
    cellElement.focus();
  };

  const sendFocusBackToTable = useCallback(() => {
    const tableElement = tableContainerRef.current?.querySelector('table');
    tableElement?.focus();
  }, [tableContainerRef]);

  const getNextCellId = useCallback((key: string, shiftKey: boolean = false) => {
    const rows = table.getRowModel().rows;
    const columns = table.getAllColumns();
    const currentRowIndex = cell.row.index;
    const currentColIndex = columns.findIndex(col => col.id === cell.column.id);

    if (key === 'Tab') {
      if (shiftKey) {
        // Move to previous cell
        if (currentColIndex > 0) {
          return `cell__${rows[currentRowIndex].id}_${columns[currentColIndex - 1].id}`;
        }
      } else {
        // Move to next cell
        if (currentColIndex < columns.length - 1) {
          return `cell__${rows[currentRowIndex].id}_${columns[currentColIndex + 1].id}`;
        } else if (currentRowIndex < rows.length - 1) {
          // Move to first cell of next row
          return `cell__${rows[currentRowIndex + 1].id}_${columns[0].id}`;
        }
      }
    } else if (key === 'Enter') {
      // Move to cell below
      if (currentRowIndex < rows.length - 1) {
        return `cell__${rows[currentRowIndex + 1].id}_${columns[currentColIndex].id}`;
      }
    }
    return null;
  }, [table, cell]);

  const handleTabNavigation = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();

    // Validate before saving
    const nextValue = editValue ?? initialValue;
    if (config?.validator && config.validator(nextValue)) {
      // Invalid - don't navigate
      return;
    }

    saveAndExitEditMode();

    // Use getNextCellId to determine next cell
    const nextCellId = getNextCellId('Tab', e.shiftKey);

    // Move to next cell after state update
    setTimeout(() => {
      if (!tableContainerRef.current || !nextCellId) return;
      const nextCell = tableContainerRef.current.querySelector(`#${nextCellId}`);
      if (nextCell instanceof HTMLElement) {
        focusCell(nextCell);
      }
    }, 0);
  }, [editValue, initialValue, config, saveAndExitEditMode, tableContainerRef, getNextCellId]);

  const handleEditableCellKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't enter edit mode for selection type on Space (it opens dropdown)
    if (cellType === 'selection' && event.code === 'Space') {
      return;
    }

    // Enter edit mode on Enter, F2, or Space
    if (event.code === 'Enter' || event.code === 'F2' || event.code === 'Space') {
      event.preventDefault();
      setEditingId((event.target as HTMLElement).id);

      // Auto-open dropdown for selection type
      if (cellType === 'selection') {
        setTimeout(() => {
          focusInputByCellType();
        }, 10);
      }
      return;
    }

    // Start typing to enter edit mode and replace content (only for text/number)
    if (cellType !== 'selection' && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      setEditingId((event.target as HTMLElement).id);
      setEditValue(event.key);
    }
  }, [cellType, setEditingId]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (editingId === cellId) {
      setTimeout(() => {
        focusInputByCellType();
      }, 0);
    }
  }, [editingId, cellId, cellType]);

  const getIconForCellType = () => {
    const icons = { text: Edit, number: CaretSort, selection: ChevronDown };
    return icons[cellType] || Edit;
  };

  // Shared keyboard handler for text and number inputs
  const handleInputKeyDown = (e: React.KeyboardEvent, isInvalid: boolean) => {
    if (e.key === 'Tab') {
      handleTabNavigation(e);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!isInvalid) {
        saveAndExitEditMode();
        const nextCellId = getNextCellId('Enter');
        setTimeout(() => {
          if (nextCellId && tableContainerRef.current) {
            const nextCell = tableContainerRef.current.querySelector(`#${nextCellId}`);
            if (nextCell instanceof HTMLElement) {
              focusCell(nextCell);
            }
          } else {
            sendFocusBackToTable();
          }
        }, 0);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditValue(initialValue as string | number | SelectOption);
      resetEditState();
      sendFocusBackToTable();
    }
  };

  const renderEditingCell = () => {
    const isInvalid = config?.validator?.(editValue ?? initialValue);
    const commonProps = {
      className: "editable-cell-input",
      id: cellId,
      hideLabel: true,
      style,
      tabIndex,
    };

    switch (cellType) {
      case 'number':
        const numValue = editValue !== null
          ? (typeof editValue === 'number' ? editValue : Number(editValue))
          : (initialValue ? Number(initialValue) : 0);

        return (
          <NumberInput
            {...commonProps}
            label="Editable number cell"
            defaultValue={numValue}
            invalid={isInvalid}
            invalidText={config?.invalidText || 'Invalid value'}
            onKeyDown={(e) => handleInputKeyDown(e, isInvalid)}
            onBlur={(e) => {
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (relatedTarget?.closest('.cds--number__controls')) return;
              saveAndExitEditMode();
            }}
            onChange={(e, { value }) => setEditValue(value)}
            ref={numberInputRef}
          />
        );

      case 'selection':
        const initialOption = config?.selectOptions?.find(
          opt => opt.id === String(initialValue || '')
        ) || null;

        return (
          <Dropdown
            {...commonProps}
            label="Editable select cell"
            titleText="Editable select cell"
            items={config?.selectOptions || []}
            itemToString={(item) => (item ? (item as SelectOption).text : '')}
            initialSelectedItem={initialOption}
            ref={dropdownRef}
            onChange={({ selectedItem }) => {
              if (selectedItem) {
                const option = selectedItem as SelectOption;
                setEditValue(option);
                setTimeout(() => {
                  table.options.meta?.updateData(cell.row.index, cell.column.id, option.id);
                  setInitialValue(option.id);
                  resetEditState();
                  sendFocusBackToTable();
                }, 10);
              }
            }}
            downshiftProps={{
              onStateChange: (state) => {
                if (state.isOpen === false) {
                  setTimeout(() => {
                    resetEditState();
                    sendFocusBackToTable();
                  }, 100);
                }
              },
            }}
          />
        );

      default: // text
        return (
          <TextInput
            {...commonProps}
            labelText="Editable cell"
            value={String(editValue ?? initialValue ?? '')}
            invalid={isInvalid}
            invalidText={config?.invalidText || 'Invalid value'}
            onKeyDown={(e) => handleInputKeyDown(e, isInvalid)}
            onBlur={saveAndExitEditMode}
            onChange={(e) => setEditValue(e.target.value)}
            ref={textInputRef}
          />
        );
    }
  };

  return editingId === cellId ? (
    <TableCell
      className="editable-cell-editing"
      style={{
        width: style?.width,
      }}>
      {renderEditingCell()}
    </TableCell>
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
          onClick={() => {
            setEditingId(cellId);
          }}>
          {(() => {
            const Icon = getIconForCellType();
            return <Icon size={16} />;
          })()}
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

  // Define cell configurations for different column types
  const cellConfigs: Record<string, CellConfig> = useMemo(() => ({
    name: {
      type: 'text',
    },
    rule: {
      type: 'selection',
      selectOptions: ruleOptions,
    },
    status: {
      type: 'selection',
      selectOptions: statusOptions,
    },
    other: {
      type: 'text',
    },
    example: {
      type: 'number',
      validator: (value) => {
        const num = Number(value);
        return isNaN(num) || num < 0;
      },
      invalidText: 'Please enter a positive number',
    },
  }), []);

  // Helper to display selection cell values
  const getSelectionDisplayValue = (columnId: string, value: string | null) => {
    if (!value) return '';
    const option = cellConfigs[columnId]?.selectOptions?.find(opt => opt.id === value);
    return option ? option.text : value;
  };

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: "Name",

    }),
    columnHelper.accessor('rule', {
      header: 'Rule',
      cell: (info) => getSelectionDisplayValue('rule', info.getValue() as string | null),

    }),
    columnHelper.accessor('status', {
      header: "Status",
      cell: (info) => getSelectionDisplayValue('status', info.getValue() as string | null),

    }),
    columnHelper.accessor('other', {
      header: 'Other',

    }),
    columnHelper.accessor('example', {
      header: 'Example',

    }),
  ], [cellConfigs]);
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
                      config={cellConfigs[cell.column.id]}
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
