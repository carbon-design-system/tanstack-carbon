import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FilterSection from '../filterSection';

const mockAccordion = vi.fn(({ children, size }) => (
  <div data-testid="mock-accordion" data-size={size}>
    {children}
  </div>
));

const mockAccordionItem = vi.fn(({ title, open, children }) => (
  <div data-testid="mock-accordion-item" data-title={title} data-open={String(Boolean(open))}>
    {children}
  </div>
));

vi.mock('@carbon/react', () => ({
  Accordion: (props) => mockAccordion(props),
  AccordionItem: (props) => mockAccordionItem(props),
}));

describe('FilterSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders accordion with section label and default closed state', () => {
    render(
      <FilterSection section={{ id: 'status', label: 'Status Filters' }}>
        <div>Section Content</div>
      </FilterSection>
    );

    expect(screen.getByTestId('mock-accordion')).toHaveAttribute('data-size', 'md');
    expect(screen.getByTestId('mock-accordion-item')).toHaveAttribute(
      'data-title',
      'Status Filters'
    );
    expect(screen.getByTestId('mock-accordion-item')).toHaveAttribute('data-open', 'false');
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });

  it('passes defaultOpen=true to accordion item', () => {
    render(
      <FilterSection section={{ id: 'status', label: 'Status Filters' }} defaultOpen>
        <div>Section Content</div>
      </FilterSection>
    );

    expect(screen.getByTestId('mock-accordion-item')).toHaveAttribute('data-open', 'true');
  });

  it('stops click propagation from the filter section content wrapper', () => {
    const outerClickHandler = vi.fn();

    render(
      <div onClick={outerClickHandler}>
        <FilterSection section={{ id: 'status', label: 'Status Filters' }}>
          <button type="button">Inner Action</button>
        </FilterSection>
      </div>
    );

    const content = screen.getByText('Inner Action').parentElement;

    expect(content).toHaveClass('filter-section-content');

    fireEvent.click(content);

    expect(outerClickHandler).not.toHaveBeenCalled();
  });

  it('renders any supplied section label through AccordionItem props', () => {
    render(
      <FilterSection section={{ id: 'owner', label: 'Owner Filters' }}>
        <div>Owner Content</div>
      </FilterSection>
    );

    expect(mockAccordionItem).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: 'Owner Filters',
        open: false,
      })
    );
    expect(screen.getByText('Owner Content')).toBeInTheDocument();
  });
});
