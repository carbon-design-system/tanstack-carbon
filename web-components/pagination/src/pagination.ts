import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  TableController,
  PaginationState,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import '@carbon/web-components/es/components/pagination/index.js';

import { makeData } from './makeData.ts';
import indexStyles from './index.scss?inline';

const styles = css`
  ${unsafeCSS(indexStyles)}
`;

type Resource = {
  id: string;
  name: string;
  rule: string;
  status: string;
  other: string;
  example: string;
};

const columns: ColumnDef<Resource, any>[] = [
  {
    accessorKey: 'name',
    cell: (info) => info.getValue(),
    header: () => html`<span>Name</span>`,
  },
  {
    accessorFn: (row) => row.rule,
    id: 'rule',
    cell: (info) => info.getValue(),
    header: () => html`<span>Rule</span>`,
    filterFn: 'arrIncludesSome',
    meta: {
      filterVariant: 'checkbox',
    },
  },
  {
    accessorKey: 'status',
    header: () => 'Status',
    meta: {
      filterVariant: 'select',
    },
  },
  {
    accessorKey: 'other',
    header: () => html`<span>Other</span>`,
  },
  {
    accessorKey: 'example',
    header: 'Example',
    filterFn: 'weakEquals',
    meta: {
      filterVariant: 'number',
    },
  },
];

const data: Resource[] = makeData(200);

@customElement('pagination-tanstack-table')
export class MyBatchTable extends LitElement {
  private tableController = new TableController<Resource>(this);

  @state()
  private pagination: PaginationState = {
    pageIndex: 0,
    pageSize: 10,
  };

  performPagination = (event: CustomEvent) => {
    const { pageSize, page } = event.detail;
    this.pagination = {
      pageSize: Number(pageSize),
      pageIndex: page - 1,
    };
  };

  render() {
    const table = this.tableController.table({
      columns,
      data,

      state: {
        pagination: this.pagination,
      },

      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });

    return html`
      <div
        class="table-container"
        style="width: ${table.getCenterTotalSize()}px;">
        <cds-table class="cds--data-table-content">
          <cds-table-head>
            ${repeat(
              table.getHeaderGroups(),
              (headerGroup) => headerGroup.id,
              (headerGroup) =>
                html`<cds-table-header-row>
                  ${repeat(
                    headerGroup.headers,
                    (header) => header.id,
                    (header) =>
                      html`<cds-table-header-cell>
                        ${header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </cds-table-header-cell>`
                  )}
                </cds-table-header-row>`
            )}
          </cds-table-head>
          <cds-table-body>
            ${repeat(
              table.getRowModel().rows,
              (row) => row.id,
              (row) => html`
                <cds-table-row>
                  ${repeat(
                    row.getVisibleCells(),
                    (cell) => cell.id,
                    (cell) =>
                      html`<cds-table-cell>
                        ${flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </cds-table-cell>`
                  )}
                </cds-table-row>
              `
            )}
          </cds-table-body>
        </cds-table>
        <cds-pagination
          class="cds--data-table-content__pagination"
          page=${table.getState().pagination.pageIndex + 1}
          total-items=${table.getFilteredRowModel().rows.length}
          page-size=${table.getState().pagination.pageSize}
          @cds-pagination-changed-current=${(event: CustomEvent) => {
            this.performPagination(event);
          }}
          @cds-page-sizes-select-changed=${(event: CustomEvent) => {
            this.performPagination(event);
          }}>
          <cds-select-item value="10">10</cds-select-item>
          <cds-select-item value="20">20</cds-select-item>
          <cds-select-item value="30">30</cds-select-item>
          <cds-select-item value="40">40</cds-select-item>
          <cds-select-item value="50">50</cds-select-item>
        </cds-pagination>
      </div>
    `;
  }

  static styles = [
    css`
      :host {
        max-width: 1280px;
        padding: 2rem;
        display: flex;
        flex-direction: column;
      }
      cds-table-batch-actions[active] {
        z-index: 1;
        clip-path: polygon(0 0, 300% 0, 300% 300%, 0 300%);
        opacity: 1;
        pointer-events: all;
        transform: translate3d(0, 0, 0);
      }
    `,
    styles,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'pagination-tanstack-table': MyBatchTable;
  }
}
