import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FilterSearch from '../filterSearch';

const mockSearch = vi.fn(
  ({ id, labelText, placeholder, value, onChange, size, closeButtonLabelText }) => (
    <div data-testid="mock-search-wrapper">
      <label htmlFor={id}>{labelText}</label>
      <input
        id={id}
        data-testid="mock-search-input"
        placeholder={placeholder}
        value={value}
        data-size={size}
        aria-label={labelText}
        onChange={onChange}
      />
      <span data-testid="mock-close-label">{closeButtonLabelText}</span>
    </div>
  )
);

const mockLayer = vi.fn(({ children, level }) => (
  <div data-testid="mock-layer" data-level={String(level)}>
    {children}
  </div>
));

vi.mock('@carbon/react', () => ({
  Search: (props) => mockSearch(props),
  Layer: (props) => mockLayer(props),
}));

describe('FilterSearch', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default placeholder and medium size mapping', () => {
    render(<FilterSearch value="" onChange={onChange} />);

    expect(screen.getByTestId('mock-layer')).toHaveAttribute('data-level', '1');
    expect(screen.getByTestId('mock-search-input')).toHaveAttribute('placeholder', 'Find filters');
    expect(screen.getByTestId('mock-search-input')).toHaveAttribute('data-size', 'md');
    expect(screen.getByTestId('mock-close-label')).toHaveTextContent('Clear search');
  });

  it('renders with provided placeholder, value, and size', () => {
    render(
      <FilterSearch value="owner" onChange={onChange} placeholder="Find table filters" size="sm" />
    );

    expect(screen.getByTestId('mock-search-input')).toHaveValue('owner');
    expect(screen.getByTestId('mock-search-input')).toHaveAttribute(
      'placeholder',
      'Find table filters'
    );
    expect(screen.getByTestId('mock-search-input')).toHaveAttribute('data-size', 'sm');
  });

  it('passes updated input value to onChange callback', () => {
    render(<FilterSearch value="" onChange={onChange} />);

    fireEvent.change(screen.getByTestId('mock-search-input'), {
      target: { value: 'inactive' },
    });

    expect(onChange).toHaveBeenCalledWith('inactive');
  });
});
