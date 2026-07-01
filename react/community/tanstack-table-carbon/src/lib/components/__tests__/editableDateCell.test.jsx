import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EditableDateCell from '../editableDateCell';

const mockTableCell = vi.fn(({ children, id, onKeyDown, onDoubleClick, ...rest }) => (
  <td id={id} onKeyDown={onKeyDown} onDoubleClick={onDoubleClick} {...rest}>
    {children}
  </td>
));

const mockDatePicker = vi.fn(({ children, onChange, appendTo, value }) => (
  <div
    data-testid="date-picker"
    data-value={value}
    data-has-append-to={String(Boolean(appendTo))}
    onClick={() => onChange?.([], '2026-05-25')}
  >
    {children}
  </div>
));

const mockDatePickerInput = vi.fn(
  ({ id, onBlur, onKeyDown, labelText, hideLabel, autoFocus, ...rest }) => (
    <input
      id={id}
      aria-label={hideLabel ? labelText : undefined}
      data-autofocus={String(Boolean(autoFocus))}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      {...rest}
    />
  )
);

vi.mock('@carbon/react', () => ({
  TableCell: (props) => mockTableCell(props),
  DatePicker: (props) => mockDatePicker(props),
  DatePickerInput: (props) => mockDatePickerInput(props),
}));

describe('EditableDateCell', () => {
  let updateData;
  let setEditingId;
  let focusMock;
  let inputClickMock;
  let querySelector;
  let tableContainerRef;
  let cell;

  const renderCell = (overrideProps = {}) =>
    render(
      <table>
        <tbody>
          <tr>
            <EditableDateCell
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
              id="row-1-date"
              style={{ width: 220 }}
              children="2026-05-01"
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
    inputClickMock = vi.fn();
    querySelector = vi.fn((selector) => {
      if (selector === '#datepicker__row-1-date') {
        return { click: inputClickMock };
      }

      if (selector === '#cell__row-1-date') {
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
        id: 'date',
      },
      getValue: vi.fn(() => '2026-05-01'),
    };
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders readonly table cell when not editing', () => {
    renderCell();

    expect(screen.getByText('2026-05-01')).toBeInTheDocument();
    expect(mockTableCell).toHaveBeenCalled();
    expect(screen.queryByLabelText('Editable date')).not.toBeInTheDocument();
  });

  it('enters edit mode on Enter key in readonly mode', () => {
    renderCell();

    fireEvent.keyDown(screen.getByText('2026-05-01').closest('td'), {
      code: 'Enter',
      target: { id: 'cell__row-1-date' },
    });

    expect(setEditingId).toHaveBeenCalledWith('cell__row-1-date');
  });

  it('does nothing for non-Enter key in readonly mode', () => {
    renderCell();

    fireEvent.keyDown(screen.getByText('2026-05-01').closest('td'), {
      code: 'Space',
      target: { id: 'cell__row-1-date' },
    });

    expect(setEditingId).not.toHaveBeenCalled();
  });

  it('enters edit mode on double click', () => {
    renderCell();

    fireEvent.doubleClick(screen.getByText('2026-05-01').closest('td'), {
      currentTarget: { id: 'cell__row-1-date' },
    });

    expect(setEditingId).toHaveBeenCalledWith('cell__row-1-date');
  });

  it('renders date picker in edit mode', () => {
    renderCell({
      editingId: 'cell__row-1-date',
    });

    expect(screen.getByLabelText('Editable date')).toBeInTheDocument();
    expect(mockDatePicker).toHaveBeenCalled();
  });

  it('saves selected date and refocuses the cell', () => {
    renderCell({
      editingId: 'cell__row-1-date',
    });

    fireEvent.click(screen.getByTestId('date-picker'));

    expect(updateData).toHaveBeenCalledWith(0, 'date', '2026-05-25');
    expect(setEditingId).toHaveBeenCalledWith(null);

    vi.advanceTimersByTime(10);

    expect(querySelector).toHaveBeenCalledWith('#cell__row-1-date');
    expect(focusMock).toHaveBeenCalled();
  });

  it('does not save when selected value is empty', () => {
    mockDatePicker.mockImplementationOnce(({ children, onChange }) => (
      <div data-testid="date-picker-empty" onClick={() => onChange?.([], '')}>
        {children}
      </div>
    ));

    renderCell({
      editingId: 'cell__row-1-date',
    });

    fireEvent.click(screen.getByTestId('date-picker-empty'));

    expect(updateData).not.toHaveBeenCalled();
    expect(setEditingId).not.toHaveBeenCalledWith(null);
  });

  it('closes edit mode on blur when focus leaves the date picker', () => {
    renderCell({
      editingId: 'cell__row-1-date',
    });

    const input = screen.getByLabelText('Editable date');
    fireEvent.blur(input, {
      relatedTarget: document.createElement('button'),
    });

    expect(setEditingId).toHaveBeenCalledWith(null);
  });

  it('closes edit mode on blur when related target is missing', () => {
    renderCell({
      editingId: 'cell__row-1-date',
    });

    const input = screen.getByLabelText('Editable date');
    fireEvent.blur(input);

    expect(setEditingId).toHaveBeenCalledWith(null);
  });

  it('closes edit mode on Escape and refocuses the cell', () => {
    renderCell({
      editingId: 'cell__row-1-date',
    });

    const input = screen.getByLabelText('Editable date');
    fireEvent.keyDown(input, { code: 'Escape' });

    expect(setEditingId).toHaveBeenCalledWith(null);

    vi.advanceTimersByTime(10);

    expect(querySelector).toHaveBeenCalledWith('#cell__row-1-date');
    expect(focusMock).toHaveBeenCalled();
  });

  it('ignores other keys in edit mode', () => {
    renderCell({
      editingId: 'cell__row-1-date',
    });

    const input = screen.getByLabelText('Editable date');
    fireEvent.keyDown(input, { code: 'Tab' });

    expect(setEditingId).not.toHaveBeenCalled();
    expect(updateData).not.toHaveBeenCalled();
  });
});
