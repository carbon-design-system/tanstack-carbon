import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_LABELS } from '../../constants/defaultLabels';
import useResponsiveBatchActions from '../../hooks/useResponsiveBatchActions';
import TableToolbar from '../tableToolbar';

vi.mock('../../hooks/useResponsiveBatchActions', () => ({
  default: vi.fn(),
}));

vi.mock('./scss/tableToolbar.module.scss', () => ({
  default: {
    tblToolbar: 'tblToolbar',
    tblToolbarDisabled: 'tblToolbarDisabled',
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

  const Button = ({
    children,
    renderIcon: RenderIcon,
    iconDescription,
    'aria-label': ariaLabel,
    onClick,
    tooltipAlignment,
    'data-testid': testId,
  }) => (
    <button
      type="button"
      aria-label={iconDescription || ariaLabel}
      onClick={onClick}
      data-tooltip-alignment={tooltipAlignment}
      data-testid={testId}>
      {RenderIcon && <RenderIcon />}
      {children}
    </button>
  );

  const OverflowMenu = ({
    children,
    ariaLabel,
    'aria-label': ariaLabelProp,
    iconDescription,
    align,
  }) => (
    <div>
      <button
        type="button"
        aria-label={ariaLabelProp || ariaLabel || iconDescription}
        data-align={align}>
        {ariaLabelProp || ariaLabel || iconDescription}
      </button>
      <div>{children}</div>
    </div>
  );

  const OverflowMenuItem = ({
    itemText,
    onClick,
    disabled,
    isDelete,
    hasDivider,
  }) => (
    <button
      type="button"
      disabled={disabled}
      data-delete={isDelete ? 'true' : 'false'}
      data-divider={hasDivider ? 'true' : 'false'}
      onClick={onClick}>
      {itemText}
    </button>
  );

  const TableToolbar = ({ children }) => <div>{children}</div>;
  const TableBatchActions = ({
    children,
    onCancel,
    onSelectAll,
    totalCount,
    totalSelected,
    translateWithId: t = (id, { totalCount: tc, totalSelected: ts } = {}) => {
      if (id === 'carbon.table.batch.selectAll') {
        return `Select all (${tc})`;
      }
      if (id === 'carbon.table.batch.items.selected') {
        return `${ts} items selected`;
      }
      if (id === 'carbon.table.batch.item.selected') {
        return `${ts} item selected`;
      }
      return id;
    },
  }) => (
    <div data-testid="batch-actions">
      <button type="button" onClick={onCancel}>
        {t('carbon.table.batch.cancel')}
      </button>
      {onSelectAll && (
        <button type="button" onClick={onSelectAll}>
          {t('carbon.table.batch.selectAll', { totalCount })}
        </button>
      )}
      <span>{t('carbon.table.batch.items.selected', { totalSelected })}</span>
      {children}
    </div>
  );
  const TableBatchAction = ({
    children,
    onClick,
    iconDescription,
    tabIndex,
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={iconDescription}
      tabIndex={tabIndex}>
      {children}
    </button>
  );
  const TableToolbarContent = ({
    children,
    className,
    'aria-hidden': ariaHidden,
  }) => (
    <div
      data-testid="toolbar-content"
      className={className}
      aria-hidden={ariaHidden}>
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

  return {
    Button,
    DataTable: {
      TableToolbar,
      TableBatchActions,
      TableBatchAction,
      TableToolbarContent,
      TableToolbarSearch,
    },
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
      { type: 'unknown' },
    ];

    render(<TableToolbar {...props} />);

    const filterBtn = screen.getByTestId('table-toolbar-filter-btn-0');
    expect(filterBtn).toBeInTheDocument();
    expect(filterBtn).toHaveAttribute(
      'aria-label',
      DEFAULT_LABELS.toolbarFilterTooltip
    );
    expect(filterBtn).toHaveAttribute('data-tooltip-alignment', 'start');
    expect(screen.getByLabelText('Search table')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Columns')).toBeInTheDocument();
    expect(screen.getByText('Custom toolbar content')).toBeInTheDocument();
  });

  it('calls toolbar handlers for filter, search event/string, and column settings', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();

    render(<TableToolbar {...props} />);

    fireEvent.click(screen.getByTestId('table-toolbar-filter-btn-0'));
    expect(props.onToggleFilterPanel).toHaveBeenCalledTimes(1);

    const search = screen.getByLabelText('Search table');
    fireEvent.change(search, { target: { value: 'typed value' } });
    expect(props.onSearchChange).toHaveBeenCalledWith('typed value');
  });

  it('renders nothing when toolbar is undefined', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();
    props.toolbar = undefined;

    const { container } = render(<TableToolbar {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when toolbar is null', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();
    props.toolbar = null;

    const { container } = render(<TableToolbar {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when toolbar is an empty array', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();
    props.toolbar = [];

    const { container } = render(<TableToolbar {...props} />);

    expect(container.firstChild).toBeNull();
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

    render(
      <TableToolbar
        {...props}
        toolbar={[{ type: 'settings', menuItems: [] }]}
      />
    );

    expect(screen.queryByText('Column settings')).not.toBeInTheDocument();
  });

  it('sets align="top-end" when settings menu is the last item and omits it when not last', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();
    props.toolbar = [
      { type: 'search' },
      {
        type: 'settings',
        menuItems: [{ label: 'Export', onClick: vi.fn() }],
      },
    ];

    const { unmount } = render(<TableToolbar {...props} />);
    const settingsBtn = screen.getByLabelText(
      DEFAULT_LABELS.toolbarSettingsAriaLabel
    );
    expect(settingsBtn).toHaveAttribute('data-align', 'top-end');

    unmount();

    props.toolbar = [
      {
        type: 'settings',
        menuItems: [{ label: 'Export', onClick: vi.fn() }],
      },
      { type: 'search' },
    ];
    render(<TableToolbar {...props} />);
    const settingsBtnNotLast = screen.getByLabelText(
      DEFAULT_LABELS.toolbarSettingsAriaLabel
    );
    expect(settingsBtnNotLast).not.toHaveAttribute('data-align');
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
    expect(overflowClick).toHaveBeenCalledWith('export', [
      { id: 1 },
      { id: 2 },
    ]);

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
    expect(overflowClick).toHaveBeenCalledWith('export', [
      { id: 1 },
      { id: 2 },
    ]);

    expect(screen.getByText('Bulk dropdown')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Archive' })).toBeDisabled();
  });

  it('does not render batch actions when selection is disabled or type is not checkbox', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const props = baseProps();
    props.enableSelection = false;
    props.selectionType = 'radio';
    props.batchActions = [
      { label: 'Delete', icon: () => null, onClick: vi.fn() },
    ];

    render(<TableToolbar {...props} />);

    expect(screen.queryByTestId('batch-actions')).not.toBeInTheDocument();
  });

  it('renders the Select all button only when onSelectAll is provided', () => {
    useResponsiveBatchActions.mockReturnValue({ shouldUseOverflow: false });
    const batchActions = [
      { label: 'Delete', icon: () => null, onClick: vi.fn() },
    ];
    const { totalCount } = baseProps();
    const selectAllLabel = `${DEFAULT_LABELS.batchActionsSelectAll} (${totalCount})`;

    const { unmount } = render(
      <TableToolbar
        {...baseProps()}
        onSelectAll={undefined}
        batchActions={batchActions}
      />
    );
    expect(screen.queryByText(selectAllLabel)).not.toBeInTheDocument();

    unmount();

    render(<TableToolbar {...baseProps()} batchActions={batchActions} />);
    expect(
      screen.getByRole('button', { name: selectAllLabel })
    ).toBeInTheDocument();
  });
});
