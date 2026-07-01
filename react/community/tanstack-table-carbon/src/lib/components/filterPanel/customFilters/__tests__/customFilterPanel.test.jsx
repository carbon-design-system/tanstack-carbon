import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomFilterPanel from '../customFilterPanel';

const mockUseCustomFilters = vi.fn();
const mockRenderCustomFilter = vi.fn();
const mockFilterSection = vi.fn(({ section, children, defaultOpen }) => (
  <div
    data-testid={`section-${section.id}`}
    data-section-label={section.label}
    data-default-open={String(Boolean(defaultOpen))}
  >
    {children}
  </div>
));

vi.mock('../../../../hooks/useCustomFilters', () => ({
  default: (...args) => mockUseCustomFilters(...args),
}));

vi.mock('../filterSection', () => ({
  default: (props) => mockFilterSection(props),
}));

vi.mock('../renderCustomFilter', () => ({
  default: (...args) => mockRenderCustomFilter(...args),
}));

describe('CustomFilterPanel', () => {
  const resetFilters = vi.fn();
  const updateFilter = vi.fn();
  const onValidationChange = vi.fn();
  const onStateChange = vi.fn();

  const baseFilterConfig = [
    {
      id: 'section-status',
      type: 'section',
      label: 'Status Filters',
      defaultOpen: true,
      filters: [
        {
          id: 'status',
          type: 'dropdown',
          label: 'Status',
          options: ['Active', 'Inactive'],
        },
        {
          id: 'priority',
          type: 'checkbox',
          label: 'Priority',
          options: ['High', 'Low'],
        },
      ],
    },
    {
      id: 'owner',
      type: 'text',
      label: 'Owner',
    },
    {
      id: 'custom-filter',
      type: 'custom',
      label: 'Custom Filter',
      render: vi.fn(({ value, onChange, disabled, error }) => (
        <button
          type="button"
          onClick={() => onChange('custom-next')}
          data-value={String(value)}
          data-disabled={String(disabled)}
          data-error={error || ''}
        >
          Custom Render
        </button>
      )),
    },
  ];

  const renderPanel = (overrideProps = {}) =>
    render(
      <CustomFilterPanel
        filterConfig={baseFilterConfig}
        searchTerm=""
        size="md"
        onValidationChange={onValidationChange}
        onStateChange={onStateChange}
        {...overrideProps}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCustomFilters.mockReturnValue({
      filters: {
        status: 'Active',
        priority: ['High'],
        owner: 'Alice',
        'custom-filter': 'custom-current',
      },
      updateFilter,
      resetFilters,
      isFilterDisabled: vi.fn(() => false),
      isFilterVisible: vi.fn(() => true),
      getFilterError: vi.fn(() => ''),
      isValid: true,
    });

    mockRenderCustomFilter.mockImplementation(
      ({ filter, value, disabled, error, searchTerm, size }) => (
        <div
          data-testid={`rendered-filter-${filter.id}`}
          data-filter-id={filter.id}
          data-value={JSON.stringify(value)}
          data-disabled={String(disabled)}
          data-error={error || ''}
          data-search-term={searchTerm}
          data-size={size}
        >
          {filter.label}
        </div>
      )
    );
  });

  it('notifies parent about validation and state changes', () => {
    renderPanel();

    expect(onValidationChange).toHaveBeenCalledWith(true);
    expect(onStateChange).toHaveBeenCalledWith({
      filterValues: {
        status: 'Active',
        priority: ['High'],
        owner: 'Alice',
        'custom-filter': 'custom-current',
      },
      resetFilters,
    });
  });

  it('renders section filters and standalone filters', () => {
    renderPanel();

    expect(screen.getByTestId('section-section-status')).toBeInTheDocument();
    expect(screen.getByTestId('rendered-filter-status')).toBeInTheDocument();
    expect(screen.getByTestId('rendered-filter-priority')).toBeInTheDocument();
    expect(screen.getByTestId('rendered-filter-owner')).toBeInTheDocument();
  });

  it('renders custom filter using render prop and wires onChange', () => {
    renderPanel();

    const button = screen.getByRole('button', { name: 'Custom Render' });
    expect(button).toHaveAttribute('data-value', 'custom-current');
    expect(button).toHaveAttribute('data-disabled', 'false');

    button.click();

    expect(updateFilter).toHaveBeenCalledWith('custom-filter', 'custom-next');
  });

  it('returns null for invisible filters', () => {
    mockUseCustomFilters.mockReturnValue({
      filters: {},
      updateFilter,
      resetFilters,
      isFilterDisabled: vi.fn(() => false),
      isFilterVisible: vi.fn((id) => id !== 'owner'),
      getFilterError: vi.fn(() => ''),
      isValid: true,
    });

    renderPanel();

    expect(screen.queryByTestId('rendered-filter-owner')).not.toBeInTheDocument();
  });

  it('passes disabled and error state from hook into rendered filters', () => {
    mockUseCustomFilters.mockReturnValue({
      filters: {
        owner: 'Alice',
      },
      updateFilter,
      resetFilters,
      isFilterDisabled: vi.fn((id) => id === 'owner'),
      isFilterVisible: vi.fn(() => true),
      getFilterError: vi.fn((id) => (id === 'owner' ? 'Owner is invalid' : '')),
      isValid: false,
    });

    renderPanel();

    expect(onValidationChange).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('rendered-filter-owner')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('rendered-filter-owner')).toHaveAttribute(
      'data-error',
      'Owner is invalid'
    );
  });

  it('filters standalone items by matching label search term', () => {
    renderPanel({
      searchTerm: 'owner',
    });

    expect(screen.getByTestId('rendered-filter-owner')).toBeInTheDocument();
    expect(screen.queryByTestId('section-section-status')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Custom Render' })).not.toBeInTheDocument();
  });

  it('shows all section filters when section title matches search term', () => {
    renderPanel({
      searchTerm: 'status filters',
    });

    expect(screen.getByTestId('section-section-status')).toBeInTheDocument();
    expect(screen.getByTestId('rendered-filter-status')).toHaveAttribute('data-search-term', '');
    expect(screen.getByTestId('rendered-filter-priority')).toHaveAttribute('data-search-term', '');
  });

  it('filters section items by option text match when section title does not match', () => {
    renderPanel({
      searchTerm: 'inactive',
    });

    expect(screen.getByTestId('section-section-status')).toBeInTheDocument();
    expect(screen.getByTestId('rendered-filter-status')).toHaveAttribute(
      'data-search-term',
      'inactive'
    );
    expect(screen.queryByTestId('rendered-filter-priority')).not.toBeInTheDocument();
  });

  it('does not render section when no section filters match search', () => {
    renderPanel({
      searchTerm: 'nonexistent',
    });

    expect(screen.queryByTestId('section-section-status')).not.toBeInTheDocument();
    expect(screen.queryByTestId('rendered-filter-owner')).not.toBeInTheDocument();
  });

  it('returns null when renderCustomFilter returns null', () => {
    mockRenderCustomFilter.mockImplementation(({ filter }) =>
      filter.id === 'owner' ? null : (
        <div data-testid={`rendered-filter-${filter.id}`}>{filter.label}</div>
      )
    );

    renderPanel();

    expect(screen.queryByTestId('rendered-filter-owner')).not.toBeInTheDocument();
    expect(screen.getByTestId('rendered-filter-status')).toBeInTheDocument();
  });

  it('passes defaultOpen to FilterSection', () => {
    renderPanel();

    expect(screen.getByTestId('section-section-status')).toHaveAttribute(
      'data-default-open',
      'true'
    );
  });
});
