import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EditableCell from '../editableCell';

const mockTableCell = vi.fn(({ children, id, onKeyDown, onDoubleClick, ...rest }) => (
  <td id={id} onKeyDown={onKeyDown} onDoubleClick={onDoubleClick} {...rest}>
    {children}
  </td>
));

const mockTextInput = vi.fn(
  ({
    id,
    value,
    onBlur,
    onChange,
    onKeyDown,
    invalid,
    invalidText,
    autoFocus,
    labelText,
    hideLabel,
    ...rest
  }) => (
    <div>
      <input
        id={id}
        aria-label={hideLabel ? labelText : undefined}
        defaultValue={value}
        data-invalid={String(Boolean(invalid))}
        data-autofocus={String(Boolean(autoFocus))}
        onBlur={onBlur}
        onChange={onChange}
        onKeyDown={onKeyDown}
        {...rest}
      />
      {invalidText ? <span>{invalidText}</span> : null}
    </div>
  )
);

vi.mock('@carbon/react', () => ({
  TableCell: (props) => mockTableCell(props),
  TextInput: (props) => mockTextInput(props),
}));

describe('EditableCell', () => {
  let updateData;
  let setEditingId;
  let focusMock;
  let querySelector;
  let tableContainerRef;
  let cell;

  const renderCell = (overrideProps = {}) =>
    render(
      <table>
        <tbody>
          <tr>
            <EditableCell
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
              id="row-1-name"
              style={{ width: 200 }}
              children="John Doe"
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

    querySelector = vi.fn(() => ({
      tabIndex: -1,
      focus: focusMock,
    }));

    tableContainerRef = {
      current: {
        querySelector,
      },
    };

    cell = {
      row: { index: 0 },
      column: {
        id: 'name',
        columnDef: {
          meta: {},
        },
      },
      getValue: vi.fn(() => 'John Doe'),
    };
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders readonly table cell when not editing', () => {
    renderCell();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(mockTableCell).toHaveBeenCalled();
    expect(screen.queryByLabelText('Editable cell')).not.toBeInTheDocument();
  });

  it('enters edit mode on Enter key in readonly mode', () => {
    renderCell();

    fireEvent.keyDown(screen.getByText('John Doe').closest('td'), {
      code: 'Enter',
      target: { id: 'cell__row-1-name' },
    });

    expect(setEditingId).toHaveBeenCalledWith('cell__row-1-name');
  });

  it('does nothing for non-Enter key in readonly mode', () => {
    renderCell();

    fireEvent.keyDown(screen.getByText('John Doe').closest('td'), {
      code: 'Space',
      target: { id: 'cell__row-1-name' },
    });

    expect(setEditingId).not.toHaveBeenCalled();
  });

  it('enters edit mode on double click', () => {
    renderCell();

    fireEvent.doubleClick(screen.getByText('John Doe').closest('td'), {
      currentTarget: { id: 'cell__row-1-name' },
    });

    expect(setEditingId).toHaveBeenCalledWith('cell__row-1-name');
  });

  it('renders input when editing and saves on Enter', () => {
    renderCell({
      editingId: 'cell__row-1-name',
    });

    const input = screen.getByLabelText('Editable cell');
    fireEvent.change(input, { target: { value: 'Jane Doe' } });
    fireEvent.keyDown(input, { code: 'Enter' });

    expect(updateData).toHaveBeenCalledWith(0, 'name', 'Jane Doe');
    expect(setEditingId).toHaveBeenCalledWith(null);

    vi.advanceTimersByTime(10);

    expect(querySelector).toHaveBeenCalledWith('#cell__row-1-name');
    expect(focusMock).toHaveBeenCalled();
  });

  it('saves original value on Enter when edit value was not changed', () => {
    renderCell({
      editingId: 'cell__row-1-name',
    });

    const input = screen.getByLabelText('Editable cell');
    fireEvent.keyDown(input, { code: 'Enter' });

    expect(updateData).toHaveBeenCalledWith(0, 'name', 'John Doe');
    expect(setEditingId).toHaveBeenCalledWith(null);
  });

  it('cancels editing on Escape and refocuses cell', () => {
    renderCell({
      editingId: 'cell__row-1-name',
    });

    const input = screen.getByLabelText('Editable cell');
    fireEvent.change(input, { target: { value: 'John Doex' } });
    fireEvent.keyDown(input, { code: 'Escape' });

    expect(updateData).not.toHaveBeenCalled();
    expect(setEditingId).toHaveBeenCalledWith(null);

    vi.advanceTimersByTime(10);

    expect(querySelector).toHaveBeenCalledWith('#cell__row-1-name');
    expect(focusMock).toHaveBeenCalled();
  });

  it('shows validation error and does not save invalid value on Enter', () => {
    cell.column.columnDef.meta.validate = vi.fn(() => 'Value is invalid');

    renderCell({
      editingId: 'cell__row-1-name',
    });

    const input = screen.getByLabelText('Editable cell');
    fireEvent.change(input, { target: { value: 'bad' } });
    fireEvent.keyDown(input, { code: 'Enter' });

    expect(cell.column.columnDef.meta.validate).toHaveBeenCalledWith('bad');
    expect(updateData).not.toHaveBeenCalled();
    expect(screen.getByText('Value is invalid')).toBeInTheDocument();
  });

  it('uses default invalid message when validate returns false', () => {
    cell.column.columnDef.meta.validate = vi.fn(() => false);

    renderCell({
      editingId: 'cell__row-1-name',
    });

    const input = screen.getByLabelText('Editable cell');
    fireEvent.keyDown(input, { code: 'Enter' });

    expect(updateData).not.toHaveBeenCalled();
    expect(screen.getByText('Invalid value')).toBeInTheDocument();
  });

  it('clears validation error on change after invalid input', () => {
    cell.column.columnDef.meta.validate = vi.fn(() => 'Value is invalid');

    renderCell({
      editingId: 'cell__row-1-name',
    });

    const input = screen.getByLabelText('Editable cell');
    fireEvent.keyDown(input, { code: 'Enter' });
    expect(screen.getByText('Value is invalid')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'A' } });

    expect(screen.queryByText('Value is invalid')).not.toBeInTheDocument();
  });

  it('reverts invalid state on blur when already invalid', () => {
    renderCell({
      editingId: 'cell__row-1-name',
    });

    const input = screen.getByLabelText('Editable cell');
    fireEvent.keyDown(input, { code: 'Enter' });

    fireEvent.blur(input);

    expect(setEditingId).toHaveBeenCalledWith(null);
  });

  it('does not save on blur when validation fails', () => {
    cell.column.columnDef.meta.validate = vi.fn(() => 'Still invalid');

    renderCell({
      editingId: 'cell__row-1-name',
    });

    const input = screen.getByLabelText('Editable cell');
    fireEvent.change(input, { target: { value: 'bad' } });
    fireEvent.blur(input);

    expect(cell.column.columnDef.meta.validate).toHaveBeenCalledWith('bad');
    expect(updateData).not.toHaveBeenCalled();
    expect(setEditingId).toHaveBeenCalledWith(null);
  });

  it('saves on blur when validation passes', () => {
    cell.column.columnDef.meta.validate = vi.fn(() => true);

    renderCell({
      editingId: 'cell__row-1-name',
    });

    const input = screen.getByLabelText('Editable cell');
    fireEvent.change(input, { target: { value: 'Saved on blur' } });
    fireEvent.blur(input);

    expect(updateData).toHaveBeenCalledWith(0, 'name', 'Saved on blur');
    expect(setEditingId).toHaveBeenCalledWith(null);
  });

  it('ignores non Enter and non Escape keys in edit mode', () => {
    renderCell({
      editingId: 'cell__row-1-name',
    });

    const input = screen.getByLabelText('Editable cell');
    fireEvent.keyDown(input, { code: 'Tab' });

    expect(updateData).not.toHaveBeenCalled();
    expect(setEditingId).not.toHaveBeenCalled();
  });
});
