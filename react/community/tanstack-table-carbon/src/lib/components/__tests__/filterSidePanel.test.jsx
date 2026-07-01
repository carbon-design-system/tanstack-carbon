import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FilterSidePanel from '../filterSidePanel';

const controllerMock = vi.fn();
const filterableColumnsMock = vi.fn();

vi.mock('./filterPanel/hooks/useFilterSidePanelController', () => ({
  useFilterSidePanelController: (...args) => controllerMock(...args),
}));

vi.mock('./filterPanel/hooks/useFilterableColumns', () => ({
  useFilterableColumns: (...args) => filterableColumnsMock(...args),
}));

vi.mock('./filterPanel/customFilters', () => ({
  CustomFilterPanel: () => <div data-testid="custom-filter-panel" />,
}));

vi.mock('./filterPanel/simpleFilterField', () => ({
  default: ({ columnData }) => <div data-testid={`simple-filter-${columnData.column.id}`} />,
}));

vi.mock('../constants/constants', () => ({
  STANDARD_SIZE_MAP: { md: 'md', sm: 'sm', lg: 'lg' },
  BUTTON_SIZE_MAP: { md: 'md', sm: 'sm', lg: 'lg' },
}));

vi.mock('./scss/filterSidePanel.module.scss', () => ({
  default: {
    filterSidePanel: 'filterSidePanel',
    open: 'open',
    sidePanelHeader: 'sidePanelHeader',
    headerText: 'headerText',
    closePanelBtn: 'closePanelBtn',
    searchWrapper: 'searchWrapper',
    sidePanelBody: 'sidePanelBody',
    filterSidePanelContent: 'filterSidePanelContent',
    noFilters: 'noFilters',
    sidePanelActions: 'sidePanelActions',
  },
}));

vi.mock('@carbon/icons-react', () => ({
  ArrowRight: () => <svg data-testid="arrow-right" />,
  Close: () => <svg data-testid="close-icon" />,
}));

vi.mock('@carbon/react', () => ({
  Layer: ({ children }) => <div>{children}</div>,
  Button: ({ children, onClick, disabled, iconDescription }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={iconDescription || children}
    >
      {children}
    </button>
  ),
  Search: ({ onChange, onClear, labelText }) => (
    <div>
      <button
        type="button"
        aria-label={`${labelText}-change`}
        onClick={() => onChange({ target: { value: 'abc' } })}
      >
        change-search
      </button>
      <button type="button" onClick={onClear}>
        clear-search
      </button>
    </div>
  ),
}));

const baseControllerValue = () => ({
  localFilters: [],
  isCustomFiltersValid: true,
  searchTerm: '',
  setSearchTerm: vi.fn(),
  sliderValuesRef: { current: {} },
  filterErrors: {},
  setFilterErrors: vi.fn(),
  getFilterValue: vi.fn(),
  updateLocalFilter: vi.fn(),
  handleCheckboxChange: vi.fn(),
  handleApply: vi.fn(),
  handleClearAll: vi.fn(),
  handleCustomFilterApply: vi.fn(),
  handleCustomFilterReset: vi.fn(),
  handleValidationChange: vi.fn(),
  handleCustomFilterStateChange: vi.fn(),
  handleCustomApplyClick: vi.fn(),
  handleCustomClearClick: vi.fn(),
});

const baseProps = () => ({
  open: true,
  onClose: vi.fn(),
  columns: [],
  columnFilters: [],
  onApplyFilters: vi.fn(),
  onClearFilters: vi.fn(),
  width: 350,
  size: 'md',
  onAdvancedFilterClick: vi.fn(),
  customFilterConfig: null,
  onCustomFiltersApply: vi.fn(),
  onCustomFiltersReset: vi.fn(),
  onSidePanelApply: vi.fn(),
  onSidePanelReset: vi.fn(),
});

describe('FilterSidePanel', () => {
  it('covers simple mode handlers and fallback rendering', () => {
    const controllerValue = baseControllerValue();
    const onClose = vi.fn();
    const onAdvancedFilterClick = vi.fn();

    controllerMock.mockReturnValue(controllerValue);
    filterableColumnsMock.mockReturnValue({
      searchedColumns: [],
    });

    render(
      <FilterSidePanel
        {...baseProps()}
        onClose={onClose}
        onAdvancedFilterClick={onAdvancedFilterClick}
      />
    );

    expect(screen.getByText('No filters available')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close'));
    fireEvent.click(screen.getByText('Advanced Filters'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAdvancedFilterClick).toHaveBeenCalledTimes(1);
  });

  it('covers custom mode warning branches and disabled apply', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const controllerValue = baseControllerValue();
    controllerValue.isCustomFiltersValid = false;

    controllerMock.mockReturnValue(controllerValue);
    filterableColumnsMock.mockReturnValue({
      searchedColumns: [],
    });

    // Suppress PropTypes warning for missing type in customFilterConfig
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <FilterSidePanel
        {...baseProps()}
        customFilterConfig={[{ id: 'custom-1' }]}
        onCustomFiltersApply={undefined}
        onCustomFiltersReset={vi.fn()}
      />
    );

    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();

    rerender(
      <FilterSidePanel
        {...baseProps()}
        customFilterConfig={[{ id: 'custom-1' }]}
        onCustomFiltersApply={vi.fn()}
        onCustomFiltersReset={undefined}
      />
    );

    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
