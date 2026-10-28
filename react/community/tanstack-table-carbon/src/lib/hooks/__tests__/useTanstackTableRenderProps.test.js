import { describe, expect, it } from 'vitest';
import { getPaginationSectionFeature } from '../useTanstackTableRenderProps';

describe('getPaginationSectionFeature', () => {
  const table = { getFilteredRowModel: () => ({ rows: new Array(10) }) };
  const paginationFeature = { shouldRender: true };

  it('uses the filtered row count for client-side pagination and rowCount for server-side pagination', () => {
    expect(getPaginationSectionFeature({ paginationFeature, table }).totalItems).toBe(10);

    expect(
      getPaginationSectionFeature({
        paginationFeature,
        table,
        pagination: { rowCount: 100 },
        isServerSidePagination: false,
      }).totalItems
    ).toBe(10);

    expect(
      getPaginationSectionFeature({
        paginationFeature,
        table,
        pagination: { rowCount: 100 },
        isServerSidePagination: true,
      })
    ).toEqual({ shouldRender: true, totalItems: 100 });

    expect(
      getPaginationSectionFeature({
        paginationFeature,
        table,
        pagination: {},
        isServerSidePagination: true,
      }).totalItems
    ).toBe(10);
  });
});
