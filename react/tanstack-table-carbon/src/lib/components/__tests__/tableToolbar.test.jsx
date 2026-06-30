import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useResponsiveBatchActions from '../../hooks/useResponsiveBatchActions';
import TableToolbar from '../tableToolbar';

vi.mock('../../hooks/useResponsiveBatchActions', () => ({
  default: vi.fn(),
}));

vi.mock('./scss/tableToolbar.module.scss', () => ({
  default: {
    tblToolbar: 'tblToolbar',
    tblToolbarContent: 'tblToolbarContent',
    settingsMenu: 'settingsMenu',
    bactActionOverflowMenuUl: 'bactActionOverflowMenuUl',
    batchActionOverflowBtn: 'batchActionOverflowBtn',
  },
}));

vi.mock('@carbon/icons-react', () => ({
  Filter: () => <svg data-testid="filter-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
}));

vi.mock('@carbon/react', () => {
  const React = require('react');

  const OverflowMenu = ({ children, ariaLabel, 'aria-label': ariaLabelProp, iconDescription }) => (
    <div>
      <button type="button">{ariaLabelProp || ariaLabel || iconDescription}</button>
      <div>{children}</div>
    </div>
  );

  const OverflowMenuItem = ({ itemText, onClick, disabled, isDelete, hasDivider }) => (
    <button
      type="button"
      disabled={disabled}
      data-delete={isDelete ? 'true' : 'false'}
      data-divider={hasDivider ? 'true' : 'false'}
      onClick={onClick}
    >
      {itemText}
    </button>
  );

  const TableToolbar = ({ children }) => <div>{children}</div>;
  const TableBatchActions = ({ children, onCancel }) => (
    <div data-testid="batch-actions">
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      {children}
    </div>
  );
  const TableBatchAction = ({ children, onClick, iconDescription, tabIndex }) => (
    <button type="button" onClick={onClick} aria-label={iconDescription} tabIndex={tabIndex}>
      {children}
    </button>
  );
  const TableToolbarContent = ({ children, className, 'aria-hidden': ariaHidden }) => (
    <div data-testid="toolbar-content" className={className} aria-hidden={ariaHidden}>
      {children}
    </div>
  );
  const TableToolbarSearch = ({ onChange, value, placeholder, tabIndex }) => (
    <input
      aria-label={placeholder}
      placeholder={placeholder}
      defaultValue={value}
      tabIndex={tabIndex}
      onChange={(event) => onChange(event)}
    />
  );
  const IconButton = ({ children, label, onClick }) => (
    <button type="button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );

  return {
    DataTable: {
      TableToolbar,
      TableBatchActions,
      TableBatchAction,
      TableToolbarContent,
      TableToolbarSearch,
    },
    IconButton,
    OverflowMenu,
    OverflowMenuItem,
  };
});

const createTable = (selectedRows = [{ id: 1 }, { id: 2 }]) => ({
  getSelectedRowModel: () => ({
    rows: selectedRows.map((row) => ({ original: row })),
  }),
});

const baseProps = () => ({
  enableSelection: true,
  selectionType: 'checkbox',
  shouldShowBatchActions: true,
  selectedCount: 2,
  totalCount: 5,
  onCancelSelection: vi.fn(),
  onSelectAll: vi.fn(),
  batchActions: [],
  table: createTable(),
  toolbar: [
    { type: 'filter' },
    { type: 'search' },
    {
      type: 'settings',
      menuItems: [{ type: 'columnSettings' }],
    },
  ],
  onSearchChange: vi.fn(),
  searchValue: 'abc',
  onToggleFilterPanel: vi.fn(),
  onOpenCustomizePanel: vi.fn(),
});

describe('TableToolbar', () => {
  it('renders filter, search, settings, and custom toolbar elements', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();
    props.toolbar = [
      { type: 'filter' },
      { type: 'search' },
      {
        type: 'settings',
        menuItems: [
          { label: 'Export', onClick: vi.fn() },
          { type: 'columnSettings', label: 'Columns' },
        ],
      },
      { type: 'custom', element: <div>Custom toolbar content</div> },
    ];

    render(<TableToolbar {...props} />);

    expect(screen.getByLabelText('Toggle filter panel')).toBeInTheDocument();
    expect(screen.getByLabelText('Search table')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Columns')).toBeInTheDocument();
    expect(screen.getByText('Custom toolbar content')).toBeInTheDocument();
  });

  it('calls toolbar handlers for filter, search event/string, and column settings', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();

    render(<TableToolbar {...props} />);

    fireEvent.click(screen.getByLabelText('Toggle filter panel'));
    expect(props.onToggleFilterPanel).toHaveBeenCalledTimes(1);

    const search = screen.getByLabelText('Search table');
    fireEvent.change(search, { target: { value: 'typed value' } });
    expect(props.onSearchChange).toHaveBeenCalledWith('typed value');
  });

  it('uses default toolbar when toolbar prop is not provided', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();
    props.toolbar = undefined;

    render(<TableToolbar {...props} />);

    expect(screen.getByLabelText('Toggle filter panel')).toBeInTheDocument();
    expect(screen.getByLabelText('Search table')).toBeInTheDocument();
  });

  it('hides settings menu when there are no renderable items', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();
    props.toolbar = [
      {
        type: 'settings',
        menuItems: [{ type: 'columnSettings' }],
      },
    ];
    props.onOpenCustomizePanel = vi.fn();

    render(<TableToolbar {...props} toolbar={[{ type: 'settings', menuItems: [] }]} />);

    expect(screen.queryByText('Column settings')).not.toBeInTheDocument();
  });

  it('renders batch actions as direct buttons and custom elements on large screens', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const buttonClick = vi.fn();
    const overflowClick = vi.fn();
    const props = baseProps();
    props.batchActions = [
      { label: 'Delete', icon: () => null, onClick: buttonClick },
      {
        type: 'overflow',
        label: 'More actions',
        onOptionClick: overflowClick,
        options: [
          { id: 'export', label: 'Export' },
          { id: 'archive', label: 'Archive', isDelete: true, hasDivider: true },
        ],
      },
      {
        type: 'custom',
        element: (selectedRows) => <div>{`Custom ${selectedRows.length}`}</div>,
      },
    ];

    render(<TableToolbar {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(buttonClick).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);

    fireEvent.click(screen.getByText('Export'));
    expect(overflowClick).toHaveBeenCalledWith('export', [{ id: 1 }, { id: 2 }]);

    expect(screen.getByText('Custom 2')).toBeInTheDocument();
  });

  it('renders all batch actions into a single overflow menu on small screens', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: true });
    const buttonClick = vi.fn();
    const overflowClick = vi.fn();
    const props = baseProps();
    props.batchActions = [
      { label: 'Delete', icon: () => null, onClick: buttonClick },
      {
        type: 'overflow',
        label: 'More',
        onOptionClick: overflowClick,
        options: [
          { id: 'export', label: 'Export' },
          { id: 'archive', label: 'Archive', disabled: true },
        ],
      },
      {
        type: 'custom',
        element: <div>Bulk dropdown</div>,
      },
    ];

    render(<TableToolbar {...props} />);

    fireEvent.click(screen.getByText('Delete'));
    expect(buttonClick).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);

    fireEvent.click(screen.getByText('Export'));
    expect(overflowClick).toHaveBeenCalledWith('export', [{ id: 1 }, { id: 2 }]);

    expect(screen.getByText('Bulk dropdown')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Archive' })).toBeDisabled();
  });

  it('does not render batch actions when selection is disabled or type is not checkbox', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();
    props.enableSelection = false;
    props.selectionType = 'radio';
    props.batchActions = [{ label: 'Delete', icon: () => null, onClick: vi.fn() }];

    render(<TableToolbar {...props} />);

    expect(screen.queryByTestId('batch-actions')).not.toBeInTheDocument();
  });
});
