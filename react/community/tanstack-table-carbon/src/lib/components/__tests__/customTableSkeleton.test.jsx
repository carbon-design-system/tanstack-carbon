import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CustomTableSkeleton from '../customTableSkeleton';

// NOTE: Minimal column definitions used across tests
const mockColumns = [
  { id: 'name', accessorKey: 'name', header: 'Name', size: 200 },
  { id: 'email', accessorKey: 'email', header: 'Email', size: 250 },
  { id: 'age', accessorKey: 'age', header: 'Age', size: 100 },
];

const defaultProps = {
  columns: mockColumns,
  rowCount: 3,
  tableSize: 'md',
  useZebraStyles: false,
  showPagination: false,
};

describe('CustomTableSkeleton', () => {
  describe('Basic rendering', () => {
    it('should render a table with header and body', () => {
      const { container } = render(<CustomTableSkeleton {...defaultProps} />);

      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('should render the correct number of header columns', () => {
      const { container } = render(<CustomTableSkeleton {...defaultProps} />);

      const headers = container.querySelectorAll('th');
      expect(headers).toHaveLength(mockColumns.length);
    });

    it('should render header text for string headers', () => {
      render(<CustomTableSkeleton {...defaultProps} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });

    it('should render a SkeletonText placeholder for function headers', () => {
      const columnsWithFnHeader = [
        {
          id: 'name',
          accessorKey: 'name',
          header: () => <span>Custom</span>,
          size: 200,
        },
        { id: 'email', accessorKey: 'email', header: 'Email', size: 250 },
      ];

      const { container } = render(
        <CustomTableSkeleton {...defaultProps} columns={columnsWithFnHeader} />
      );

      // NOTE: First header is a function → renders SkeletonText (cds--skeleton__text)
      // Second header is a string → renders the text directly
      const skeletonTexts = container.querySelectorAll('.cds--skeleton__text');
      // At minimum one skeleton text should be present for the function header cell
      expect(skeletonTexts.length).toBeGreaterThan(0);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render the correct number of skeleton rows', () => {
      const { container } = render(
        <CustomTableSkeleton {...defaultProps} rowCount={5} />
      );

      const bodyRows = container.querySelectorAll('tbody tr');
      expect(bodyRows).toHaveLength(5);
    });

    it('should render the correct number of cells per row', () => {
      const { container } = render(
        <CustomTableSkeleton {...defaultProps} rowCount={2} />
      );

      const rows = container.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        expect(row.querySelectorAll('td')).toHaveLength(mockColumns.length);
      });
    });

    it('should render SkeletonText inside each body cell', () => {
      const { container } = render(
        <CustomTableSkeleton {...defaultProps} rowCount={2} />
      );

      // NOTE: 2 rows × 3 columns = 6 body cells, each with a SkeletonText
      const cells = container.querySelectorAll('tbody td');
      cells.forEach((cell) => {
        expect(cell.querySelector('.cds--skeleton__text')).toBeInTheDocument();
      });
    });
  });

  describe('Column sizing', () => {
    it('should apply explicit column size as inline width and minWidth on header', () => {
      const { container } = render(<CustomTableSkeleton {...defaultProps} />);

      const headers = container.querySelectorAll('th');
      // Name column has size 200
      expect(headers[0].style.width).toBe('200px');
      expect(headers[0].style.minWidth).toBe('200px');
    });

    it('should apply explicit column size as inline width and minWidth on body cells', () => {
      const { container } = render(
        <CustomTableSkeleton {...defaultProps} rowCount={1} />
      );

      const firstRowCells = container.querySelectorAll(
        'tbody tr:first-child td'
      );
      expect(firstRowCells[0].style.width).toBe('200px');
      expect(firstRowCells[0].style.minWidth).toBe('200px');
    });

    it('should fall back to 150px when column has no size defined', () => {
      const columnsNoSize = [
        { id: 'name', accessorKey: 'name', header: 'Name' },
      ];

      const { container } = render(
        <CustomTableSkeleton
          {...defaultProps}
          columns={columnsNoSize}
          rowCount={1}
        />
      );

      const header = container.querySelector('th');
      expect(header.style.width).toBe('150px');
      expect(header.style.minWidth).toBe('150px');

      const cell = container.querySelector('tbody td');
      expect(cell.style.width).toBe('150px');
      expect(cell.style.minWidth).toBe('150px');
    });
  });

  describe('Toolbar skeleton', () => {
    it('should never render a toolbar skeleton (toolbar is always the real toolbar now)', () => {
      const { container } = render(<CustomTableSkeleton {...defaultProps} />);

      // NOTE: Toolbar skeleton was removed — the real toolbar is always rendered outside
      expect(
        container.querySelector('[class*="toolbarSkeleton"]')
      ).not.toBeInTheDocument();
    });
  });

  describe('Pagination skeleton', () => {
    it('should not render pagination skeleton when showPagination is false', () => {
      const { container } = render(
        <CustomTableSkeleton {...defaultProps} showPagination={false} />
      );

      expect(
        container.querySelector('[class*="paginationSkeleton"]')
      ).not.toBeInTheDocument();
    });

    it('should render pagination skeleton when showPagination is true', () => {
      const { container } = render(
        <CustomTableSkeleton {...defaultProps} showPagination={true} />
      );

      expect(
        container.querySelector('[class*="paginationSkeleton"]')
      ).toBeInTheDocument();
    });

    it('should render 3 SkeletonText items inside the pagination skeleton', () => {
      const { container } = render(
        <CustomTableSkeleton
          {...defaultProps}
          showPagination={true}
          rowCount={0}
        />
      );

      // NOTE: Pagination renders 4 SkeletonText: left(120px) + right(80px, 100px, 60px)
      const paginationSkeleton = container.querySelector(
        '[class*="paginationSkeleton"]'
      );
      expect(
        paginationSkeleton.querySelectorAll('.cds--skeleton__text')
      ).toHaveLength(4);
    });
  });

  describe('Height / container style', () => {
    it('should never apply an inline maxHeight (height is managed by useTableHeight)', () => {
      // The skeleton no longer receives or applies a height prop — useTableHeight
      // sets maxHeight on .cds--data-table-container directly via the wrapperRef.
      const { container } = render(<CustomTableSkeleton {...defaultProps} />);

      const tableContainer = container.querySelector('.cds--data-table-container');
      expect(tableContainer.style.maxHeight).toBe('');
      expect(tableContainer.style.overflow).toBe('');
    });
  });

  describe('Table props pass-through', () => {
    it('should pass tableSize to the Table component', () => {
      const { container } = render(
        <CustomTableSkeleton {...defaultProps} tableSize="xs" />
      );

      expect(container.querySelector('table')).toHaveClass(
        'cds--data-table--xs'
      );
    });

    it('should pass useZebraStyles to the Table component', () => {
      const { container } = render(
        <CustomTableSkeleton {...defaultProps} useZebraStyles={true} />
      );

      expect(container.querySelector('table')).toHaveClass(
        'cds--data-table--zebra'
      );
    });
  });

  describe('Zero rows', () => {
    it('should render an empty tbody when rowCount is 0', () => {
      const { container } = render(
        <CustomTableSkeleton {...defaultProps} rowCount={0} />
      );

      const bodyRows = container.querySelectorAll('tbody tr');
      expect(bodyRows).toHaveLength(0);
    });
  });
});
