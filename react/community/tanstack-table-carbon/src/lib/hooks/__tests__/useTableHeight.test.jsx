import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useTableHeight from '../useTableHeight';

// NOTE: jsdom has no layout, so every element reports 0 for offsetHeight / clientHeight.
// Sizes are provided per test id instead.
const sizes = { parent: 500, thead: 40, pagination: 50, toolbar: 30, filterTags: 35 };

const Harness = ({ height, content = 'table', hasEmptyState = false, hasFilterTags = false }) => {
  const { wrapperRef } = useTableHeight(height);

  return (
    <div data-testid="parent">
      <div ref={wrapperRef} data-testid="wrapper">
        <div className="cds--table-toolbar" data-testid="toolbar" />
        {hasFilterTags && <div data-filter-tags-summary="true" data-testid="filterTags" />}
        {content === 'table' && (
          <div className="cds--data-table-content" data-testid="scrollArea">
            <table>
              <thead data-testid="thead" />
            </table>
            {hasEmptyState && <div className="emptyStateDt" data-testid="emptyState" />}
            <div className="cds--pagination" data-testid="pagination" />
          </div>
        )}
        {content === 'skeleton' && (
          <section className="cds--data-table-container" data-testid="skeletonArea">
            <table>
              <thead data-testid="thead" />
            </table>
            <div data-skeleton-pagination="true" data-testid="skeletonPagination" />
          </section>
        )}
      </div>
    </div>
  );
};

describe('useTableHeight', () => {
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
  );
  const originalClientHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight');

  beforeEach(() => {
    sizes.parent = 500;

    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        const testId = this.dataset.testid;
        if (this.tagName === 'THEAD') {
          return sizes.thead;
        }
        if (testId === 'pagination' || testId === 'skeletonPagination') {
          return sizes.pagination;
        }
        if (testId === 'toolbar') {
          return sizes.toolbar;
        }
        if (testId === 'filterTags') {
          return sizes.filterTags;
        }
        return 0;
      },
    });

    Object.defineProperty(Element.prototype, 'clientHeight', {
      configurable: true,
      get() {
        return this.dataset?.testid === 'parent' ? sizes.parent : 0;
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
    Object.defineProperty(Element.prototype, 'clientHeight', originalClientHeight);
    vi.unstubAllGlobals();
  });

  describe('height="100%"', () => {
    it('should fit the table to the parent minus header, toolbar and pagination', () => {
      render(<Harness height="100%" />);

      const scrollArea = screen.getByTestId('scrollArea');
      // 500 (parent) - 40 (thead) - 50 (pagination) - 30 (toolbar)
      expect(scrollArea.style.maxHeight).toBe('380px');
      expect(scrollArea.style.overflow).toBe('auto');
      expect(scrollArea.style.position).toBe('relative');
      // The wrapper is hidden only while measuring the parent
      expect(screen.getByTestId('wrapper').style.display).toBe('');
    });

    it('should subtract filter tags summary height when tags are present', () => {
      render(<Harness height="100%" hasFilterTags />);

      const scrollArea = screen.getByTestId('scrollArea');
      // 500 (parent) - 40 (thead) - 50 (pagination) - 30 (toolbar) - 35 (filterTags) = 345
      expect(scrollArea.style.maxHeight).toBe('345px');
    });

    it('should size the loading skeleton and count its pagination placeholder', () => {
      render(<Harness height="100%" content="skeleton" />);

      expect(screen.getByTestId('skeletonArea').style.maxHeight).toBe('380px');
    });

    it('should size the empty state container when there is no data', () => {
      render(<Harness height="100%" hasEmptyState />);

      // contentHeight (380) - header (40) - 3
      expect(screen.getByTestId('emptyState').style.height).toBe('337px');
    });

    it('should not set a height when the parent has no height', () => {
      sizes.parent = 0;
      render(<Harness height="100%" />);

      expect(screen.getByTestId('scrollArea').style.maxHeight).toBe('');
    });

    it('should never set a negative height', () => {
      sizes.parent = 50;
      render(<Harness height="100%" />);

      expect(screen.getByTestId('scrollArea').style.maxHeight).toBe('0px');
    });
  });

  describe('pixel height', () => {
    it('should subtract header and pagination from a numeric height', () => {
      render(<Harness height={400} />);

      const scrollArea = screen.getByTestId('scrollArea');
      // 400 - 40 (thead) - 50 (pagination); the toolbar is not part of the pixel height
      expect(scrollArea.style.maxHeight).toBe('310px');
      expect(scrollArea.style.overflow).toBe('auto');
    });

    it('should subtract filter tags summary height from numeric height when present', () => {
      render(<Harness height={400} hasFilterTags />);

      const scrollArea = screen.getByTestId('scrollArea');
      // 400 - 40 (thead) - 50 (pagination) - 35 (filterTags) = 275
      expect(scrollArea.style.maxHeight).toBe('275px');
    });

    it('should parse a "px" string and size the empty state container', () => {
      render(<Harness height="400px" hasEmptyState />);

      expect(screen.getByTestId('scrollArea').style.maxHeight).toBe('310px');
      expect(screen.getByTestId('emptyState').style.height).toBe('267px');
    });

    it('should ignore a height that is not a number', () => {
      render(<Harness height="auto" />);

      expect(screen.getByTestId('scrollArea').style.maxHeight).toBe('');
    });
  });

  describe('natural height', () => {
    it('should clear a previously applied height when height becomes null', () => {
      const { rerender } = render(<Harness height={400} hasEmptyState />);

      expect(screen.getByTestId('scrollArea').style.maxHeight).toBe('310px');

      rerender(<Harness height={null} hasEmptyState />);

      expect(screen.getByTestId('scrollArea').style.maxHeight).toBe('');
      expect(screen.getByTestId('emptyState').style.height).toBe('');

      // Also works when there is no empty state container to reset
      rerender(<Harness height={400} />);
      expect(screen.getByTestId('scrollArea').style.maxHeight).toBe('310px');

      rerender(<Harness height={null} />);
      expect(screen.getByTestId('scrollArea').style.maxHeight).toBe('');
    });
  });

  it('should do nothing when there is no table or skeleton to size', () => {
    expect(() => render(<Harness height="100%" content="none" />)).not.toThrow();

    // No inline style may be written anywhere, including the temporary display: none used to measure
    expect(screen.getByTestId('wrapper')).not.toHaveAttribute('style');
    expect(screen.getByTestId('toolbar')).not.toHaveAttribute('style');
    expect(screen.getByTestId('parent')).not.toHaveAttribute('style');
  });

  describe('observers', () => {
    it('should re-measure when the parent is resized and disconnect on unmount', () => {
      const instances = [];
      class MockResizeObserver {
        constructor(callback) {
          this.callback = callback;
          this.observe = vi.fn();
          this.disconnect = vi.fn();
          instances.push(this);
        }
      }
      vi.stubGlobal('ResizeObserver', MockResizeObserver);

      const { unmount } = render(<Harness height="100%" />);
      const scrollArea = screen.getByTestId('scrollArea');

      expect(scrollArea.style.maxHeight).toBe('380px');
      expect(instances[0].observe).toHaveBeenCalledWith(screen.getByTestId('parent'));

      sizes.parent = 300;
      instances[0].callback();

      expect(scrollArea.style.maxHeight).toBe('180px');

      unmount();

      expect(instances[0].disconnect).toHaveBeenCalled();
    });

    it('should not observe the parent for a pixel height', () => {
      const instances = [];
      class MockResizeObserver {
        constructor() {
          this.observe = vi.fn();
          this.disconnect = vi.fn();
          instances.push(this);
        }
      }
      vi.stubGlobal('ResizeObserver', MockResizeObserver);

      render(<Harness height={400} />);

      expect(instances).toHaveLength(0);
    });

    it('should re-measure when the table content changes', async () => {
      render(<Harness height="100%" />);
      const scrollArea = screen.getByTestId('scrollArea');

      expect(scrollArea.style.maxHeight).toBe('380px');

      // e.g. skeleton <-> table swap: layout of the wrapper changed
      sizes.parent = 300;
      scrollArea.appendChild(document.createElement('span'));

      await waitFor(() => expect(scrollArea.style.maxHeight).toBe('180px'));
    });

    it('should size the empty state when it appears after the first render (e.g. search with no results)', async () => {
      render(<Harness height="100%" />);
      const scrollArea = screen.getByTestId('scrollArea');

      const emptyState = document.createElement('div');
      emptyState.className = 'emptyStateDt';
      scrollArea.appendChild(emptyState);

      // contentHeight (380) - header (40) - 3
      await waitFor(() => expect(emptyState.style.height).toBe('337px'));
    });
  });
});
