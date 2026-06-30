import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaginationSection from '../paginationSection';

const mockPagination = vi.fn(
  ({
    backwardText,
    forwardText,
    itemsPerPageText,
    page,
    pageSize,
    pageSizes,
    totalItems,
    onChange,
  }) => (
    <div
      data-testid="mock-pagination"
      data-backward-text={backwardText}
      data-forward-text={forwardText}
      data-items-per-page-text={itemsPerPageText}
      data-page={String(page)}
      data-page-size={String(pageSize)}
      data-page-sizes={pageSizes.join(',')}
      data-total-items={String(totalItems)}
    >
      <button type="button" onClick={() => onChange({ page: 4, pageSize: '25' })}>
        Trigger Pagination Change
      </button>
    </div>
  )
);

vi.mock('@carbon/react', () => ({
  Pagination: (props) => mockPagination(props),
}));

describe('PaginationSection', () => {
  const table = {
    setPageSize: vi.fn(),
    setPageIndex: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when pagination should not render', () => {
    const { container } = render(
      <PaginationSection feature={{ shouldRender: false }} table={table} />
    );

    expect(container.firstChild).toBeNull();
    expect(mockPagination).not.toHaveBeenCalled();
  });

  it('renders pagination with mapped props from feature state', () => {
    render(
      <PaginationSection
        feature={{
          shouldRender: true,
          paginationState: {
            pageIndex: 1,
            pageSize: 10,
          },
          pageSizeOptions: [10, 25, 50],
          totalItems: 150,
        }}
        table={table}
      />
    );

    expect(screen.getByTestId('mock-pagination')).toHaveAttribute(
      'data-backward-text',
      'Previous page'
    );
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-forward-text', 'Next page');
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute(
      'data-items-per-page-text',
      'Items per page:'
    );
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-page', '2');
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-page-size', '10');
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-page-sizes', '10,25,50');
    expect(screen.getByTestId('mock-pagination')).toHaveAttribute('data-total-items', '150');
  });

  it('updates table page size and zero-based page index on change', () => {
    render(
      <PaginationSection
        feature={{
          shouldRender: true,
          paginationState: {
            pageIndex: 0,
            pageSize: 10,
          },
          pageSizeOptions: [10, 25, 50],
          totalItems: 150,
        }}
        table={table}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Pagination Change' }));

    expect(table.setPageSize).toHaveBeenCalledWith(25);
    expect(table.setPageIndex).toHaveBeenCalledWith(3);
  });
});
