import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_LABELS } from '../../../constants/defaultLabels';
import SimpleFilterField from '../simpleFilterField';

vi.mock('@carbon/react', () => ({
  Layer: ({ children }) => <div data-testid="layer">{children}</div>,
}));

vi.mock('../fields', () => ({
  CheckboxGroupFilterField: ({ legend, items, selectedValues, onChange, emptyMessage }) => (
    <div>
      <div>{legend}</div>
      <div>{emptyMessage}</div>
      <div>{selectedValues.join(',')}</div>
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => onChange(item.value, true)}>
          {`${item.label}:${item.count}`}
        </button>
      ))}
    </div>
  ),
  DateFilterField: ({ label, value, onChange }) => (
    <button type="button" onClick={() => onChange(value ? '' : '2026-05-25')}>
      {label}
    </button>
  ),
  DateRangeFilterField: ({ startLabel, endLabel, onChange }) => (
    <button type="button" onClick={() => onChange({ start: '2026-01-01', end: '2026-01-31' })}>
      {`${startLabel} ${endLabel}`}
    </button>
  ),
  DropdownFilterField: ({ titleText, items, onChange }) => (
    <div>
      <div>{titleText}</div>
      {items.map((item) => (
        <button key={item} type="button" onClick={() => onChange(item)}>
          {item}
        </button>
      ))}
    </div>
  ),
  MultiSelectFilterField: ({ titleText, items, onChange }) => (
    <div>
      <div>{titleText}</div>
      <button type="button" onClick={() => onChange(items.slice(0, 1))}>
        select-one
      </button>
      <button type="button" onClick={() => onChange([])}>
        clear-all
      </button>
    </div>
  ),
  NumberFilterField: ({ label, onChange, error }) => (
    <div>
      <div>{label}</div>
      <div>{error}</div>
      <button type="button" onClick={() => onChange('')}>
        empty
      </button>
      <button type="button" onClick={() => onChange('abc')}>
        invalid
      </button>
      <button type="button" onClick={() => onChange('42')}>
        valid
      </button>
    </div>
  ),
  RadioGroupFilterField: ({ legend, items, onChange, emptyMessage }) => (
    <div>
      <div>{legend}</div>
      <div>{emptyMessage}</div>
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => onChange(item.value)}>
          {item.value}
        </button>
      ))}
    </div>
  ),
  SliderFilterField: ({ label, onChange, onRelease }) => (
    <div>
      <div>{label}</div>
      <button type="button" onClick={() => onChange({ value: 55 })}>
        slide
      </button>
      <button type="button" onClick={() => onRelease({ value: 60 })}>
        release
      </button>
    </div>
  ),
  TextFilterField: ({ label, onChange }) => (
    <button type="button" onClick={() => onChange('typed-text')}>
      {label}
    </button>
  ),
  TimeFilterField: ({ label, onChange }) => (
    <button type="button" onClick={() => onChange('12:30')}>
      {label}
    </button>
  ),
}));

vi.mock('../scss/filterSidePanel.module.scss', () => ({
  default: {
    filterItem: 'filterItem',
    noResults: 'noResults',
    filterCheckboxGroupLabel: 'filterCheckboxGroupLabel',
  },
}));

const createColumn = ({
  id = 'status',
  header = 'Status',
  filterVariant,
  uniqueValues = new Map(),
} = {}) => ({
  id,
  columnDef: {
    header,
    meta: { filterVariant },
  },
  getFacetedUniqueValues: () => uniqueValues,
});

const createProps = (overrides = {}) => ({
  columnData: {
    column: createColumn(),
    matchedByLabel: false,
  },
  size: 'md',
  searchTerm: '',
  localFilters: [],
  filterErrors: {},
  setFilterErrors: vi.fn(),
  sliderValuesRef: { current: {} },
  getFilterValue: vi.fn(() => undefined),
  updateLocalFilter: vi.fn(),
  handleCheckboxChange: vi.fn(),
  labels: DEFAULT_LABELS,
  ...overrides,
});

describe('SimpleFilterField', () => {
  it('renders select filter and shows no-results message when search does not match', () => {
    const props = createProps({
      searchTerm: 'zzz',
      columnData: {
        column: createColumn({
          id: 'status',
          header: 'Status',
          filterVariant: 'select',
          uniqueValues: new Map([
            ['Open', 2],
            ['Closed', 1],
          ]),
        }),
        matchedByLabel: false,
      },
    });

    render(<SimpleFilterField {...props} />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('No options match "zzz"')).toBeInTheDocument();
  });

  it('renders checkbox filter and forwards checkbox changes', () => {
    const props = createProps({
      localFilters: [{ id: 'status', value: ['Open'] }],
      columnData: {
        column: createColumn({
          id: 'status',
          header: 'Status',
          filterVariant: 'checkbox',
          uniqueValues: new Map([
            ['Open', 2],
            ['Closed', 1],
          ]),
        }),
        matchedByLabel: true,
      },
    });

    render(<SimpleFilterField {...props} />);

    fireEvent.click(screen.getByText('Closed:1'));
    expect(props.handleCheckboxChange).toHaveBeenCalledWith('status', 'Closed', true);
  });

  it('renders number filter and handles empty, invalid, and valid values', () => {
    const setFilterErrors = vi.fn();
    const updateLocalFilter = vi.fn();
    const props = createProps({
      setFilterErrors,
      updateLocalFilter,
      filterErrors: { amount: 'Existing error' },
      getFilterValue: vi.fn(() => '10'),
      columnData: {
        column: createColumn({
          id: 'amount',
          header: 'Amount',
          filterVariant: 'number',
        }),
        matchedByLabel: true,
      },
    });

    render(<SimpleFilterField {...props} />);

    fireEvent.click(screen.getByText('empty'));
    fireEvent.click(screen.getByText('invalid'));
    fireEvent.click(screen.getByText('valid'));

    expect(setFilterErrors).toHaveBeenCalled();
    expect(updateLocalFilter).toHaveBeenCalledWith('amount', '');
    expect(updateLocalFilter).toHaveBeenCalledWith('amount', 'abc');
    expect(updateLocalFilter).toHaveBeenCalledWith('amount', '42');
  });

  it('renders radio filter and updates local filter on selection', () => {
    const props = createProps({
      columnData: {
        column: createColumn({
          id: 'priority',
          header: 'Priority',
          filterVariant: 'radio',
          uniqueValues: new Map([
            ['High', 3],
            ['Low', 1],
          ]),
        }),
        matchedByLabel: false,
      },
      searchTerm: 'h',
    });

    render(<SimpleFilterField {...props} />);

    fireEvent.click(screen.getByText('High'));
    expect(props.updateLocalFilter).toHaveBeenCalledWith('priority', 'High');
  });

  it('renders multiselect filter and handles selection and clear', () => {
    const updateLocalFilter = vi.fn();
    const props = createProps({
      updateLocalFilter,
      getFilterValue: vi.fn(() => ['Open']),
      columnData: {
        column: createColumn({
          id: 'status',
          header: 'Status',
          filterVariant: 'multiselect',
          uniqueValues: new Map([
            ['Open', 2],
            ['Closed', 1],
          ]),
        }),
        matchedByLabel: true,
      },
    });

    render(<SimpleFilterField {...props} />);

    fireEvent.click(screen.getByText('select-one'));
    fireEvent.click(screen.getByText('clear-all'));

    expect(updateLocalFilter).toHaveBeenCalledWith('status', ['Closed']);
    expect(updateLocalFilter).toHaveBeenCalledWith('status', undefined);
  });

  it('renders slider empty state when there are no numeric values', () => {
    const props = createProps({
      columnData: {
        column: createColumn({
          id: 'score',
          header: 'Score',
          filterVariant: 'slider',
          uniqueValues: new Map([
            ['abc', 1],
            ['xyz', 2],
          ]),
        }),
        matchedByLabel: true,
      },
    });

    render(<SimpleFilterField {...props} />);

    expect(screen.getByText('No numeric values available for slider')).toBeInTheDocument();
    expect(screen.getByTestId('layer')).toBeInTheDocument();
  });

  it('renders slider field and updates ref and local filter on interaction', () => {
    const updateLocalFilter = vi.fn();
    const sliderValuesRef = { current: {} };
    const props = createProps({
      updateLocalFilter,
      sliderValuesRef,
      getFilterValue: vi.fn(() => ({ min: 10, max: 40 })),
      columnData: {
        column: createColumn({
          id: 'score',
          header: 'Score',
          filterVariant: 'slider',
          uniqueValues: new Map([
            ['10', 1],
            ['20', 1],
            ['50', 1],
          ]),
        }),
        matchedByLabel: true,
      },
    });

    render(<SimpleFilterField {...props} />);

    fireEvent.click(screen.getByText('slide'));
    fireEvent.click(screen.getByText('release'));

    expect(sliderValuesRef.current.score).toBe(55);
    expect(updateLocalFilter).toHaveBeenCalledWith('score', { min: 10, max: 60 });
  });

  it('renders date, dateRange, time, and default text filters', () => {
    const updateLocalFilter = vi.fn();

    const { rerender } = render(
      <SimpleFilterField
        {...createProps({
          updateLocalFilter,
          columnData: {
            column: createColumn({
              id: 'createdDate',
              header: 'Created Date',
              filterVariant: 'date',
            }),
            matchedByLabel: true,
          },
        })}
      />
    );

    fireEvent.click(screen.getByText('Created Date'));
    expect(updateLocalFilter).toHaveBeenCalledWith('createdDate', '2026-05-25');

    rerender(
      <SimpleFilterField
        {...createProps({
          updateLocalFilter,
          columnData: {
            column: createColumn({
              id: 'range',
              header: 'Range',
              filterVariant: 'dateRange',
            }),
            matchedByLabel: true,
          },
        })}
      />
    );
    fireEvent.click(screen.getByText('Range (Start) End date'));
    expect(updateLocalFilter).toHaveBeenCalledWith('range', {
      start: '2026-01-01',
      end: '2026-01-31',
    });

    rerender(
      <SimpleFilterField
        {...createProps({
          updateLocalFilter,
          columnData: {
            column: createColumn({
              id: 'time',
              header: 'Time',
              filterVariant: 'time',
            }),
            matchedByLabel: true,
          },
        })}
      />
    );
    fireEvent.click(screen.getByText('Time'));
    expect(updateLocalFilter).toHaveBeenCalledWith('time', '12:30');

    rerender(
      <SimpleFilterField
        {...createProps({
          updateLocalFilter,
          columnData: {
            column: createColumn({
              id: 'notes',
              header: () => 'header fn',
              filterVariant: undefined,
            }),
            matchedByLabel: true,
          },
        })}
      />
    );
    fireEvent.click(screen.getByText('Filter notes'));
    expect(updateLocalFilter).toHaveBeenCalledWith('notes', 'typed-text');
  });
});
