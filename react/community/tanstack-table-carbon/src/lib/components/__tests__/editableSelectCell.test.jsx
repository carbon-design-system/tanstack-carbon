import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EditableSelectCell from '../editableSelectCell';

const mockTableCell = vi.fn(({ children, id, onKeyDown, onDoubleClick, ...rest }) => (
  <td id={id} onKeyDown={onKeyDown} onDoubleClick={onDoubleClick} {...rest}>
    {children}
  </td>
));

const mockDropdown = vi.fn(
  ({ id, label, items, selectedItem, onChange, direction, itemToString }) => (
    <div data-testid="dropdown" data-dropdown-id={id} data-label={label} data-direction={direction}>
      <button
        type="button"
        className="cds--list-box__field"
        data-testid="dropdown-trigger"
        data-items={JSON.stringify(items)}
        data-selected={JSON.stringify(selectedItem)}
        data-item-to-string={itemToString(selectedItem)}
        onClick={() => onChange?.({ selectedItem: items[0] })}
      >
        Dropdown
      </button>
    </div>
  )
);

vi.mock('@carbon/react', () => ({
  TableCell: (props) => mockTableCell(props),
  Dropdown: (props) => mockDropdown(props),
}));

describe('EditableSelectCell', () => {
  let updateData;
  let setEditingId;
  let focusMock;
  let querySelector;
  let tableContainerRef;
  let cell;
  let addEventListenerSpy;
  let removeEventListenerSpy;
  let windowAddEventListenerSpy;
  let windowRemoveEventListenerSpy;

  const renderCell = (overrideProps = {}) =>
    render(
      <table>
        <tbody>
          <tr>
            <EditableSelectCell
              tableContainerRef={tableContainerRef}
              table={{
                options: {
                  meta: {
                    updateData,
                  },
                },
              }}
              cell={cell}
              editingId={null}
              setEditingId={setEditingId}
              id="row-1-status"
              options={['Active', 'Inactive']}
              style={{ width: 220 }}
              children="Active"
              {...overrideProps}
            />
          </tr>
        </tbody>
      </table>
    );

  beforeEach(() => {
    vi.useFakeTimers();

    updateData = vi.fn();
    setEditingId = vi.fn();
    focusMock = vi.fn();
    querySelector = vi.fn((selector) => {
      if (selector === '.cds--data-table-content') {
        return {
          getBoundingClientRect: () => ({
            top: 0,
            bottom: 300,
          }),
        };
      }

      if (selector === '#cell__row-1-status') {
        return {
          tabIndex: -1,
          focus: focusMock,
        };
      }

      return null;
    });

    tableContainerRef = {
      current: {
        querySelector,
      },
    };

    cell = {
      row: { index: 0 },
      column: {
        id: 'status',
      },
      getValue: vi.fn(() => 'Active'),
    };

    addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    windowAddEventListenerSpy = vi.spyOn(window, 'addEventListener');
    windowRemoveEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('renders readonly table cell when not editing', () => {
    renderCell();

    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(mockTableCell).toHaveBeenCalled();
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
  });

  it('enters edit mode on Enter key in readonly mode', () => {
    renderCell();

    fireEvent.keyDown(screen.getByText('Active').closest('td'), {
      code: 'Enter',
      target: { id: 'cell__row-1-status' },
    });

    expect(setEditingId).toHaveBeenCalledWith('cell__row-1-status');
  });

  it('does nothing for non-Enter key in readonly mode', () => {
    renderCell();

    fireEvent.keyDown(screen.getByText('Active').closest('td'), {
      code: 'Space',
      target: { id: 'cell__row-1-status' },
    });

    expect(setEditingId).not.toHaveBeenCalled();
  });

  it('enters edit mode on double click', () => {
    renderCell();

    fireEvent.doubleClick(screen.getByText('Active').closest('td'), {
      currentTarget: { id: 'cell__row-1-status' },
    });

    expect(setEditingId).toHaveBeenCalledWith('cell__row-1-status');
  });

  it('renders dropdown in edit mode with mapped string options', () => {
    renderCell({
      editingId: 'cell__row-1-status',
    });

    const dropdown = screen.getByTestId('dropdown');
    const dropdownTrigger = screen.getByTestId('dropdown-trigger');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveAttribute('data-label', 'Active');
    expect(dropdownTrigger).toHaveAttribute(
      'data-items',
      JSON.stringify([
        { id: 'Active', label: 'Active' },
        { id: 'Inactive', label: 'Inactive' },
      ])
    );
    expect(dropdownTrigger).toHaveAttribute(
      'data-selected',
      JSON.stringify({ id: 'Active', label: 'Active' })
    );
  });

  it('uses current value object directly when current value is not a string', () => {
    cell.getValue = vi.fn(() => ({ id: 'ACTIVE', label: 'Active' }));

    renderCell({
      editingId: 'cell__row-1-status',
      options: [
        { id: 'ACTIVE', label: 'Active' },
        { id: 'INACTIVE', label: 'Inactive' },
      ],
    });

    expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute(
      'data-selected',
      JSON.stringify({ id: 'ACTIVE', label: 'Active' })
    );
  });

  it('saves selected string option and refocuses the cell', () => {
    renderCell({
      editingId: 'cell__row-1-status',
    });

    fireEvent.click(screen.getByTestId('dropdown-trigger'));

    expect(updateData).toHaveBeenCalledWith(0, 'status', 'Active');
    expect(setEditingId).toHaveBeenCalledWith(null);

    vi.advanceTimersByTime(10);

    expect(querySelector).toHaveBeenCalledWith('#cell__row-1-status');
    expect(focusMock).toHaveBeenCalled();
  });

  it('saves selected object option by id', () => {
    renderCell({
      editingId: 'cell__row-1-status',
      options: [
        { id: 'ACTIVE', label: 'Active' },
        { id: 'INACTIVE', label: 'Inactive' },
      ],
    });

    fireEvent.click(screen.getByTestId('dropdown-trigger'));

    expect(updateData).toHaveBeenCalledWith(0, 'status', 'ACTIVE');
    expect(setEditingId).toHaveBeenCalledWith(null);
  });

  it('does not save when selectedItem is missing', () => {
    mockDropdown.mockImplementationOnce(({ onChange }) => (
      <div data-testid="dropdown-empty" onClick={() => onChange?.({ selectedItem: null })}>
        Dropdown
      </div>
    ));

    renderCell({
      editingId: 'cell__row-1-status',
    });

    fireEvent.click(screen.getByTestId('dropdown-empty'));

    expect(updateData).not.toHaveBeenCalled();
  });

  it('registers listeners while editing and cleans them up on unmount', () => {
    const { unmount } = renderCell({
      editingId: 'cell__row-1-status',
    });

    expect(windowAddEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    unmount();

    expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('closes edit mode when clicking outside', () => {
    mockDropdown.mockImplementationOnce(() => (
      <div
        data-testid="dropdown"
        ref={(node) => {
          if (node) {
            node.contains = vi.fn(() => false);
          }
        }}
      >
        Dropdown
      </div>
    ));

    renderCell({
      editingId: 'cell__row-1-status',
    });

    const mousedownHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'mousedown'
    )[1];
    mousedownHandler({ target: document.createElement('button') });

    expect(setEditingId).toHaveBeenCalledWith(null);
  });

  it('closes on Escape key and refocuses the cell', () => {
    renderCell({
      editingId: 'cell__row-1-status',
    });

    const dropdownWrapper = screen.getByTestId('dropdown').parentElement;

    fireEvent.keyDown(dropdownWrapper, {
      code: 'Escape',
      bubbles: true,
    });

    expect(setEditingId).toHaveBeenCalledWith(null);

    vi.advanceTimersByTime(100);

    expect(querySelector).toHaveBeenCalledWith('#cell__row-1-status');
    expect(focusMock).toHaveBeenCalled();
  });

  it('ignores non-Escape keys from onKeyDownCapture handler', () => {
    renderCell({
      editingId: 'cell__row-1-status',
    });

    const dropdownWrapper = screen.getByTestId('dropdown').parentElement;

    fireEvent.keyDown(dropdownWrapper, {
      code: 'Enter',
      bubbles: true,
    });

    expect(setEditingId).not.toHaveBeenCalled();
  });

  it('keeps bottom direction by default', () => {
    renderCell({
      editingId: 'cell__row-1-status',
    });

    expect(screen.getByTestId('dropdown')).toHaveAttribute('data-direction', 'bottom');
  });

  it('keeps bottom direction when using table container fallback', () => {
    tableContainerRef = {
      current: {
        querySelector: vi.fn((selector) => {
          if (selector === '.cds--data-table-content') {
            return null;
          }

          if (selector === '#cell__row-1-status') {
            return {
              tabIndex: -1,
              focus: focusMock,
            };
          }

          return null;
        }),
        getBoundingClientRect: () => ({
          top: 0,
          bottom: 300,
        }),
      },
    };

    renderCell({
      editingId: 'cell__row-1-status',
    });

    expect(screen.getByTestId('dropdown')).toHaveAttribute('data-direction', 'bottom');
  });

  it('renders dropdown in edit mode with bottom direction for object options', () => {
    renderCell({
      editingId: 'cell__row-1-status',
      options: [
        { id: 'ACTIVE', label: 'Active' },
        { id: 'INACTIVE', label: 'Inactive' },
      ],
    });

    expect(screen.getByTestId('dropdown')).toHaveAttribute('data-direction', 'bottom');
    expect(screen.getByTestId('dropdown-trigger')).toHaveAttribute('data-item-to-string', 'Active');
  });
});
