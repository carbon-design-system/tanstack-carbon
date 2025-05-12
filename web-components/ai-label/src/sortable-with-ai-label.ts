import { customElement } from 'lit/decorators.js';
import { LitElement, css, html, unsafeCSS } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { state } from 'lit/decorators/state.js';
import {
  flexRender,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingFn,
  type SortingState,
  TableController,
} from '@tanstack/lit-table';
import '@carbon/web-components/es/components/data-table/index.js';
import { exampleAiLabelTemplate } from './example-ai-label';

import { makeData, Resource } from './makeData';
import indexStyles from './index.scss?inline';

const styles = css`
  ${unsafeCSS(indexStyles)}
`;

const sortStatusFn: SortingFn<Resource> = (rowA, rowB) => {
  const statusA = rowA.original.status;
  const statusB = rowB.original.status;
  const statusOrder = ['single', 'complicated', 'relationship'];
  return statusOrder.indexOf(statusA) - statusOrder.indexOf(statusB);
};

type ColumnMeta = {
  aiLabel?: () => unknown;
};

const columnHelper = createColumnHelper<Resource>();

const columns = [
  columnHelper.accessor((row) => row.name, {
    id: 'lastName',
    cell: (info) => html`<i>${info.getValue()}</i>`,
    header: () => html`<span>Name</span>`,
  }),
  columnHelper.accessor('rule', {
    header: () => 'Rule',
    cell: (info) => info.renderValue(),
    meta: {
      aiLabel: exampleAiLabelTemplate,
    } as ColumnMeta,
    sortDescFirst: true, //first sort order will be descending (nullable values can mess up auto detection of sort order)
  }),
  columnHelper.accessor('status', {
    header: () => html`<span>Status</span>`,
    sortingFn: sortStatusFn,
  }),
  columnHelper.accessor('other', {
    header: 'Other',
  }),
  columnHelper.accessor('example', {
    header: 'Example',
    sortingFn: 'alphanumeric',
  }),
];

const data: Resource[] = makeData(10);

/**
 * An example table using `@tanstack/lit-table` and `@carbon/web-components` DataTable.
 *
 */

@customElement('sortable-ai-label-table')
export class MyBasicTable extends LitElement {
  @state()
  private _sorting: SortingState = [];

  private tableController = new TableController<Resource>(this);

  protected render() {
    const table = this.tableController.table({
      columns,
      data,
      state: {
        sorting: this._sorting,
      },
      onSortingChange: (updaterOrValue) => {
        if (typeof updaterOrValue === 'function') {
          this._sorting = updaterOrValue(this._sorting);
        } else {
          this._sorting = updaterOrValue;
        }
      },
      getSortedRowModel: getSortedRowModel(),
      getCoreRowModel: getCoreRowModel(),
    });

    return html`
      <cds-table is-sortable .customSortRow=${() => null}>
        <cds-table-header-title slot="title"
          >Column, AI label with sorting</cds-table-header-title
        >
        <cds-table-head>
          ${repeat(
            table.getHeaderGroups(),
            (headerGroup) => headerGroup.id,
            (headerGroup) => html`
              <cds-table-header-row>
                ${headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColumnMeta;
                  return html`
                    <cds-table-header-cell
                      sort-direction=${{ asc: 'ascending', desc: 'descending' }[
                        header.column.getIsSorted() as string
                      ] ?? 'none'}
                      @cds-table-header-cell-sort="${header.column.getToggleSortingHandler()}">
                      ${header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      ${typeof meta?.aiLabel === 'function'
                        ? meta.aiLabel() ?? null
                        : ''}
                    </cds-table-header-cell>
                  `;
                })}
              </cds-table-header-row>
            `
          )}
        </cds-table-head>
        <cds-table-body>
          ${table
            .getRowModel()
            .rows.slice(0, 10)
            .map(
              (row) => html`
                <cds-table-row>
                  ${row
                    .getVisibleCells()
                    .map(
                      (cell) => html`
                        <cds-table-cell>
                          ${flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </cds-table-cell>
                      `
                    )}
                </cds-table-row>
              `
            )}
        </cds-table-body>
      </cds-table>
    `;
  }

  static styles = [
    css`
      :host {
        max-width: 1280px;
        margin: 0 auto;
        padding: 2rem;
        display: flex;
        place-items: center;
      }
      .sortable-col-button {
        width: calc(100% + 1rem);
        transform: translateX(-1rem);
      }
      .sorting-icon {
        width: 1rem;
        height: 1rem;
      }
      .sorting-icon-desc {
        transform: rotate(0.5turn);
      }
    `,
    styles,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'sortable-ai-label-table': MyBasicTable;
  }
}
